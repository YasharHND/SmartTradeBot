import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ConditionalCheckFailedException,
  ScanCommand,
  BatchWriteItemCommand,
  AttributeValue,
  TransactWriteItemsCommand,
  TransactionCanceledException,
  TransactWriteItem,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBModel, DynamoDBKey, UpdateDynamoDBModel } from '@/clients/aws/dynamodb/dynamodb-model.schema';
import { LogUtil, Logger } from '@utils/log.util';
import { DynamoDBEnvironment } from '@clients/aws/dynamodb/dynamodb.environment';

const BATCH_SIZE = 25;
const MAX_RETRIES = 5;
const BASE_DELAY = 100;
const MAX_TRANSACTION_ITEMS = 100; // DynamoDB limits transactions to 100 operations

export class DynamoDBService {
  private static _instance: DynamoDBService;

  public static get instance(): DynamoDBService {
    if (!DynamoDBService._instance) {
      const environment = DynamoDBEnvironment.instance;
      DynamoDBService._instance = new DynamoDBService(environment.getAwsRegion(), environment.getDynamodbTableName());
    }
    return DynamoDBService._instance;
  }

  private readonly client: DynamoDBClient;

  private constructor(
    private readonly region: string,
    private readonly tableName: string,
    private readonly logger: Logger = LogUtil.getLogger(DynamoDBService.name)
  ) {
    this.client = new DynamoDBClient({ region: this.region });
  }

  async putItem<T extends DynamoDBModel>(item: T, insertOnly: boolean = false): Promise<boolean> {
    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
        ConditionExpression: insertOnly ? 'attribute_not_exists(PK)' : undefined,
      });

      await this.client.send(command);
      this.logger.info(`Item successfully put in table ${this.tableName}`, { PK: item.PK, SK: item.SK });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        this.logger.info(`Item not inserted because it already exists in table ${this.tableName}`, {
          PK: item.PK,
          SK: item.SK,
        });
        return false;
      }
      throw error;
    }
    return true;
  }

  async getItem<T extends DynamoDBModel>(key: DynamoDBKey): Promise<T | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall(key),
    });

    const response = await this.client.send(command);
    if (response.Item) {
      this.logger.info(`Item successfully retrieved from table ${this.tableName}`, { PK: key.PK, SK: key.SK });
      return unmarshall(response.Item) as T;
    } else {
      this.logger.info(`Item not found in table ${this.tableName}`, { PK: key.PK, SK: key.SK });
      return null;
    }
  }

  async query<T extends DynamoDBModel>(
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, unknown>,
    options?: {
      indexName?: string;
      filterExpression?: string;
      projectionFields?: (keyof T)[];
      limit?: number;
      scanIndexForward?: boolean;
    }
  ): Promise<T[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      IndexName: options?.indexName,
      FilterExpression: options?.filterExpression,
      ProjectionExpression: options?.projectionFields?.join(','),
      Limit: options?.limit,
      ScanIndexForward: options?.scanIndexForward,
    });

    const response = await this.client.send(command);
    this.logger.info(`Query successfully executed on table ${this.tableName}`, {
      indexName: options?.indexName,
      keyConditionExpression,
    });
    return (response.Items || []).map((item) => unmarshall(item) as T);
  }

  async scan<T extends DynamoDBModel>(
    filterExpression: string,
    expressionAttributeValues: Record<string, unknown>
  ): Promise<T[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    });

    const response = await this.client.send(command);
    this.logger.info(
      `Scan successfully executed on table ${this.tableName} with ${response.Items?.length ?? 0} results`,
      { filterExpression }
    );
    return (response.Items || []).map((item) => unmarshall(item) as T);
  }

  async updateItem<T extends DynamoDBModel>(
    { key, updates }: UpdateDynamoDBModel<T>,
    conditionExpression?: string
  ): Promise<T | null> {
    const { updateExpression, expressionAttributeValues, expressionAttributeNames } =
      this.prepareUpdateExpression(updates);

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ExpressionAttributeNames: expressionAttributeNames,
      ConditionExpression: conditionExpression,
      ReturnValues: 'ALL_NEW',
    });

    try {
      const response = await this.client.send(command);
      this.logger.info(`Item successfully updated in table ${this.tableName}`, { PK: key.PK, SK: key.SK });
      return response.Attributes ? (unmarshall(response.Attributes) as T) : null;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        this.logger.error(`Conditional update failed for item in table ${this.tableName}`, { PK: key.PK, SK: key.SK });
        return null;
      }
      throw error;
    }
  }

  async deleteItem(key: DynamoDBKey): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall(key),
    });

    await this.client.send(command);
    this.logger.info(`Item successfully deleted from table ${this.tableName}`, { PK: key.PK, SK: key.SK });
  }

  async batchDeleteItems(keys: DynamoDBKey[]): Promise<void> {
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);
      await this.processBatchDelete(batch);
    }
  }

  // Implement exponential backoff as recommended by AWS
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
  private async processBatchDelete(batch: DynamoDBKey[], attempt: number = 0): Promise<void> {
    if (batch.length === 0) {
      this.logBatchDeleteResult(batch.length, 0);
      return;
    }

    if (attempt > MAX_RETRIES) {
      this.logBatchDeleteResult(batch.length, batch.length);
      return;
    }

    const { unprocessed, error } = await this.executeBatchDelete(batch);

    if (error) {
      this.logger.error(`Error in batch delete for table ${this.tableName}`, { unprocessed });
      throw new Error('Error in batch delete');
    }

    if (unprocessed.length > 0) {
      await this.delay(Math.pow(2, attempt + 1) * BASE_DELAY);
      return await this.processBatchDelete(unprocessed, attempt + 1);
    } else {
      this.logBatchDeleteResult(batch.length, unprocessed.length);
    }
  }

  private async executeBatchDelete(items: DynamoDBKey[]): Promise<{ unprocessed: DynamoDBKey[]; error?: Error }> {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [this.tableName]: items.map((key) => ({ DeleteRequest: { Key: marshall(key) } })),
      },
    });

    try {
      const response = await this.client.send(command);
      const unprocessed = response.UnprocessedItems?.[this.tableName]
        ? response.UnprocessedItems[this.tableName].map(
            (item) => unmarshall(item.DeleteRequest?.Key as Record<string, AttributeValue>) as DynamoDBKey
          )
        : [];
      return { unprocessed };
    } catch (error) {
      return { unprocessed: items, error: error as Error };
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logBatchDeleteResult(batchSize: number, unprocessedCount: number): void {
    if (unprocessedCount > 0) {
      this.logger.warn(`Some items were not processed after max retries for table ${this.tableName}`, {
        unprocessedCount,
      });
    } else {
      this.logger.info(`Batch delete successfully executed on table ${this.tableName}`, { batchSize });
    }
  }

  async batchWriteItems<T extends DynamoDBModel>(items: T[]): Promise<void> {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const requestItems = {
        [this.tableName]: batch.map((item) => ({
          PutRequest: {
            Item: marshall(item),
          },
        })),
      };

      const command = new BatchWriteItemCommand({
        RequestItems: requestItems,
      });

      await this.client.send(command);
    }

    this.logger.info(`${items.length} items successfully batch written to table ${this.tableName}`);
  }

  async transactionPutItems<T extends DynamoDBModel>(items: T[]): Promise<boolean> {
    const operations: TransactWriteItem[] = items.map((item) => ({
      Put: {
        TableName: this.tableName,
        Item: marshall(item),
      },
    }));

    return this.transactWrite(operations);
  }

  async transactionDeleteItems(keys: DynamoDBKey[]): Promise<boolean> {
    const operations: TransactWriteItem[] = keys.map((key) => ({
      Delete: {
        TableName: this.tableName,
        Key: marshall(key),
      },
    }));

    return this.transactWrite(operations);
  }

  async transactionUpdateItems<T extends DynamoDBModel>(
    items: { key: DynamoDBKey; updates: Partial<T> }[]
  ): Promise<boolean> {
    const operations: TransactWriteItem[] = items.map((item) => {
      const { updateExpression, expressionAttributeValues, expressionAttributeNames } = this.prepareUpdateExpression(
        item.updates
      );
      return {
        Update: {
          TableName: this.tableName,
          Key: marshall(item.key),
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: marshall(expressionAttributeValues),
          ExpressionAttributeNames: expressionAttributeNames,
        },
      };
    });

    return this.transactWrite(operations);
  }

  private async transactWrite(operations: TransactWriteItem[]): Promise<boolean> {
    if (operations.length === 0) {
      this.logger.info('No operations to perform in transaction');
      return true;
    }

    if (operations.length > MAX_TRANSACTION_ITEMS) {
      throw new Error(`Transaction can't contain more than ${MAX_TRANSACTION_ITEMS} items`);
    }
    const command = new TransactWriteItemsCommand({
      TransactItems: operations,
    });

    try {
      await this.client.send(command);
      this.logger.info(`Transaction successfully completed with ${operations.length} operations`);
      return true;
    } catch (error) {
      if (error instanceof TransactionCanceledException) {
        this.logger.warn('Transaction cancelled', {
          reasons: error.CancellationReasons,
          message: error.message,
        });
        return false;
      }
      this.logger.error('Transaction failed', { error });
      throw error;
    }
  }

  private prepareUpdateExpression<T extends DynamoDBModel>(
    updates: Partial<T>
  ): {
    updateExpression: string;
    expressionAttributeValues: Record<string, unknown>;
    expressionAttributeNames: Record<string, string>;
  } {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    if (!updates.updatedAt) {
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
    }

    return {
      updateExpression: `SET ${updateExpressions.join(', ')}`,
      expressionAttributeValues,
      expressionAttributeNames,
    };
  }
}
