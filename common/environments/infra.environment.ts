import { EnvUtil } from '@common/utils/env.util';

const PROJECT_NAME = 'PROJECT_NAME';
const AWS_ACCOUNT_ID = 'AWS_ACCOUNT_ID';
const AWS_REGION = 'AWS_REGION';
const ENVIRONMENT = 'ENVIRONMENT';

export class InfraEnvironment {
  private readonly projectName: string;
  private readonly accountId: string;
  private readonly awsRegion: string;
  private readonly environment: string;

  constructor() {
    this.projectName = EnvUtil.getRequiredEnv(PROJECT_NAME);
    this.accountId = EnvUtil.getRequiredEnv(AWS_ACCOUNT_ID);
    this.awsRegion = EnvUtil.getRequiredEnv(AWS_REGION);
    this.environment = EnvUtil.getRequiredEnv(ENVIRONMENT);
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
}
