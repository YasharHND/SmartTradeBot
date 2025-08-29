export class EnvironmentUtil {
  private constructor() {}

  static isProduction(environment: string): boolean {
    return environment === 'production';
  }

  static isNonProduction(environment: string): boolean {
    return !EnvironmentUtil.isProduction(environment);
  }
}
