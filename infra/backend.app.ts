#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { BackendStack } from './stacks/backend.stack';
import { AWS_ACCOUNT_ID, AWS_REGION, ENVIRONMENT, PROJECT_NAME } from '@common/environments/infra.environment';
import { GNEWS_API_KEY, LOG_LEVEL } from '@common/environments/backend.environment';
import { EnvUtil } from '@common/utils/env.util';

const projectName = EnvUtil.getRequiredEnv(PROJECT_NAME);

const account = EnvUtil.getRequiredEnv(AWS_ACCOUNT_ID);
const region = EnvUtil.getRequiredEnv(AWS_REGION);

const environment = EnvUtil.getRequiredEnv(ENVIRONMENT);
const logLevel = EnvUtil.getOptionalEnv(LOG_LEVEL, 'INFO');

const gnewsApiKey = EnvUtil.getRequiredEnv(GNEWS_API_KEY);

const stackName = `${projectName}-${environment}-backend-stack`;

const app = new cdk.App();

new BackendStack(app, stackName, {
  environment,
  gnewsApiKey,
  logLevel,
  env: {
    account,
    region,
  },
});
