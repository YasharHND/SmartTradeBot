import { LambdaUtil } from '@utils/lambda.util';
import { newsAnalysisHandler } from '@/handlers/news-analysis.handler';

export const handler = LambdaUtil.proxy(newsAnalysisHandler);
