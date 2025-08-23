import { ApiProperty } from '@nestjs/swagger';

/**
 * Error detail interface for validation errors
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * API Constants
 */
export class ApiConstants {
  public static readonly SUCCESS = 'SUCCESS';
  public static readonly ERROR = 'ERROR';
}

/**
 * Standardized error response DTO
 */
export class ErrorResponseDto<T = any> {
  /**
   * Response status
   * @example "ERROR"
   */
  @ApiProperty({ example: 'ERROR' })
  private readonly status: string = ApiConstants.ERROR;

  /**
   * Error details
   */
  @ApiProperty()
  private error: T;

  /**
   * Get error details
   * @returns Error details
   */
  public getError(): T {
    return this.error;
  }

  /**
   * Set error details
   * @param error Error details
   */
  public setError(error: T): void {
    this.error = error;
  }

  /**
   * Get response status
   * @returns Response status
   */
  public getStatus(): string {
    return this.status;
  }

  /**
   * Constructor
   * @param error Error details
   */
  constructor(error: T) {
    this.error = error;
  }
}

/**
 * Standard error details structure
 */
export class StandardErrorDetails {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: '2023-07-15T10:30:45.123Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/users' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  traceId: string;

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string', example: 'email' },
        message: { type: 'string', example: 'Must be a valid email address' },
      },
    },
  })
  errors?: ErrorDetail[];
}
