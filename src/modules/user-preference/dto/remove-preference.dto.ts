import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemovePreferenceDto {
  @ApiProperty({
    description: 'session id',
    example: 'b7ccfd18-6dc2-4d94-b2fc-47ce15ad0def',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'city name',
    example: 'Coimbatore',
  })
  @IsString()
  city: string;
}