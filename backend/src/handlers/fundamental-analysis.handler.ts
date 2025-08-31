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

const logger = LogUtil.getLogger('FundamentalAnalysisHandler');

export const fundamentalAnalysisHandler: LambdaHandler = async (event: unknown) => {
  const env = new BackendEnvironment();
  const gnewsService = new GNewsService(env.getGnewsApiKey());
  const anthropicService = new AnthropicService(env.getAnthropicApiKey());

  const parsedEvent = GNewsTopHeadlinesQueryInputSchema.parse(event);

  const news = await gnewsService.getTopHeadlines(parsedEvent);

  logger.info('Received news', { news });

  const newsData = news.articles.map((article) => gnewsService.compactNewsArticle(article));

  const fundamentalAnalysisPrompt = new FundamentalAnalysisPrompt();

  const fundamentalAnalysisVariables = {
    newsData,
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
    news,
  };
};
