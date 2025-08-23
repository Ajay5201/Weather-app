import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SuccessObjectResponseDto,
  SuccessArrayResponseDto,
  SuccessPaginatedResponseDto,
  SuccessMessageResponseDto,
} from '../../common/dto';

/**
 * Interceptor to automatically wrap responses in the appropriate response DTO
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercept method to transform the response
   * @param context Execution context
   * @param next Call handler
   * @returns Observable with transformed response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If the response is already wrapped in a response DTO, return it as is
        if (
          data instanceof SuccessObjectResponseDto ||
          data instanceof SuccessArrayResponseDto ||
          data instanceof SuccessPaginatedResponseDto ||
          data instanceof SuccessMessageResponseDto
        ) {
          return data;
        }

        // Check if it's a paginated response (has specific properties)
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'totalCount' in data &&
          'page' in data &&
          'size' in data
        ) {
          return new SuccessPaginatedResponseDto(data.items, data.totalCount, data.page, data.size);
        }

        // Check if it's a message response
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          Object.keys(data).length === 1
        ) {
          return new SuccessMessageResponseDto(data.message);
        }

        // Otherwise, wrap it in the appropriate response DTO based on type
        if (Array.isArray(data)) {
          return new SuccessArrayResponseDto(data);
        } else {
          return new SuccessObjectResponseDto(data);
        }
      }),
    );
  }
}
