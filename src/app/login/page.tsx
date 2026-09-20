import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** M3 dev auth: email sign-in creating a couple account on first use. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const em = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!em) return;
    const user = await prisma.user.upsert({
      where: { email: em },
      update: {},
      create: { email: em, role: "COUPLE" },
    });
    let couple = await prisma.couple.findUnique({ where: { userId: user.id } });
    if (!couple) {
      couple = await prisma.couple.create({ data: { userId: user.id } });
    }
    const coupleId = couple.id;
    const existingTasks = await prisma.checklistItem.count({
      where: { coupleId },
    });
    if (existingTasks === 0) {
      const { CHECKLIST_TEMPLATE } = await import("@/lib/couple");
      await prisma.checklistItem.createMany({
        data: CHECKLIST_TEMPLATE.map(([monthsOut, title]) => ({
          coupleId,
          monthsOut,
          title,
        })),
      });
    }
    const jar = await cookies();
    jar.set("weddo_couple", couple.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    const { setSession } = await import("@/lib/session");
    await setSession({
      uid: user.id,
      email: user.email,
      role: user.role,
      coupleId: couple.id,
    });
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 font-serif text-2xl font-bold">Sign in</h1>
      <p className="mb-6 text-sm text-neutral-500">
        New here? Just use your email — we create your wedding plan
        automatically.
      </p>
      <form action={signIn} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          placeholder="Email"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
