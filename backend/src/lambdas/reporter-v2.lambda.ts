import { LambdaUtil } from '@utils/lambda.util';
import { reporterV2Handler } from '@handlers/reporter-v2.handler';

export const handler = LambdaUtil.proxy(reporterV2Handler);
