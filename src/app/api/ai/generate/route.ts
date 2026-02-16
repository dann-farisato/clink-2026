import { NextRequest, NextResponse } from "next/server";
import { generateContent, type AIAction } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, context } = body as { action: AIAction; context: Record<string, unknown> };

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const result = await generateContent({ action, context });
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
