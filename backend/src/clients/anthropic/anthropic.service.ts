import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@anthropic-ai/sdk/resources';
import { ZodSchema } from 'zod';

export class AnthropicService {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async invoke<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    const response = await this.client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return this.parseResponse(response, schema);
  }

  private parseResponse<T>(response: Message, schema: ZodSchema<T>): T {
    for (const content of response.content) {
      if (content.type === 'text') {
        const text = content.text;
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || text.match(/^([\s\S]*)$/);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
        const parsedJson = JSON.parse(jsonString);
        return schema.parse(parsedJson);
      }
    }

    throw new Error(`No text content found in Anthropic response: ${JSON.stringify(response)}`);
  }
}
