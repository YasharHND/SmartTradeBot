import { z } from 'zod';

export enum RiskTolerance {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive',
}

export enum Timeframe {
  SHORT_TERM = 'Short-term',
  MEDIUM_TERM = 'Medium-term',
  LONG_TERM = 'Long-term',
}

export enum PositionSize {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
}

export const FundamentalAnalysisVariablesSchema = z.strictObject({
  usNewsData: z.any(),
  globalNewsData: z.any(),
  riskTolerance: z.nativeEnum(RiskTolerance),
  timeframe: z.nativeEnum(Timeframe),
  positionSize: z.nativeEnum(PositionSize),
});

export type FundamentalAnalysisVariables = z.infer<typeof FundamentalAnalysisVariablesSchema>;
