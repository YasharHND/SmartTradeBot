import { DynamoDBService } from '@clients/aws/dynamodb/dynamodb.service';
import { NewsEntity } from '@entities/news.entity';
import { News } from '@schemas/news.schema';
import { LogUtil, Logger } from '@utils/log.util';

export class NewsRepository {
  private static _instance: NewsRepository;

  public static get instance(): NewsRepository {
    if (!NewsRepository._instance) {
      NewsRepository._instance = new NewsRepository();
    }
    return NewsRepository._instance;
  }

  private constructor(
    private readonly entity: NewsEntity = new NewsEntity(),
    private readonly dynamodbService: DynamoDBService = DynamoDBService.instance,
    private readonly logger: Logger = LogUtil.getLogger(NewsRepository.name)
  ) {}

  async saveAll(newsItems: News[]): Promise<News[]> {
    if (newsItems.length === 0) {
      return [];
    }

    const dynamoDBModels = newsItems.map((news) => this.entity.toDynamoDBModel(news));

    try {
      await this.dynamodbService.batchWriteItems(dynamoDBModels);
      this.logger.info('Batch news creation completed', { count: newsItems.length });
      return newsItems;
    } catch (error) {
      this.logger.error('Failed to batch create news', { error, count: newsItems.length });
      throw new Error('Error batch creating news');
    }
  }
}
