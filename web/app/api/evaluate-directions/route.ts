import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { EVALUATION_CONFIG } from "@/config/evaluation-rules";

import { getOpenAIClient } from "@/lib/utils/openai-client";

export async function POST(request: NextRequest) {
  try {
    const { lawImpacts } = await request.json();

    if (!lawImpacts || !Array.isArray(lawImpacts)) {
      return NextResponse.json(
        { error: "lawImpacts array is required" },
        { status: 400 },
      );
    }

    const { openai, model } = getOpenAIClient();

    const userPrompt = `Law Impacts to Evaluate:
${JSON.stringify(lawImpacts, null, 2)}

Please evaluate each direction against the criteria defined in the system prompt above.

IMPORTANT: Return your response in valid JSON format following the structure specified in the system prompt.`;

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: EVALUATION_CONFIG.systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI service");
    }

    let evaluationResult;
    try {
      let cleanedContent = responseContent.trim();

      const jsonMatch = cleanedContent.match(
        /```(?:json)?\s*(\{[\s\S]*\})\s*```/,
      );
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/['']/g, "'");
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

      evaluationResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    // Validate the response structure
    if (
      !evaluationResult.evaluatedImpacts ||
      !Array.isArray(evaluationResult.evaluatedImpacts)
    ) {
      throw new Error(
        "Invalid response format: evaluatedImpacts array missing",
      );
    }

    return NextResponse.json(evaluationResult);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to evaluate directions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
