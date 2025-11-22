import { NewsV2Repository } from '@repositories/news-v2.repository';
import { NewsV2, NewsV2Schema } from '@schemas/news-v2.schema';
import { LogUtil, Logger } from '@utils/log.util';
import { MediastackService } from '@/clients/mediastack/services/mediastack.service';
import { MediastackNewsQueryInputSchema } from '@/clients/mediastack/schemas/news-query-input.schema';
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
    private readonly mediastackService: MediastackService = MediastackService.instance,
    private readonly logger: Logger = LogUtil.getLogger(NewsV2Service.name)
  ) {}

  async fetchUnstored(): Promise<NewsV2[]> {
    try {
      this.logger.info('Fetching news from Mediastack');

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

      const allNews = [...usNews, ...globalNews];

      this.logger.info('Fetched all unstored news', {
        usNewsCount: usNews.length,
        globalNewsCount: globalNews.length,
        totalArticles: allNews.length,
      });

      return allNews;
    } catch (error) {
      this.logger.error('Error fetching unstored news', { error });
      throw error;
    }
  }

  async saveAll(inputs: unknown[]): Promise<NewsV2[]> {
    if (inputs.length === 0) {
      return [];
    }

    try {
      const newsItems = inputs.map((input) => NewsV2Schema.parse(input));

      return this.newsV2Repository.saveAll(newsItems);
    } catch (error) {
      this.logger.error('Error parsing news items for batch save', { error, count: inputs.length });
      throw error;
    }
  }

  private async getAllAtDate(date: string): Promise<NewsV2[]> {
    try {
      return this.newsV2Repository.findAllAtDate(date);
    } catch (error) {
      this.logger.error('Error retrieving all news at date', { error, date });
      throw error;
    }
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

      this.logger.info('Fetching news batch', { offset, limit });

      const response = await this.mediastackService.getNews(MediastackNewsQueryInputSchema.parse(query));

      if (response.data.length === 0) {
        this.logger.info('No more news available');
        break;
      }

      let foundDuplicate = false;

      for (const news of response.data) {
        if (storedNewsIds.has(news.id)) {
          this.logger.info('Found duplicate, stopping fetch', { newsId: news.id, offset });
          foundDuplicate = true;
          break;
        }
        allNews.push(news);
      }

      if (foundDuplicate) {
        break;
      }

      if (response.data.length < limit) {
        this.logger.info('Reached end of available news');
        break;
      }

      offset += limit;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return allNews;
  }
}
