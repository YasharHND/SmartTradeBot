import axios, { AxiosInstance } from 'axios';
import { pick } from 'lodash';
import { GNewsTopHeadlinesQueryInput } from '@/clients/gnews/schemas/top-headlines-query.input.schema';
import { GNewsNews } from '@clients/gnews/models/news.model';
import { GNewsCompactArticle } from '@clients/gnews/models/compact-article.model';
import { GnewsEnvironment } from '@/clients/gnews/environments/gnews.environment';
import { AxiosUtil } from '@/utils/axios.util';

export class GNewsService {
  private static _instance: GNewsService;
  private readonly axiosInstance: AxiosInstance;

  public static get instance(): GNewsService {
    if (!GNewsService._instance) {
      GNewsService._instance = new GNewsService(GnewsEnvironment.instance.getGnewsApiKey());
    }
    return GNewsService._instance;
  }

  private constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://gnews.io/api/v4',
      validateStatus: () => true,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        apikey: apiKey,
      };
      return config;
    });

    AxiosUtil.setupErrorInterceptor(this.axiosInstance);
  }

  async getTopHeadlines(params: GNewsTopHeadlinesQueryInput): Promise<GNewsNews> {
    const queryParams: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'q') {
          const quotedQuery = `"${value.toString()}"`;
          queryParams[key] = encodeURIComponent(quotedQuery);
        } else {
          queryParams[key] = value.toString();
        }
      }
    });

    try {
      const response = await this.axiosInstance.get('/top-headlines', {
        params: queryParams,
      });

      return response.data as GNewsNews;
    } catch (error: unknown) {
      throw AxiosUtil.handleAxiosError(error);
    }
  }

  compactNewsArticle(article: unknown): GNewsCompactArticle {
    return pick(article, [
      'title',
      'description',
      'content',
      'publishedAt',
      'source.name',
      'source.country',
    ]) as GNewsCompactArticle;
  }
}
