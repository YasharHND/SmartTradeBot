import { Logger } from '@aws-lambda-powertools/logger';
import type { LogLevel } from '@aws-lambda-powertools/logger/types';
import { EnvUtil } from '@utils/env.util';

const SERVICE_NAME = 'BackendLogger';
const LOG_LEVEL: LogLevel | undefined = EnvUtil.getOptionalEnv<LogLevel>('LOG_LEVEL', 'INFO');

export { Logger };

export class LoggerUtil {
  private constructor() {}

  private static readonly logger = new Logger({
    serviceName: SERVICE_NAME,
    logLevel: LOG_LEVEL,
  });

  static getLogger(serviceName: string): Logger {
    return LoggerUtil.logger.createChild({ serviceName });
  }
}
