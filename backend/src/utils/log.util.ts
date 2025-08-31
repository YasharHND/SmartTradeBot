import { Logger } from '@aws-lambda-powertools/logger';

const SERVICE_NAME = 'BackendLogger';

export { Logger };

export class LogUtil {
  private constructor() {}

  private static readonly logger = new Logger({
    serviceName: SERVICE_NAME,
    logLevel: 'INFO',
  });

  static getLogger(serviceName: string): Logger {
    return LogUtil.logger.createChild({ serviceName });
  }
}
