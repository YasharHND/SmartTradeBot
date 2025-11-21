import { NewsRepository } from '@repositories/news.repository';
import { News, NewsSchema } from '@schemas/news.schema';
import { LogUtil, Logger } from '@utils/log.util';

export class NewsService {
  private static _instance: NewsService;

  public static get instance(): NewsService {
    if (!NewsService._instance) {
      NewsService._instance = new NewsService();
    }
    return NewsService._instance;
  }

  private constructor(
    private readonly newsRepository: NewsRepository = NewsRepository.instance,
    private readonly logger: Logger = LogUtil.getLogger(NewsService.name)
  ) {}

  async getLatest(): Promise<News | null> {
    try {
      return this.newsRepository.findLatest();
    } catch (error) {
      this.logger.error('Error retrieving latest news', { error });
      throw error;
    }
  }

  async getAllAfter(after: string): Promise<News[]> {
    try {
      return this.newsRepository.findAllAfter(after);
    } catch (error) {
      this.logger.error('Error retrieving all news after', { error, after });
      throw error;
    }
  }

  async saveAll(inputs: unknown[]): Promise<News[]> {
    if (inputs.length === 0) {
      return [];
    }

    try {
      const newsItems = inputs.map((input) => NewsSchema.parse(input));
      const uniqueNewsItems = this.removeDuplicates(newsItems);

      this.logger.info('Removed duplicates', {
        originalCount: newsItems.length,
        uniqueCount: uniqueNewsItems.length,
        duplicatesRemoved: newsItems.length - uniqueNewsItems.length,
      });

      return this.newsRepository.saveAll(uniqueNewsItems);
    } catch (error) {
      this.logger.error('Error parsing news items for batch save', { error, count: inputs.length });
      throw error;
    }
  }

  private removeDuplicates(newsItems: News[]): News[] {
    const seen = new Map<string, News>();

    newsItems.forEach((news) => {
      if (!seen.has(news.id)) {
        seen.set(news.id, news);
      }
    });

    return Array.from(seen.values());
  }
}
