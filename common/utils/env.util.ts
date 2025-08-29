export class EnvUtil {
  private constructor() {}

  static getRequiredEnv<T = string>(envName: string): T {
    const value = process.env[envName];
    if (!value) {
      throw new Error(`Environment variable ${envName} is required but not set`);
    }
    return value as T;
  }

  static getOptionalEnv<T = string>(envName: string, defaultValue: T): T {
    const value = process.env[envName];
    return value ? (value as T) : defaultValue;
  }
}
