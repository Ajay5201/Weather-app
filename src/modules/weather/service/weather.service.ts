import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/modules/redis/service/redis.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CurrentWeatherDto, DailyWeatherDto, HourlyWeatherDto, WeatherResponseDto } from '../dto/weather-response.dto';
import { URL_CONSTANTS } from '../../../constants/url.constants';
import { MultipleCityCurrentWeatherMapDto } from '../dto/multiple-weather-response.dto';
import { UserPreferenceService } from 'src/modules/user-preference/service/user-preference.service';
import { UserPreference } from 'src/modules/user-preference/entity/user-preference.entity';


@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly weatherCacheTTL: number;
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly userPreferenceService: UserPreferenceService,
  ) {
    const apiKey = this.configService.get<string>('OPEN_WEATHER_API_KEY');
    this.weatherCacheTTL = this.configService.get<number>('WEATHER_CACHE_TTL', 600);

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Missing required environment variable: OPEN_WEATHER_API_KEY',
      );
    }
    this.apiKey = apiKey;
  }

  // Fetch weather (with Redis caching)
  async getWeatherForecast(city: string): Promise<WeatherResponseDto> {
    try {


      const sanitizedCity = this.sanitizeCityName(city);
      
      const cacheKey = `weather:${sanitizedCity.toLowerCase()}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        console.log("returns forecast cached city data" , city)
        return JSON.parse(cached);
      }

      const weatherData = await this.fetchWeatherFromAPI(sanitizedCity);
      await this.redisService.set(cacheKey, JSON.stringify(weatherData), this.weatherCacheTTL);

      return weatherData;
    } catch (error) {
      this.logger.error(`Failed to get weather forecast for ${city}:`, error);
      throw new InternalServerErrorException('Failed to fetch weather data');
    }
  }

  // Fetch weather data from OpenWeather API
  private async fetchWeatherFromAPI(city: string): Promise<WeatherResponseDto> {
    try {
      const url = `${URL_CONSTANTS.OPEN_WEATHER_MAP}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
      const response = await firstValueFrom(this.httpService.get(url));
      
      if (!response.data || !response.data.list || !response.data.city) {
        throw new Error('Invalid response format from OpenWeather API');
      }

      return this.transformWeatherData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException(`City "${city}" not found`);
      }
      if (error.response?.status === 401) {
        throw new InternalServerErrorException('Invalid API key for OpenWeather');
      }
      if (error.response?.status === 429) {
        throw new InternalServerErrorException('OpenWeather API rate limit exceeded');
      }
      throw error;
    }
  }

  // Transform raw API data to DTO format
  private transformWeatherData(data: any): WeatherResponseDto {
    const current = this.extractCurrentWeather(data);
    const hourly = this.extractHourlyWeather(data);
    const daily = this.extractDailyWeather(data);

    return {
      city: data.city.name,
      current,
      hourly,
      daily,
    };
  }

  // Extract current weather information
  private extractCurrentWeather(data: any): CurrentWeatherDto {
    const firstItem = data.list[0];
    return {
      temperature: firstItem.main.temp,
      feelsLike: firstItem.main.feels_like,
      condition: firstItem.weather[0].description,
      icon: firstItem.weather[0].icon,
      humidity: firstItem.main.humidity,
      windSpeed: firstItem.wind.speed,
      windDirection: this.getWindDirection(firstItem.wind.deg),
      pressure: firstItem.main.pressure,
      sunrise: new Date(data.city.sunrise * 1000).toISOString(),
      sunset: new Date(data.city.sunset * 1000).toISOString(),
    };
  }

  // Extract hourly weather data
  private extractHourlyWeather(data: any): HourlyWeatherDto[] {
    return data.list.map((item: any) => ({
      time: item.dt_txt,
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      condition: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitationChance: item.pop ? Math.round(item.pop * 100) : 0,
      windSpeed: item.wind.speed,
    }));
  }

  // Extract daily weather data
  private extractDailyWeather(data: any): DailyWeatherDto[] {
    const dailyMap: Record<string, any[]> = {};
    
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(item);
    });

    return Object.entries(dailyMap).map(([date, items]) => {
      const temps = items.map((i) => i.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      const mid = items[Math.floor(items.length / 2)];

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
    });
  }

  // Sanitize city name input
  private sanitizeCityName(city: string): string {
    if (!city || typeof city !== 'string') {
      throw new BadRequestException('City name must be a valid string');
    }
    
    const sanitized = city.trim().replace(/[<>\"'&]/g, '');
    if (sanitized.length < 1 || sanitized.length > 100) {
      throw new BadRequestException('City name must be between 1 and 100 characters');
    }
    
    return sanitized;
  }

  // Helper for wind direction
  private getWindDirection(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  async getMultipleWeatherForecasts(cities: string[]) {
    const results = {};
  
    for (const city of cities) {
      try {
        const forecast = await this.getWeatherForecast(city);
        results[forecast.city] = forecast.current;
      } catch (error) {
        this.logger.warn(`Skipping city ${city}: ${error.message}`);
        results[city] = { error: error.message };
      }
    }
  
    return results;
  }

  async getWeatherForecastsForSession(sessionId: string) {
    const results = {};
    const session: UserPreference | null= await this.userPreferenceService.getUserPreferences(sessionId)
    if (session)
      for (const  city of session.cities) {
        try {
          const forecast = await this.getWeatherForecast(city);
          results[city] = forecast.current;
        } catch (error) {
          this.logger.warn(`Skipping city ${city}: ${error.message}`);
          results[city] = { error: error.message };
        }
      }
  
    return results;
  }
}
