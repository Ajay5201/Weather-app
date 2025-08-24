import { ApiProperty } from '@nestjs/swagger';

export class CitySearchResultDto {
  @ApiProperty({ example: 'Coimbatore' })
  name: string;

  @ApiProperty({ example: 'IN' })
  country: string;

  @ApiProperty({ example: 'Coimbatore, Tamil Nadu, IN' })
  displayName: string;
}
