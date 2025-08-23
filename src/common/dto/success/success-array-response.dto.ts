import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDto } from '../abstract-response.dto';

/**
 * Success response DTO for array data
 */
export class SuccessArrayResponseDto<T> extends AbstractResponseDto {
  /**
   * Response status
   * @example "SUCCESS"
   */
  @ApiProperty({ example: 'SUCCESS' })
  status: string = 'SUCCESS';

  /**
   * Array data
   */
  @ApiProperty({ type: 'array', isArray: true })
  data: T[];

  /**
   * Constructor
   * @param data Array data
   */
  constructor(data: T[]) {
    super();
    this.data = data;
  }
}
