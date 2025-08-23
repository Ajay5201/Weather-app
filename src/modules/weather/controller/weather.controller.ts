// weather.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ROUTES } from '../../../constants/route.constants';
import {  ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessObjectResponse } from 'src/common/decorators/api-response.decorators';

import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherService } from '../service/weather.service';



@Controller(ROUTES.WEATHER.CONTROLLER)
@ApiTags('Weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  
  @Get(ROUTES.WEATHER.GET_FORECAST)
  @ApiOperation({ summary: 'Get weather forecast for a city' })
  @ApiSuccessObjectResponse(WeatherResponseDto)
  async getForecast(@Param('city') city: string) {
    return this.weatherService.getWeatherForecast(city);
  }
}
