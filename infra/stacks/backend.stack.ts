import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { EnvironmentUtil } from '@infra/utils/environment.util';
import { LambdaUtil } from '@infra/utils/lambda.util';
import { BackendEnvironment } from '@common/environments/backend.environment';

interface BackendStackProps extends StackProps {
  environment: string;
  backendEnvironment: BackendEnvironment;
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: EnvironmentUtil.isProduction(props.environment),
    });

    this.createTechnicalAnalysisLambda(props);

    this.addTags(props.environment);
  }

  private createTechnicalAnalysisLambda(props: BackendStackProps): lambda.Function {
    const functionName = `fundamental-analysis-${props.environment}`;
    return LambdaUtil.createLambdaFunction(
      this,
      functionName,
      'fundamental-analysis.lambda.ts',
      props.environment,
      props.backendEnvironment
    );
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
