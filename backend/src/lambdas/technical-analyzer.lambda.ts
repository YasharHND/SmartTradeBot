import { LambdaUtil } from '@utils/lambda.util';
import { technicalAnalyzerHandler } from '@/handlers/technical-analyzer.handler';

export const handler = LambdaUtil.proxy(technicalAnalyzerHandler);
