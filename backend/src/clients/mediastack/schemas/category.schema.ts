import { z } from 'zod';

export enum MediastackCategory {
  GENERAL = 'general',
  BUSINESS = 'business',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  SCIENCE = 'science',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
}

export const MediastackCategorySchema = z.nativeEnum(MediastackCategory);
