import { NewsV2Service } from '@/services/news.v2.service';
import { AnthropicService } from '@/clients/anthropic/services/anthropic.service';
import { FundamentalAnalysisPrompt } from '@/prompts/fundamental-analysis/fundamental-analysis.prompt';
import {
  PositionSize,
  RiskTolerance,
  Timeframe,
} from '@/prompts/fundamental-analysis/fundamental-analysis.variables.schema';
import { FundamentalAnalysisResponse } from '@/prompts/fundamental-analysis/fundamental-analysis.response.schema';
import { Region } from '@/schemas/region.schema';
import { LogUtil, Logger } from '@utils/log.util';

const NEWS_LIMIT = 100;

export class FundamentalAnalysisService {
  private static _instance: FundamentalAnalysisService;

  public static get instance(): FundamentalAnalysisService {
    if (!FundamentalAnalysisService._instance) {
      FundamentalAnalysisService._instance = new FundamentalAnalysisService();
    }
    return FundamentalAnalysisService._instance;
  }

  private constructor(
    private readonly newsV2Service: NewsV2Service = NewsV2Service.instance,
    private readonly anthropicService: AnthropicService = AnthropicService.instance,
    private readonly logger: Logger = LogUtil.getLogger(FundamentalAnalysisService.name)
  ) {}

  async analyze(): Promise<FundamentalAnalysisResponse> {
    this.logger.info('Starting fundamental analysis');

    const [usNews, globalNews] = await Promise.all([
      this.newsV2Service.findLatestByRegion(Region.UNITED_STATES, NEWS_LIMIT),
      this.newsV2Service.findLatestByRegion(Region.GLOBAL, NEWS_LIMIT),
    ]);

    this.logger.info('Fetched news for analysis', {
      usNewsCount: usNews.length,
      globalNewsCount: globalNews.length,
    });

    const fundamentalAnalysisPrompt = new FundamentalAnalysisPrompt();

    const fundamentalAnalysisVariables = {
      usNewsData: JSON.stringify(usNews, null, 2),
      globalNewsData: JSON.stringify(globalNews, null, 2),
      riskTolerance: RiskTolerance.MODERATE,
      timeframe: Timeframe.SHORT_TERM,
      positionSize: PositionSize.MEDIUM,
    };

    const renderedPrompt = fundamentalAnalysisPrompt.render(fundamentalAnalysisVariables);

    this.logger.info('Invoking Anthropic for fundamental analysis');

    const analysis = await this.anthropicService.invoke(renderedPrompt, fundamentalAnalysisPrompt.responseSchema());

    this.logger.info('Fundamental analysis completed', { analysis });

    return analysis as FundamentalAnalysisResponse;
  }
}
