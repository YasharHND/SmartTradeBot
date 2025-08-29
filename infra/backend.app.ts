#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { BackendStack } from './stacks/backend.stack';
import { getBackendStackName } from './utils/resource-naming.util';
import { AWS_ACCOUNT_ID, AWS_REGION, ENVIRONMENT, PROJECT_NAME } from '@common/environments/infra.environment';
import { NEWS_API_ORG_API_KEY, LOG_LEVEL } from '@common/environments/backend.environment';
import { EnvUtil } from '@common/utils/env.util';

const app = new cdk.App();

const projectName = EnvUtil.getRequiredEnv(PROJECT_NAME);

const account = EnvUtil.getRequiredEnv(AWS_ACCOUNT_ID);
const region = EnvUtil.getRequiredEnv(AWS_REGION);

const environment = EnvUtil.getRequiredEnv(ENVIRONMENT);

const newsApiOrgApiKey = EnvUtil.getRequiredEnv(NEWS_API_ORG_API_KEY);
const logLevel = EnvUtil.getOptionalEnv(LOG_LEVEL, 'INFO');

const stackName = getBackendStackName(projectName, environment);

new BackendStack(app, stackName, {
  environment,
  newsApiOrgApiKey,
  logLevel,
  env: {
    account,
    region,
  },
});
