import { LambdaHandler } from '@utils/lambda.util';
import { GNewsTopHeadlinesQueryInputSchema } from '@clients/gnews/schemas/top-headlines-query-input.schema';
import { LogUtil } from '@utils/log.util';
import { NewsService } from '@/services/news.service';

const logger = LogUtil.getLogger('FundamentalAnalysis2Handler');

export const fundamentalAnalysis2Handler: LambdaHandler = async (event: unknown) => {
  const newsService = NewsService.instance;

  const parsedEvent = GNewsTopHeadlinesQueryInputSchema.parse(event);

  const from = parsedEvent?.from || new Date().toISOString();

  logger.info('Retrieving news from', { from });

  const news = await newsService.getAllAfter(from);

  logger.info('Retrieved news', { news });

  return {
    news,
  };
};
