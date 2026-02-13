import { Injectable } from '@nestjs/common';
import { AlertRuleType, AlertSeverity, FinancialSnapshot, RockStatus } from '@prisma/client';

@Injectable()
export class AlertEngineService {
  evaluateRule(type: AlertRuleType, ctx: {
    latest?: FinancialSnapshot;
    previous?: FinancialSnapshot;
    offTrackRocks?: number;
    kpiMissing?: boolean;
    gmDrop?: number;
    founder7d?: number;
    founderPrev7d?: number;
    thresholdNumeric?: number | null;
    thresholdPct?: number | null;
  }): { severity: AlertSeverity; message: string } | null {
    if (!ctx.latest && [AlertRuleType.MARGIN_DROP, AlertRuleType.MARGIN_FLOOR, AlertRuleType.CASH_RUNWAY, AlertRuleType.DSCR_FLOOR].includes(type)) return null;
    switch (type) {
      case AlertRuleType.MARGIN_FLOOR:
        if ((ctx.latest!.net_margin_pct) < (ctx.thresholdPct ?? 20)) return { severity: AlertSeverity.CRITICAL, message: 'Net margin below floor' };
        return null;
      case AlertRuleType.MARGIN_DROP:
        if (ctx.previous && ctx.previous.net_margin_pct - ctx.latest!.net_margin_pct > (ctx.thresholdPct ?? 3)) return { severity: AlertSeverity.WARN, message: 'Net margin dropped materially' };
        return null;
      case AlertRuleType.CASH_RUNWAY:
        if (ctx.latest!.working_cap_days !== null && ctx.latest!.working_cap_days < (ctx.thresholdNumeric ?? 60)) return { severity: AlertSeverity.WARN, message: 'Cash runway low' };
        return null;
      case AlertRuleType.DSCR_FLOOR:
        if (ctx.latest!.dscr !== null && ctx.latest!.dscr < (ctx.thresholdNumeric ?? 2)) return { severity: AlertSeverity.CRITICAL, message: 'DSCR below floor' };
        return null;
      case AlertRuleType.KPIS_MISSING:
        if (ctx.kpiMissing) return { severity: AlertSeverity.WARN, message: 'Weekly KPI entries missing' };
        return null;
      case AlertRuleType.ROCKS_LATE:
        if ((ctx.offTrackRocks ?? 0) > 0) return { severity: AlertSeverity.WARN, message: 'Rocks are off track' };
        return null;
      case AlertRuleType.GM_SCORE_DROP:
        if ((ctx.gmDrop ?? 0) > (ctx.thresholdNumeric ?? 10)) return { severity: AlertSeverity.WARN, message: 'GM score dropped' };
        return null;
      case AlertRuleType.FOUNDER_HOURS_RISING: {
        const increased = (ctx.founderPrev7d ?? 0) > 0 && (ctx.founder7d ?? 0) > (ctx.founderPrev7d ?? 0) * 1.25;
        if ((ctx.founder7d ?? 0) > 300 || increased) return { severity: AlertSeverity.WARN, message: 'Founder dependency rising' };
        return null;
      }
      default:
        return null;
    }
  }
}
