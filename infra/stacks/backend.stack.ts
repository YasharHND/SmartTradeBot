import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { EnvironmentUtil } from '@infra/utils/environment.util';
import { LambdaUtil } from '@infra/utils/lambda.util';
import { DynamoDBUtil } from '@infra/utils/dynamodb.util';
import { ResourceUtil } from '@infra/utils/resource.util';
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
    const reporterLambda = this.createReporterLambda(props);
    this.scheduleReporterLambda(props, reporterLambda);

    this.addTags(props.infraEnvironment.getEnvironment());
  }

  private createDynamoDBTable(props: BackendStackProps): dynamodb.Table {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const tableName = ResourceUtil.name(projectName, 'dynamodb-table', env);

    return DynamoDBUtil.createTable(this, tableName, env);
  }

  private createReporterLambda(props: BackendStackProps): lambda.Function {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const functionName = ResourceUtil.name(projectName, 'reporter', env);

    const runtimeEnvironment = RuntimeEnvironment.provision({
      awsRegion: props.infraEnvironment.getAwsRegion(),
      dynamodbTableName: this.dynamoTable.tableName,
      gnewsApiKey: props.infraEnvironment.getGnewsApiKey(),
      anthropicApiKey: props.infraEnvironment.getAnthropicApiKey(),
    });

    const lambdaFunction = LambdaUtil.createLambdaFunction(
      this,
      functionName,
      'reporter.lambda.ts',
      env,
      runtimeEnvironment
    );

    this.dynamoTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private scheduleReporterLambda(props: BackendStackProps, lambdaFunction: lambda.Function): void {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const ruleName = ResourceUtil.name(projectName, 'reporter-schedule', env);

    const rule = new events.Rule(this, ruleName, {
      ruleName,
      schedule: events.Schedule.cron({
        minute: `0,30`,
        hour: '*',
      }),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
