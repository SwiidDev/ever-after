import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** POPIA right of access: export the signed-in user's data as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const data: Record<string, unknown> = { user: { email: session.email, role: session.role } };

  if (session.coupleId) {
    data.wedding = await prisma.couple.findUnique({
      where: { id: session.coupleId },
      include: {
        guests: true,
        budgetItems: true,
        checklist: true,
        ideas: true,
        leads: { select: { id: true, category: true, region: true, budgetBand: true, createdAt: true } },
      },
    });
  }
  if (session.vendorId) {
    data.vendor = await prisma.vendor.findUnique({
      where: { id: session.vendorId },
      include: {
        serviceRegions: true,
        reviews: { select: { rating: true, createdAt: true } },
        ledgerEntries: { select: { type: true, deltaCredits: true, balanceAfter: true, createdAt: true } },
      },
    });
  }
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="everafter-export.json"`,
    },
  });
}
