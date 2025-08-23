import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDto } from '../abstract-response.dto';

/**
 * Success response DTO for message
 */
export class SuccessMessageResponseDto extends AbstractResponseDto {
  /**
   * Response status
   * @example "SUCCESS"
   */
  @ApiProperty({ example: 'SUCCESS' })
  status: string = 'SUCCESS';

  /**
   * Success message
   * @example "Operation completed successfully"
   */
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  /**
   * Constructor
   * @param message Success message
   */
  constructor(message: string) {
    super();
    this.message = message;
  }
}
