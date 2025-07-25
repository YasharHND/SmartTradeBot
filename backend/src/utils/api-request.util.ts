import { APIGatewayProxyEvent } from 'aws-lambda';
import { MissingRequiredParameterError } from '@errors/api-request.error';

export function extractQueryParams(event: APIGatewayProxyEvent, requiredParams: string[] = []): Record<string, string> {
  const queryParams = event.queryStringParameters || {};
  const result: Record<string, string> = {};

  // Check for required parameters
  for (const param of requiredParams) {
    const value = queryParams[param];
    if (!value) {
      throw new MissingRequiredParameterError(param);
    }
    result[param] = value;
  }

  // Add optional parameters that are present
  for (const [key, value] of Object.entries(queryParams)) {
    if (!requiredParams.includes(key) && value) {
      result[key] = value;
    }
  }

  return result;
}
