import { ApiProperty } from '@nestjs/swagger';
import { CurrentWeatherDto } from './weather-response.dto';

export class CityCurrentWeatherErrorDto {
  @ApiProperty({ example: 'City "XYZ" not found' })
  error: string;
}

export class CityCurrentWeatherEntryDto {
  @ApiProperty({ type: () => CurrentWeatherDto, required: false })
  current?: CurrentWeatherDto;

  @ApiProperty({ type: () => CityCurrentWeatherErrorDto, required: false })
  error?: CityCurrentWeatherErrorDto;
}


export class MultipleCityCurrentWeatherMapDto {
  @ApiProperty({ example: 'Coimbatore' })
  city: string;

  @ApiProperty({ type: () => CurrentWeatherDto, required: false })
  current?: CurrentWeatherDto;

  @ApiProperty({ type: () => String, required: false })
  error?: string;
}
