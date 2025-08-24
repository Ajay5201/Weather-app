import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ROUTES } from '../../../constants/route.constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessObjectResponse } from 'src/common/decorators/api-response.decorators';
import { RateLimit, RateLimits } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../core/guards/rate-limit.guard';

import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherService } from '../service/weather.service';

@Controller(ROUTES.WEATHER.CONTROLLER)
@ApiTags('Weather')
@UseGuards(RateLimitGuard)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get(ROUTES.WEATHER.GET_FORECAST)
  @RateLimit(RateLimits.WEATHER_API)
  @ApiOperation({ 
    summary: 'Get weather forecast for a city',
    description: 'Retrieves current, hourly (24h), and daily (5-day) weather forecast for a specified city'
  })
  @ApiSuccessObjectResponse(WeatherResponseDto)
  async getForecast(@Param('city') city: string) {
    return this.weatherService.getWeatherForecast(city);
  }
}
