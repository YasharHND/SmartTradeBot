import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { EnvironmentUtil } from '../utils/environment.util';
import { LambdaUtil } from '../utils/lambda.util';
import { ENVIRONMENT } from '@common/environments/infra.environment';
import { GNEWS_API_KEY, LOG_LEVEL } from '@common/environments/backend.environment';

interface BackendStackProps extends StackProps {
  environment: string;
  logLevel: string;
  gnewsApiKey: string;
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
    return LambdaUtil.createLambdaFunction(this, functionName, 'fundamental-analysis.lambda.ts', {
      [ENVIRONMENT]: props.environment,
      [LOG_LEVEL]: props.logLevel,
      [GNEWS_API_KEY]: props.gnewsApiKey,
    });
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
