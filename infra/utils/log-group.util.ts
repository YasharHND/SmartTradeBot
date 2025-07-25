import { RemovalPolicy } from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import { isProduction } from './environment-status.util';

export const createLambdaLogGroup = (scope: Construct, functionName: string, env: string): logs.LogGroup => {
  return new logs.LogGroup(scope, `${functionName}-LogGroup`, {
    logGroupName: `/aws/lambda/${functionName}`,
    retention: isProduction(env) ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.TWO_WEEKS,
    removalPolicy: RemovalPolicy.DESTROY,
  });
};
