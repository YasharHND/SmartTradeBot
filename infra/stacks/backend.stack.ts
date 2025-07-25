import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { isProduction } from '../utils/environment-status.util';
import { createLambdaFunction } from '../utils/lambda.util';

interface BackendStackProps extends StackProps {
  environment: string;
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: isProduction(props.environment),
    });

    this.createTechnicalAnalysisLambda(props);

    this.addTags(props.environment);
  }

  private createTechnicalAnalysisLambda(props: BackendStackProps): lambda.Function {
    const functionName = `fundamental-analysis-${props.environment}`;
    return createLambdaFunction(this, functionName, 'fundamental-analysis.lambda.ts', {
      ENVIRONMENT: props.environment,
    });
  }

  private addTags(environment: string): void {
    Tags.of(this).add('Environment', environment);
  }
}
