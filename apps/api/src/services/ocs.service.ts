import { Injectable } from '@nestjs/common';
import { AlertRuleType, Cadence, Prisma, RockStatus, UserRole, WorkflowStatus } from '@prisma/client';
import { AlertEngineService } from './alert-engine.service';
import { PrismaService } from './prisma.service';
import { ScoringService } from './scoring.service';

@Injectable()
export class OcsService {
  constructor(private prisma: PrismaService, private scoring: ScoringService, private alerts: AlertEngineService) {}

  getCompanies() { return this.prisma.company.findMany(); }
  createCompany(data: any) { return this.prisma.company.create({ data }); }
  getCompany(id: string) { return this.prisma.company.findUnique({ where: { id } }); }
  updateCompany(id: string, data: any) { return this.prisma.company.update({ where: { id }, data }); }

  getWorkflows(company_id: string) { return this.prisma.workflow.findMany({ where: { company_id }, include: { steps: true } }); }
  createWorkflow(company_id: string, userId: string, body: any) {
    return this.prisma.workflow.create({ data: { company_id, title: body.title, description: body.description || '', status: body.status || WorkflowStatus.DRAFT, created_by: userId } });
  }
  getWorkflow(id: string) { return this.prisma.workflow.findUnique({ where: { id }, include: { steps: true } }); }
  addWorkflowStep(workflow_id: string, body: any) {
    return this.prisma.workflowStep.create({ data: { ...body, workflow_id, owner_role: body.owner_role, escalation_role: body.escalation_role, expected_output: body.expected_output, cadence: body.cadence || Cadence.WEEKLY } });
  }
  patchWorkflowStep(id: string, body: any) { return this.prisma.workflowStep.update({ where: { id }, data: body }); }
  deleteWorkflowStep(id: string) { return this.prisma.workflowStep.delete({ where: { id } }); }
  async createWorkflowFromText(companyId: string, userId: string, body: any) {
    const workflow = await this.createWorkflow(companyId, userId, { title: body.title || 'Workflow from text', description: 'Generated from source text', status: WorkflowStatus.DRAFT });
    await this.prisma.procedureSource.create({ data: { company_id: companyId, workflow_id: workflow.id, source_type: 'TEXT', raw_text: body.text } });
    const lines = String(body.text || '').split('\n').map((l: string) => l.trim().replace(/^[-*\d.)\s]+/, '')).filter(Boolean);
    await Promise.all(lines.slice(0, 25).map((line: string, i: number) => this.addWorkflowStep(workflow.id, {
      step_order: i + 1,
      title: line.slice(0, 60),
      description: line,
      owner_role: UserRole.DEPT_HEAD,
      backup_role: UserRole.GM,
      expected_output: 'Step completed and documented',
      cadence: Cadence.WEEKLY,
      escalation_role: UserRole.GM,
      required: true,
    })));
    return this.getWorkflow(workflow.id);
  }

  getKpiDefs(company_id: string) { return this.prisma.kpiDefinition.findMany({ where: { company_id } }); }
  createKpiDef(company_id: string, data: any) { return this.prisma.kpiDefinition.create({ data: { ...data, company_id } }); }
  getKpiEntries(company_id: string) { return this.prisma.kpiEntry.findMany({ where: { company_id } }); }
  createKpiEntry(company_id: string, userId: string, data: any) { return this.prisma.kpiEntry.create({ data: { ...data, company_id, created_by: userId } }); }
  getRocks(company_id: string) { return this.prisma.rock.findMany({ where: { company_id } }); }
  createRock(company_id: string, data: any) { return this.prisma.rock.create({ data: { ...data, company_id } }); }
  getIssues(company_id: string) { return this.prisma.issue.findMany({ where: { company_id } }); }
  createIssue(company_id: string, userId: string, data: any) { return this.prisma.issue.create({ data: { ...data, company_id, created_by: userId, status: data.status || 'OPEN' } }); }

  getFinancialSnapshots(company_id: string) { return this.prisma.financialSnapshot.findMany({ where: { company_id }, orderBy: { period_end: 'asc' } }); }
  async addFinancialSnapshot(company_id: string, userId: string, data: any) {
    const created = await this.prisma.financialSnapshot.create({ data: { ...data, company_id, created_by: userId } });
    await this.computeWeeklyGmScore(company_id);
    return created;
  }

  getCultureReviews(company_id: string) { return this.prisma.cultureReview.findMany({ where: { company_id }, include: { personScores: true } }); }
  async createCultureReview(company_id: string, body: any) {
    return this.prisma.cultureReview.create({ data: { company_id, reviewer_user_id: body.reviewer_user_id, review_date: new Date(body.review_date), notes: body.notes, personScores: { create: body.personScores || [] } }, include: { personScores: true } });
  }
  getFounderActivity(company_id: string) { return this.prisma.founderActivityLog.findMany({ where: { company_id }, orderBy: { occurred_at: 'desc' } }); }
  async createFounderActivity(company_id: string, userId: string, data: any) {
    const entry = await this.prisma.founderActivityLog.create({ data: { ...data, company_id, founder_user_id: userId, occurred_at: new Date(data.occurred_at) } });
    await this.evaluateAlertsForCompany(company_id);
    return entry;
  }
  getGmScorecards(company_id: string) { return this.prisma.gmScorecard.findMany({ where: { company_id }, orderBy: { period_end: 'desc' } }); }

  getAlertRules(company_id: string) { return this.prisma.alertRule.findMany({ where: { company_id } }); }
  createAlertRule(company_id: string, data: any) { return this.prisma.alertRule.create({ data: { ...data, company_id } }); }
  patchAlertRule(id: string, data: any) { return this.prisma.alertRule.update({ where: { id }, data }); }
  getAlerts(company_id: string) { return this.prisma.alertEvent.findMany({ where: { company_id }, orderBy: { created_at: 'desc' } }); }
  ackAlert(id: string, userId: string) { return this.prisma.alertEvent.update({ where: { id }, data: { acknowledged_by: userId, acknowledged_at: new Date() } }); }

  async getPortfolio() {
    const companies = await this.prisma.company.findMany();
    const tiles = await Promise.all(companies.map(async (c) => {
      const [latestFin, gm, culture, founder7d, alerts] = await Promise.all([
        this.prisma.financialSnapshot.findFirst({ where: { company_id: c.id }, orderBy: { period_end: 'desc' } }),
        this.prisma.gmScorecard.findFirst({ where: { company_id: c.id }, orderBy: { period_end: 'desc' } }),
        this.prisma.cultureReview.findFirst({ where: { company_id: c.id }, orderBy: { review_date: 'desc' }, include: { personScores: true } }),
        this.sumFounderMinutes(c.id, 7),
        this.prisma.alertEvent.findMany({ where: { company_id: c.id, acknowledged_at: null }, take: 5, orderBy: { created_at: 'desc' } }),
      ]);
      const risky = culture ? culture.personScores.filter((s) => s.risk_flag !== 'GREEN').length / Math.max(culture.personScores.length, 1) : 0;
      return { company: c, latestFinancialSnapshot: latestFin, gmScore: gm?.overall_score || null, cultureRiskPct: Math.round(risky * 100), founderMinutes7d: founder7d, alerts };
    }));
    const totalRevenue = tiles.reduce((acc, t) => acc + (t.latestFinancialSnapshot?.revenue || 0), 0);
    return { tiles, totals: { totalRevenue } };
  }

  private async sumFounderMinutes(company_id: string, days: number, offsetDays = 0) {
    const end = new Date(Date.now() - offsetDays * 86400000);
    const start = new Date(end.getTime() - days * 86400000);
    const agg = await this.prisma.founderActivityLog.aggregate({ where: { company_id, occurred_at: { gte: start, lte: end } }, _sum: { minutes: true } });
    return agg._sum.minutes || 0;
  }

  async computeWeeklyGmScore(company_id: string) {
    const [fins, rocks, founder7d, founderEscalations, kpis, gmHistory] = await Promise.all([
      this.prisma.financialSnapshot.findMany({ where: { company_id }, orderBy: { period_end: 'asc' }, take: 4 }),
      this.prisma.rock.findMany({ where: { company_id } }),
      this.sumFounderMinutes(company_id, 7),
      this.prisma.founderActivityLog.count({ where: { company_id, activity_type: 'ESCALATION', occurred_at: { gte: new Date(Date.now() - 7*86400000) } } }),
      this.prisma.kpiEntry.count({ where: { company_id, created_at: { gte: new Date(Date.now() - 7*86400000) } } }),
      this.prisma.gmScorecard.findMany({ where: { company_id }, orderBy: { period_end: 'desc' }, take: 2 })
    ]);
    const s = this.scoring.computeGmScore({
      margins: fins.map((f) => f.net_margin_pct),
      rocksDone: rocks.filter((r) => r.status === RockStatus.DONE).length,
      rocksTotal: rocks.length,
      rocksOffTrack: rocks.filter((r) => r.status === RockStatus.OFF_TRACK).length,
      founderMinutes: founder7d,
      escalations: founderEscalations,
      missingKpis: kpis === 0 ? 1 : 0,
      revenue: fins.map((f) => f.revenue),
    });
    const now = new Date();
    return this.prisma.gmScorecard.create({ data: { company_id, period_start: new Date(now.getTime()-7*86400000), period_end: now, ...s, notes: 'Auto-computed weekly' } });
  }

  async evaluateAlertsForCompany(company_id: string) {
    const [rules, fins, rocksOffTrack, kpiCount, gm] = await Promise.all([
      this.prisma.alertRule.findMany({ where: { company_id, is_enabled: true } }),
      this.prisma.financialSnapshot.findMany({ where: { company_id }, orderBy: { period_end: 'desc' }, take: 2 }),
      this.prisma.rock.count({ where: { company_id, status: RockStatus.OFF_TRACK } }),
      this.prisma.kpiEntry.count({ where: { company_id, created_at: { gte: new Date(Date.now()-7*86400000) } } }),
      this.prisma.gmScorecard.findMany({ where: { company_id }, orderBy: { period_end: 'desc' }, take: 2 }),
    ]);
    const founder7d = await this.sumFounderMinutes(company_id, 7);
    const founderPrev7d = await this.sumFounderMinutes(company_id, 7, 7);
    for (const r of rules) {
      const result = this.alerts.evaluateRule(r.rule_type, {
        latest: fins[0], previous: fins[1], offTrackRocks: rocksOffTrack, kpiMissing: kpiCount === 0,
        gmDrop: gm.length > 1 ? gm[1].overall_score - gm[0].overall_score : 0, founder7d, founderPrev7d,
        thresholdNumeric: r.threshold_numeric, thresholdPct: r.threshold_pct,
      });
      if (result) {
        await this.prisma.alertEvent.create({ data: { company_id, rule_id: r.id, severity: result.severity, message: result.message } });
      }
    }
  }
}
