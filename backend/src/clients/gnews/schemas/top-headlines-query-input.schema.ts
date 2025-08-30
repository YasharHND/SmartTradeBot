import { z } from 'zod';
import { GNewsCategory } from '../models/category.enum';
import { GNewsLanguage } from '../models/language.enum';
import { GNewsCountry } from '../models/country.enum';

const GNewsNullableAttributeEnum = z.enum(['description', 'content', 'image']);

const GNewsNullableAttributesSchema = z.string().refine(
  (val) => {
    const attributes = val.split(',').map((attr) => attr.trim());
    return attributes.every((attr) => GNewsNullableAttributeEnum.safeParse(attr).success);
  },
  {
    message: 'Nullable must be one or more of: description, content, image (comma-separated)',
  }
);

const GNewsExpandOptionEnum = z.enum(['content']);

export const GNewsTopHeadlinesQueryInputSchema = z.strictObject({
  category: z.nativeEnum(GNewsCategory).optional(),
  lang: z.nativeEnum(GNewsLanguage).optional(),
  country: z.nativeEnum(GNewsCountry).optional(),
  max: z.number().min(1).max(100).optional(),
  nullable: GNewsNullableAttributesSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  expand: GNewsExpandOptionEnum.optional(),
});

export type GNewsTopHeadlinesQueryInput = z.infer<typeof GNewsTopHeadlinesQueryInputSchema>;
