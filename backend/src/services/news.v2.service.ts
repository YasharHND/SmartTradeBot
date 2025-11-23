import { NewsV2Repository } from '@/repositories/news.v2.repository';
import { NewsV2, NewsV2Schema } from '@/schemas/news.v2.schema';
import { Region } from '@/schemas/region.schema';
import { MediastackService } from '@/clients/mediastack/services/mediastack.service';
import { MediastackNewsQueryInputSchema } from '@/clients/mediastack/schemas/news-query.input.schema';
import { MediastackCategory } from '@/clients/mediastack/schemas/category.schema';
import { MediastackCountry } from '@/clients/mediastack/schemas/country.schema';
import { MediastackLanguage } from '@/clients/mediastack/schemas/language.schema';

export class NewsV2Service {
  private static _instance: NewsV2Service;

  public static get instance(): NewsV2Service {
    if (!NewsV2Service._instance) {
      NewsV2Service._instance = new NewsV2Service();
    }
    return NewsV2Service._instance;
  }

  private constructor(
    private readonly newsV2Repository: NewsV2Repository = NewsV2Repository.instance,
    private readonly mediastackService: MediastackService = MediastackService.instance
  ) {}

  async fetchUnstored(): Promise<NewsV2[]> {
    const date = new Date().toISOString().split('T')[0];
    const storedNews = await this.getAllAtDate(date);
    const storedNewsIds = new Set(storedNews.map((news) => news.id));

    const usNewsQuery = {
      categories: [MediastackCategory.BUSINESS].join(','),
      countries: [MediastackCountry.UNITED_STATES].join(','),
      languages: [MediastackLanguage.ENGLISH].join(','),
      date,
      limit: 100,
    };

    const globalNewsQuery = {
      categories: [MediastackCategory.BUSINESS].join(','),
      countries: `-${MediastackCountry.UNITED_STATES}`,
      date,
      limit: 100,
    };

    const usNews = await this.fetchUntilDuplicate(usNewsQuery, storedNewsIds);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const globalNews = await this.fetchUntilDuplicate(globalNewsQuery, storedNewsIds);

    return [...usNews, ...globalNews];
  }

  async findLatestByRegion(region: Region, limit: number): Promise<NewsV2[]> {
    return this.newsV2Repository.findLatestByRegion(region, limit);
  }

  async saveAll(inputs: unknown[]): Promise<NewsV2[]> {
    if (inputs.length === 0) {
      return [];
    }

    const newsItems = inputs.map((input) => NewsV2Schema.parse(input));
    return this.newsV2Repository.saveAll(newsItems);
  }

  private async getAllAtDate(date: string): Promise<NewsV2[]> {
    return this.newsV2Repository.findAllAtDate(date);
  }

  private async fetchUntilDuplicate(
    baseQuery: Record<string, string | number>,
    storedNewsIds: Set<string>
  ): Promise<NewsV2[]> {
    const allNews: NewsV2[] = [];
    let offset = 0;
    const limit = baseQuery.limit as number;

    while (true) {
      const query = { ...baseQuery, offset };

      const response = await this.mediastackService.getNews(MediastackNewsQueryInputSchema.parse(query));

      if (response.data.length === 0) {
        break;
      }

      let foundDuplicate = false;

      for (const news of response.data) {
        if (storedNewsIds.has(news.id)) {
          foundDuplicate = true;
          break;
        }
        allNews.push(news);
      }

      if (foundDuplicate) {
        break;
      }

      if (response.data.length < limit) {
        break;
      }

      offset += limit;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return allNews;
  }
}
