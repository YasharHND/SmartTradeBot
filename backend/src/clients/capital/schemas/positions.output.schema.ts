import { z } from 'zod';

const PositionSchema = z.object({
  contractSize: z.number(),
  createdDate: z.string(),
  createdDateUTC: z.string(),
  dealId: z.string(),
  dealReference: z.string(),
  workingOrderId: z.string(),
  size: z.number(),
  leverage: z.number(),
  upl: z.number(),
  direction: z.string(),
  level: z.number(),
  currency: z.string(),
  guaranteedStop: z.boolean(),
});

const MarketSchema = z.object({
  instrumentName: z.string(),
  expiry: z.string(),
  marketStatus: z.string(),
  epic: z.string(),
  symbol: z.string(),
  instrumentType: z.string(),
  lotSize: z.number(),
  high: z.number(),
  low: z.number(),
  percentageChange: z.number(),
  netChange: z.number(),
  bid: z.number(),
  offer: z.number(),
  updateTime: z.string(),
  updateTimeUTC: z.string(),
  delayTime: z.number(),
  streamingPricesAvailable: z.boolean(),
  scalingFactor: z.number(),
  marketModes: z.array(z.string()),
});

const PositionItemSchema = z.object({
  position: PositionSchema,
  market: MarketSchema,
});

export const PositionsResponseSchema = z.object({
  positions: z.array(PositionItemSchema),
});

export type Position = z.infer<typeof PositionSchema>;
export type Market = z.infer<typeof MarketSchema>;
export type PositionItem = z.infer<typeof PositionItemSchema>;
export type PositionsResponse = z.infer<typeof PositionsResponseSchema>;
