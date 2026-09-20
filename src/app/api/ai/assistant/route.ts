import { NextResponse } from "next/server";
import { aiChat, aiEnabled, ASSISTANT_SYSTEM } from "@/lib/ai";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.coupleId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  if (!aiEnabled()) {
    return NextResponse.json(
      { error: "AI not configured", reply: null },
      { status: 503 },
    );
  }
  const { messages } = (await req.json()) as {
    messages?: { role: "user" | "assistant"; content: string }[];
  };
  if (!messages?.length || messages.length > 20) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const reply = await aiChat([
    { role: "system", content: ASSISTANT_SYSTEM },
    ...messages.slice(-10),
  ]);
  return NextResponse.json({ reply });
}
