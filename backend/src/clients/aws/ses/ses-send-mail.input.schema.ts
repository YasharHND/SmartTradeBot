import { z } from 'zod';

export const SesSendMailInputSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string().min(1),
  htmlBody: z.string().min(1),
});

export type SesSendMailInput = z.infer<typeof SesSendMailInputSchema>;
