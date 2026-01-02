import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const VALIDATION_PROMPT = `You are an expert World-Building Validator specializing in the "Core Anomaly Verification" methodology.

Your task is to analyze a proposed Core Premise and determine if it meets the criteria for a truly unique and "structural" (non-decorative) world-building foundation.

## Validation Framework (Based on 核心设定检验原则)

### 1. Core Anomaly Identification (核心异质点)
- Identify which of the 7 Laws is being fundamentally disrupted
- Determine if this is a superficial change or a deep structural transformation
- The 7 Laws are: Space, Survival, Cognition, Scarcity, Time, Power, Metaphysics

### 2. Domino Effect Test (逻辑压力测试)
- Analyze how this core premise forces changes across ALL other laws
- A true core premise should create a cascading effect across the entire world structure
- For each law, predict ONE concrete change this premise would necessitate

### 3. The Eraser Test (橡皮擦实验)
- Create a test scenario (e.g., a wedding, a murder, a trade negotiation)
- Show what happens if we "erase" the core premise and replace it with a mundane setting
- Verdict:
  * STRUCTURAL: The scenario becomes impossible/nonsensical without the premise
  * DECORATIVE: The scenario still works fine in a normal setting

### 4. Uniqueness Scoring (0-100)
- 0-30: Generic/derivative (easily found in existing works)
- 31-60: Interesting but not revolutionary (minor twist on known concepts)
- 61-85: Highly unique (rarely seen, strong potential)
- 86-100: Revolutionary (completely unprecedented, paradigm-shifting)

## Response Format (STRICT JSON only)

CRITICAL: You MUST return valid JSON with double quotes (") only. NO single quotes (').
All string values must use double quotes. Use proper JSON escaping for any quotes within strings.

Return a JSON object with this exact structure:
{
  "isUnique": true,
  "uniquenessScore": 75,
  "coreAnomalyIdentified": "Which law is being disrupted and how",
  "lawImpacts": [
    {
      "law": "Space",
      "impact": "Brief description of how this law is affected",
      "example": "One concrete example of this impact"
    }
  ],
  "eraserTest": {
    "originalScenario": "A scenario in this world (2-3 sentences)",
    "replacementScenario": "The same scenario in a normal/mundane world (2-3 sentences)",
    "analysis": "Explanation of what breaks or changes",
    "verdict": "structural"
  },
  "warnings": [
    "Array of potential issues or weaknesses in the premise"
  ],
  "recommendations": [
    "Array of suggestions to strengthen the core premise"
  ]
}

IMPORTANT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. Include all 7 laws in lawImpacts array (Space, Survival, Cognition, Scarcity, Time, Power, Metaphysics)
3. verdict must be exactly "structural" or "decorative" (lowercase, double quotes)
4. Be brutally honest. A weak premise should score low. Don't inflate scores out of politeness.`;


export async function POST(request: NextRequest) {
  try {
    const { corePremise } = await request.json();

    if (!corePremise || corePremise.trim().length === 0) {
      return NextResponse.json(
        { error: 'Core Premise is required' },
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

    const userPrompt = `Core Premise to validate:\n\n${corePremise}`;

    // Use appropriate model
    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: VALIDATION_PROMPT,
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

    // Parse the JSON response with robust error handling
    let validationResult;
    try {
      // Clean the response content first
      let cleanedContent = responseContent.trim();

      // Remove markdown code blocks if present
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      // Fix common AI JSON issues
      // 1. Replace smart quotes with regular quotes
      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/['']/g, "'");

      // 2. Remove trailing commas before } or ]
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      // First try: parse as-is
      try {
        validationResult = JSON.parse(cleanedContent);
      } catch (firstError: any) {
        // Log the specific error location for debugging
        console.error('JSON parse error at:', firstError.message);
        console.error('Problem area:', cleanedContent.substring(Math.max(0, (firstError as any).position - 50), Math.min(cleanedContent.length, (firstError as any).position + 50)));
        throw firstError;
      }
    } catch (parseError: any) {
      console.error('Raw AI response:', responseContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Validate the response structure
    if (!validationResult.lawImpacts || !Array.isArray(validationResult.lawImpacts)) {
      throw new Error('Invalid response format: lawImpacts array missing');
    }

    if (!validationResult.eraserTest || typeof validationResult.eraserTest !== 'object') {
      throw new Error('Invalid response format: eraserTest object missing');
    }

    return NextResponse.json(validationResult);
  } catch (error: any) {
    console.error('Error validating premise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate premise' },
      { status: 500 }
    );
  }
}
