import { Logger } from '@aws-lambda-powertools/logger';
import type { LogLevel } from '@aws-lambda-powertools/logger/types';
import { EnvUtil } from '@common/utils/env.util';
import { LOG_LEVEL as LOG_LEVEL_KEY } from '@common/environments/backend.environment';

const SERVICE_NAME = 'BackendLogger';
const LOG_LEVEL: LogLevel = EnvUtil.getOptionalEnv<LogLevel>(LOG_LEVEL_KEY, 'INFO');

export { Logger };

export class LogUtil {
  private constructor() {}

  private static readonly logger = new Logger({
    serviceName: SERVICE_NAME,
    logLevel: LOG_LEVEL,
  });

  static getLogger(serviceName: string): Logger {
    return LogUtil.logger.createChild({ serviceName });
  }
}
