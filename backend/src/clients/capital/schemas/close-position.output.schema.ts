import { z } from 'zod';

export const ClosePositionResponseSchema = z.object({
  dealReference: z.string(),
});

export type ClosePositionResponse = z.infer<typeof ClosePositionResponseSchema>;
