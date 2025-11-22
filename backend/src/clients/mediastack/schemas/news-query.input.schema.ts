import { z } from 'zod';
import { MediastackCategorySchema } from './category.schema';
import { MediastackCountrySchema } from './country.schema';
import { MediastackLanguageSchema } from './language.schema';

const createCommaSeparatedSchema = (
  schema: z.ZodTypeAny,
  fieldName: string
): z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string> =>
  z
    .string()
    .refine(
      (val) => {
        const items = val.split(',').map((item) => item.trim());
        return items.every((item) => {
          const cleanItem = item.startsWith('-') ? item.slice(1) : item;
          return schema.safeParse(cleanItem).success;
        });
      },
      {
        message: `${fieldName} must be comma-separated valid values (can be prefixed with - for exclusion)`,
      }
    )
    .transform((val) => {
      const items = val.split(',').map((item) => item.trim());
      return items.join(',');
    });

const MediastackCategoriesSchema = createCommaSeparatedSchema(MediastackCategorySchema, 'Categories');
const MediastackCountriesSchema = createCommaSeparatedSchema(MediastackCountrySchema, 'Countries');
const MediastackLanguagesSchema = createCommaSeparatedSchema(MediastackLanguageSchema, 'Languages');

const MediastackSortEnum = z.enum(['published_desc', 'published_asc', 'popularity']);

export const MediastackNewsQueryInputSchema = z.object({
  categories: MediastackCategoriesSchema.optional(),
  countries: MediastackCountriesSchema.optional(),
  languages: MediastackLanguagesSchema.optional(),
  keywords: z.string().optional(),
  date: z.string().date().optional(),
  sort: MediastackSortEnum.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type MediastackNewsQueryInput = z.infer<typeof MediastackNewsQueryInputSchema>;
