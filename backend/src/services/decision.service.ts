import { Action, Position } from '@/services/technical-analysis.service';
import {
  FundamentalAnalysisResponse,
  PricePrediction,
} from '@/prompts/fundamental-analysis/fundamental-analysis.response.schema';

const TECHNICAL_WEIGHT = 0.4;
const FUNDAMENTAL_BASE_WEIGHT = 0.6;
const DECISION_THRESHOLD = 0.7;
const HIGH_CONFIDENCE_THRESHOLD = 75;

export interface DecisionResult {
  shouldTakeAction: boolean;
  consensus: number;
  finalAction: Action;
  reasoning: string;
}

export class DecisionService {
  private static _instance: DecisionService;

  public static get instance(): DecisionService {
    if (!DecisionService._instance) {
      DecisionService._instance = new DecisionService();
    }
    return DecisionService._instance;
  }

  private constructor() {}

  decide(
    technicalAction: Action,
    fundamentalAnalysis: FundamentalAnalysisResponse,
    currentPosition: Position
  ): DecisionResult {
    const fundamentalWeight = this.calculateFundamentalWeight(fundamentalAnalysis.confidence);
    const alignment = this.calculateAlignment(technicalAction, fundamentalAnalysis.prediction, currentPosition);
    const consensus = this.calculateConsensus(alignment, fundamentalWeight);
    const shouldTakeAction = consensus >= DECISION_THRESHOLD;

    const finalAction = this.determineFinalAction(
      technicalAction,
      fundamentalAnalysis,
      currentPosition,
      shouldTakeAction
    );

    const reasoning = this.buildReasoning(
      technicalAction,
      fundamentalAnalysis,
      alignment,
      consensus,
      fundamentalWeight,
      shouldTakeAction
    );

    return {
      shouldTakeAction,
      consensus,
      finalAction,
      reasoning,
    };
  }

  private calculateAlignment(
    technicalAction: Action,
    pricePrediction: PricePrediction,
    currentPosition: Position
  ): number {
    if (technicalAction === Action.BUY && pricePrediction === PricePrediction.UPWARD) {
      return 1.0;
    }

    if (technicalAction === Action.SELL && pricePrediction === PricePrediction.DOWNWARD) {
      return 1.0;
    }

    if (technicalAction === Action.CLOSE) {
      if (currentPosition === Position.LONG) {
        if (pricePrediction === PricePrediction.DOWNWARD || pricePrediction === PricePrediction.STABLE) {
          return 0.8;
        }
        return 0.3;
      }

      if (currentPosition === Position.SHORT) {
        if (pricePrediction === PricePrediction.UPWARD || pricePrediction === PricePrediction.STABLE) {
          return 0.8;
        }
        return 0.3;
      }
    }

    if (technicalAction === Action.KEEP) {
      if (currentPosition === Position.LONG) {
        if (pricePrediction === PricePrediction.UPWARD || pricePrediction === PricePrediction.STABLE) {
          return 0.8;
        }
        return 0.3;
      }

      if (currentPosition === Position.SHORT) {
        if (pricePrediction === PricePrediction.DOWNWARD || pricePrediction === PricePrediction.STABLE) {
          return 0.8;
        }
        return 0.3;
      }
    }

    if (technicalAction === Action.BUY && pricePrediction === PricePrediction.STABLE) {
      return 0.5;
    }

    if (technicalAction === Action.SELL && pricePrediction === PricePrediction.STABLE) {
      return 0.5;
    }

    return 0.0;
  }

  private calculateFundamentalWeight(confidence: number): number {
    const confidenceRatio = confidence / 100;
    return FUNDAMENTAL_BASE_WEIGHT * confidenceRatio;
  }

  private calculateConsensus(alignment: number, fundamentalWeight: number): number {
    const technicalContribution = TECHNICAL_WEIGHT;
    const fundamentalContribution = fundamentalWeight * alignment;

    return technicalContribution + fundamentalContribution;
  }

  private determineFinalAction(
    technicalAction: Action,
    fundamentalAnalysis: FundamentalAnalysisResponse,
    currentPosition: Position,
    shouldTakeAction: boolean
  ): Action {
    if (!shouldTakeAction) {
      return Action.KEEP;
    }

    if (fundamentalAnalysis.confidence >= HIGH_CONFIDENCE_THRESHOLD) {
      if (fundamentalAnalysis.prediction === PricePrediction.UPWARD) {
        if (currentPosition === Position.NONE) {
          return Action.BUY;
        }
        if (currentPosition === Position.SHORT) {
          return Action.CLOSE;
        }
        return Action.KEEP;
      }

      if (fundamentalAnalysis.prediction === PricePrediction.DOWNWARD) {
        if (currentPosition === Position.NONE) {
          return Action.SELL;
        }
        if (currentPosition === Position.LONG) {
          return Action.CLOSE;
        }
        return Action.KEEP;
      }

      if (fundamentalAnalysis.prediction === PricePrediction.STABLE) {
        return Action.KEEP;
      }
    }

    return technicalAction;
  }

  private buildReasoning(
    technicalAction: Action,
    fundamentalAnalysis: FundamentalAnalysisResponse,
    alignment: number,
    consensus: number,
    fundamentalWeight: number,
    shouldTakeAction: boolean
  ): string {
    const alignmentPercent = (alignment * 100).toFixed(0);
    const consensusPercent = (consensus * 100).toFixed(0);
    const thresholdPercent = (DECISION_THRESHOLD * 100).toFixed(0);
    const fundamentalWeightPercent = (fundamentalWeight * 100).toFixed(0);

    if (shouldTakeAction) {
      return `Technical analysis suggests ${technicalAction} and fundamental analysis predicts ${fundamentalAnalysis.prediction} with ${fundamentalAnalysis.confidence}% confidence. Fundamental weight: ${fundamentalWeightPercent}%, Alignment: ${alignmentPercent}%, Consensus: ${consensusPercent}% (threshold: ${thresholdPercent}%). Action approved.`;
    }

    return `Technical analysis suggests ${technicalAction} and fundamental analysis predicts ${fundamentalAnalysis.prediction} with ${fundamentalAnalysis.confidence}% confidence. Fundamental weight: ${fundamentalWeightPercent}%, Alignment: ${alignmentPercent}%, Consensus: ${consensusPercent}% (threshold: ${thresholdPercent}%). Action rejected - insufficient consensus.`;
  }
}
