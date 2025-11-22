import { z } from 'zod';
import { ObjectUtil } from '@utils/object.util';
import { UpdateDynamoDBModel } from '@/clients/aws/dynamodb/dynamodb-model.schema';

export const BaseDynamoDBSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  GSI1PK: z.string().optional(),
  GSI1SK: z.string().optional(),
  GSI2PK: z.string().optional(),
  GSI2SK: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const KeySchema = z.object({ PK: z.string(), SK: z.string() });
export const GSI1KeySchema = z.object({ GSI1PK: z.string(), GSI1SK: z.string() });
export const GSI2KeySchema = z.object({ GSI2PK: z.string(), GSI2SK: z.string() });

export const GSI1_KEY_FIELDS = {
  PK: 'GSI1PK',
  SK: 'GSI1SK',
} as const;

export const GSI2_KEY_FIELDS = {
  PK: 'GSI2PK',
  SK: 'GSI2SK',
} as const;

export type Key = z.infer<typeof KeySchema>;
export type GSI1Key = z.infer<typeof GSI1KeySchema>;
export type GSI2Key = z.infer<typeof GSI2KeySchema>;
export type BaseDynamoDB = z.infer<typeof BaseDynamoDBSchema>;

export abstract class BaseEntity<KeyType, T extends KeyType, U extends BaseDynamoDB> {
  protected abstract domainSchema: z.ZodType<T>;
  protected abstract dynamoDBSchema: z.ZodType<U>;
  protected abstract updateDynamoDBSchema: z.ZodType<Partial<U>>;

  protected abstract getPK(domainModel: KeyType): string;
  protected abstract getSK(domainModel: KeyType): string;

  protected abstract getGSI1PK(domainModel: KeyType): string;
  protected abstract getGSI1SK(domainModel: KeyType): string;

  protected abstract getGSI1PKForUpdate(domainModel: Partial<KeyType>): { GSI1PK: string };
  protected abstract getGSI1SKForUpdate(domainModel: Partial<KeyType>): { GSI1SK: string };

  protected getGSI2PK(_domainModel: KeyType): string | undefined {
    return undefined;
  }

  protected getGSI2SK(_domainModel: KeyType): string | undefined {
    return undefined;
  }

  protected getGSI2PKForUpdate(_domainModel: Partial<KeyType>): { GSI2PK?: string } {
    return {};
  }

  protected getGSI2SKForUpdate(_domainModel: Partial<KeyType>): { GSI2SK?: string } {
    return {};
  }

  toDynamoDBModel(domainModel: T): U {
    const now = new Date().toISOString();

    const baseModel = {
      ...this.getKey(domainModel),
      ...this.getGSI1Key(domainModel),
      ...this.getGSI2Key(domainModel),
      createdAt: now,
      updatedAt: now,
    };

    return this.dynamoDBSchema.parse({ ...domainModel, ...baseModel });
  }

  toDynamoDBModelForUpdate(domainModel: Partial<T> & KeyType): UpdateDynamoDBModel<U> {
    const now = new Date().toISOString();

    const baseModel = {
      ...this.getGSI1KeyForUpdate(domainModel),
      ...this.getGSI2KeyForUpdate(domainModel),
      updatedAt: now,
    };

    const updates = this.updateDynamoDBSchema.parse({ ...domainModel, ...baseModel });

    return {
      key: this.getKey(domainModel),
      updates,
    };
  }

  toDomainModel(dynamoDBModel: U): T {
    return this.domainSchema.parse(dynamoDBModel);
  }

  getKey(entity: KeyType): Key {
    return { PK: this.getPK(entity), SK: this.getSK(entity) };
  }

  getGSI1Key(entity: KeyType): Partial<GSI1Key> {
    return {
      ...ObjectUtil.optionalField(this.getGSI1PK(entity), GSI1_KEY_FIELDS.PK),
      ...ObjectUtil.optionalField(this.getGSI1SK(entity), GSI1_KEY_FIELDS.SK),
    };
  }

  getGSI1KeyForUpdate(entity: Partial<T> & KeyType): Partial<GSI1Key> {
    return {
      ...this.getGSI1PKForUpdate(entity),
      ...this.getGSI1SKForUpdate(entity),
    };
  }

  getGSI2Key(entity: KeyType): Partial<GSI2Key> {
    return {
      ...ObjectUtil.optionalField(this.getGSI2PK(entity), GSI2_KEY_FIELDS.PK),
      ...ObjectUtil.optionalField(this.getGSI2SK(entity), GSI2_KEY_FIELDS.SK),
    };
  }

  getGSI2KeyForUpdate(entity: Partial<T> & KeyType): Partial<GSI2Key> {
    return {
      ...this.getGSI2PKForUpdate(entity),
      ...this.getGSI2SKForUpdate(entity),
    };
  }
}
