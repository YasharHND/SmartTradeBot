export class ResourceUtil {
  private constructor() {}

  static name(project: string, resource: string, environment: string): string {
    return `${project}-${resource}-${environment}`;
  }
}
