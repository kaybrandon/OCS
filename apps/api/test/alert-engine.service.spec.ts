import { AlertRuleType } from '@prisma/client';
import { AlertEngineService } from '../src/services/alert-engine.service';

describe('AlertEngineService', () => {
  const service = new AlertEngineService();

  it('flags margin floor', () => {
    const result = service.evaluateRule(AlertRuleType.MARGIN_FLOOR, {
      latest: { net_margin_pct: 15 } as any,
      thresholdPct: 20,
    });
    expect(result?.severity).toBe('CRITICAL');
  });

  it('flags founder hours rising', () => {
    const result = service.evaluateRule(AlertRuleType.FOUNDER_HOURS_RISING, {
      founder7d: 350,
      founderPrev7d: 200,
    });
    expect(result?.message).toContain('Founder dependency rising');
  });
});
