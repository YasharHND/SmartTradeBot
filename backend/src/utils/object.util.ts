export class ObjectUtil {
  private constructor() {}

  static optionalField<V>(value: V | undefined, key: string): Record<string, V> {
    if (!value) return {};
    return { [key]: value };
  }
}
