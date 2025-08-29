import { GNewsTopHeadlinesQueryInput } from './schemas/top-headlines-query-input.schema';

const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';

export class GNewsService {
  constructor(private readonly apiKey: string) {}

  async getTopHeadlines(params: GNewsTopHeadlinesQueryInput = {}): Promise<unknown> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'q') {
          // Special handling for query parameter - wrap in quotes and URL encode
          const quotedQuery = `"${value.toString()}"`;
          queryParams.append(key, encodeURIComponent(quotedQuery));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    queryParams.append('apikey', this.apiKey);

    const url = `${GNEWS_API_BASE_URL}/top-headlines?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GNews API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }
}
