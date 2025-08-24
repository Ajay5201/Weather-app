import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './service/weather.service';
import { WeatherController } from './controller/weather.controller';
import { UserPreferenceModule } from '../user-preference/user-preference.module';



@Module({
  imports: [HttpModule, UserPreferenceModule], 
  controllers: [WeatherController],
  providers: [WeatherService,],
})
export class WeatherModule {}
