import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { OcsController } from './ocs.controller';
import { OcsService } from './services/ocs.service';
import { PrismaService } from './services/prisma.service';
import { ScoringService } from './services/scoring.service';
import { AlertEngineService } from './services/alert-engine.service';
import { JobsService } from './services/jobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), JwtModule.register({ secret: process.env.JWT_SECRET || 'dev-secret', signOptions: { expiresIn: '1d' } })],
  controllers: [AuthController, OcsController],
  providers: [PrismaService, AuthService, JwtStrategy, OcsService, ScoringService, AlertEngineService, JobsService],
})
export class AppModule {}
