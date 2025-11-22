import { z } from 'zod';
import { v5 as uuidv5 } from 'uuid';
import { MediastackCategorySchema } from './category.schema';
import { MediastackLanguageSchema } from './language.schema';
import { MediastackCountrySchema } from './country.schema';

export const MediastackNewsOutputSchema = z
  .object({
    author: z.string().nullable(),
    title: z.string(),
    description: z.string(),
    url: z.string(),
    source: z.string(),
    image: z.string().nullable(),
    category: z.union([MediastackCategorySchema, z.string()]),
    language: z.union([MediastackLanguageSchema, z.string()]),
    country: z.union([MediastackCountrySchema, z.string()]),
    published_at: z.string().transform((val) => new Date(val).toISOString()),
  })
  .transform((data) => ({
    id: uuidv5(data.url, uuidv5.URL),
    ...data,
    date: data.published_at.split('T')[0],
  }));

export const MediastackPaginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  count: z.number(),
  total: z.number(),
});

export const MediastackNewsResponseSchema = z.object({
  pagination: MediastackPaginationSchema,
  data: z.array(MediastackNewsOutputSchema),
});

export type MediastackNewsOutput = z.infer<typeof MediastackNewsOutputSchema>;
export type MediastackPagination = z.infer<typeof MediastackPaginationSchema>;
export type MediastackNewsResponse = z.infer<typeof MediastackNewsResponseSchema>;
