import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Global HTTP exception filter
 * Handles all exceptions thrown in the application
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catches and formats HTTP exceptions
   * @param exception The exception object
   * @param host The arguments host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate a unique trace ID for this error
    const traceId = randomUUID();

    // Determine status code and error details
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let errorName = 'Internal Server Error';
    let validationErrors = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Handle validation errors
      if (typeof exceptionResponse === 'object') {
        errorMessage = exceptionResponse.message || exception.message;
        errorName = exceptionResponse.error || exception.name;

        // Extract validation errors if available
        if (Array.isArray(exceptionResponse.message)) {
          errorMessage = 'Validation failed';
          validationErrors = exceptionResponse.message.map(msg => {
            const parts = msg.split(': ');
            return {
              field: parts[0],
              message: parts[1] || msg,
            };
          });
        }
      } else {
        errorMessage = exception.message;
        errorName = exception.name;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorName = exception.name;
    }

    // Build the error response
    const errorResponse: any = {
      statusCode: status,
      message: errorMessage,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      traceId: traceId,
    };

    // Add validation errors if present
    if (validationErrors) {
      errorResponse.errors = validationErrors;
    }

    // In production, you might want to hide detailed error information for 500 errors
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = 'Internal server error';
      // Still log the actual error details
    }

    this.logger.error(
      `[${traceId}] ${request.method} ${request.url} ${status}: ${errorMessage}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json(errorResponse);
  }
}
