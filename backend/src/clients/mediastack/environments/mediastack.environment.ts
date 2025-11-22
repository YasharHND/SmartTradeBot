import { RuntimeEnvironment } from '@common/environments/runtime.environment';

export class MediastackEnvironment {
  private static _instance: MediastackEnvironment;

  public static get instance(): MediastackEnvironment {
    if (!MediastackEnvironment._instance) {
      MediastackEnvironment._instance = new MediastackEnvironment(RuntimeEnvironment.instance.getMediastackApiKey());
    }
    return MediastackEnvironment._instance;
  }

  private constructor(private readonly mediastackApiKey: string) {}

  getMediastackApiKey(): string {
    return this.mediastackApiKey;
  }
}
