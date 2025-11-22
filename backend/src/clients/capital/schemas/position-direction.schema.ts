import { z } from 'zod';

export enum PositionDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export const PositionDirectionSchema = z.nativeEnum(PositionDirection);
