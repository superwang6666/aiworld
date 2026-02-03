import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import OpenAI from 'openai';

import { EVALUATION_CONFIG } from '@/config/evaluation-rules';

export async function POST(request: NextRequest) {
  try {
    const { lawImpacts } = await request.json();

    if (!lawImpacts || !Array.isArray(lawImpacts)) {
      return NextResponse.json(
        { error: 'lawImpacts array is required' },
        { status: 400 }
      );
    }

    // Read environment variables
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const apiKey = deepSeekKey || openAiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY in .env file' },
        { status: 500 }
      );
    }

    // Configure OpenAI client
    const baseURL = deepSeekKey ? 'https://api.deepseek.com' : undefined;
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    const userPrompt = `Law Impacts to Evaluate:
${JSON.stringify(lawImpacts, null, 2)}

Please evaluate each direction against the criteria defined in the system prompt above.

IMPORTANT: Return your response in valid JSON format following the structure specified in the system prompt.`;

    // Use appropriate model
    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: EVALUATION_CONFIG.systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response
    let evaluationResult;
    try {
      let cleanedContent = responseContent.trim();

      // Remove markdown code blocks if present
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      // Fix common AI JSON issues
      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/['']/g, "'");
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      evaluationResult = JSON.parse(cleanedContent);
    } catch (parseError: any) {
      console.error('Raw AI response:', responseContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Validate the response structure
    if (!evaluationResult.evaluatedImpacts || !Array.isArray(evaluationResult.evaluatedImpacts)) {
      throw new Error('Invalid response format: evaluatedImpacts array missing');
    }

    return NextResponse.json(evaluationResult);
  } catch (error: any) {
    console.error('Error evaluating directions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate directions' },
      { status: 500 }
    );
  }
}
