import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from '../service/health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ROUTES } from '../../constants/route.constants';
import { ApiSuccessObjectResponse } from 'src/common/decorators/api-response.decorators';

@ApiTags('Health')
@Controller(ROUTES.HEALTH_CHECK.CONTROLLER)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }



 
}
