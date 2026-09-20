import { getCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATS = [
  "Venues",
  "Catering & Bar",
  "Photography & Video",
  "Flowers & Decor",
  "Dresses & Suits",
  "Hair & Makeup",
  "Other",
];

const COLORS = ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#e879a0", "#d65d92", "#e5e7eb"];

export default async function BudgetPage() {
  const couple = await getCouple();
  const items = await prisma.budgetItem.findMany({
    where: { coupleId: couple.id },
    orderBy: { id: "asc" },
  });

  async function addItem(formData: FormData) {
    "use server";
    const { getCouple } = await import("@/lib/couple");
    const { prisma } = await import("@/lib/prisma");
    const c = await getCouple();
    const category = String(formData.get("category") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    const estimated = Number(formData.get("estimated") ?? 0);
    if (!description || !CATS.includes(category) || !(estimated >= 0)) return;
    await prisma.budgetItem.create({
      data: {
        coupleId: c.id,
        category,
        description,
        estimatedCents: Math.round(estimated * 100),
      },
    });
    const { redirect } = await import("next/navigation");
    redirect("/budget");
  }

  async function setActual(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    const id = String(formData.get("id"));
    const actual = Number(formData.get("actual") ?? 0);
    const paid = formData.get("paid") === "on";
    await prisma.budgetItem.updateMany({
      where: { id, coupleId: c.id },
      data: { actualCents: Math.round(actual * 100), paid },
    });
    const { redirect } = await import("next/navigation");
    redirect("/budget");
  }

  const totalEstimated = items.reduce((a, i) => a + i.estimatedCents, 0) / 100;
  const totalActual = items.reduce((a, i) => a + i.actualCents, 0) / 100;
  const totalPaid =
    items.filter((i) => i.paid).reduce((a, i) => a + i.actualCents, 0) / 100;
  const byCat = CATS.map((cat, idx) => ({
    cat,
    color: COLORS[idx],
    sum: items.filter((i) => i.category === cat).reduce((a, i) => a + i.estimatedCents, 0) / 100,
  })).filter((c) => c.sum > 0);
  const totalForChart = byCat.reduce((a, c) => a + c.sum, 0);
  let acc = 0;
  const segments = byCat.map((c) => {
    const start = (acc / (totalForChart || 1)) * 360;
    acc += c.sum;
    const end = (acc / (totalForChart || 1)) * 360;
    return { ...c, start, end };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Wedding budget</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="text-xs uppercase text-neutral-500">Estimated</p>
          <p className="font-serif text-2xl font-bold">
            R {totalEstimated.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="text-xs uppercase text-neutral-500">Actual</p>
          <p className="font-serif text-2xl font-bold">
            R {totalActual.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="text-xs uppercase text-neutral-500">Paid</p>
          <p className="font-serif text-2xl font-bold text-pink-700">
            R {totalPaid.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
            {segments.map((s) => (
              <circle
                key={s.cat}
                cx="50" cy="50" r="35" fill="none"
                stroke={s.color} strokeWidth="20"
                strokeDasharray={`${(s.end - s.start) / 360 * 2 * Math.PI * 35} ${2 * Math.PI * 35}`}
                strokeDashoffset={-s.start / 360 * 2 * Math.PI * 35}
              />
            ))}
          </svg>
          <div className="space-y-1 text-sm">
            {segments.map((s) => (
              <p key={s.cat} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: s.color }} />
                {s.cat} — R {s.sum.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
              </p>
            ))}
          </div>
        </div>
      )}

      <form
        action={addItem}
        className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm"
      >
        <select name="category" className="rounded-lg border border-neutral-300 px-3 py-2">
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="description" required placeholder="Expense" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2" />
        <input name="estimated" type="number" min={0} step="0.01" required placeholder="Est. R" className="w-28 rounded-lg border border-neutral-300 px-3 py-2" />
        <button className="rounded-full bg-pink-600 px-4 py-2 font-medium text-white hover:bg-pink-700">
          Add
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map((i) => (
          <form
            key={i.id}
            action={setActual}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium">{i.description}</span>{" "}
              <span className="text-xs text-neutral-500">{i.category}</span>
            </span>
            <span className="flex items-center gap-2">
              est R {(i.estimatedCents / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
              <input
                name="actual"
                type="number"
                min={0}
                step="0.01"
                defaultValue={i.actualCents / 100}
                className="w-24 rounded-lg border border-neutral-300 px-2 py-1"
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="paid" defaultChecked={i.paid} /> paid
              </label>
              <button className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">
                Save
              </button>
            </span>
          </form>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-neutral-500">
            No expenses yet — add your first budget line above.
          </p>
        )}
      </div>
    </div>
  );
}
