import { z } from 'zod';
import { BaseDynamoDBSchema, BaseEntity } from '@entities/base.entity';
import { NewsV2, NewsV2Schema, NewsV2Key } from '@/schemas/news.v2.schema';

export const NewsV2DynamoDBSchema = BaseDynamoDBSchema.extend(NewsV2Schema.shape);

export type NewsV2DynamoDB = z.infer<typeof NewsV2DynamoDBSchema>;

export class NewsV2Entity extends BaseEntity<NewsV2Key, NewsV2, NewsV2DynamoDB> {
  protected domainSchema = NewsV2Schema;
  protected dynamoDBSchema = NewsV2DynamoDBSchema;
  protected updateDynamoDBSchema = NewsV2DynamoDBSchema.partial();

  protected getPK(partialDomainModel: NewsV2Key): string {
    return `NEWS_V2#${partialDomainModel.id}`;
  }

  protected getSK(partialDomainModel: NewsV2Key): string {
    return `PUBLISHED_AT#${partialDomainModel.published_at}`;
  }

  protected getGSI1PK(_partialDomainModel: NewsV2Key): string {
    return 'NEWS_V2';
  }

  protected getGSI1SK(partialDomainModel: NewsV2Key): string {
    return partialDomainModel.published_at;
  }

  protected getGSI1PKForUpdate(_partialDomainModel: Partial<NewsV2Key> & NewsV2Key): { GSI1PK: string } {
    return { GSI1PK: 'NEWS_V2' };
  }

  protected getGSI1SKForUpdate(partialDomainModel: Partial<NewsV2Key> & NewsV2Key): { GSI1SK: string } {
    return { GSI1SK: partialDomainModel.published_at };
  }

  protected getGSI2PK(partialDomainModel: NewsV2): string {
    return `REGION#${partialDomainModel.region}`;
  }

  protected getGSI2SK(partialDomainModel: NewsV2): string {
    return partialDomainModel.published_at;
  }

  protected getGSI2PKForUpdate(partialDomainModel: Partial<NewsV2> & NewsV2Key): { GSI2PK: string } {
    return { GSI2PK: `REGION#${partialDomainModel.region}` };
  }

  protected getGSI2SKForUpdate(partialDomainModel: Partial<NewsV2> & NewsV2Key): { GSI2SK: string } {
    return { GSI2SK: partialDomainModel.published_at };
  }
}
