import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const LAWS = [
  { name: 'Space', description: 'Geography/Physics' },
  { name: 'Survival', description: 'Biology/Needs' },
  { name: 'Cognition', description: 'Language/Belief' },
  { name: 'Scarcity', description: 'Economy/Conflict' },
  { name: 'Time', description: 'History/Erosion' },
  { name: 'Power', description: 'Politics/Order' },
  { name: 'Metaphysics', description: 'The Anomaly' },
];

const EXPERT_COUNCIL_PROMPT = `You are the 'Expert Council of World Builders'.
Analyze the provided [Core Premise] and [Art Style].
Apply the following 7 Laws:
1. Space (Geography/Physics)
2. Survival (Biology/Needs)
3. Cognition (Language/Belief)
4. Scarcity (Economy/Conflict)
5. Time (History/Erosion)
6. Power (Politics/Order)
7. Metaphysics (The Anomaly)

Generate 20 practical, specific rules that govern this world.
Examples: "Police sirens require citizens to stop and pray", "Water is only traded at night".

CRITICAL JSON FORMAT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. All property names must use double quotes
3. All string values must use double quotes

Format each rule as a JSON object with these exact fields:
{ "law": "Law Name", "rule": "Description", "expert_logic": "Why this exists" }

Return a JSON object with a "rules" key containing an array of exactly 20 rule objects.
Format: { "rules": [ {...}, {...}, ... ] }

Do not include any other text or markdown formatting.`;

export async function POST(request: NextRequest) {
  try {
    const { corePremise, artStyle } = await request.json();

    if (!corePremise || !artStyle) {
      return NextResponse.json(
        { error: 'Core Premise and Art Style are required' },
        { status: 400 }
      );
    }

    // Read environment variables at request time
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const apiKey = deepSeekKey || openAiKey;

    if (!apiKey) {
      console.error('Environment variables check:', {
        DEEPSEEK_API_KEY: deepSeekKey ? 'Set (hidden)' : 'Not set',
        OPENAI_API_KEY: openAiKey ? 'Set (hidden)' : 'Not set',
      });
      return NextResponse.json(
        { error: 'API Key not configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY in .env file' },
        { status: 500 }
      );
    }

    // Configure OpenAI client with DeepSeek or OpenAI
    const baseURL = deepSeekKey ? 'https://api.deepseek.com' : undefined;
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    const userPrompt = `Core Premise: ${corePremise}\nArt Style: ${artStyle}`;

    // Use DeepSeek model if DEEPSEEK_API_KEY is set, otherwise use OpenAI model
    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: EXPERT_COUNCIL_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response with robust error handling
    let rulesData;
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
      let parsed;
      try {
        parsed = JSON.parse(cleanedContent);
      } catch (firstError: any) {
        // Log the specific error location for debugging
        console.error('JSON parse error at:', firstError.message);
        console.error('Problem area:', cleanedContent.substring(Math.max(0, (firstError as any).position - 50), Math.min(cleanedContent.length, (firstError as any).position + 50)));
        throw firstError;
      }

      // Extract rules array from the response object
      rulesData = parsed.rules || parsed.rule_list || parsed.ruleList || [];

      // If it's already an array, use it directly (fallback)
      if (Array.isArray(parsed)) {
        rulesData = parsed;
      }

      if (!Array.isArray(rulesData) || rulesData.length === 0) {
        throw new Error('Invalid response format: rules array not found');
      }
    } catch (parseError: any) {
      console.error('Raw AI response:', responseContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Validate and format the rules
    const formattedRules = rulesData.map((rule: any, index: number) => {
      // Ensure law is one of the valid laws
      const lawName = rule.law || rule.Law || '';
      const validLaw = LAWS.find(
        (l) => l.name.toLowerCase() === lawName.toLowerCase()
      )?.name || LAWS[index % LAWS.length].name;

      return {
        id: `rule-${Date.now()}-${index}`,
        law: validLaw,
        rule: rule.rule || rule.Rule || rule.description || 'No description provided',
        expert_logic: rule.expert_logic || rule.expertLogic || rule.expert_reasoning || 'No expert logic provided',
        confirmed: false,
      };
    });

    return NextResponse.json({ rules: formattedRules });
  } catch (error: any) {
    console.error('Error generating rules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate rules' },
      { status: 500 }
    );
  }
}
