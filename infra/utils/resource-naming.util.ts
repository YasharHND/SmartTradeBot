import { isProduction } from './environment-status.util';

export const getBackendStackName = (projectName: string, environment: string) =>
  `${projectName}-${environment}-backend-stack`;
