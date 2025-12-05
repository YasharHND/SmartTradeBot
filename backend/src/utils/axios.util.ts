import { AxiosError, AxiosInstance } from 'axios';

export class AxiosUtil {
  private constructor() {}

  static setupErrorInterceptor(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.response.use(
      (response) => {
        if (response.status >= 200 && response.status < 300) {
          return response;
        }
        return Promise.reject(
          Object.assign(new Error(response.statusText || 'Request failed'), {
            config: response.config,
            response,
            status: response.status,
          })
        );
      },
      (error) => Promise.reject(error)
    );
  }

  static handleAxiosError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const errorDetails: Record<string, unknown> = {
        message: error.message,
        status: error.status,
      };

      if (error.config) {
        errorDetails.method = error.config.method;
        const fullUrl = `${error.config.baseURL}${error.config.url}`;
        errorDetails.url = fullUrl;
        errorDetails.params = error.config.params;

        if (error.config.data) {
          errorDetails.requestBody = this.tryParseJson(error.config.data);
        }
      }

      if (error.response) {
        if (error.response.data) {
          errorDetails.responseBody = this.tryParseJson(error.response.data);
        }
        errorDetails.responseStatus = error.response.status;
        errorDetails.responseHeaders = error.response.headers;
      }

      return new Error(JSON.stringify(errorDetails));
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  private static tryParseJson(data: unknown): unknown {
    try {
      return JSON.parse(data as string);
    } catch {
      return data;
    }
  }
}
