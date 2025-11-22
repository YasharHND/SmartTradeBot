import { DynamicPrompt } from '@prompts/dynamic.prompt';
import { FundamentalAnalysisVariables } from '@/prompts/fundamental-analysis/fundamental-analysis.variables.schema';
import { FundamentalAnalysisResponseSchema } from '@/prompts/fundamental-analysis/fundamental-analysis.response.schema';
import { ZodSchema } from 'zod';

const TEMPLATE_CONTENT = `
# Gold Price Prediction Analysis

## Current Market Context

Based on the latest news data provided below, please analyze the market sentiment and provide a prediction on gold price movement.

## News Data

### US News Data

\`\`\`json
{{{usNewsData}}}
\`\`\`

### Global News Data

\`\`\`json
{{{globalNewsData}}}
\`\`\`

## Price Prediction Request

Please analyze the above news articles and provide your assessment on the following:

1. **Market Sentiment Analysis**: Based on the news provided, what is the overall market sentiment that could impact gold prices? Consider:
   - Economic indicators and GDP data
   - Geopolitical tensions or stability
   - Currency movements and central bank policies
   - Inflation concerns or deflationary pressures
   - Stock market performance and risk appetite

2. **Gold Price Prediction**:
   - Will gold prices move **UPWARD**?
   - Will gold prices remain **STABLE**?
   - Will gold prices move **DOWNWARD**?

   **Important**: Consider even the tiniest price movements in your prediction. Even if the expected movement is just a few cents up or down, classify it as UPWARD or DOWNWARD accordingly. Only predict STABLE if you genuinely expect no meaningful price change.

   Provide your reasoning based on the news analysis.

## Additional Context

- Analysis timeframe: {{timeframe}} (Short-term/Medium-term/Long-term)
- Market volatility: {{riskTolerance}} (Low/Moderate/High)
- Economic cycle phase: {{positionSize}} (Early/Mid/Late)

## Response Format

Respond with ONLY a JSON object containing exactly these three properties:

\`\`\`json
{
  "prediction": "UPWARD",
  "confidence": 75,
  "reason": "One sentence brief explanation for your prediction"
}
\`\`\`

- **prediction**: Must be one of: "UPWARD", "STABLE", "DOWNWARD"
- **confidence**: A number from 0 to 100 representing your confidence percentage in this prediction
- **reason**: A string containing one sentence that briefly explains your price prediction

Provide ONLY the JSON object, no additional text or explanation.
`;

export class FundamentalAnalysisPrompt extends DynamicPrompt {
  constructor() {
    super(TEMPLATE_CONTENT);
  }

  render(variables: FundamentalAnalysisVariables): string {
    return super.render(variables);
  }

  responseSchema(): ZodSchema {
    return FundamentalAnalysisResponseSchema;
  }
}
