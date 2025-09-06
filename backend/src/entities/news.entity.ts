import { z } from 'zod';
import { BaseDynamoDBSchema, BaseEntity } from '@entities/base.entity';
import { News, NewsSchema } from '@schemas/news.schema';

export type NewsKey = {
  id: string;
  source: {
    country: string;
  };
  publishedAt: string;
};

export const NewsDynamoDBSchema = BaseDynamoDBSchema.extend(NewsSchema.shape);

export type NewsDynamoDB = z.infer<typeof NewsDynamoDBSchema>;

export class NewsEntity extends BaseEntity<NewsKey, News, NewsDynamoDB> {
  protected domainSchema = NewsSchema;
  protected dynamoDBSchema = NewsDynamoDBSchema;
  protected updateDynamoDBSchema = NewsDynamoDBSchema.partial();

  protected getPK(partialDomainModel: NewsKey): string {
    return `NEWS#${partialDomainModel.id}`;
  }

  protected getSK(partialDomainModel: NewsKey): string {
    return `COUNTRY#${partialDomainModel.source.country}`;
  }

  protected getGSI1PK(partialDomainModel: NewsKey): string {
    return `COUNTRY#${partialDomainModel.source.country}`;
  }

  protected getGSI1SK(partialDomainModel: NewsKey): string {
    return `PUBLISHED_AT#${partialDomainModel.publishedAt}`;
  }

  protected getGSI1PKForUpdate(partialDomainModel: Partial<NewsKey> & NewsKey): { GSI1PK: string } {
    return { GSI1PK: `COUNTRY#${partialDomainModel.source.country}` };
  }

  protected getGSI1SKForUpdate(partialDomainModel: Partial<NewsKey> & NewsKey): { GSI1SK: string } {
    return { GSI1SK: `PUBLISHED_AT#${partialDomainModel.publishedAt}` };
  }

  create(domainModel: News): News {
    return domainModel;
  }
}
