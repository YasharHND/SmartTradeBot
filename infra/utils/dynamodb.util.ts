import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import { EnvironmentUtil } from '@infra/utils/environment.util';

export class DynamoDBUtil {
  private constructor() {}

  static createTable(scope: Construct, tableName: string, environment: string): dynamodb.Table {
    const table = new dynamodb.Table(scope, tableName, {
      tableName,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: EnvironmentUtil.isProduction(environment)
        ? {
            pointInTimeRecoveryEnabled: true,
            recoveryPeriodInDays: 1,
          }
        : undefined,
      deletionProtection: EnvironmentUtil.isProduction(environment),
      removalPolicy: EnvironmentUtil.isProduction(environment) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: AttributeType.STRING },
    });

    return table;
  }
}
