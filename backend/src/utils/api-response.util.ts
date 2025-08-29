import { type APIGatewayProxyResult } from 'aws-lambda';
import { ZodError } from 'zod';
import { ZodUtil } from '@utils/zod.util';

export class ApiResponseUtil {
  private constructor() {}

  static ok(body: unknown): APIGatewayProxyResult {
    return ApiResponseUtil.createResponse(200, body);
  }

  static badRequest(error: string | ZodError): APIGatewayProxyResult {
    const body =
      typeof error === 'string' ? { error } : { error: 'Bad Request', fields: ZodUtil.extractFieldErrors(error) };

    return ApiResponseUtil.createResponse(400, body);
  }

  static internalServerError(requestId: string): APIGatewayProxyResult {
    return ApiResponseUtil.createResponse(500, {
      error: 'Internal server error',
      requestId,
    });
  }

  private static createResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  }
}
