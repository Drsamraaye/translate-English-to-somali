// lib/ai.ts
import { z } from "zod";

const ResponseSchema = z.object({
  word: z.string(),
  translation: z.string(),
  grammar: z.object({
    type: z.array(z.string()),
    explanation: z.string(),
  }),
  somali_explanation: z.string(),
  example: z.string(),
});

type AiResponse = z.infer<typeof ResponseSchema>;

export async function analyzeWord(text: string): Promise<AiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is not configured.");

  const prompt = `
You are an assistant that MUST return strictly valid JSON only (no markdown, no comments).
Analyze this English word or short phrase: """${text}"""

Return JSON in THIS EXACT SCHEMA:

{
  "word": "<the original input, trimmed>",
  "translation": "<accurate Somali translation (one or two words)>",
  "grammar": {
    "type": ["noun","verb","adjective","adverb", ...],
    "explanation": "<short Somali explanation of its grammatical behavior (1-2 sentences)>"
  },
  "somali_explanation": "<short Somali sentence explaining meaning in Somali>",
  "example": "<one short example in English → Somali>"
}

Rules:
- Detect grammar types (can be multiple).
- Translate faithfully to Somali (use common, natural words).
- Keep all fields short and clear.
- Return ONLY JSON that validates against the schema above.
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const textErr = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${textErr}`);
  }

  const data = await res.json();

  const raw = data.choices?.[0]?.message?.content ?? null;
  if (!raw) throw new Error("OpenAI returned no content.");

  // Try to parse JSON robustly (strip surrounding text if needed)
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // if the model added extraneous text, try to extract JSON block
    const match = raw.match(/\{[\s\S]*\}$/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse JSON from OpenAI response.");
    }
  }

  const result = ResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("OpenAI response did not match expected schema: " + JSON.stringify(result.error.format()));
  }

  return result.data;
}
