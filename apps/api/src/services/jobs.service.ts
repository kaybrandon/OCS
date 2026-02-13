import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OcsService } from './ocs.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService, private ocs: OcsService) {}

  @Cron('0 2 * * *')
  async runDailyAlerts() {
    const companies = await this.prisma.company.findMany({ select: { id: true } });
    for (const company of companies) {
      await this.ocs.evaluateAlertsForCompany(company.id);
    }
  }
}
