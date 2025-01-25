import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckController } from './health.controller';
import { HealthService } from './health.service';
/**
 * @param  {[TerminusModule} {imports
 * @param  {} HttpModule]
 * @param  {[HealthCheckController]} controllers
 * @param  {} }
 */
@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
  providers:[HealthService],
  exports: [HealthService]
})
export class HealthModule { }
