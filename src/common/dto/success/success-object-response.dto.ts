import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDto } from '../abstract-response.dto';

/**
 * Success response DTO for object data
 */
export class SuccessObjectResponseDto<T> extends AbstractResponseDto {
  /**
   * Response status
   * @example "SUCCESS"
   */
  @ApiProperty({ example: 'SUCCESS' })
  status: string = 'SUCCESS';

  /**
   * Object data
   */
  @ApiProperty({ type: Object })
  data: T;

  /**
   * Constructor
   * @param data Object data
   */
  constructor(data: T) {
    super();
    this.data = data;
  }
}
