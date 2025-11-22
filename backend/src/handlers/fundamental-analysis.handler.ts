import { LambdaHandler } from '@utils/lambda.util';
import { GNewsService } from '@/clients/gnews/services/gnews.service';
import { GNewsTopHeadlinesQueryInputSchema } from '@clients/gnews/schemas/top-headlines-query-input.schema';
import { FundamentalAnalysisPrompt } from '@prompts/fundamental-analysis/fundamental-analysis.prompt';
import {
  PositionSize,
  RiskTolerance,
  Timeframe,
} from '@/prompts/fundamental-analysis/fundamental-analysis-variables.schema';
import { LogUtil } from '@utils/log.util';
import { AnthropicService } from '@clients/anthropic/anthropic.service';
import { GNewsCountry } from '@clients/gnews/models/country.enum';
import { NewsService } from '@/services/news.service';

const logger = LogUtil.getLogger('FundamentalAnalysisHandler');

export const fundamentalAnalysisHandler: LambdaHandler = async (event: unknown) => {
  const gnewsService = GNewsService.instance;
  const anthropicService = AnthropicService.instance;
  const newsService = NewsService.instance;

  const parsedEvent = GNewsTopHeadlinesQueryInputSchema.parse(event);

  const usNewsQuery = { ...parsedEvent, country: GNewsCountry.UNITED_STATES };
  const globalNewsQuery = { ...parsedEvent, country: undefined };

  const [usNews, globalNews] = await Promise.all([
    gnewsService.getTopHeadlines(usNewsQuery),
    gnewsService.getTopHeadlines(globalNewsQuery),
  ]);

  logger.info('Received news', { usNews, globalNews });

  try {
    const allArticles = [...usNews.articles, ...globalNews.articles];
    const savedNews = await newsService.saveAll(allArticles);

    logger.info('News articles saved successfully', {
      totalCount: savedNews.length,
      usNewsCount: usNews.articles.length,
      globalNewsCount: globalNews.articles.length,
    });
  } catch (error) {
    logger.error('Failed to save news articles', { error });
  }

  const usNewsData = usNews.articles.map((article) => gnewsService.compactNewsArticle(article));
  const globalNewsData = globalNews.articles.map((article) => gnewsService.compactNewsArticle(article));

  const fundamentalAnalysisPrompt = new FundamentalAnalysisPrompt();

  const fundamentalAnalysisVariables = {
    usNewsData,
    globalNewsData,
    riskTolerance: RiskTolerance.MODERATE,
    timeframe: Timeframe.SHORT_TERM,
    positionSize: PositionSize.MEDIUM,
  };

  const renderedPrompt = fundamentalAnalysisPrompt.render(fundamentalAnalysisVariables);

  logger.info('Rendered prompt', { renderedPrompt });

  const analysis = await anthropicService.invoke(renderedPrompt, fundamentalAnalysisPrompt.responseSchema());

  logger.info('Analysis', { analysis });

  return {
    analysis,
    usNews,
    globalNews,
  };
};
