import { RuntimeEnvironment } from '@common/environments/runtime.environment';

export class CapitalEnvironment {
  private static _instance: CapitalEnvironment;

  public static get instance(): CapitalEnvironment {
    if (!CapitalEnvironment._instance) {
      CapitalEnvironment._instance = new CapitalEnvironment(
        RuntimeEnvironment.instance.getCapitalApiUrl(),
        RuntimeEnvironment.instance.getCapitalEmail(),
        RuntimeEnvironment.instance.getCapitalApiKey(),
        RuntimeEnvironment.instance.getCapitalApiKeyCustomPassword()
      );
    }
    return CapitalEnvironment._instance;
  }

  private constructor(
    private readonly capitalApiUrl: string,
    private readonly capitalEmail: string,
    private readonly capitalApiKey: string,
    private readonly capitalApiKeyCustomPassword: string
  ) {}

  getCapitalApiUrl(): string {
    return this.capitalApiUrl;
  }

  getCapitalEmail(): string {
    return this.capitalEmail;
  }

  getCapitalApiKey(): string {
    return this.capitalApiKey;
  }

  getCapitalApiKeyCustomPassword(): string {
    return this.capitalApiKeyCustomPassword;
  }
}
