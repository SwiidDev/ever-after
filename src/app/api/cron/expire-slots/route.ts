import { NextResponse } from "next/server";
import { expireAndRedistribute } from "@/lib/slots";

export const dynamic = "force-dynamic";

/**
 * Vercel cron target. Secured with a shared secret in `CRON_SECRET`.
 * Set vercel.json `crons` to hit `/api/cron/expire-slots` every 15 min.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await expireAndRedistribute();
  return NextResponse.json({ ok: true, ...result });
}
