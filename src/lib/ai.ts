/**
 * Provider-agnostic AI wrapper. Talks to any OpenAI-compatible
 * /chat/completions endpoint (Nous Research, OpenAI, OpenRouter,
 * local llama.cpp/vLLM, etc). Config via env:
 *   AI_BASE_URL  e.g. https://inference-api.nousresearch.com/v1
 *   AI_API_KEY   the provider key
 *   AI_MODEL     e.g. Hermes-4-405B / gpt-4o-mini / anything the endpoint serves
 */

export const aiConfig = {
  baseUrl: process.env.AI_BASE_URL ?? "",
  apiKey: process.env.AI_API_KEY ?? "",
  model: process.env.AI_MODEL ?? "",
};

export function aiEnabled(): boolean {
  return Boolean(aiConfig.baseUrl && aiConfig.apiKey && aiConfig.model);
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  if (!aiEnabled()) return null;
  const res = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages,
      max_tokens: opts.maxTokens ?? 500,
      temperature: opts.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? null;
}

/** Wedding-planning assistant system prompt. */
export const ASSISTANT_SYSTEM = `You are the Ever After wedding assistant, helping South African couples plan their wedding. You know the local market: budgets in ZAR (typical full wedding R100k-R250k), categories (venues, catering & bar, photography & video, flowers & decor, dresses & suits, hair & makeup, dance lessons, health & beauty, honeymoon), and cities (start with Pretoria and Johannesburg). Give practical, warm, concise advice. When useful, suggest which vendor categories to request quotes for. Never invent specific vendor names or prices as fact — give ranges and guidance.`;

/** Vendor listing description generator system prompt. */
export const LISTING_SYSTEM = `You write wedding-vendor business descriptions for the Ever After marketplace in South Africa. Given rough bullet points from the vendor, write a polished, warm, professional 2-3 sentence description. No emojis, no superlatives like "best", no markdown. Plain prose only.`;
