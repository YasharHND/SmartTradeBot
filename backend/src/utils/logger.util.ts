import { Logger } from '@aws-lambda-powertools/logger';
import type { LogLevel } from '@aws-lambda-powertools/logger/types';

export { Logger };

const SERVICE_NAME = 'BackendLogger';
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

export const logger = new Logger({
  serviceName: SERVICE_NAME,
  logLevel: LOG_LEVEL,
});

export function getAppLogger(serviceName: string): Logger {
  return logger.createChild({ serviceName });
}
