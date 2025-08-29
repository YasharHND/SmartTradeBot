import { LambdaHandler } from '@utils/lambda.util';

export const fundamentalAnalysisHandler: LambdaHandler = async (_event: unknown) => {
  return { message: 'Hello New VERY VERY NEW Universe' };
};
