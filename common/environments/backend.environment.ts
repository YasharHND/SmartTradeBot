import { EnvUtil } from '@common/utils/env.util';
import { LambdaEnvironment } from '@common/environments/lambda.environment';

const GNEWS_API_KEY = 'GNEWS_API_KEY';
const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';

export class BackendEnvironment implements LambdaEnvironment {
  private readonly gnewsApiKey: string;
  private readonly anthropicApiKey: string;

  constructor() {
    this.gnewsApiKey = EnvUtil.getRequiredEnv(GNEWS_API_KEY);
    this.anthropicApiKey = EnvUtil.getRequiredEnv(ANTHROPIC_API_KEY);
  }

  getGnewsApiKey(): string {
    return this.gnewsApiKey;
  }

  getAnthropicApiKey(): string {
    return this.anthropicApiKey;
  }

  getAll(): Record<string, string> {
    return {
      [GNEWS_API_KEY]: this.gnewsApiKey,
      [ANTHROPIC_API_KEY]: this.anthropicApiKey,
    };
  }
}
