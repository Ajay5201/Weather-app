import { ApiProperty } from '@nestjs/swagger';

export class CitySearchResultDto {
  @ApiProperty({ example: 'Coimbatore' })
  name: string;

  @ApiProperty({ example: 'IN' })
  country: string;

  @ApiProperty({ example: 'Tamil Nadu', required: false })
  state?: string;

  @ApiProperty({ example: 11.0168 })
  latitude: number;

  @ApiProperty({ example: 76.9558 })
  longitude: number;

  @ApiProperty({ example: 'Coimbatore, Tamil Nadu, IN' })
  displayName: string;
}
