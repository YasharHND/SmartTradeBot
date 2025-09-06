import { z } from 'zod';

export const NewsSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  country: z.string(),
});

export type NewsSource = z.infer<typeof NewsSourceSchema>;

export const NewsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  url: z.string(),
  image: z.string().optional().nullable(),
  publishedAt: z.string(),
  lang: z.string(),
  source: NewsSourceSchema,
});

export type News = z.infer<typeof NewsSchema>;
