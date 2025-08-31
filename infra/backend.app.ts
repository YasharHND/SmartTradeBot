#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { BackendStack } from '@infra/stacks/backend.stack';
import { InfraEnvironment } from '@common/environments/infra.environment';
import { BackendEnvironment } from '@common/environments/backend.environment';

const infraEnvironment = new InfraEnvironment();
const backendEnvironment = new BackendEnvironment();

const projectName = infraEnvironment.getProjectName();
const account = infraEnvironment.getAccountId();
const region = infraEnvironment.getAwsRegion();
const environment = infraEnvironment.getEnvironment();

const stackName = `${projectName}-${environment}-backend-stack`;

const app = new cdk.App();

new BackendStack(app, stackName, {
  environment,
  backendEnvironment,
  env: {
    account,
    region,
  },
});
