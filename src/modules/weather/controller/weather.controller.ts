import { Controller, Post, Body, Get, Param, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ROUTES } from '../../../constants/route.constants';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessArrayResponse, ApiSuccessObjectResponse } from 'src/common/decorators/api-response.decorators';
import { RateLimit, RateLimits } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../core/guards/rate-limit.guard';

import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherService } from '../service/weather.service';
import {  MultipleCityCurrentWeatherMapDto } from '../dto/multiple-weather-response.dto';

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

  @Get(ROUTES.WEATHER.GET_MULTIPLE_FORECAST_FOR_SESSION)
  @RateLimit(RateLimits.WEATHER_API)
  @ApiOperation({ 
  summary: 'Get weather forecasts for multiple cities for the given session id',
  description: 'Retrieves current, hourly (24h), and daily (5-day) weather forecasts for a list of specified cities'
 })
 @ApiSuccessObjectResponse(MultipleCityCurrentWeatherMapDto)
 async getMultipleForecasts(@Query('session-id') sessionId: string) {
  if (!sessionId) {
    throw new BadRequestException('Query param "Session Id" is required');
  }
  return this.weatherService.getWeatherForecastsForSession(sessionId);
}
//  @Get()
//   async getWeather(@Query('city') city: string) {
//     return {
//       city,
//       forecast: await this.weatherService.predictWeather(city),
//     };
//   }
}
