import { z } from 'zod';
import { RegionSchema } from './region.schema';

export const publishedAtSchema = z.string().datetime();

export const NewsV2KeySchema = z.object({
  id: z.string(),
  published_at: publishedAtSchema,
});

export type NewsV2Key = z.infer<typeof NewsV2KeySchema>;

export const NewsV2Schema = NewsV2KeySchema.extend({
  author: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  image: z.string().nullable(),
  category: z.string(),
  language: z.string(),
  country: z.string(),
  region: RegionSchema,
  date: z.string().date(),
});

export type NewsV2 = z.infer<typeof NewsV2Schema>;
