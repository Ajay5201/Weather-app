// weather.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/modules/redis/service/redis.service';

import { HttpService } from '@nestjs/axios';
import { CurrentWeatherDto, DailyWeatherDto, HourlyWeatherDto, WeatherResponseDto } from '../dto/weather-response.dto';
import { URL_CONSTANTS } from '../../../constants/url.constants';


@Injectable()
export class WeatherService {
  private readonly apiKey: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {

    const key = process.env.OPEN_WEATHER_API_KEY;

    if (!key) {
      throw new InternalServerErrorException(
        'Missing required environment variable: OPEN_WEATHER_API_KEY',
      );
    }
    this.apiKey = key;
  }


  // Fetch weather (with Redis caching)
  async getWeatherForecast(city: string): Promise<WeatherResponseDto> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const url = `${URL_CONSTANTS.OPEN_WEATHER_MAP}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await this.httpService.axiosRef.get(url);
  
    const data = response.data;
  
    // ✅ Current Weather (first item + city info)
    const current: CurrentWeatherDto = {
      temperature: data.list[0].main.temp,
      feelsLike: data.list[0].main.feels_like,
      condition: data.list[0].weather[0].description,
      icon: data.list[0].weather[0].icon,
      humidity: data.list[0].main.humidity,
      windSpeed: data.list[0].wind.speed,
      windDirection: this.getWindDirection(data.list[0].wind.deg),
      pressure: data.list[0].main.pressure,
      sunrise: new Date(data.city.sunrise * 1000).toISOString(),
      sunset: new Date(data.city.sunset * 1000).toISOString(),
    };
  
    // ✅ Hourly (3h intervals, next 24h)
    const hourly: HourlyWeatherDto[] = data.list.map((h: any) => ({
      time: h.dt_txt,
      temperature: h.main.temp,
      feelsLike: h.main.feels_like,
      condition: h.weather[0].description,
      icon: h.weather[0].icon,
      precipitationChance: h.pop ? h.pop * 100 : 0,
      windSpeed: h.wind.speed,
    }));
  
    // ✅ Daily (group by date, min/max)
    const dailyMap: Record<string, any[]> = {};
    data.list.forEach((f: any) => {
      const date = f.dt_txt.split(" ")[0];
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(f);
    });
  
    const daily: DailyWeatherDto[] = Object.entries(dailyMap).map(
      ([date, items]: [string, any[]]) => {
        const temps = items.map((i) => i.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const mid = items[Math.floor(items.length / 2)]; // pick middle slot for condition
  
        return {
          date,
          minTemp,
          maxTemp,
          condition: mid.weather[0].description,
          icon: mid.weather[0].icon,
          precipitationChance: Math.round(
            (items.reduce((sum, i) => sum + (i.pop || 0), 0) / items.length) * 100
          ),
          windSpeed: mid.wind.speed,
        };
      }
    );
  
    const weatherdata = {
        city: data.city.name,
        current,
        hourly,
        daily,
      }

      await this.redisService.set(cacheKey, JSON.stringify(weatherdata), 600);


    return weatherdata
  }
  
  // helper for wind
  private getWindDirection(deg: number): string {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }
  
}
