import { EnvUtil } from '@common/utils/env.util';
import { LambdaEnvironment } from '@common/environments/lambda.environment';

const AWS_REGION = 'AWS_REGION';
const DYNAMODB_TABLE_NAME = 'DYNAMODB_TABLE_NAME';
const GNEWS_API_KEY = 'GNEWS_API_KEY';
const MEDIASTACK_API_KEY = 'MEDIASTACK_API_KEY';
const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';

export interface RuntimeEnvironmentVariables {
  awsRegion: string;
  dynamodbTableName: string;
  gnewsApiKey: string;
  mediastackApiKey: string;
  anthropicApiKey: string;
}

export class RuntimeEnvironment implements LambdaEnvironment {
  private static _instance: RuntimeEnvironment;

  private constructor(
    private readonly awsRegion: string,
    private readonly dynamodbTableName: string,
    private readonly gnewsApiKey: string,
    private readonly mediastackApiKey: string,
    private readonly anthropicApiKey: string
  ) {}

  // Used during infrastructure deployment to provision environment variables
  public static provision(environmentVariables: RuntimeEnvironmentVariables): RuntimeEnvironment {
    if (RuntimeEnvironment._instance) {
      throw new Error('RuntimeEnvironment is already provisioned');
    }

    RuntimeEnvironment._instance = new RuntimeEnvironment(
      environmentVariables.awsRegion,
      environmentVariables.dynamodbTableName,
      environmentVariables.gnewsApiKey,
      environmentVariables.mediastackApiKey,
      environmentVariables.anthropicApiKey
    );
    return RuntimeEnvironment._instance;
  }

  // Used in the runtime environment to access provisioned environment variables
  public static get instance(): RuntimeEnvironment {
    if (!RuntimeEnvironment._instance) {
      RuntimeEnvironment._instance = new RuntimeEnvironment(
        EnvUtil.getRequiredEnv(AWS_REGION),
        EnvUtil.getRequiredEnv(DYNAMODB_TABLE_NAME),
        EnvUtil.getRequiredEnv(GNEWS_API_KEY),
        EnvUtil.getRequiredEnv(MEDIASTACK_API_KEY),
        EnvUtil.getRequiredEnv(ANTHROPIC_API_KEY)
      );
    }
    return RuntimeEnvironment._instance;
  }

  getAwsRegion(): string {
    return this.awsRegion;
  }

  getDynamodbTableName(): string {
    return this.dynamodbTableName;
  }

  getGnewsApiKey(): string {
    return this.gnewsApiKey;
  }

  getMediastackApiKey(): string {
    return this.mediastackApiKey;
  }

  getAnthropicApiKey(): string {
    return this.anthropicApiKey;
  }

  // AWS_REGION environment variable is reserved by the lambda runtime and can not be set manually. See https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
  // This method is used to pass the environment variables to the lambda when provisioning it, so no need to pass the AWS_REGION manually.
  getAll(): Record<string, string> {
    return {
      [DYNAMODB_TABLE_NAME]: this.dynamodbTableName,
      [GNEWS_API_KEY]: this.gnewsApiKey,
      [MEDIASTACK_API_KEY]: this.mediastackApiKey,
      [ANTHROPIC_API_KEY]: this.anthropicApiKey,
    };
  }
}
