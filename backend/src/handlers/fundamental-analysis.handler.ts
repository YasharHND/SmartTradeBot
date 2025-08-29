import { LambdaHandler } from '@utils/lambda.util';
import { GNewsService } from '@clients/gnews/gnews.service';
import { GNewsTopHeadlinesQueryInputSchema } from '@clients/gnews/schemas/top-headlines-query-input.schema';
import { EnvUtil } from '@common/utils/env.util';
import { GNEWS_API_KEY } from '@common/environments/backend.environment';

export const fundamentalAnalysisHandler: LambdaHandler = async (event: unknown) => {
  const apiKey = EnvUtil.getRequiredEnv(GNEWS_API_KEY);
  const gnewsService = new GNewsService(apiKey);

  const parsedEvent = GNewsTopHeadlinesQueryInputSchema.parse(event);

  return await gnewsService.getTopHeadlines(parsedEvent);
};
