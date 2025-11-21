import { LambdaHandler } from '@utils/lambda.util';
import { GNewsService } from '@clients/gnews/gnews.service';
import { NewsService } from '@/services/news.service';
import { LogUtil } from '@utils/log.util';
import { GNewsCountry } from '@clients/gnews/models/country.enum';
import { NEWS_FETCH_INTERVAL_MINUTES } from '@common/constants/news.constant';

const logger = LogUtil.getLogger('ReporterHandler');

const ONE_SECOND_MS = 1000;
const NEWS_FETCH_INTERVAL_MS = NEWS_FETCH_INTERVAL_MINUTES * 60 * 1000;

export const reporterHandler: LambdaHandler = async () => {
  const gnewsService = GNewsService.instance;
  const newsService = NewsService.instance;

  const latestNews = await newsService.getLatest();

  const fromDate = latestNews
    ? new Date(new Date(latestNews.publishedAt).getTime() + ONE_SECOND_MS)
    : new Date(Date.now() - NEWS_FETCH_INTERVAL_MS);

  logger.info('Fetching news', {
    from: fromDate.toISOString(),
    hasLatestNews: !!latestNews,
  });

  const usNewsQuery = { from: fromDate.toISOString(), country: GNewsCountry.UNITED_STATES };
  const globalNewsQuery = { from: fromDate.toISOString(), country: undefined };

  const [usNews, globalNews] = await Promise.all([
    gnewsService.getTopHeadlines(usNewsQuery),
    gnewsService.getTopHeadlines(globalNewsQuery),
  ]);

  logger.info('Received news', {
    usNewsCount: usNews.articles.length,
    globalNewsCount: globalNews.articles.length,
    totalArticles: usNews.articles.length + globalNews.articles.length,
  });

  const allArticles = [...usNews.articles, ...globalNews.articles];
  const savedNews = await newsService.saveAll(allArticles);

  logger.info('News articles saved successfully', {
    savedCount: savedNews.length,
  });

  return {
    savedCount: savedNews.length,
    from: fromDate.toISOString(),
    usNewsCount: usNews.articles.length,
    globalNewsCount: globalNews.articles.length,
    articles: savedNews,
  };
};
