import { z } from 'zod';

export const EncryptionKeyResponseSchema = z.object({
  encryptionKey: z.string(),
  timeStamp: z.number(),
});

export type EncryptionKeyResponse = z.infer<typeof EncryptionKeyResponseSchema>;
