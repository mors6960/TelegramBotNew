import { Controller, Get, Res } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Response } from 'express';


@Controller('health')
/**
 * @param  {HealthCheckService} privatehealthCheckService
 */
export class HealthCheckController {
  constructor(private healthCheckService: HealthCheckService) { }

  @Get()
  @HealthCheck()
  checkHealth() {
    return this.healthCheckService.check([]);
  }
  /**
  * @get check health
  * @param {Response} response
  * @returns {status, error, message, data}
  */
  @Get()
  public async health(@Res() response: Response) {
    return response.status(200).json({
      status: 200,
      error: null,
      message: 'Service working fine.',
      data: null,
    });
  }
}
