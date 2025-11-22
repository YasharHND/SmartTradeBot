import { MediastackNewsQueryInput } from '@/clients/mediastack/schemas/news-query-input.schema';
import { MediastackNewsResponse, MediastackNewsResponseSchema } from '@/clients/mediastack/schemas/news-output.schema';
import { MediastackEnvironment } from '@/clients/mediastack/environments/mediastack.environment';

const MEDIASTACK_API_BASE_URL = 'https://api.mediastack.com/v1';

export class MediastackService {
  private static _instance: MediastackService;

  public static get instance(): MediastackService {
    if (!MediastackService._instance) {
      MediastackService._instance = new MediastackService(MediastackEnvironment.instance.getMediastackApiKey());
    }
    return MediastackService._instance;
  }

  private constructor(private readonly apiKey: string) {}

  async getNews(params: MediastackNewsQueryInput): Promise<MediastackNewsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    queryParams.append('access_key', this.apiKey);

    const url = `${MEDIASTACK_API_BASE_URL}/news?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Mediastack API request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return MediastackNewsResponseSchema.parse(json);
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }
}
