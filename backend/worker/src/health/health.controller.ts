import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Health check endpoint for Kubernetes
   * @returns service health status
   */
  @Get('health')
  health() {
    return this.healthService.getHealth();
  }
}
