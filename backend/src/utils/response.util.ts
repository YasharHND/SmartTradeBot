import { type APIGatewayProxyResult } from 'aws-lambda';
import { ZodError } from 'zod';
import { ZodUtil } from '@utils/zod.util';

export class ResponseUtil {
  private constructor() {}

  static ok(body: unknown): APIGatewayProxyResult {
    return ResponseUtil.createResponse(200, body);
  }

  static badRequest(error: string | ZodError): APIGatewayProxyResult {
    const body = typeof error === 'string'
      ? { error }
      : { error: 'Bad Request', fields: ZodUtil.extractFieldErrors(error) };

    return ResponseUtil.createResponse(400, body);
  }
  
  static internalServerError(requestId: string): APIGatewayProxyResult {
    return ResponseUtil.createResponse(500, {
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
