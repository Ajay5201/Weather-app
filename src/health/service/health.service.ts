import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  name: string;
  description: string;
}

@Injectable()
export class HealthService {
  private startTime: number = Date.now();

  /**
   * Get the overall health status of the application
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    const environment = process.env.NODE_ENV || 'development';
    const version = process.env.npm_package_version || '0.0.1';
    const name = process.env.npm_package_name || 'Weather App';
    const description = process.env.npm_package_description || 'Weather App API';

    return {
      status: 'ok',
      name,
      description,
      timestamp: new Date().toISOString(),
      uptime,
      environment,
      version,
    
    };
  }  
}
