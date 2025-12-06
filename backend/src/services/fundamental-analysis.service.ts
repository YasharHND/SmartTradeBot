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
    private readonly anthropicService: AnthropicService = AnthropicService.instance
  ) {}

  async analyze(newsLimit: number = NEWS_LIMIT): Promise<FundamentalAnalysisResponse> {
    const [usNews, globalNews] = await Promise.all([
      this.newsV2Service.findLatestByRegion(Region.UNITED_STATES, newsLimit),
      this.newsV2Service.findLatestByRegion(Region.GLOBAL, newsLimit),
    ]);

    const fundamentalAnalysisVariables = {
      usNewsData: JSON.stringify(usNews, null, 2),
      globalNewsData: JSON.stringify(globalNews, null, 2),
      riskTolerance: RiskTolerance.AGGRESSIVE,
      timeframe: Timeframe.SHORT_TERM,
      positionSize: PositionSize.SMALL,
    };

    const prompt = new FundamentalAnalysisPrompt();
    return await this.anthropicService.invoke(
      prompt.systemPrompt(),
      prompt.userPrompt(fundamentalAnalysisVariables),
      prompt.responseSchema()
    );
  }
}
