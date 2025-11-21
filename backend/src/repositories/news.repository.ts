import { DynamoDBService } from '@clients/aws/dynamodb/dynamodb.service';
import { NewsDynamoDB, NewsEntity } from '@entities/news.entity';
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

  async findLatest(): Promise<News | null> {
    try {
      const dynamoDBModels = await this.dynamodbService.query(
        'GSI1PK = :pk',
        {
          ':pk': 'NEWS',
        },
        {
          indexName: 'GSI1',
          scanIndexForward: false,
          limit: 1,
        }
      );

      if (dynamoDBModels.length === 0) {
        this.logger.info('No news found');
        return null;
      }

      const latestNews = this.entity.toDomainModel(dynamoDBModels[0] as NewsDynamoDB);
      this.logger.info('Successfully retrieved latest news', {
        id: latestNews.id,
        publishedAt: latestNews.publishedAt,
      });
      return latestNews;
    } catch (error) {
      this.logger.error('Failed to retrieve latest news', { error });
      throw new Error('Error retrieving latest news');
    }
  }

  async findAllAfter(after: string): Promise<News[]> {
    try {
      const dynamoDBModels = await this.dynamodbService.query(
        'GSI1PK = :pk AND GSI1SK > :after',
        {
          ':pk': 'NEWS',
          ':after': after,
        },
        {
          indexName: 'GSI1',
          scanIndexForward: false,
        }
      );

      const newsItems = dynamoDBModels.map((model) => this.entity.toDomainModel(model as NewsDynamoDB));
      this.logger.info('Successfully retrieved all news after', { after, count: newsItems.length });
      return newsItems;
    } catch (error) {
      this.logger.error('Failed to retrieve all news after', { error, after });
      throw new Error('Error retrieving all news after');
    }
  }
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
