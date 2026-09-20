import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { getCouple } from "@/lib/couple";
import AiAssistant from "./ai-assistant";

export const dynamic = "force-dynamic";

const HERO = "https://images.unsplash.com/photo-1519741497674-611481863552?w=2400&q=80&auto=format&fit=crop";

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

  const partners = Array.isArray(couple.partnerNames)
    ? (couple.partnerNames as string[]).join(" & ")
    : "Your wedding";
  const dateLabel = couple.weddingDate
    ? couple.weddingDate.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Set a date to start the countdown";

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
      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-3xl bg-cover bg-center p-6 text-white sm:p-10"
        style={{ backgroundImage: `url("${HERO}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-700/80 via-pink-600/60 to-black/40" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider text-white/80">
            {dateLabel}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">
            {partners}
          </h1>
          <p className="mt-4 inline-flex items-baseline gap-2">
            <span className="font-serif text-7xl font-bold text-white drop-shadow">
              {days == null ? "—" : days}
            </span>
            <span className="text-base text-white/90">
              {days == null ? "days" : days === 1 ? "day to go" : "days to go"}
            </span>
          </p>
          <form action={savePlan} className="mt-6 flex flex-wrap gap-2 text-xs">
            <input
              name="weddingDate"
              type="date"
              defaultValue={couple.weddingDate?.toISOString().slice(0, 10)}
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-white placeholder-white/60 backdrop-blur"
            />
            <input
              name="partnerNames"
              defaultValue={Array.isArray(couple.partnerNames)
                ? (couple.partnerNames as string[]).join(" & ")
                : ""}
              placeholder="Jane & John"
              className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-white placeholder-white/60 backdrop-blur"
            />
            <input
              name="budgetTotal"
              type="number"
              min={0}
              defaultValue={budget || ""}
              placeholder="Budget R"
              className="w-32 rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-white placeholder-white/60 backdrop-blur"
            />
            <button className="rounded-full bg-white px-4 py-1.5 font-medium text-pink-700 hover:bg-pink-50">
              Save
            </button>
          </form>
        </div>
      </section>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Guests invited"
          value={String(guestCount)}
          sub={`${attending} attending`}
        />
        <Stat
          label="Budget estimated"
          value={`R ${estimated.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}
          sub={budget ? `of R ${budget.toLocaleString("en-ZA")}` : "set a budget"}
        />
        <Stat label="Checklist" value={`${pct}%`} sub={`${doneCount}/${taskAgg._count._all} done`} />
        <Stat
          label="Vendors"
          value="0"
          sub="request quotes below"
        />
      </div>

      {/* CHECKLIST PREVIEW */}
      <h2 className="mb-3 mt-10 font-serif text-xl font-semibold">
        Up next
      </h2>
      <div className="mb-10 space-y-2">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href="/checklist"
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 transition hover:border-pink-300"
          >
            <span className="text-sm">{t.title}</span>
            <span className="text-xs text-neutral-400">
              {t.monthsOut} months out →
            </span>
          </Link>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-neutral-500">All done — enjoy the wedding!</p>
        )}
      </div>

      {/* VENDORS */}
      <h2 className="mb-3 font-serif text-xl font-semibold">Find vendors</h2>
      <AiAssistant />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/quotes/${encodeURIComponent(cat)}`}
            className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm transition hover:border-pink-400 hover:bg-pink-50"
          >
            <span className="font-medium group-hover:text-pink-700">{cat}</span>
            <span className="text-pink-600 opacity-0 transition group-hover:opacity-100">
              →
            </span>
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
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="font-serif text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}
