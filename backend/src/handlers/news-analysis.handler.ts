import { LambdaHandler } from '@utils/lambda.util';
import { FundamentalAnalysisService } from '@/services/fundamental-analysis.service';

const NEWS_LIMIT = 10;

export const newsAnalysisHandler: LambdaHandler = async () => {
  const fundamentalAnalysisService = FundamentalAnalysisService.instance;
  const analysis = await fundamentalAnalysisService.analyze(NEWS_LIMIT);

  return {
    analysis,
  };
};
