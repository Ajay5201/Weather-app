// city-search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CityLookUpService } from '../service/city-lookup.service';
import { CitySearchResultDto } from '../dto/city-lookup-response.dto';


@ApiTags('Cities')
@Controller('cities')
export class CityLookUpController {
  constructor(private readonly cityLookUpService: CityLookUpService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search cities by name' })
  @ApiOkResponse({ type: [CitySearchResultDto] })
  async search(@Query('query') query: string): Promise<CitySearchResultDto[]> {
    return this.cityLookUpService.search(query);
  }
}
