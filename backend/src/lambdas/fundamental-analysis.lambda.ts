import { fundamentalAnalysisHandler } from '@handlers/fundamental-analysis.handler';
import { LambdaUtil } from '@utils/lambda.util';

export const handler = LambdaUtil.proxy(fundamentalAnalysisHandler);
