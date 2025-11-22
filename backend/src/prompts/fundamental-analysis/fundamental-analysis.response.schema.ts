import { z } from 'zod';

export enum Action {
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
}

export const FundamentalAnalysisResponseSchema = z.object({
  action: z.nativeEnum(Action),
  confidence: z.number().min(0).max(100),
  reason: z.string().min(1),
});

export type FundamentalAnalysisResponse = z.infer<typeof FundamentalAnalysisResponseSchema>;
