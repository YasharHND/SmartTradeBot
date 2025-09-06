import { EnvUtil } from '@common/utils/env.util';

const PROJECT_NAME = 'PROJECT_NAME';
const AWS_ACCOUNT_ID = 'AWS_ACCOUNT_ID';
const AWS_REGION = 'AWS_REGION';
const ENVIRONMENT = 'ENVIRONMENT';
const GNEWS_API_KEY = 'GNEWS_API_KEY';
const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';

export class InfraEnvironment {
  private static _instance: InfraEnvironment;

  private readonly projectName: string;
  private readonly accountId: string;
  private readonly awsRegion: string;
  private readonly environment: string;
  private readonly gnewsApiKey: string;
  private readonly anthropicApiKey: string;

  private constructor() {
    this.projectName = EnvUtil.getRequiredEnv(PROJECT_NAME);
    this.accountId = EnvUtil.getRequiredEnv(AWS_ACCOUNT_ID);
    this.awsRegion = EnvUtil.getRequiredEnv(AWS_REGION);
    this.environment = EnvUtil.getRequiredEnv(ENVIRONMENT);
    this.gnewsApiKey = EnvUtil.getRequiredEnv(GNEWS_API_KEY);
    this.anthropicApiKey = EnvUtil.getRequiredEnv(ANTHROPIC_API_KEY);
  }

  public static get instance(): InfraEnvironment {
    if (!InfraEnvironment._instance) {
      InfraEnvironment._instance = new InfraEnvironment();
    }
    return InfraEnvironment._instance;
  }

  getProjectName(): string {
    return this.projectName;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getAwsRegion(): string {
    return this.awsRegion;
  }

  getEnvironment(): string {
    return this.environment;
  }

  getGnewsApiKey(): string {
    return this.gnewsApiKey;
  }

  getAnthropicApiKey(): string {
    return this.anthropicApiKey;
  }
}
