import { pick } from 'lodash';
import { GNewsTopHeadlinesQueryInput } from '@clients/gnews/schemas/top-headlines-query-input.schema';
import { GNewsNews } from '@clients/gnews/models/news.model';
import { GNewsCompactArticle } from '@clients/gnews/models/compact-article.model';
import { GnewsEnvironment } from '@/clients/gnews/environments/gnews.environment';

const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';

export class GNewsService {
  private static _instance: GNewsService;

  public static get instance(): GNewsService {
    if (!GNewsService._instance) {
      GNewsService._instance = new GNewsService(GnewsEnvironment.instance.getGnewsApiKey());
    }
    return GNewsService._instance;
  }

  private constructor(private readonly apiKey: string) {}

  async getTopHeadlines(params: GNewsTopHeadlinesQueryInput): Promise<GNewsNews> {
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

    return response.json() as Promise<GNewsNews>;
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

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }
}
