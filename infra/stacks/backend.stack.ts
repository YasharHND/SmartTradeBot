import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
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
  private readonly runtimeEnvironment: RuntimeEnvironment;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: EnvironmentUtil.isProduction(props.infraEnvironment.getEnvironment()),
    });

    this.dynamoTable = this.createDynamoDBTable(props);

    this.runtimeEnvironment = this.provisionRuntimeEnvironment(props);

    const reporterV2Lambda = this.createReporterV2Lambda(props);
    this.scheduleReporterV2Lambda(props, reporterV2Lambda);

    const orchestratorLambda = this.createOrchestratorLambda(props);
    this.scheduleOrchestratorLambda(props, orchestratorLambda);

    this.addTags(props.infraEnvironment.getEnvironment());
  }

  private createDynamoDBTable(props: BackendStackProps): dynamodb.Table {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const tableName = ResourceUtil.name(projectName, 'dynamodb-table', env);

    return DynamoDBUtil.createTable(this, tableName, env);
  }

  private provisionRuntimeEnvironment(props: BackendStackProps): RuntimeEnvironment {
    return RuntimeEnvironment.provision({
      awsRegion: props.infraEnvironment.getAwsRegion(),
      awsSesSource: props.infraEnvironment.getAwsSesSource(),
      defaultEmailNotificationDestination: props.infraEnvironment.getDefaultEmailNotificationDestination(),
      dynamodbTableName: this.dynamoTable.tableName,
      gnewsApiKey: props.infraEnvironment.getGnewsApiKey(),
      mediastackApiKey: props.infraEnvironment.getMediastackApiKey(),
      anthropicApiKey: props.infraEnvironment.getAnthropicApiKey(),
      capitalApiUrl: props.infraEnvironment.getCapitalApiUrl(),
      capitalEmail: props.infraEnvironment.getCapitalEmail(),
      capitalApiKey: props.infraEnvironment.getCapitalApiKey(),
      capitalApiKeyCustomPassword: props.infraEnvironment.getCapitalApiKeyCustomPassword(),
    });
  }

  private createReporterV2Lambda(props: BackendStackProps): lambda.Function {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const functionName = ResourceUtil.name(projectName, 'reporter-v2', env);

    const lambdaFunction = LambdaUtil.createLambdaFunction(
      this,
      functionName,
      'reporter.v2.lambda.ts',
      env,
      this.runtimeEnvironment
    );

    this.dynamoTable.grantReadWriteData(lambdaFunction);
    this.grantSesPermissions(lambdaFunction);
    return lambdaFunction;
  }

  private createOrchestratorLambda(props: BackendStackProps): lambda.Function {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const functionName = ResourceUtil.name(projectName, 'orchestrator', env);

    const lambdaFunction = LambdaUtil.createLambdaFunction(
      this,
      functionName,
      'orchestrator.lambda.ts',
      env,
      this.runtimeEnvironment
    );

    this.dynamoTable.grantReadData(lambdaFunction);
    this.grantSesPermissions(lambdaFunction);
    return lambdaFunction;
  }

  private scheduleReporterV2Lambda(props: BackendStackProps, lambdaFunction: lambda.Function): void {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const ruleName = ResourceUtil.name(projectName, 'reporter-v2-schedule', env);

    const rule = new events.Rule(this, ruleName, {
      ruleName,
      schedule: events.Schedule.cron({
        minute: '0,10,20,30,40,50',
        hour: '*',
      }),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));
  }

  private scheduleOrchestratorLambda(props: BackendStackProps, lambdaFunction: lambda.Function): void {
    const projectName = props.infraEnvironment.getProjectName();
    const env = props.infraEnvironment.getEnvironment();
    const ruleName = ResourceUtil.name(projectName, 'orchestrator-schedule', env);

    const rule = new events.Rule(this, ruleName, {
      ruleName,
      schedule: events.Schedule.cron({
        minute: '2,7,12,17,22,27,32,37,42,47,52,57',
        hour: '*',
      }),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));
  }

  private grantSesPermissions(lambdaFunction: lambda.Function): void {
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
