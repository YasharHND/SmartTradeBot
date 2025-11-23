import { CapitalService } from '@/clients/capital/services/capital.service';
import {
  TechnicalAnalysisService,
  Position,
  TechnicalAnalysisInput,
  Action,
  TechnicalAnalysisResult,
} from '@/services/technical-analysis.service';
import { FundamentalAnalysisService } from '@/services/fundamental-analysis.service';
import { DecisionService, DecisionResult } from '@/services/decision.service';
import { EmailService } from '@/services/email.service';
import { SecurityCredentials } from '@/clients/capital/schemas/security-credentials.output.schema';
import { PositionItem } from '@/clients/capital/schemas/positions.output.schema';
import { PriceOutput } from '@/clients/capital/schemas/price.output.schema';
import { PositionDirection } from '@/clients/capital/schemas/position-direction.schema';
import { FundamentalAnalysisResponse } from '@/prompts/fundamental-analysis/fundamental-analysis.response.schema';
import { LogUtil, Logger } from '@utils/log.util';
import { MarketHoursUtil } from '@utils/market-hours.util';

const EPIC = 'GOLD';
const EPIC_TIMEFRAME = 'MINUTE';
const EPIC_BAR_COUNT = 60;

const EPIC_DEAL_SIZE = 100;

const STOP_AMOUNT_PERCENT = 0.5;
const PROFIT_AMOUNT_PERCENT = 0.3;

const MINUTES_BEFORE_CLOSE_NO_NEW_POSITION = 60;
const MINUTES_BEFORE_CLOSE_FORCE_CLOSE = 5;

interface OrchestratorResult {
  epic: string;
  isMarketOpen: boolean;
  message?: string;
  expected?: number;
  received?: number;
  timeframe?: string;
  pricesCount?: number;
  technicalAnalysis?: TechnicalAnalysisResult;
  fundamentalAnalysis?: FundamentalAnalysisResponse | null;
  decision?: DecisionResult | null;
  actionTaken?: { action: Action; success: boolean; details: unknown } | null;
}

export class OrchestratorService {
  private static _instance: OrchestratorService;

  public static get instance(): OrchestratorService {
    if (!OrchestratorService._instance) {
      OrchestratorService._instance = new OrchestratorService();
    }
    return OrchestratorService._instance;
  }

  private constructor(
    private readonly capitalService: CapitalService = CapitalService.instance,
    private readonly technicalAnalysisService: TechnicalAnalysisService = TechnicalAnalysisService.instance,
    private readonly fundamentalAnalysisService: FundamentalAnalysisService = FundamentalAnalysisService.instance,
    private readonly decisionService: DecisionService = DecisionService.instance,
    private readonly emailService: EmailService = EmailService.instance,
    private readonly logger: Logger = LogUtil.getLogger(OrchestratorService.name)
  ) {}

  async execute(): Promise<OrchestratorResult> {
    this.logger.info('Creating Capital.com session');
    const credentials: SecurityCredentials = await this.capitalService.createSession();

    try {
      // Check if the market is open
      this.logger.info('Checking if the market is open', { epic: EPIC });
      const isMarketOpen = await this.capitalService.isMarketOpen(EPIC, credentials);
      if (!isMarketOpen) {
        this.logger.info('Market is not open, not taking any actions');
        return {
          epic: EPIC,
          isMarketOpen: false,
          message: 'Market is closed, no actions taken',
        };
      }
      this.logger.info('Market is open');

      // Check if there are any open positions
      this.logger.info('Checking for open positions', { epic: EPIC });
      const openPositions = await this.capitalService.getAllPositions(credentials);
      const existingPosition = openPositions.positions.find((position) => position.market.epic === EPIC);
      if (existingPosition) {
        this.logger.info('Found existing position for EPIC', { epic: EPIC, position: existingPosition });
      } else {
        this.logger.info('No existing position found for EPIC', { epic: EPIC });
      }

      // Fetch prices
      this.logger.info('Fetching historical prices', {
        epic: EPIC,
        timeframe: EPIC_TIMEFRAME,
        barCount: EPIC_BAR_COUNT,
      });
      const prices = await this.capitalService.getHistoricalPrices(EPIC, EPIC_TIMEFRAME, EPIC_BAR_COUNT, credentials);
      this.logger.info('Historical prices fetched successfully', {
        pricesCount: prices.prices.length,
        instrumentType: prices.instrumentType,
      });
      if (prices.prices.length < EPIC_BAR_COUNT) {
        this.logger.info('Insufficient price data, not taking any actions', {
          expected: EPIC_BAR_COUNT,
          received: prices.prices.length,
        });
        return {
          epic: EPIC,
          isMarketOpen: true,
          message: 'Insufficient price data, no actions taken',
          expected: EPIC_BAR_COUNT,
          received: prices.prices.length,
        };
      }

      // Check if the market is closing soon
      this.logger.info('Checking if the market will close soon');
      const lastPriceTime = new Date(prices.prices[prices.prices.length - 1].snapshotTimeUTC);
      if (
        existingPosition &&
        MarketHoursUtil.willMarketCloseInMinutes(lastPriceTime, MINUTES_BEFORE_CLOSE_FORCE_CLOSE)
      ) {
        this.logger.info('Market closing soon, force closing position', {
          minutesThreshold: MINUTES_BEFORE_CLOSE_FORCE_CLOSE,
        });
        const closeResult = await this.capitalService.closePosition(existingPosition.position.dealId, credentials);
        return {
          epic: EPIC,
          isMarketOpen: true,
          message: 'Market closing soon, position force closed',
          actionTaken: {
            action: Action.CLOSE,
            success: true,
            details: closeResult,
          },
        };
      }
      if (
        !existingPosition &&
        MarketHoursUtil.willMarketCloseInMinutes(lastPriceTime, MINUTES_BEFORE_CLOSE_NO_NEW_POSITION)
      ) {
        this.logger.info('Market closing soon, not opening new positions', {
          minutesThreshold: MINUTES_BEFORE_CLOSE_NO_NEW_POSITION,
        });
        return {
          epic: EPIC,
          isMarketOpen: true,
          message: 'Market closing soon, no new positions allowed',
        };
      }

      // Build analysis input
      this.logger.info('Starting technical analysis');
      const analysisInput = this.buildAnalysisInput(existingPosition, prices.prices);
      const technicalAnalysis = this.technicalAnalysisService.analyze(analysisInput);
      this.logger.info('Technical analysis completed', { technicalAnalysis });

      // Engage fundamental analysis if needed
      this.logger.info('Checking if fundamental analysis is needed');
      const shouldEngageFundamentalAnalysis = this.shouldEngageFundamentalAnalysis(
        existingPosition,
        technicalAnalysis.action
      );
      let fundamentalAnalysis = null;
      let decision = null;
      let actionTaken = null;
      if (shouldEngageFundamentalAnalysis) {
        this.logger.info('Engaging fundamental analysis', {
          hasPosition: !!existingPosition,
          technicalAction: technicalAnalysis.action,
        });
        fundamentalAnalysis = await this.fundamentalAnalysisService.analyze();
        this.logger.info('Fundamental analysis completed', { fundamentalAnalysis });

        // Make decision
        this.logger.info('Making decision');
        const currentPosition = analysisInput.currentPosition;
        decision = this.decisionService.decide(technicalAnalysis.action, fundamentalAnalysis, currentPosition);
        this.logger.info('Decision made', { decision });

        // Execute action if needed
        this.logger.info('Checking if action is needed');
        if (decision.shouldTakeAction && decision.finalAction !== Action.KEEP) {
          actionTaken = await this.executeAction(decision.finalAction, existingPosition, credentials);
        } else {
          this.logger.info('No action taken', {
            shouldTakeAction: decision.shouldTakeAction,
            finalAction: decision.finalAction,
          });
        }
      } else {
        this.logger.info('Skipping fundamental analysis - no strong technical signal', {
          hasPosition: !!existingPosition,
          technicalAction: technicalAnalysis.action,
        });
      }

      const response = {
        epic: EPIC,
        isMarketOpen: true,
        timeframe: EPIC_TIMEFRAME,
        pricesCount: prices.prices.length,
        technicalAnalysis,
        fundamentalAnalysis,
        decision,
        actionTaken,
      };
      this.logger.info('Returning analysis result', response);
      return response;
    } finally {
      this.logger.info('Closing Capital.com session');
      await this.capitalService.closeSession(credentials);
      this.logger.info('Session closed successfully');
    }
  }

  private shouldEngageFundamentalAnalysis(
    existingPosition: PositionItem | undefined,
    technicalAction: Action
  ): boolean {
    return !!existingPosition || technicalAction === Action.BUY || technicalAction === Action.SELL;
  }

  private buildAnalysisInput(
    existingPosition: PositionItem | undefined,
    prices: PriceOutput[]
  ): TechnicalAnalysisInput {
    const currentPosition = existingPosition
      ? existingPosition.position.direction === 'BUY'
        ? Position.LONG
        : Position.SHORT
      : Position.NONE;

    const entryPrice = existingPosition ? existingPosition.position.level : undefined;

    return {
      currentPosition,
      entryPrice,
      prices,
      stopLossPercent: 0.5,
      takeProfitPercent: 1.0,
    };
  }

  private async executeAction(
    action: Action,
    existingPosition: PositionItem | undefined,
    credentials: SecurityCredentials
  ): Promise<{ action: Action; success: boolean; details: unknown }> {
    if (action === Action.CLOSE) {
      const dealId = existingPosition!.position.dealId;
      const position = existingPosition!.position;
      this.logger.info('Closing position', { dealId });

      const closeResult = await this.capitalService.closePosition(dealId, credentials);

      await this.emailService.sendPositionActionNotification(
        'CLOSE',
        EPIC,
        position.direction === 'BUY' ? 'BUY' : 'SELL',
        position.size
      );

      return {
        action,
        success: true,
        details: closeResult,
      };
    }

    const direction = action === Action.BUY ? PositionDirection.BUY : PositionDirection.SELL;
    const stopAmount = Math.round(EPIC_DEAL_SIZE * STOP_AMOUNT_PERCENT);
    const profitAmount = Math.round(EPIC_DEAL_SIZE * PROFIT_AMOUNT_PERCENT);

    this.logger.info('Opening position', {
      epic: EPIC,
      direction,
      size: EPIC_DEAL_SIZE,
      profitAmount,
      stopAmount,
    });

    const createResult = await this.capitalService.createPosition(
      {
        epic: EPIC,
        direction,
        size: EPIC_DEAL_SIZE,
        guaranteedStop: true,
        stopAmount,
        profitAmount,
      },
      credentials
    );

    await this.emailService.sendPositionActionNotification(
      'OPEN',
      EPIC,
      direction === PositionDirection.BUY ? 'BUY' : 'SELL',
      EPIC_DEAL_SIZE
    );

    return {
      action,
      success: true,
      details: createResult,
    };
  }
}
