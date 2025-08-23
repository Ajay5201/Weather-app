import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CityLookUpController } from './controller/city-lookup.controller';
import { CityLookUpService } from './service/city-lookup.service';


@Module({
  imports: [HttpModule], 
  controllers: [CityLookUpController],
  providers: [CityLookUpService,],
})
export class CityLookModule {}
