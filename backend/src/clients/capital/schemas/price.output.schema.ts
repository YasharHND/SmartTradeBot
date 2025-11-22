import { z } from 'zod';

const PricePointSchema = z.object({
  bid: z.number(),
  ask: z.number(),
});

export const PriceOutputSchema = z.object({
  snapshotTime: z.string(),
  snapshotTimeUTC: z.string(),
  openPrice: PricePointSchema,
  closePrice: PricePointSchema,
  highPrice: PricePointSchema,
  lowPrice: PricePointSchema,
  lastTradedVolume: z.number(),
});

export const HistoricalPricesResponseSchema = z.object({
  prices: z.array(PriceOutputSchema),
  instrumentType: z.string(),
  tickSize: z.number(),
  pipPosition: z.number(),
});

export type PricePoint = z.infer<typeof PricePointSchema>;
export type PriceOutput = z.infer<typeof PriceOutputSchema>;
export type HistoricalPricesResponse = z.infer<typeof HistoricalPricesResponseSchema>;
