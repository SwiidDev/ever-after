import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCouple() {
  const jar = await cookies();
  const coupleId = jar.get("weddo_couple")?.value;
  if (!coupleId) redirect("/login");
  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: { user: true },
  });
  if (!couple) redirect("/login");
  return couple;
}

export const CHECKLIST_TEMPLATE: [number, string][] = [
  [12, "Choose your wedding party"],
  [12, "Start a guest list"],
  [12, "Pick a date and schedule venue tours"],
  [12, "Start planning your budget"],
  [12, "Identify your wedding style and color palette"],
  [11, "Book your venue"],
  [11, "Book your caterer"],
  [10, "Book photographer & videographer"],
  [10, "Order invitations"],
  [9, "Choose and order the wedding dress and suits"],
  [8, "Book flowers and decor"],
  [7, "Finalize bar service"],
  [6, "Send invitations"],
  [5, "Book hair and makeup trials"],
  [4, "Final RSVP chase"],
  [3, "Apply for marriage licence"],
  [2, "Final venue walkthrough"],
  [1, "Confirm final headcount with caterers"],
  [1, "Pack for the honeymoon"],
];
