import axios, { AxiosInstance } from 'axios';
import { MediastackNewsQueryInput } from '@/clients/mediastack/schemas/news-query.input.schema';
import { MediastackNewsResponse, MediastackNewsResponseSchema } from '@/clients/mediastack/schemas/news.output.schema';
import { MediastackEnvironment } from '@/clients/mediastack/environments/mediastack.environment';

export class MediastackService {
  private static _instance: MediastackService;
  private readonly axiosInstance: AxiosInstance;

  public static get instance(): MediastackService {
    if (!MediastackService._instance) {
      MediastackService._instance = new MediastackService(MediastackEnvironment.instance.getMediastackApiKey());
    }
    return MediastackService._instance;
  }

  private constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.mediastack.com/v1',
    });

    this.axiosInstance.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        access_key: apiKey,
      };
      return config;
    });
  }

  async getNews(params: MediastackNewsQueryInput): Promise<MediastackNewsResponse> {
    const queryParams: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value.toString();
      }
    });

    const response = await this.axiosInstance.get('/news', {
      params: queryParams,
    });

    return MediastackNewsResponseSchema.parse(response.data);
  }
}
