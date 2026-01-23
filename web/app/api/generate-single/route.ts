import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Law } from '@/types';

const LAWS = [
  { name: 'Space', description: 'Geography/Physics' },
  { name: 'Survival', description: 'Biology/Needs' },
  { name: 'Cognition', description: 'Language/Belief' },
  { name: 'Scarcity', description: 'Economy/Conflict' },
  { name: 'Time', description: 'History/Erosion' },
  { name: 'Power', description: 'Politics/Order' },
  { name: 'Metaphysics', description: 'The Anomaly' },
];

export async function POST(request: NextRequest) {
  try {
    const { corePremise, artStyle, law } = await request.json();

    if (!corePremise || !artStyle || !law) {
      return NextResponse.json(
        { error: 'Core Premise, Art Style, and Law are required' },
        { status: 400 }
      );
    }

    // Validate law
    const validLaw = LAWS.find((l) => l.name === law);
    if (!validLaw) {
      return NextResponse.json(
        { error: `Invalid law: ${law}` },
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

    const systemPrompt = `You are an expert world-builder specializing in the "${validLaw.name}" law (${validLaw.description}).

Generate ONE specific, practical rule for a world based on the provided Core Premise and Art Style.
The rule must be related to the "${validLaw.name}" law domain.

Examples: "Police sirens require citizens to stop and pray", "Water is only traded at night".

CRITICAL JSON FORMAT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. All property names must use double quotes
3. All string values must use double quotes

Format the rule as a JSON object with these exact fields:
{ "law": "${validLaw.name}", "rule": "Description", "expert_logic": "Why this exists" }

Return a JSON object with a "rule" key containing the rule object.
Format: { "rule": {...} }

Do not include any other text or markdown formatting.`;

    const userPrompt = `Core Premise: ${corePremise}\nArt Style: ${artStyle}`;

    // Use DeepSeek model if DEEPSEEK_API_KEY is set, otherwise use OpenAI model
    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
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

    // Parse the JSON response
    let ruleData;
    try {
      let cleanedContent = responseContent.trim();

      // Remove markdown code blocks if present
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      // Fix common AI JSON issues
      // 1. Replace smart quotes with regular quotes first
      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/['']/g, "'");

      // 2. Fix single quotes used as string delimiters (invalid in JSON)
      // This regex handles single-quoted strings more carefully
      // Match patterns like: 'key': 'value' or "key": 'value'
      cleanedContent = cleanedContent.replace(/:\s*'([^']*)'/g, (_match, content) => {
        // Value after colon - replace single quotes with double quotes
        return `: "${content.replace(/"/g, '\\"')}"`;
      });

      // Match single-quoted property names: 'key':
      cleanedContent = cleanedContent.replace(/'([^']+)':/g, (_match, content) => {
        // Property name - replace single quotes with double quotes
        return `"${content}":`;
      });

      // 3. Remove trailing commas before } or ]
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      const parsed = JSON.parse(cleanedContent);
      ruleData = parsed.rule || parsed;

      if (!ruleData || typeof ruleData !== 'object') {
        throw new Error('Invalid response format: rule object not found');
      }
    } catch (parseError: any) {
      console.error('Raw AI response:', responseContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Format the rule
    const formattedRule = {
      id: `rule-${Date.now()}-new`,
      law: validLaw.name as Law,
      rule: ruleData.rule || ruleData.Rule || ruleData.description || 'No description provided',
      expert_logic: ruleData.expert_logic || ruleData.expertLogic || ruleData.expert_reasoning || 'No expert logic provided',
      confirmed: false,
      isNew: true, // 标记为新生成的规则
    };

    return NextResponse.json({ rule: formattedRule });
  } catch (error: any) {
    console.error('Error generating single rule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate rule' },
      { status: 500 }
    );
  }
}
