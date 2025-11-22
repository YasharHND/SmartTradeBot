import { LambdaHandler } from '@utils/lambda.util';
import { NewsV2Service } from '@/services/news-v2.service';
import { LogUtil } from '@utils/log.util';

const logger = LogUtil.getLogger('ReporterV2Handler');

export const reporterV2Handler: LambdaHandler = async () => {
  const newsV2Service = NewsV2Service.instance;

  const allNews = await newsV2Service.fetchUnstored();

  logger.info('Fetched unstored news', { count: allNews.length });

  if (allNews.length === 0) {
    logger.info('No unstored news to save');
    return {
      savedCount: 0,
      articles: [],
    };
  }

  const savedNews = await newsV2Service.saveAll(allNews);

  logger.info('News articles saved successfully', { savedCount: savedNews.length });

  return {
    savedCount: savedNews.length,
    articles: savedNews,
  };
};
