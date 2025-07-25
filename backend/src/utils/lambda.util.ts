import { APIGatewayProxyResult } from 'aws-lambda';
import {
  createBadRequestApiResponse,
  createInternalErrorApiResponse,
  createValidationErrorResponse,
} from '@utils/api-response.util';
import { ApiRequestError } from '@errors/api-request.error';
import { ZodError } from 'zod';
import { getAppLogger } from '@utils/logger.util';

export type LambdaHandler<T = unknown> = (event: T) => Promise<APIGatewayProxyResult>;

export const withErrorHandling = <T = unknown>(handler: LambdaHandler<T>, loggerName: string): LambdaHandler<T> => {
  const logger = getAppLogger(loggerName);

  return async (event: T): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.warn('Invalid JSON format:', { error });
        return createBadRequestApiResponse('Invalid JSON format');
      }

      if (error instanceof ZodError) {
        logger.warn('Validation error:', { error });
        return createValidationErrorResponse(error);
      }

      if (error instanceof ApiRequestError) {
        logger.warn('Bad request:', { error });
        return createBadRequestApiResponse(error.message);
      }

      logger.error('Internal server error:', { error });
      return createInternalErrorApiResponse();
    }
  };
};
