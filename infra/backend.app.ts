#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { BackendStack } from './stacks/backend.stack';
import { checkRequiredEnvVars } from './utils/validation.util';
import { getBackendStackName } from './utils/resource-naming.util';

const PROJECT_NAME = 'SmartTradeBot';

const app = new cdk.App();

const requiredEnvVars = ['AWS_ACCOUNT_ID', 'AWS_REGION', 'ENVIRONMENT'];
checkRequiredEnvVars(requiredEnvVars);

const [AWS_ACCOUNT_ID, AWS_REGION, ENVIRONMENT] = requiredEnvVars.map((envVar) => process.env[envVar]!);

const STACK_NAME = getBackendStackName(PROJECT_NAME, ENVIRONMENT);

new BackendStack(app, STACK_NAME, {
  stackName: STACK_NAME,
  environment: ENVIRONMENT,
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});
