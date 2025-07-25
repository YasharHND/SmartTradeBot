import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { getInfraLogger } from '../utils/logger.util';

export class CloudFormationService {
  constructor(
    private readonly cloudFormation: CloudFormation = new CloudFormation({}),
    private readonly logger = getInfraLogger(CloudFormationService.name)
  ) {}

  async getOutputsByKey(stackName: string, outputKeys: string[]): Promise<{ [key: string]: string }> {
    const response = await this.cloudFormation.describeStacks({ StackName: stackName });
    const stack = response.Stacks?.[0];
    if (!stack) {
      throw new Error(`Stack ${stackName} not found`);
    }
    const outputs = stack.Outputs?.filter((output) => output.OutputKey && outputKeys.includes(output.OutputKey));
    return Object.fromEntries(outputs?.map((output) => [output.OutputKey, output.OutputValue]) || []);
  }
}
