import { APIGatewayProxyResult } from 'aws-lambda';
import { fundamentalAnalysisHandler } from '@handlers/fundamental-analysis.handler';
import { withErrorHandling } from '@utils/lambda.util';

export const handler = withErrorHandling(
  async (event: unknown): Promise<APIGatewayProxyResult> => {
    return await fundamentalAnalysisHandler(event);
  },
  'fundamentalAnalysisHandler'
);
