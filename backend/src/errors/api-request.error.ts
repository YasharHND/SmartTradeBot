export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class BadRequestError extends ApiRequestError {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class MissingRequiredParameterError extends ApiRequestError {
  constructor(parameterName: string) {
    super(`Missing required parameter: ${parameterName}`);
    this.name = 'MissingRequiredParameterError';
  }
}
