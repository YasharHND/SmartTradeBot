// import { fundamentalAnalysisHandler } from '@/handlers/fundamental-analysis.handler';
import { fundamentalAnalysis2Handler } from '@handlers/fundamental-analysis-2.handler';
import { LambdaUtil } from '@utils/lambda.util';

// export const handler = LambdaUtil.proxy(fundamentalAnalysisHandler);
export const handler = LambdaUtil.proxy(fundamentalAnalysis2Handler);
