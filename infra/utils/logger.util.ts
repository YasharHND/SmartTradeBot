import { Logger } from '@aws-lambda-powertools/logger';

export { Logger };

export const getInfraLogger = (serviceName: string): Logger => {
  return new Logger({
    serviceName,
    logLevel: 'INFO',
  });
};
