import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDto } from '../abstract-response.dto';

/**
 * Success response DTO for paginated data
 */
export class SuccessPaginatedResponseDto<T> extends AbstractResponseDto {
  /**
   * Response status
   * @example "SUCCESS"
   */
  @ApiProperty({ example: 'SUCCESS' })
  status: string = 'SUCCESS';

  /**
   * Paginated data array
   */
  @ApiProperty({ type: 'array', isArray: true })
  data: T[];

  /**
   * Total count of items
   * @example 100
   */
  @ApiProperty({ example: 100 })
  totalCount: number;

  /**
   * Current page number
   * @example 1
   */
  @ApiProperty({ example: 1 })
  page: number;

  /**
   * Page size
   * @example 10
   */
  @ApiProperty({ example: 10 })
  size: number;

  /**
   * Constructor
   * @param data Array of items
   * @param totalCount Total count of items
   * @param page Current page number
   * @param size Page size
   */
  constructor(data: T[], totalCount: number, page: number, size: number) {
    super();
    this.data = data;
    this.totalCount = totalCount;
    this.page = page;
    this.size = size;
  }
}
