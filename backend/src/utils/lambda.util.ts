import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestError } from '@errors/request.error';
import { ZodError } from 'zod';
import { LogUtil } from '@utils/log.util';
import { v4 as uuidv4 } from 'uuid';
import { ResponseUtil } from '@utils/response.util';

export type LambdaHandler = (event: unknown) => Promise<unknown>;

type ProxiedLambdaHandler = (event: unknown) => Promise<APIGatewayProxyResult>;

export class LambdaUtil {
  private constructor() {}

  static proxy(handler: LambdaHandler): ProxiedLambdaHandler {
    const logger = LogUtil.getLogger(handler.name);

    return async (event: unknown): Promise<APIGatewayProxyResult> => {
      logger.info('Received event', { event });

      try {
        const response = await handler(event);
        logger.info('Returning response', { response });
        return ResponseUtil.ok(response);
      } catch (error) {
        if (error instanceof SyntaxError) {
          logger.warn('Invalid JSON format', { error });
          return ResponseUtil.badRequest('Invalid JSON format');
        }

        if (error instanceof ZodError) {
          logger.warn('Validation error', { error });
          return ResponseUtil.badRequest(error);
        }

        if (error instanceof RequestError) {
          logger.warn('Request error', { error });
          return ResponseUtil.badRequest(error.message);
        }

        const requestId = uuidv4();
        logger.error('Internal server error', { requestId, error });
        return ResponseUtil.internalServerError(requestId);
      }
    };
  }
}
