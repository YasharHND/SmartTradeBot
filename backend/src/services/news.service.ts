import { NewsRepository } from '@repositories/news.repository';
import { News, NewsSchema } from '@schemas/news.schema';

export class NewsService {
  private static _instance: NewsService;

  public static get instance(): NewsService {
    if (!NewsService._instance) {
      NewsService._instance = new NewsService();
    }
    return NewsService._instance;
  }

  private constructor(private readonly newsRepository: NewsRepository = NewsRepository.instance) {}

  async getLatest(): Promise<News | null> {
    return this.newsRepository.findLatest();
  }

  async getAllAfter(after: string): Promise<News[]> {
    return this.newsRepository.findAllAfter(after);
  }

  async saveAll(inputs: unknown[]): Promise<News[]> {
    if (inputs.length === 0) {
      return [];
    }

    const newsItems = inputs.map((input) => NewsSchema.parse(input));
    const uniqueNewsItems = this.removeDuplicates(newsItems);

    return this.newsRepository.saveAll(uniqueNewsItems);
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
