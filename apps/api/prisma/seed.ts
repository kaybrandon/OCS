import { PrismaClient, UserRole, CompanyStatus, Direction, Cadence, AlertRuleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('founder123', 10);
  const founder = await prisma.user.upsert({
    where: { email: 'founder@ocs.local' },
    update: {},
    create: { name: 'Default Founder', email: 'founder@ocs.local', password_hash, role: UserRole.FOUNDER },
  });
  const company = await prisma.company.create({ data: { name: 'Sample Ops Co', state: 'TX', timezone: 'America/Chicago', status: CompanyStatus.STABILIZING, industry: 'Home Services' } });
  await prisma.roleAssignment.create({ data: { company_id: company.id, user_id: founder.id, role_in_company: UserRole.FOUNDER } });
  const kpi = await prisma.kpiDefinition.create({ data: { company_id: company.id, name: 'On-time jobs', unit: '%', target_value: 95, direction: Direction.HIGHER_BETTER, cadence: Cadence.WEEKLY } });
  await prisma.kpiEntry.create({ data: { company_id: company.id, kpi_definition_id: kpi.id, period_start: new Date('2026-01-01'), period_end: new Date('2026-01-07'), actual_value: 92, created_by: founder.id } });
  await prisma.financialSnapshot.createMany({ data: [
    { company_id: company.id, period_start: new Date('2026-01-01'), period_end: new Date('2026-01-31'), revenue: 120000, gross_margin_pct: 48, net_margin_pct: 22, cash_on_hand: 80000, working_cap_days: 90, created_by: founder.id },
    { company_id: company.id, period_start: new Date('2026-02-01'), period_end: new Date('2026-02-28'), revenue: 118000, gross_margin_pct: 46, net_margin_pct: 20, cash_on_hand: 76000, working_cap_days: 75, created_by: founder.id },
  ]});
  await prisma.alertRule.createMany({ data: [
    { company_id: company.id, rule_type: AlertRuleType.MARGIN_FLOOR, threshold_pct: 20, is_enabled: true },
    { company_id: company.id, rule_type: AlertRuleType.FOUNDER_HOURS_RISING, is_enabled: true },
  ]});
}

main().finally(async () => prisma.$disconnect());
