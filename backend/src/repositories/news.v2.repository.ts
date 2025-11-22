import { DynamoDBService } from '@clients/aws/dynamodb/dynamodb.service';
import { NewsV2DynamoDB, NewsV2Entity } from '@/entities/news.v2.entity';
import { NewsV2 } from '@/schemas/news.v2.schema';
import { Region } from '@/schemas/region.schema';
import { LogUtil, Logger } from '@utils/log.util';

export class NewsV2Repository {
  private static _instance: NewsV2Repository;

  public static get instance(): NewsV2Repository {
    if (!NewsV2Repository._instance) {
      NewsV2Repository._instance = new NewsV2Repository();
    }
    return NewsV2Repository._instance;
  }

  private constructor(
    private readonly entity: NewsV2Entity = new NewsV2Entity(),
    private readonly dynamodbService: DynamoDBService = DynamoDBService.instance,
    private readonly logger: Logger = LogUtil.getLogger(NewsV2Repository.name)
  ) {}

  async findAllAtDate(date: string): Promise<NewsV2[]> {
    try {
      const dynamoDBModels = await this.dynamodbService.query(
        'GSI1PK = :pk AND begins_with(GSI1SK, :date)',
        {
          ':pk': 'NEWS_V2',
          ':date': date,
        },
        {
          indexName: 'GSI1',
          scanIndexForward: false,
        }
      );

      const newsItems = dynamoDBModels.map((model) => this.entity.toDomainModel(model as NewsV2DynamoDB));
      this.logger.info('Successfully retrieved all news at date', { date, count: newsItems.length });
      return newsItems;
    } catch (error) {
      this.logger.error('Failed to retrieve all news at date', { error, date });
      throw new Error('Error retrieving all news at date');
    }
  }

  async findLatestByRegion(region: Region, limit: number): Promise<NewsV2[]> {
    try {
      const dynamoDBModels = await this.dynamodbService.query(
        'GSI2PK = :pk',
        {
          ':pk': `REGION#${region}`,
          ':gsi1pk': 'NEWS_V2',
        },
        {
          indexName: 'GSI2',
          filterExpression: 'GSI1PK = :gsi1pk',
          scanIndexForward: false,
          limit,
        }
      );

      const newsItems = dynamoDBModels.map((model) => this.entity.toDomainModel(model as NewsV2DynamoDB));
      this.logger.info('Successfully retrieved latest news by region', { region, count: newsItems.length, limit });
      return newsItems;
    } catch (error) {
      this.logger.error('Failed to retrieve latest news by region', { error, region });
      throw new Error('Error retrieving latest news by region');
    }
  }

  async saveAll(newsItems: NewsV2[]): Promise<NewsV2[]> {
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
