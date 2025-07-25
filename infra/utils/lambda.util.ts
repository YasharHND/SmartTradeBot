import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import * as path from 'node:path';
import { createLambdaLogGroup } from './log-group.util';

export const createLambdaFunction = (
  scope: Construct,
  functionName: string,
  entryPoint: string,
  environmentVars: Record<string, string>
): lambda.Function => {
  const backendRoot = path.join(__dirname, '..', '..', 'backend');
  const nodeEnv = environmentVars.NODE_ENV || 'development';
  const logGroup = createLambdaLogGroup(scope, functionName, nodeEnv);

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
};
