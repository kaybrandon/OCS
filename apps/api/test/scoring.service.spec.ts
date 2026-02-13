import { ScoringService } from '../src/services/scoring.service';

describe('ScoringService', () => {
  it('computes gm score from inputs', () => {
    const service = new ScoringService();
    const result = service.computeGmScore({
      margins: [25, 24, 20, 19],
      rocksDone: 3,
      rocksTotal: 4,
      rocksOffTrack: 1,
      founderMinutes: 180,
      escalations: 2,
      missingKpis: 0,
      revenue: [100, 110, 115, 120],
    });
    expect(result.overall_score).toBeGreaterThan(0);
    expect(result.margin_stability_score).toBeLessThan(100);
  });
});
