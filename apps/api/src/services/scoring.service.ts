import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringService {
  computeGmScore(input: {
    margins: number[];
    rocksDone: number;
    rocksTotal: number;
    rocksOffTrack: number;
    founderMinutes: number;
    escalations: number;
    missingKpis: number;
    revenue: number[];
  }) {
    const marginDrops = input.margins.slice(1).filter((m, i) => input.margins[i] - m > 3).length;
    const marginStability = Math.max(0, 100 - marginDrops * 20);
    const rockCompletion = input.rocksTotal === 0 ? 70 : Math.max(0, (input.rocksDone / input.rocksTotal) * 100 - input.rocksOffTrack * 10);
    const escalationScore = Math.max(0, 100 - input.founderMinutes / 5 - input.escalations * 10);
    const turnoverScore = Math.max(0, 100 - input.missingKpis * 15);
    const revenueTrend = input.revenue.length >= 2 && input.revenue[input.revenue.length - 1] >= input.revenue[0] ? 80 : 50;
    const overall = Number((marginStability * 0.25 + rockCompletion * 0.25 + escalationScore * 0.2 + turnoverScore * 0.15 + revenueTrend * 0.15).toFixed(2));
    return {
      margin_stability_score: marginStability,
      rock_completion_score: rockCompletion,
      escalation_score: escalationScore,
      turnover_score: turnoverScore,
      revenue_trend_score: revenueTrend,
      overall_score: overall,
    };
  }
}
