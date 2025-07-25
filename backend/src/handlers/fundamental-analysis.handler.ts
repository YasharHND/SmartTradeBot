import { APIGatewayProxyResult } from 'aws-lambda';
import { getAppLogger } from '@utils/logger.util';
import { createRestApiResponse } from '@utils/api-response.util';

const logger = getAppLogger('fundamentalAnalysisHandler');

export const fundamentalAnalysisHandler = async (event: unknown): Promise<APIGatewayProxyResult> => {
  logger.debug('DUMMY:', { event });
  return createRestApiResponse({ message: 'Hello, world!' }, 200);
};
