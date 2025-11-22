import { RSI, SMA, EMA, MACD, BollingerBands, ATR } from 'technicalindicators';
import { LogUtil, Logger } from '@utils/log.util';

export enum Position {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NONE = 'NONE',
}

export enum Action {
  BUY = 'BUY',
  SELL = 'SELL',
  KEEP = 'KEEP',
  CLOSE = 'CLOSE',
}

export interface PricePoint {
  bid: number;
  ask: number;
}

export interface PriceBar {
  closePrice: PricePoint;
  highPrice: PricePoint;
  lowPrice: PricePoint;
  lastTradedVolume: number;
}

export interface TechnicalAnalysisInput {
  currentPosition: Position;
  entryPrice?: number;
  prices: PriceBar[];
  stopLossPercent: number;
  takeProfitPercent: number;
}

export interface TechnicalAnalysisResult {
  action: Action;
  reason: string;
  indicators: {
    rsi: number | null;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    } | null;
    sma20: number | null;
    ema12: number | null;
    ema26: number | null;
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    } | null;
    atr14: number | null;
    averageVolume: number;
    volumeSpike: boolean;
    support: number;
    resistance: number;
    currentPrice: number;
    profitLossPercent?: number;
  };
}

export class TechnicalAnalysisService {
  private static _instance: TechnicalAnalysisService;

  public static get instance(): TechnicalAnalysisService {
    if (!TechnicalAnalysisService._instance) {
      TechnicalAnalysisService._instance = new TechnicalAnalysisService();
    }
    return TechnicalAnalysisService._instance;
  }

  private constructor(private readonly logger: Logger = LogUtil.getLogger(TechnicalAnalysisService.name)) {}

  analyze(input: TechnicalAnalysisInput): TechnicalAnalysisResult {
    const { currentPosition, entryPrice, prices, stopLossPercent, takeProfitPercent } = input;

    if (prices.length < 26) {
      throw new Error(`Insufficient data for technical analysis. Need at least 26 periods, got ${prices.length}`);
    }

    const closingPrices = prices.map((p) => p.closePrice.bid);
    const highPrices = prices.map((p) => p.highPrice.bid);
    const lowPrices = prices.map((p) => p.lowPrice.bid);
    const volumes = prices.map((p) => p.lastTradedVolume);

    const rsi = this.calculateRSI(closingPrices);
    const macd = this.calculateMACD(closingPrices);
    const sma20 = this.calculateSMA(closingPrices, 20);
    const ema12 = this.calculateEMA(closingPrices, 12);
    const ema26 = this.calculateEMA(closingPrices, 26);
    const bollingerBands = this.calculateBollingerBands(closingPrices);
    const atr14 = this.calculateATR(highPrices, lowPrices, closingPrices);
    const { averageVolume, volumeSpike } = this.analyzeVolume(volumes);
    const { support, resistance } = this.findSupportResistance(highPrices, lowPrices);

    const currentPrice = closingPrices[closingPrices.length - 1];

    const profitLossPercent = entryPrice
      ? this.calculateProfitLoss(currentPosition, entryPrice, currentPrice)
      : undefined;

    const indicators = {
      rsi,
      macd,
      sma20,
      ema12,
      ema26,
      bollingerBands,
      atr14,
      averageVolume,
      volumeSpike,
      support,
      resistance,
      currentPrice,
      profitLossPercent,
    };

    const { action, reason } = this.decideAction(currentPosition, indicators, stopLossPercent, takeProfitPercent);

    this.logger.info('Technical analysis completed', {
      dataPoints: prices.length,
      currentPrice,
      currentPosition,
      action,
      reason,
    });

    return {
      action,
      reason,
      indicators,
    };
  }

  private calculateProfitLoss(position: Position, entryPrice: number, currentPrice: number): number {
    if (position === Position.LONG) {
      return ((currentPrice - entryPrice) / entryPrice) * 100;
    }
    if (position === Position.SHORT) {
      return ((entryPrice - currentPrice) / entryPrice) * 100;
    }
    return 0;
  }

  private decideAction(
    currentPosition: Position,
    indicators: TechnicalAnalysisResult['indicators'],
    stopLossPercent: number,
    takeProfitPercent: number
  ): { action: Action; reason: string } {
    const { rsi, macd, currentPrice, support, resistance, profitLossPercent } = indicators;

    if (currentPosition === Position.NONE) {
      return this.decideEntry(rsi, macd, currentPrice, support, resistance);
    }

    return this.decideExitOrHold(currentPosition, profitLossPercent, rsi, macd, stopLossPercent, takeProfitPercent);
  }

  private decideEntry(
    rsi: number | null,
    macd: { macd: number; signal: number; histogram: number } | null,
    currentPrice: number,
    support: number,
    resistance: number
  ): { action: Action; reason: string } {
    const isBullish =
      rsi !== null && rsi < 30 && macd !== null && macd.histogram > 0 && currentPrice <= support * 1.005;

    if (isBullish) {
      return { action: Action.BUY, reason: 'RSI oversold, MACD bullish, price near support' };
    }

    const isBearish =
      rsi !== null && rsi > 70 && macd !== null && macd.histogram < 0 && currentPrice >= resistance * 0.995;

    if (isBearish) {
      return { action: Action.SELL, reason: 'RSI overbought, MACD bearish, price near resistance' };
    }

    return { action: Action.KEEP, reason: 'No clear entry signal' };
  }

  private decideExitOrHold(
    currentPosition: Position,
    profitLossPercent: number | undefined,
    rsi: number | null,
    macd: { macd: number; signal: number; histogram: number } | null,
    stopLossPercent: number,
    takeProfitPercent: number
  ): { action: Action; reason: string } {
    if (profitLossPercent === undefined) {
      return { action: Action.KEEP, reason: 'No entry price available' };
    }

    if (profitLossPercent <= -stopLossPercent) {
      return { action: Action.CLOSE, reason: `Stop-loss triggered: ${profitLossPercent.toFixed(2)}%` };
    }

    if (profitLossPercent >= takeProfitPercent) {
      return { action: Action.CLOSE, reason: `Take-profit triggered: ${profitLossPercent.toFixed(2)}%` };
    }

    if (currentPosition === Position.LONG) {
      const shouldCloseLong = rsi !== null && rsi > 70 && macd !== null && macd.histogram < 0;
      if (shouldCloseLong) {
        return { action: Action.CLOSE, reason: 'RSI overbought and MACD bearish reversal' };
      }
    }

    if (currentPosition === Position.SHORT) {
      const shouldCloseShort = rsi !== null && rsi < 30 && macd !== null && macd.histogram > 0;
      if (shouldCloseShort) {
        return { action: Action.CLOSE, reason: 'RSI oversold and MACD bullish reversal' };
      }
    }

    return { action: Action.KEEP, reason: 'Position maintained, no exit signal' };
  }

  private calculateRSI(closingPrices: number[]): number | null {
    if (closingPrices.length < 14) {
      return null;
    }

    const rsiValues = RSI.calculate({
      values: closingPrices,
      period: 14,
    });

    return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
  }

  private calculateMACD(closingPrices: number[]): {
    macd: number;
    signal: number;
    histogram: number;
  } | null {
    if (closingPrices.length < 26) {
      return null;
    }

    const macdValues = MACD.calculate({
      values: closingPrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });

    if (macdValues.length === 0) {
      return null;
    }

    const latest = macdValues[macdValues.length - 1];
    return {
      macd: latest.MACD ?? 0,
      signal: latest.signal ?? 0,
      histogram: latest.histogram ?? 0,
    };
  }

  private calculateSMA(closingPrices: number[], period: number): number | null {
    if (closingPrices.length < period) {
      return null;
    }

    const smaValues = SMA.calculate({
      values: closingPrices,
      period,
    });

    return smaValues.length > 0 ? smaValues[smaValues.length - 1] : null;
  }

  private calculateEMA(closingPrices: number[], period: number): number | null {
    if (closingPrices.length < period) {
      return null;
    }

    const emaValues = EMA.calculate({
      values: closingPrices,
      period,
    });

    return emaValues.length > 0 ? emaValues[emaValues.length - 1] : null;
  }

  private calculateBollingerBands(closingPrices: number[]): {
    upper: number;
    middle: number;
    lower: number;
  } | null {
    if (closingPrices.length < 20) {
      return null;
    }

    const bbValues = BollingerBands.calculate({
      values: closingPrices,
      period: 20,
      stdDev: 2,
    });

    if (bbValues.length === 0) {
      return null;
    }

    const latest = bbValues[bbValues.length - 1];
    return {
      upper: latest.upper,
      middle: latest.middle,
      lower: latest.lower,
    };
  }

  private calculateATR(highPrices: number[], lowPrices: number[], closingPrices: number[]): number | null {
    if (highPrices.length < 14) {
      return null;
    }

    const atrValues = ATR.calculate({
      high: highPrices,
      low: lowPrices,
      close: closingPrices,
      period: 14,
    });

    return atrValues.length > 0 ? atrValues[atrValues.length - 1] : null;
  }

  private analyzeVolume(volumes: number[]): {
    averageVolume: number;
    volumeSpike: boolean;
  } {
    const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeSpike = currentVolume > averageVolume * 1.5;

    return {
      averageVolume: Math.round(averageVolume),
      volumeSpike,
    };
  }

  private findSupportResistance(
    highPrices: number[],
    lowPrices: number[]
  ): {
    support: number;
    resistance: number;
  } {
    const support = Math.min(...lowPrices);
    const resistance = Math.max(...highPrices);

    return {
      support: Math.round(support * 100) / 100,
      resistance: Math.round(resistance * 100) / 100,
    };
  }
}
