import { getInfraLogger } from './logger.util';

const logger = getInfraLogger('util-validation');

export const checkRequiredEnvVars = (requiredEnvVars: string[]): void => {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    const missingEnvVarsString = missingEnvVars.map((envVar) => `- ${envVar}`).join('\n');
    logger.error(`Missing required environment variables:\n${missingEnvVarsString}`);
    throw new Error('Missing required environment variables. Please check the console for details.');
  }
};
