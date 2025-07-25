import { type APIGatewayProxyResult } from 'aws-lambda';
import { ZodError } from 'zod';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
};
export function createRestApiResponse(
  body: unknown,
  statusCode = 200,
  headers: Record<string, string> = defaultHeaders
): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
}

export function createCreatedApiResponse(): APIGatewayProxyResult {
  return {
    statusCode: 201,
    body: '',
    headers: defaultHeaders,
  };
}

export function createNoContentApiResponse(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    body: '',
    headers: defaultHeaders,
  };
}

export function createBadRequestApiResponse(message: string): APIGatewayProxyResult {
  return createRestApiResponse({ error: message }, 400);
}

export function createValidationErrorResponse(error: ZodError): APIGatewayProxyResult {
  const fieldErrors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return createRestApiResponse(
    {
      error: 'Validation error',
      fields: fieldErrors,
    },
    400
  );
}

export function createNotFoundApiResponse(message = 'Not Found'): APIGatewayProxyResult {
  return createRestApiResponse({ error: message }, 404);
}

export function createInternalErrorApiResponse(): APIGatewayProxyResult {
  return createRestApiResponse(
    {
      error: 'Internal server error',
    },
    500
  );
}
