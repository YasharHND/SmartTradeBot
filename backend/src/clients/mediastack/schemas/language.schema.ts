import { z } from 'zod';

export enum MediastackLanguage {
  ARABIC = 'ar',
  GERMAN = 'de',
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  HEBREW = 'he',
  ITALIAN = 'it',
  DUTCH = 'nl',
  NORWEGIAN = 'no',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  SWEDISH = 'se',
  CHINESE = 'zh',
}

export const MediastackLanguageSchema = z.nativeEnum(MediastackLanguage);
