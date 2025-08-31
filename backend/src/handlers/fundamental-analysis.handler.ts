import { LambdaHandler } from '@utils/lambda.util';
import { GNewsService } from '@clients/gnews/gnews.service';
import { GNewsTopHeadlinesQueryInputSchema } from '@clients/gnews/schemas/top-headlines-query-input.schema';
import { BackendEnvironment } from '@common/environments/backend.environment';
import { FundamentalAnalysisPrompt } from '@prompts/fundamental-analysis/fundamental-analysis.prompt';
import {
  PositionSize,
  RiskTolerance,
  Timeframe,
} from '@/prompts/fundamental-analysis/fundamental-analysis-variables.schema';
import { LogUtil } from '@utils/log.util';
import { AnthropicService } from '@clients/anthropic/anthropic.service';
import { GNewsCountry } from '@clients/gnews/models/country.enum';

const logger = LogUtil.getLogger('FundamentalAnalysisHandler');

export const fundamentalAnalysisHandler: LambdaHandler = async (event: unknown) => {
  const env = new BackendEnvironment();
  const gnewsService = new GNewsService(env.getGnewsApiKey());
  const anthropicService = new AnthropicService(env.getAnthropicApiKey());

  const parsedEvent = GNewsTopHeadlinesQueryInputSchema.parse(event);

  const usNewsQuery = { ...parsedEvent, country: GNewsCountry.UNITED_STATES };
  const globalNewsQuery = { ...parsedEvent, country: undefined };

  const [usNews, globalNews] = await Promise.all([
    gnewsService.getTopHeadlines(usNewsQuery),
    gnewsService.getTopHeadlines(globalNewsQuery),
  ]);

  logger.info('Received news', { usNews, globalNews });

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
