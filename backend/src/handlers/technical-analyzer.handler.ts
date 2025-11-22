import { LambdaHandler } from '@utils/lambda.util';
import { CapitalService } from '@/clients/capital/services/capital.service';
import { LogUtil } from '@utils/log.util';
import { SecurityCredentials } from '@/clients/capital/schemas/security-credentials.output.schema';
import { HistoricalPricesResponse } from '@/clients/capital/schemas/price.output.schema';
import { TechnicalAnalysisService, Position } from '@/services/technical-analysis.service';

const logger = LogUtil.getLogger('TechnicalAnalyzerHandler');

export const technicalAnalyzerHandler: LambdaHandler = async () => {
  const capitalService = CapitalService.instance;
  const technicalAnalysisService = TechnicalAnalysisService.instance;

  logger.info('Creating Capital.com session');
  const credentials: SecurityCredentials = await capitalService.createSession();

  const epic = 'GOLD';
  const resolution = 'MINUTE';
  const max = 60;

  const isMarketOpen = await capitalService.isMarketOpen(epic, credentials);

  logger.info('Market status checked', { isMarketOpen });

  logger.info('Fetching historical prices', {
    epic,
    resolution,
    max,
  });

  const prices: HistoricalPricesResponse = await capitalService.getHistoricalPrices(epic, resolution, max, credentials);

  logger.info('Historical prices fetched successfully', {
    pricesCount: prices.prices.length,
    instrumentType: prices.instrumentType,
  });

  const analysisResult = technicalAnalysisService.analyze({
    currentPosition: Position.NONE,
    entryPrice: undefined,
    prices: prices.prices,
    stopLossPercent: 0.5,
    takeProfitPercent: 1.0,
  });

  logger.info('Closing Capital.com session');
  await capitalService.closeSession(credentials);

  logger.info('Session closed successfully');

  const response = {
    epic,
    isMarketOpen,
    resolution,
    pricesCount: prices.prices.length,
    analysis: analysisResult,
  };

  logger.info('Returning analysis result', response);

  return response;
};
