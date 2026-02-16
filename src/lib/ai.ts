import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type AIAction =
  | "generate-summary"
  | "generate-experience"
  | "improve-bullets"
  | "tailor-to-job"
  | "suggest-skills";

interface GenerateContentParams {
  action: AIAction;
  context: {
    role?: string;
    industry?: string;
    currentContent?: string;
    jobDescription?: string;
    sectionData?: Record<string, unknown>;
  };
}

const SYSTEM_PROMPT = `You are a professional CV/resume writing assistant. You help create compelling, ATS-friendly CV content.

Rules:
- Write in a professional, concise tone
- Use strong action verbs to start bullet points
- Quantify achievements when possible
- Tailor content to the specified role and industry
- Return structured JSON matching the requested format
- Never fabricate specific numbers or company details the user hasn't provided`;

export async function generateContent({ action, context }: GenerateContentParams) {
  const userPrompt = buildPrompt(action, context);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return JSON.parse(textBlock.text);
}

function buildPrompt(action: AIAction, context: GenerateContentParams["context"]): string {
  switch (action) {
    case "generate-summary":
      return `Write a professional summary for a ${context.role || "professional"} in the ${context.industry || "technology"} industry. Return JSON: { "content": "..." }`;

    case "generate-experience":
      return `Generate 3-5 achievement-oriented bullet points for a ${context.role || "professional"} role. ${context.currentContent ? `Current context: ${context.currentContent}` : ""} Return JSON: { "bullets": ["...", "..."] }`;

    case "improve-bullets":
      return `Improve these bullet points to be more impactful and quantified:\n${context.currentContent}\nReturn JSON: { "bullets": ["...", "..."] }`;

    case "tailor-to-job":
      return `Tailor this CV content to match this job description:\nJob: ${context.jobDescription}\nCurrent content: ${context.currentContent}\nReturn JSON with the tailored version in the same structure.`;

    case "suggest-skills":
      return `Suggest relevant skills for a ${context.role || "professional"} in ${context.industry || "technology"}. Return JSON: { "skills": [{ "category": "...", "items": ["..."] }] }`;

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
