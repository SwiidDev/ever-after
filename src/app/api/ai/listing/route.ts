import { NextResponse } from "next/server";
import { aiChat, aiEnabled, LISTING_SYSTEM } from "@/lib/ai";

export async function POST(req: Request) {
  if (!aiEnabled()) {
    return NextResponse.json(
      { error: "AI not configured", description: null },
      { status: 503 },
    );
  }
  const { bullets, businessName, category } = (await req.json()) as {
    bullets?: string;
    businessName?: string;
    category?: string;
  };
  if (!bullets?.trim()) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const reply = await aiChat(
    [
      { role: "system", content: LISTING_SYSTEM },
      {
        role: "user",
        content: `Business: ${businessName ?? "wedding vendor"} (${category ?? "wedding services"}).\nBullet points:\n${bullets.slice(0, 1000)}`,
      },
    ],
    { maxTokens: 200, temperature: 0.8 },
  );
  return NextResponse.json({ description: reply });
}
