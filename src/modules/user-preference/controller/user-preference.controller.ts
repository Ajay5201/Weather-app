// weather.controller.ts
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserPreferenceService, } from '../service/user-preference.service';
import { CreatePreferenceDto } from '../dto/create-preference.dto';
import { ROUTES } from '../../../constants/route.constants';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessObjectResponse } from 'src/common/decorators/api-response.decorators';
import { GetPreferenceDto } from '../dto/get-preference.dto';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { RemovePreferenceDto } from '../dto/remove-preference.dto';



@Controller(ROUTES.USER.CONTROLLER)
@ApiTags('Users')
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create user session with preference' })
  @ApiBody({ type: CreatePreferenceDto })
  @ApiSuccessObjectResponse(GetPreferenceDto)
  async addCity(@Body() dto: CreatePreferenceDto) {
    const updated = await this.userPreferenceService.addCity(dto.sessionId, dto.city);
    return { sessionId: updated.sessionId, cities: updated.cities };
  }

  @Delete(ROUTES.USER.REMOVE_CITY)
  @ApiOperation({ summary: 'Remove a city from user preferences' })
  @ApiBody({ type: RemovePreferenceDto })
  @ApiSuccessObjectResponse(GetPreferenceDto)
  async removeCity(@Body() dto: RemovePreferenceDto) {
  const updated = await this.userPreferenceService.removeCity(dto.sessionId, dto.city);
  return { sessionId: updated.sessionId, cities: updated.cities };
  }


  @Get(ROUTES.USER.GET_PREFERENCES)
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiSuccessObjectResponse(GetPreferenceDto)
  async getPreferences(@Param('sessionId') sessionId: string) {
    const prefs = await this.userPreferenceService.getUserPreferences(sessionId);
    return { sessionId, cities: prefs?.cities || [] };
  }


}
