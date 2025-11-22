import { EnvUtil } from '@common/utils/env.util';

const PROJECT_NAME = 'PROJECT_NAME';
const AWS_ACCOUNT_ID = 'AWS_ACCOUNT_ID';
const AWS_REGION = 'AWS_REGION';
const ENVIRONMENT = 'ENVIRONMENT';
const GNEWS_API_KEY = 'GNEWS_API_KEY';
const MEDIASTACK_API_KEY = 'MEDIASTACK_API_KEY';
const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';
const CAPITAL_API_URL = 'CAPITAL_API_URL';
const CAPITAL_EMAIL = 'CAPITAL_EMAIL';
const CAPITAL_API_KEY = 'CAPITAL_API_KEY';
const CAPITAL_API_KEY_CUSTOM_PASSWORD = 'CAPITAL_API_KEY_CUSTOM_PASSWORD';

export class InfraEnvironment {
  private static _instance: InfraEnvironment;

  private readonly projectName: string;
  private readonly accountId: string;
  private readonly awsRegion: string;
  private readonly environment: string;
  private readonly gnewsApiKey: string;
  private readonly mediastackApiKey: string;
  private readonly anthropicApiKey: string;
  private readonly capitalApiUrl: string;
  private readonly capitalEmail: string;
  private readonly capitalApiKey: string;
  private readonly capitalApiKeyCustomPassword: string;

  private constructor() {
    this.projectName = EnvUtil.getRequiredEnv(PROJECT_NAME);
    this.accountId = EnvUtil.getRequiredEnv(AWS_ACCOUNT_ID);
    this.awsRegion = EnvUtil.getRequiredEnv(AWS_REGION);
    this.environment = EnvUtil.getRequiredEnv(ENVIRONMENT);
    this.gnewsApiKey = EnvUtil.getRequiredEnv(GNEWS_API_KEY);
    this.mediastackApiKey = EnvUtil.getRequiredEnv(MEDIASTACK_API_KEY);
    this.anthropicApiKey = EnvUtil.getRequiredEnv(ANTHROPIC_API_KEY);
    this.capitalApiUrl = EnvUtil.getRequiredEnv(CAPITAL_API_URL);
    this.capitalEmail = EnvUtil.getRequiredEnv(CAPITAL_EMAIL);
    this.capitalApiKey = EnvUtil.getRequiredEnv(CAPITAL_API_KEY);
    this.capitalApiKeyCustomPassword = EnvUtil.getRequiredEnv(CAPITAL_API_KEY_CUSTOM_PASSWORD);
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

  getMediastackApiKey(): string {
    return this.mediastackApiKey;
  }

  getAnthropicApiKey(): string {
    return this.anthropicApiKey;
  }

  getCapitalApiUrl(): string {
    return this.capitalApiUrl;
  }

  getCapitalEmail(): string {
    return this.capitalEmail;
  }

  getCapitalApiKey(): string {
    return this.capitalApiKey;
  }

  getCapitalApiKeyCustomPassword(): string {
    return this.capitalApiKeyCustomPassword;
  }
}
