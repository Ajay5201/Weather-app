import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';
import {
  SuccessObjectResponseDto,
  SuccessArrayResponseDto,
  SuccessPaginatedResponseDto,
  SuccessMessageResponseDto,
} from '../dto';

/**
 * Success object response decorator
 * @param model Response DTO type
 * @param options Additional options for the response
 */
export const ApiSuccessObjectResponse = <T extends Type<any>>(
  model: T,
  options: Partial<{ description: string }> = {},
) => {
  return applyDecorators(
    ApiExtraModels(SuccessObjectResponseDto, model), // 👈 add both
    ApiOkResponse({
      description: options.description || 'Successful response with object data',
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessObjectResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Success array response decorator
 * @param model Response DTO type for array items
 * @param options Additional options for the response
 */
export const ApiSuccessArrayResponse = <T extends Type<any>>(
  model: T,
  options: Partial<{ description: string }> = {},
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options.description || 'Successful response with array data',
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessArrayResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Success paginated response decorator
 * @param model Response DTO type for paginated items
 * @param options Additional options for the response
 */
export const ApiSuccessPaginatedResponse = <T extends Type<any>>(
  model: T,
  options: Partial<{ description: string }> = {},
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options.description || 'Successful response with paginated data',
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessPaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Success message response decorator
 * @param options Additional options for the response
 */
export const ApiSuccessMessageResponse = (options: Partial<{ description: string }> = {}) => {
  return ApiOkResponse({
    description: options.description || 'Successful response with message',
    type: SuccessMessageResponseDto,
  });
};
