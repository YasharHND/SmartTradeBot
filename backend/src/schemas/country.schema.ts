import { z } from 'zod';

export enum Country {
  AUSTRALIA = 'au',
  BRAZIL = 'br',
  CANADA = 'ca',
  CHINA = 'cn',
  EGYPT = 'eg',
  FRANCE = 'fr',
  GERMANY = 'de',
  GREECE = 'gr',
  HONG_KONG = 'hk',
  INDIA = 'in',
  IRELAND = 'ie',
  ITALY = 'it',
  JAPAN = 'jp',
  NETHERLANDS = 'nl',
  NORWAY = 'no',
  PAKISTAN = 'pk',
  PERU = 'pe',
  PHILIPPINES = 'ph',
  PORTUGAL = 'pt',
  ROMANIA = 'ro',
  RUSSIAN_FEDERATION = 'ru',
  SINGAPORE = 'sg',
  SWEDEN = 'se',
  SWITZERLAND = 'ch',
  TAIWAN = 'tw',
  UKRAINE = 'ua',
  UNITED_KINGDOM = 'gb',
  UNITED_STATES = 'us',
}

export const CountrySchema = z.nativeEnum(Country);
