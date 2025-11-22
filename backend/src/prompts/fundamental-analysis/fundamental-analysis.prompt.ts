import { DynamicPrompt } from '@prompts/dynamic.prompt';
import { FundamentalAnalysisVariables } from '@/prompts/fundamental-analysis/fundamental-analysis.variables.schema';
import { FundamentalAnalysisResponseSchema } from '@/prompts/fundamental-analysis/fundamental-analysis.response.schema';
import { ZodSchema } from 'zod';

const TEMPLATE_CONTENT = `
# Gold Trading Analysis Request

## Current Market Context

Based on the latest news data provided below, please analyze the market sentiment and provide specific guidance on gold trading positions.

## News Data

### US News Data

\`\`\`json
{{{usNewsData}}}
\`\`\`

### Global News Data

\`\`\`json
{{{globalNewsData}}}
\`\`\`

## Trading Analysis Request

Please analyze the above news articles and provide your assessment on the following:

1. **Market Sentiment Analysis**: Based on the news provided, what is the overall market sentiment that could impact gold prices? Consider:
   - Economic indicators and GDP data
   - Geopolitical tensions or stability
   - Currency movements and central bank policies
   - Inflation concerns or deflationary pressures
   - Stock market performance and risk appetite

2. **Gold Trading Recommendation**:
   - Should I **BUY** gold (take a long position)?
   - Should I **SELL** gold (take a short position)?
   - Should I remain **NEUTRAL** and avoid trading?

   Provide your reasoning based on the news analysis.

## Additional Context

- My risk tolerance: {{riskTolerance}} (Conservative/Moderate/Aggressive)
- Trading timeframe: {{timeframe}} (Short-term/Medium-term/Long-term)
- Position size preference: {{positionSize}} (Small/Medium/Large)

## Response Format

Respond with ONLY a JSON object containing exactly these three properties:

\`\`\`json
{
  "action": "BUY",
  "confidence": 75,
  "reason": "One sentence brief explanation for your recommendation"
}
\`\`\`

- **action**: Must be one of: "BUY", "HOLD", "SELL"
- **confidence**: A number from 0 to 100 representing your confidence percentage in this recommendation
- **reason**: A string containing one sentence that briefly explains your trading recommendation

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
