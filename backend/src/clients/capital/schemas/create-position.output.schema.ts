import { z } from 'zod';

export const CreatePositionResponseSchema = z.object({
  dealReference: z.string(),
});

export type CreatePositionResponse = z.infer<typeof CreatePositionResponseSchema>;
