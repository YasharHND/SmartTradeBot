import { LambdaUtil } from '@utils/lambda.util';
import { orchestratorHandler } from '@/handlers/orchestrator.handler';

export const handler = LambdaUtil.proxy(orchestratorHandler);
