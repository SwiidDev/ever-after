import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * M2 dev auth: sign in by choosing your vendor (email match).
 * Replaced by Auth.js in M3.
 */
export default async function VendorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const em = String(formData.get("email") ?? "").trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: em },
      include: { vendor: true },
    });
    if (!user?.vendor) return;
    const jar = await cookies();
    jar.set("weddo_vendor", user.vendor.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    const { setSession } = await import("@/lib/session");
    await setSession({
      uid: user.id,
      email: user.email,
      role: "VENDOR",
      vendorId: user.vendor.id,
    });
    const { redirect } = await import("next/navigation");
    redirect("/vendor/leads");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 font-serif text-2xl font-bold">Vendor sign in</h1>
      <p className="mb-6 text-xs text-neutral-500">
        Dev note: seeded vendor emails look like{" "}
        <code>rustic-rock-venue@vendors.weddo.local</code>
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
