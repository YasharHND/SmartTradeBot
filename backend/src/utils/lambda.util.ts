import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { RequestError } from '@errors/request.error';
import { ZodError } from 'zod';
import { LogUtil } from '@utils/log.util';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponseUtil } from '@utils/api-response.util';
import { ApiRequest } from '@models/api-request.model';

export type LambdaHandler = (event: unknown) => Promise<unknown>;

export type ApiHandler = (request: ApiRequest) => Promise<unknown>;

type ProxiedApiHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

export class LambdaUtil {
  private constructor() {}

  static proxy(handler: LambdaHandler): LambdaHandler {
    const logger = LogUtil.getLogger(handler.name);

    return async (event: unknown): Promise<unknown> => {
      logger.info('Received event', { event });
      try {
        const response = await handler(event);
        logger.info('Returning response', { response });
        return response;
      } catch (error) {
        throw error;
      }
    };
  }

  static proxyApi(handler: ApiHandler): ProxiedApiHandler {
    const logger = LogUtil.getLogger(handler.name);

    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      logger.info('Received event', { event });

      try {
        const body = event.body !== null ? JSON.parse(event.body) : null;

        const apiRequest: ApiRequest = {
          body,
          pathParameters: event.pathParameters,
          queryStringParameters: event.queryStringParameters,
        };

        const response = await handler(apiRequest);
        logger.info('Returning response', { response });
        return ApiResponseUtil.ok(response);
      } catch (error) {
        if (error instanceof SyntaxError) {
          logger.warn('Invalid JSON format', { error });
          return ApiResponseUtil.badRequest('Invalid JSON format');
        }

        if (error instanceof ZodError) {
          logger.warn('Validation error', { error });
          return ApiResponseUtil.badRequest(error);
        }

        if (error instanceof RequestError) {
          logger.warn('Request error', { error });
          return ApiResponseUtil.badRequest(error.message);
        }

        const requestId = uuidv4();
        logger.error('Internal server error', { requestId, error });
        return ApiResponseUtil.internalServerError(requestId);
      }
    };
  }
}
