import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OcsService } from './services/ocs.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class OcsController {
  constructor(private service: OcsService) {}

  @Get('companies') getCompanies() { return this.service.getCompanies(); }
  @Post('companies') createCompany(@Body() body: any) { return this.service.createCompany(body); }
  @Get('companies/:id') getCompany(@Param('id') id: string) { return this.service.getCompany(id); }
  @Patch('companies/:id') updateCompany(@Param('id') id: string, @Body() body: any) { return this.service.updateCompany(id, body); }

  @Get('companies/:id/workflows') getWorkflows(@Param('id') id: string) { return this.service.getWorkflows(id); }
  @Post('companies/:id/workflows') createWorkflow(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.createWorkflow(id, req.user.userId, body); }
  @Get('workflows/:id') getWorkflow(@Param('id') id: string) { return this.service.getWorkflow(id); }
  @Post('workflows/:id/steps') addStep(@Param('id') id: string, @Body() body: any) { return this.service.addWorkflowStep(id, body); }
  @Patch('workflow-steps/:id') patchStep(@Param('id') id: string, @Body() body: any) { return this.service.patchWorkflowStep(id, body); }
  @Delete('workflow-steps/:id') deleteStep(@Param('id') id: string) { return this.service.deleteWorkflowStep(id); }
  @Post('companies/:id/workflow-from-text') fromText(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.createWorkflowFromText(id, req.user.userId, body); }

  @Get('companies/:id/kpi-definitions') getKpiDefs(@Param('id') id: string) { return this.service.getKpiDefs(id); }
  @Post('companies/:id/kpi-definitions') createKpiDef(@Param('id') id: string, @Body() body: any) { return this.service.createKpiDef(id, body); }
  @Get('companies/:id/kpi-entries') getKpiEntries(@Param('id') id: string) { return this.service.getKpiEntries(id); }
  @Post('companies/:id/kpi-entries') createKpiEntry(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.createKpiEntry(id, req.user.userId, body); }

  @Get('companies/:id/rocks') getRocks(@Param('id') id: string) { return this.service.getRocks(id); }
  @Post('companies/:id/rocks') createRock(@Param('id') id: string, @Body() body: any) { return this.service.createRock(id, body); }
  @Get('companies/:id/issues') getIssues(@Param('id') id: string) { return this.service.getIssues(id); }
  @Post('companies/:id/issues') createIssue(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.createIssue(id, req.user.userId, body); }

  @Get('companies/:id/financial-snapshots') getFin(@Param('id') id: string) { return this.service.getFinancialSnapshots(id); }
  @Post('companies/:id/financial-snapshots') addFin(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.addFinancialSnapshot(id, req.user.userId, body); }

  @Get('companies/:id/culture-reviews') getCulture(@Param('id') id: string) { return this.service.getCultureReviews(id); }
  @Post('companies/:id/culture-reviews') createCulture(@Param('id') id: string, @Body() body: any) { return this.service.createCultureReview(id, body); }

  @Get('companies/:id/founder-activity') getFounderActivity(@Param('id') id: string) { return this.service.getFounderActivity(id); }
  @Post('companies/:id/founder-activity') createFounderActivity(@Param('id') id: string, @Req() req: any, @Body() body: any) { return this.service.createFounderActivity(id, req.user.userId, body); }

  @Get('companies/:id/gm-scorecards') gmScorecards(@Param('id') id: string) { return this.service.getGmScorecards(id); }

  @Get('companies/:id/alert-rules') alertRules(@Param('id') id: string) { return this.service.getAlertRules(id); }
  @Post('companies/:id/alert-rules') createAlertRule(@Param('id') id: string, @Body() body: any) { return this.service.createAlertRule(id, body); }
  @Patch('alert-rules/:id') patchAlertRule(@Param('id') id: string, @Body() body: any) { return this.service.patchAlertRule(id, body); }
  @Get('companies/:id/alerts') alerts(@Param('id') id: string) { return this.service.getAlerts(id); }
  @Post('alerts/:id/acknowledge') ackAlert(@Param('id') id: string, @Req() req: any) { return this.service.ackAlert(id, req.user.userId); }

  @Get('dashboard/portfolio') portfolio() { return this.service.getPortfolio(); }
}
