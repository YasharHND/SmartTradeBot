import { AwsEnvironment } from '@clients/aws/common/aws.environment';
import { RuntimeEnvironment } from '@common/environments/runtime.environment';

// Using this Singleton class to break the link from the actual client to the outside.
// That's the only place it's referencing outside of its own module.
export class DynamoDBEnvironment implements AwsEnvironment {
  private static _instance: DynamoDBEnvironment;

  public static get instance(): DynamoDBEnvironment {
    if (!DynamoDBEnvironment._instance) {
      const environment = RuntimeEnvironment.instance;
      DynamoDBEnvironment._instance = new DynamoDBEnvironment(
        environment.getAwsRegion(),
        environment.getDynamodbTableName()
      );
    }
    return DynamoDBEnvironment._instance;
  }

  private constructor(
    private readonly awsRegion: string,
    private readonly dynamodbTableName: string
  ) {}

  getAwsRegion(): string {
    return this.awsRegion;
  }

  getDynamodbTableName(): string {
    return this.dynamodbTableName;
  }
}
