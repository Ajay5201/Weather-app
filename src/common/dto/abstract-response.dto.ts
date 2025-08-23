import { ApiProperty } from '@nestjs/swagger';

/**
 * Abstract base class for all API responses
 */
export abstract class AbstractResponseDto {
  /**
   * Response status
   * @example "SUCCESS"
   */
  @ApiProperty({ example: 'SUCCESS' })
  status: string;
}
