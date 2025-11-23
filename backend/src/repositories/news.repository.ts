import { DynamoDBService } from '@clients/aws/dynamodb/dynamodb.service';
import { NewsDynamoDB, NewsEntity } from '@entities/news.entity';
import { News } from '@schemas/news.schema';

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
    private readonly dynamodbService: DynamoDBService = DynamoDBService.instance
  ) {}

  async findLatest(): Promise<News | null> {
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
      return null;
    }

    return this.entity.toDomainModel(dynamoDBModels[0] as NewsDynamoDB);
  }

  async findAllAfter(after: string): Promise<News[]> {
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

    return dynamoDBModels.map((model) => this.entity.toDomainModel(model as NewsDynamoDB));
  }

  async saveAll(newsItems: News[]): Promise<News[]> {
    if (newsItems.length === 0) {
      return [];
    }

    const dynamoDBModels = newsItems.map((news) => this.entity.toDynamoDBModel(news));
    await this.dynamodbService.batchWriteItems(dynamoDBModels);
    return newsItems;
  }
}
