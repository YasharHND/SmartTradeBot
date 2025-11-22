import { z } from 'zod';

export const DynamoDBKeySchema = z.object({
  PK: z.string(),
  SK: z.string(),
});

export type DynamoDBKey = z.infer<typeof DynamoDBKeySchema>;

export const DynamoDBModelSchema = DynamoDBKeySchema.extend({
  GSI1PK: z.string().optional(),
  GSI1SK: z.string().optional(),
  GSI2PK: z.string().optional(),
  GSI2SK: z.string().optional(),
}).and(z.record(z.string(), z.unknown()));

export type DynamoDBModel = z.infer<typeof DynamoDBModelSchema>;

export const GSI1KeySchema = z.object({
  GSI1PK: z.string(),
  GSI1SK: z.string(),
});

export type GSI1Key = z.infer<typeof GSI1KeySchema>;

export const GSI2KeySchema = z.object({
  GSI2PK: z.string(),
  GSI2SK: z.string(),
});

export type GSI2Key = z.infer<typeof GSI2KeySchema>;

export type UpdateDynamoDBModel<T extends DynamoDBModel> = {
  key: DynamoDBKey;
  updates: Partial<T>;
};
