import { ApiProperty } from "@nestjs/swagger";

export class GetPreferenceDto {
    @ApiProperty()
    sessionId: string;
    @ApiProperty()
    cities: string[];
  }