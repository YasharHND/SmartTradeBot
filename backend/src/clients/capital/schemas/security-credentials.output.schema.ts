import { z } from 'zod';

export const SecurityCredentialsSchema = z.object({
  securityToken: z.string(),
  cst: z.string(),
});

export type SecurityCredentials = z.infer<typeof SecurityCredentialsSchema>;
