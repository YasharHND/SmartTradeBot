import { AwsEnvironment } from '@clients/aws/common/aws.environment';
import { RuntimeEnvironment } from '@common/environments/runtime.environment';

export class SESEnvironment implements AwsEnvironment {
  private static _instance: SESEnvironment;

  public static get instance(): SESEnvironment {
    if (!SESEnvironment._instance) {
      const environment = RuntimeEnvironment.instance;
      SESEnvironment._instance = new SESEnvironment(environment.getAwsRegion(), environment.getAwsSesSource());
    }
    return SESEnvironment._instance;
  }

  private constructor(
    private readonly awsRegion: string,
    private readonly awsSesSource: string
  ) {}

  getAwsRegion(): string {
    return this.awsRegion;
  }

  getAwsSesSource(): string {
    return this.awsSesSource;
  }
}
