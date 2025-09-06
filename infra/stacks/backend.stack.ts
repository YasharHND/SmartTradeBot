import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { EnvironmentUtil } from '@infra/utils/environment.util';
import { LambdaUtil } from '@infra/utils/lambda.util';
import { DynamoDBUtil } from '@infra/utils/dynamodb.util';
import { InfraEnvironment } from '@common/environments/infra.environment';
import { RuntimeEnvironment } from '@common/environments/runtime.environment';

interface BackendStackProps extends StackProps {
  infraEnvironment: InfraEnvironment;
}

export class BackendStack extends Stack {
  private readonly dynamoTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: EnvironmentUtil.isProduction(props.infraEnvironment.getEnvironment()),
    });

    this.dynamoTable = this.createDynamoDBTable(props);
    this.createTechnicalAnalysisLambda(props);

    this.addTags(props.infraEnvironment.getEnvironment());
  }

  private createDynamoDBTable(props: BackendStackProps): dynamodb.Table {
    const env = props.infraEnvironment.getEnvironment();
    const tableName = `smart-trade-bot-${env}-dynamodb-table`;

    return DynamoDBUtil.createTable(this, tableName, env);
  }

  private createTechnicalAnalysisLambda(props: BackendStackProps): lambda.Function {
    const functionName = `fundamental-analysis-${props.infraEnvironment.getEnvironment()}`;

    const runtimeEnvironment = RuntimeEnvironment.provision({
      awsRegion: props.infraEnvironment.getAwsRegion(),
      dynamodbTableName: this.dynamoTable.tableName,
      gnewsApiKey: props.infraEnvironment.getGnewsApiKey(),
      anthropicApiKey: props.infraEnvironment.getAnthropicApiKey(),
    });

    const lambdaFunction = LambdaUtil.createLambdaFunction(
      this,
      functionName,
      'fundamental-analysis.lambda.ts',
      props.infraEnvironment.getEnvironment(),
      runtimeEnvironment
    );

    this.dynamoTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
