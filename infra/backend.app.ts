#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { BackendStack } from '@infra/stacks/backend.stack';
import { InfraEnvironment } from '@common/environments/infra.environment';
import { ResourceUtil } from '@infra/utils/resource.util';

const infraEnvironment = InfraEnvironment.instance;

const projectName = infraEnvironment.getProjectName();
const account = infraEnvironment.getAccountId();
const region = infraEnvironment.getAwsRegion();
const env = infraEnvironment.getEnvironment();

const stackName = ResourceUtil.name(projectName, 'backend-stack', env);

const app = new cdk.App();

new BackendStack(app, stackName, {
  infraEnvironment,
  env: {
    account,
    region,
  },
});
