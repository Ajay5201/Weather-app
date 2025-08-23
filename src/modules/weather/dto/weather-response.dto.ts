import { ApiProperty } from "@nestjs/swagger";

export class CurrentWeatherDto {
  @ApiProperty()
  temperature: number;
  @ApiProperty()
  feelsLike: number;
  @ApiProperty()
  condition: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  humidity: number;
  @ApiProperty()
  windSpeed: number;
  @ApiProperty()
  windDirection: string;
  @ApiProperty()
  pressure: number;
  @ApiProperty()
  sunrise: string; // ISO time
  @ApiProperty()
  sunset: string;  // ISO time
  @ApiProperty()
  uvIndex?: number;
  @ApiProperty()
  aqi?: number;
}

export class HourlyWeatherDto {
  @ApiProperty()
  time: string; // "2025-08-23T15:00:00Z"
  @ApiProperty()
  temperature: number;
  @ApiProperty()
  feelsLike: number;
  @ApiProperty()
  condition: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  precipitationChance: number;
  @ApiProperty()
  windSpeed: number;
}

export class DailyWeatherDto {
  @ApiProperty()
  date: string; // "2025-08-24"
  @ApiProperty()
  minTemp: number;
  @ApiProperty()
  maxTemp: number;
  @ApiProperty()
  condition: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  precipitationChance: number;
  @ApiProperty()
  windSpeed?: number;
}

export class WeatherResponseDto {
  @ApiProperty()
  city: string;
  @ApiProperty({ type: () => CurrentWeatherDto })
  current: CurrentWeatherDto;
  @ApiProperty({ type: () => [HourlyWeatherDto] })
  hourly: HourlyWeatherDto[];
  @ApiProperty({ type: () => [DailyWeatherDto] })
  daily: DailyWeatherDto[];
}
