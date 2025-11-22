import { z } from 'zod';

export enum PricePrediction {
  UPWARD = 'UPWARD',
  STABLE = 'STABLE',
  DOWNWARD = 'DOWNWARD',
}

export const FundamentalAnalysisResponseSchema = z.object({
  prediction: z.nativeEnum(PricePrediction),
  confidence: z.number().min(0).max(100),
  reason: z.string().min(1),
});

export type FundamentalAnalysisResponse = z.infer<typeof FundamentalAnalysisResponseSchema>;
