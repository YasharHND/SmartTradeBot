import { z } from 'zod';
import { GNewsCategory } from '@clients/gnews/models/category.enum';
import { GNewsLanguage } from '@clients/gnews/models/language.enum';
import { GNewsCountry } from '@clients/gnews/models/country.enum';

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

const GNewsTruncateOptionEnum = z.enum(['content']);

export const GNewsTopHeadlinesQueryInputSchema = z.strictObject({
  category: z.nativeEnum(GNewsCategory).optional().default(GNewsCategory.BUSINESS),
  lang: z.nativeEnum(GNewsLanguage).optional().default(GNewsLanguage.ENGLISH),
  country: z.nativeEnum(GNewsCountry).optional(),
  max: z.number().min(1).max(100).optional().default(25),
  nullable: GNewsNullableAttributesSchema.optional().default('image'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  truncate: GNewsTruncateOptionEnum.optional(),
});

export type GNewsTopHeadlinesQueryInput = z.infer<typeof GNewsTopHeadlinesQueryInputSchema>;
