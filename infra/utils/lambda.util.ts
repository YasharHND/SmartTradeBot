import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import * as path from 'node:path';
import { EnvironmentUtil } from './environment.util';
import { ENVIRONMENT } from '@common/environments/infra.environment';

export class LambdaUtil {
  private constructor() {}

  static createLambdaFunction(
    scope: Construct,
    functionName: string,
    entryPoint: string,
    environmentVars: Record<string, string>
  ): lambda.Function {
    const backendRoot = path.join(__dirname, '..', '..', 'backend');
    const environment = environmentVars[ENVIRONMENT];
    const logGroup = this.createLambdaLogGroup(scope, functionName, environment);

    return new nodejs.NodejsFunction(scope, functionName, {
      functionName: functionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(backendRoot, 'src', 'lambdas', entryPoint),
      handler: 'handler',
      timeout: Duration.seconds(30),
      environment: environmentVars,
      bundling: {
        workingDirectory: backendRoot,
        minify: true,
        keepNames: true,
        sourceMap: true,
      },
      logGroup,
    });
  }

  private static createLambdaLogGroup(scope: Construct, functionName: string, environment: string): logs.LogGroup {
    return new logs.LogGroup(scope, `${functionName}-LogGroup`, {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: EnvironmentUtil.isProduction(environment) ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
