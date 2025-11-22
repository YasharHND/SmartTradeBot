import { LambdaHandler } from '@utils/lambda.util';
import { OrchestratorService } from '@/services/orchestrator.service';

export const orchestratorHandler: LambdaHandler = async () => {
  const orchestratorService = OrchestratorService.instance;
  return orchestratorService.execute();
};
