import { z } from 'zod';

export enum Language {
  ARABIC = 'ar',
  CHINESE = 'zh',
  DUTCH = 'nl',
  ENGLISH = 'en',
  FRENCH = 'fr',
  GERMAN = 'de',
  GREEK = 'el',
  HINDI = 'hi',
  ITALIAN = 'it',
  JAPANESE = 'ja',
  MALAYALAM = 'ml',
  MARATHI = 'mr',
  NORWEGIAN = 'no',
  PORTUGUESE = 'pt',
  ROMANIAN = 'ro',
  RUSSIAN = 'ru',
  SPANISH = 'es',
  SWEDISH = 'sv',
  TAMIL = 'ta',
  TELUGU = 'te',
  UKRAINIAN = 'uk',
}

export const LanguageSchema = z.nativeEnum(Language);
