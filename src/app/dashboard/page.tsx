import Link from "next/link";
import { getCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import AiAssistant from "./ai-assistant";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const couple = await getCouple();
  const [guestCount, attending, budgetAgg, taskAgg, tasks] = await Promise.all([
    prisma.guest.count({ where: { coupleId: couple.id } }),
    prisma.guest.count({ where: { coupleId: couple.id, rsvp: "ATTENDING" } }),
    prisma.budgetItem.aggregate({
      where: { coupleId: couple.id },
      _sum: { estimatedCents: true, actualCents: true },
    }),
    prisma.checklistItem.aggregate({
      where: { coupleId: couple.id },
      _count: { _all: true },
    }),
    prisma.checklistItem.findMany({
      where: { coupleId: couple.id, done: false },
      orderBy: { monthsOut: "asc" },
      take: 3,
    }),
  ]);
  const doneCount = await prisma.checklistItem.count({
    where: { coupleId: couple.id, done: true },
  });

  const days =
    couple.weddingDate == null
      ? null
      : Math.max(
          0,
          Math.ceil(
            (couple.weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          ),
        );
  const budget = Number(couple.budgetTotal ?? 0);
  const estimated = (budgetAgg._sum.estimatedCents ?? 0) / 100;
  const pct =
    taskAgg._count._all === 0
      ? 0
      : Math.round((doneCount / taskAgg._count._all) * 100);

  async function savePlan(formData: FormData) {
    "use server";
    const { getCouple } = await import("@/lib/couple");
    const { prisma } = await import("@/lib/prisma");
    const c = await getCouple();
    const date = String(formData.get("weddingDate") ?? "");
    const budget = String(formData.get("budgetTotal") ?? "");
    const names = String(formData.get("partnerNames") ?? "").trim();
    await prisma.couple.update({
      where: { id: c.id },
      data: {
        weddingDate: date ? new Date(date) : null,
        budgetTotal: budget ? Number(budget) * 100 : null,
        partnerNames: names ? [names] : undefined,
      },
    });
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Your Wedding Plan</h1>

      <form
        action={savePlan}
        className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-neutral-200 p-4 text-sm"
      >
        <label className="flex flex-col gap-1">
          Wedding date
          <input
            name="weddingDate"
            type="date"
            defaultValue={couple.weddingDate?.toISOString().slice(0, 10)}
            className="rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          Budget (R)
          <input
            name="budgetTotal"
            type="number"
            min={0}
            defaultValue={budget || ""}
            placeholder="100000"
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          Partner names
          <input
            name="partnerNames"
            defaultValue={
              Array.isArray(couple.partnerNames)
                ? (couple.partnerNames as string[]).join(" & ")
                : ""
            }
            placeholder="Jane & John"
            className="rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>
        <button className="rounded-full bg-pink-600 px-5 py-2 font-medium text-white hover:bg-pink-700">
          Save
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Days to go" value={days == null ? "—" : String(days)} accent />
        <Stat label="Guests invited" value={String(guestCount)} sub={`${attending} attending`} />
        <Stat
          label="Budget estimated"
          value={`R ${estimated.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}
          sub={budget ? `of R ${budget.toLocaleString("en-ZA")}` : undefined}
        />
        <Stat label="Checklist" value={`${pct}%`} sub={`${doneCount}/${taskAgg._count._all} done`} />
      </div>

      <h2 className="mb-3 mt-8 font-serif text-xl font-semibold">
        Next up on your checklist
      </h2>
      <ul className="mb-8 space-y-1 text-sm">
        {tasks.map((t) => (
          <li key={t.id} className="rounded-lg border border-neutral-200 px-3 py-2">
            {t.title} <span className="text-neutral-400">· {t.monthsOut} months out</span>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-neutral-500">All done — enjoy the wedding!</li>
        )}
      </ul>

      <h2 className="mb-3 font-serif text-xl font-semibold">Find your vendors</h2>
      <AiAssistant />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/quotes/${encodeURIComponent(cat)}`}
            className="rounded-xl border border-neutral-200 p-4 text-center text-sm font-medium transition hover:border-pink-400 hover:text-pink-600"
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-pink-300 bg-pink-50" : "border-neutral-200"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`font-serif text-2xl font-bold ${accent ? "text-pink-700" : ""}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}
