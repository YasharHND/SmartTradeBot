import { z } from 'zod';
import { v5 as uuidv5 } from 'uuid';
import { MediastackCategorySchema } from '@/clients/mediastack/schemas/category.schema';
import { MediastackLanguageSchema } from '@/clients/mediastack/schemas/language.schema';
import { MediastackCountrySchema } from '@/clients/mediastack/schemas/country.schema';
import { Region } from '@/schemas/region.schema';

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
  .transform((data) => {
    const region = data.country === 'us' ? Region.UNITED_STATES : Region.GLOBAL;
    return {
      id: uuidv5(data.url, uuidv5.URL),
      ...data,
      region,
      date: data.published_at.split('T')[0],
    };
  });

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
