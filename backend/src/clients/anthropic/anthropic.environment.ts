import { RuntimeEnvironment } from '@common/environments/runtime.environment';

// Using this Singleton class to break the link from the actual client to the outside.
// That's the only place it's referencing outside of its own module.
export class AnthropicEnvironment {
  private static _instance: AnthropicEnvironment;

  public static get instance(): AnthropicEnvironment {
    if (!AnthropicEnvironment._instance) {
      AnthropicEnvironment._instance = new AnthropicEnvironment(RuntimeEnvironment.instance.getAnthropicApiKey());
    }
    return AnthropicEnvironment._instance;
  }

  private constructor(private readonly anthropicApiKey: string) {}

  getAnthropicApiKey(): string {
    return this.anthropicApiKey;
  }
}
