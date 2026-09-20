import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clearSession } from "@/lib/session";

/**
 * POPIA right to erasure: soft-delete the signed-in user. A nightly purge
 * job (M6) removes purged accounts older than 30 days.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  await prisma.user.update({
    where: { id: session.uid },
    data: { email: `deleted+${session.uid}@purge.local` },
  });
  if (session.coupleId) {
    await prisma.couple.delete({ where: { id: session.coupleId } }).catch(() => {});
  }
  if (session.vendorId) {
    await prisma.vendor.update({
      where: { id: session.vendorId },
      data: { status: "SUSPENDED", businessName: "[deleted listing]" },
    });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
