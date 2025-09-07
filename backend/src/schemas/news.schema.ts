import { z } from 'zod';
import { CountrySchema } from '@schemas/country.schema';
import { LanguageSchema } from '@schemas/language.schema';

export const publishedAtSchema = z.string().datetime();

export const NewsKeySchema = z.object({
  id: z.string(),
  publishedAt: publishedAtSchema,
});

export type NewsKey = z.infer<typeof NewsKeySchema>;

export const NewsSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  country: CountrySchema,
});

export type NewsSource = z.infer<typeof NewsSourceSchema>;

export const NewsSchema = NewsKeySchema.extend({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  url: z.string(),
  image: z.string().optional().nullable(),
  lang: LanguageSchema,
  source: NewsSourceSchema,
});

export type News = z.infer<typeof NewsSchema>;
