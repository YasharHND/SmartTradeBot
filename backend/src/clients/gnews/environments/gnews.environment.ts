import { RuntimeEnvironment } from '@common/environments/runtime.environment';

// Using this Singleton class to break the link from the actual client to the outside.
// That's the only place it's referencing outside of its own module.
export class GnewsEnvironment {
  private static _instance: GnewsEnvironment;

  public static get instance(): GnewsEnvironment {
    if (!GnewsEnvironment._instance) {
      GnewsEnvironment._instance = new GnewsEnvironment(RuntimeEnvironment.instance.getGnewsApiKey());
    }
    return GnewsEnvironment._instance;
  }

  private constructor(private readonly gnewsApiKey: string) {}

  getGnewsApiKey(): string {
    return this.gnewsApiKey;
  }
}
