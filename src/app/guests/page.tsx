import { getCouple } from "@/lib/couple";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EVENTS = [
  { key: "WEDDING", label: "Wedding" },
  { key: "BRIDAL_SHOWER", label: "Bridal Shower" },
  { key: "BACHELORS", label: "Bachelors" },
] as const;

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const couple = await getCouple();
  const { event: eventParam } = await searchParams;
  const event = (EVENTS.find((e) => e.key === eventParam)?.key ??
    "WEDDING") as (typeof EVENTS)[number]["key"];

  const guests = await prisma.guest.findMany({
    where: { coupleId: couple.id, event },
    orderBy: { createdAt: "asc" },
  });

  async function addGuest(formData: FormData) {
    "use server";
    const { getCouple } = await import("@/lib/couple");
    const { prisma } = await import("@/lib/prisma");
    const c = await getCouple();
    const name = String(formData.get("name") ?? "").trim();
    const event = String(formData.get("event") ?? "WEDDING");
    const needsRoom = formData.get("needsRoom") === "on";
    if (!name || !["WEDDING", "BRIDAL_SHOWER", "BACHELORS"].includes(event))
      return;
    await prisma.guest.create({
      data: { coupleId: c.id, name, event: event as "WEDDING", needsRoom },
    });
    const { redirect } = await import("next/navigation");
    redirect(`/guests?event=${event}`);
  }

  async function setRsvp(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    const id = String(formData.get("id"));
    const rsvp = String(formData.get("rsvp"));
    if (!["PENDING", "ATTENDING", "DECLINED"].includes(rsvp)) return;
    await prisma.guest.updateMany({
      where: { id, coupleId: c.id },
      data: { rsvp: rsvp as "ATTENDING" | "DECLINED" | "PENDING" },
    });
    const { redirect } = await import("next/navigation");
    redirect(`/guests?event=${String(formData.get("event"))}`);
  }

  async function removeGuest(formData: FormData) {
    "use server";
    const { prisma } = await import("@/lib/prisma");
    const { getCouple } = await import("@/lib/couple");
    const c = await getCouple();
    await prisma.guest.deleteMany({
      where: { id: String(formData.get("id")), coupleId: c.id },
    });
    const { redirect } = await import("next/navigation");
    redirect(`/guests?event=${String(formData.get("event"))}`);
  }

  const attending = guests.filter((g) => g.rsvp === "ATTENDING").length;
  const declined = guests.filter((g) => g.rsvp === "DECLINED").length;
  const rooms = guests.filter((g) => g.needsRoom).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Guest list</h1>

      <div className="mt-4 flex gap-2 text-sm">
        {EVENTS.map((e) => (
          <a
            key={e.key}
            href={`/guests?event=${e.key}`}
            className={`rounded-full px-4 py-1.5 ${
              event === e.key
                ? "bg-pink-600 text-white"
                : "border border-neutral-300 hover:border-pink-400"
            }`}
          >
            {e.label}
          </a>
        ))}
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        {guests.length} invited · {attending} attending · {declined} declined ·{" "}
        {rooms} need accommodation
      </p>

      <form
        action={addGuest}
        className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm"
      >
        <input type="hidden" name="event" value={event} />
        <input
          name="name"
          required
          placeholder="Guest name"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox" name="needsRoom" /> needs room
        </label>
        <button className="rounded-full bg-pink-600 px-4 py-2 font-medium text-white hover:bg-pink-700">
          Add guest
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {guests.map((g) => (
          <div
            key={g.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            <span className="font-medium">
              {g.name}
              {g.needsRoom && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                  room
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {(["ATTENDING", "DECLINED", "PENDING"] as const).map((r) => (
                <form action={setRsvp} key={r}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="rsvp" value={r} />
                  <input type="hidden" name="event" value={event} />
                  <button
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      g.rsvp === r
                        ? r === "ATTENDING"
                          ? "bg-green-600 text-white"
                          : r === "DECLINED"
                            ? "bg-red-500 text-white"
                            : "bg-neutral-400 text-white"
                        : "border border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {r === "ATTENDING" ? "Yes" : r === "DECLINED" ? "No" : "?"}
                  </button>
                </form>
              ))}
              <form action={removeGuest}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="event" value={event} />
                <button className="ml-1 px-1 text-xs text-red-400 hover:text-red-600">
                  ✕
                </button>
              </form>
            </div>
          </div>
        ))}
        {guests.length === 0 && (
          <p className="text-sm text-neutral-500">No guests added yet.</p>
        )}
      </div>
    </div>
  );
}
