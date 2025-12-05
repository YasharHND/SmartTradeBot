import { z } from 'zod';

const OpeningHoursSchema = z.object({
  sun: z.array(z.string()),
  mon: z.array(z.string()),
  tue: z.array(z.string()),
  wed: z.array(z.string()),
  thu: z.array(z.string()),
  fri: z.array(z.string()),
  sat: z.array(z.string()),
});

const OvernightFeeSchema = z.object({
  longRate: z.number(),
  shortRate: z.number(),
  swapChargeTimestamp: z.number(),
  swapChargeInterval: z.number(),
});

const InstrumentSchema = z.object({
  epic: z.string(),
  symbol: z.string(),
  expiry: z.string(),
  name: z.string(),
  lotSize: z.number(),
  type: z.string(),
  guaranteedStopAllowed: z.boolean(),
  streamingPricesAvailable: z.boolean(),
  currency: z.string(),
  marginFactor: z.number(),
  marginFactorUnit: z.string(),
  openingHours: OpeningHoursSchema,
  overnightFee: OvernightFeeSchema,
});

const UnitValueSchema = z.object({
  unit: z.string(),
  value: z.number(),
});

const DealingRulesSchema = z.object({
  minStepDistance: UnitValueSchema,
  minDealSize: UnitValueSchema,
  maxDealSize: UnitValueSchema,
  minSizeIncrement: UnitValueSchema,
  minGuaranteedStopDistance: UnitValueSchema,
  minStopOrProfitDistance: UnitValueSchema,
  maxStopOrProfitDistance: UnitValueSchema,
  marketOrderPreference: z.string(),
  trailingStopsPreference: z.string(),
});

const SnapshotSchema = z.object({
  marketStatus: z.string(),
  percentageChange: z.number(),
  updateTime: z.string(),
  delayTime: z.number(),
  bid: z.number(),
  offer: z.number(),
  decimalPlacesFactor: z.number(),
  scalingFactor: z.number(),
  marketModes: z.array(z.string()),
});

export const MarketDetailsResponseSchema = z.object({
  instrument: InstrumentSchema,
  dealingRules: DealingRulesSchema,
  snapshot: SnapshotSchema,
});

export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type OvernightFee = z.infer<typeof OvernightFeeSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type UnitValue = z.infer<typeof UnitValueSchema>;
export type DealingRules = z.infer<typeof DealingRulesSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type MarketDetailsResponse = z.infer<typeof MarketDetailsResponseSchema>;
