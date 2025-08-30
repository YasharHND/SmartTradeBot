import Handlebars from 'handlebars';

export abstract class DynamicPrompt {
  private readonly compiledTemplate: HandlebarsTemplateDelegate;

  protected constructor(templateContent: string) {
    this.compiledTemplate = Handlebars.compile(templateContent);
  }

  protected render(variables: Record<string, unknown>): string {
    const processedVariables = Object.entries(variables).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
          acc[key] = JSON.stringify(value, null, 2);
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    return this.compiledTemplate(processedVariables).trim();
  }
}
