import { z } from 'zod';

export enum Region {
  UNITED_STATES = 'UNITED_STATES',
  GLOBAL = 'GLOBAL',
}

export const RegionSchema = z.nativeEnum(Region);
