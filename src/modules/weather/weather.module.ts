import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './service/weather.service';
import { WeatherController } from './controller/weather.controller';



@Module({
  imports: [HttpModule], 
  controllers: [WeatherController],
  providers: [WeatherService,],
})
export class WeatherModule {}
