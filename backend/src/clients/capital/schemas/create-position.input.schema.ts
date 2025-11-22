import { z } from 'zod';
import { PositionDirectionSchema } from './position-direction.schema';

export const CreatePositionInputSchema = z.object({
  direction: PositionDirectionSchema,
  epic: z.string(),
  size: z.number(),
  guaranteedStop: z.boolean().optional(),
  trailingStop: z.boolean().optional(),
  stopLevel: z.number().optional(),
  stopDistance: z.number().optional(),
  stopAmount: z.number().optional(),
  profitLevel: z.number().optional(),
  profitDistance: z.number().optional(),
  profitAmount: z.number().optional(),
});

export type CreatePositionInput = z.infer<typeof CreatePositionInputSchema>;
