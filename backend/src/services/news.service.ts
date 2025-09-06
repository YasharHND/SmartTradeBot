import { NewsRepository } from '@/repositories/news.repository';
import { News, NewsSchema } from '@/schemas/news.schema';
import { LogUtil, Logger } from '@/utils/log.util';

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

  async saveAll(inputs: unknown[]): Promise<News[]> {
    if (inputs.length === 0) {
      return [];
    }

    try {
      const newsItems = inputs.map((input) => NewsSchema.parse(input));
      return this.newsRepository.saveAll(newsItems);
    } catch (error) {
      this.logger.error('Error parsing news items for batch save', { error, count: inputs.length });
      throw error;
    }
  }
}
