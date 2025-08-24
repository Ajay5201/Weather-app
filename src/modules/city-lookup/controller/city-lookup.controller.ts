import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiSuccessArrayResponse } from '../../../common/decorators/api-response.decorators';
import { RateLimit, RateLimits } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../core/guards/rate-limit.guard';

import { CityLookUpService } from '../service/city-lookup.service';
import { CitySearchResultDto } from '../dto/city-lookup-response.dto';
import { ROUTES } from '../../../constants/route.constants';

@Controller(ROUTES.CITY_LOOK_UP.CONTROLLER)
@ApiTags('City Lookup')
@UseGuards(RateLimitGuard)
export class CityLookUpController {
  constructor(private readonly cityLookUpService: CityLookUpService) {}

  @Get(ROUTES.CITY_LOOK_UP.SEARCH)
  @RateLimit(RateLimits.CITY_SEARCH)
  @ApiOperation({ 
    summary: 'Search for cities',
    description: 'Search for cities with autocomplete functionality using geocoding services'
  })
  @ApiQuery({ 
    name: 'query', 
    description: 'City name or partial name to search for',
    example: 'london',
    required: true
  })
  @ApiSuccessArrayResponse(CitySearchResultDto)
  async searchCities(@Query('query') query: string): Promise<CitySearchResultDto[]> {
    return this.cityLookUpService.search(query);
  }
}
