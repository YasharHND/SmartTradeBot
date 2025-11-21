import { LambdaUtil } from '@utils/lambda.util';
import { reporterHandler } from '@handlers/reporter.handler';

export const handler = LambdaUtil.proxy(reporterHandler);
