import Link from "next/link";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { getSession } from "@/lib/session";
import SignOutButton from "@/app/components/sign-out";
import CookieBanner from "@/app/components/cookie-banner";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="font-serif text-2xl tracking-[0.18em] text-[var(--gold)]"
            >
              {BRAND.name.toUpperCase()}
            </Link>
            <nav className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-neutral-300 md:flex">
              <Link href="/" className="gold-underline pb-1 text-[var(--gold)]">
                Home
              </Link>
              <Link href="/search" className="hover:text-[var(--gold)]">
                Vendors
              </Link>
              <Link href="/pricing" className="hover:text-[var(--gold)]">
                Pricing
              </Link>
              <Link href="/about" className="hover:text-[var(--gold)]">
                About
              </Link>
              <Link href="/vendor/register" className="hover:text-[var(--gold)]">
                Join as vendor
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {session?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-full border border-[var(--gold)] px-4 py-1.5 text-[11px] uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black"
                >
                  Admin
                </Link>
              )}
              {session ? (
                <SignOutButton />
              ) : (
                <Link
                  href="/login"
                  className="text-[11px] uppercase tracking-[0.22em] text-neutral-300 hover:text-[var(--gold)]"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/search"
                className="rounded-full bg-[var(--gold)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black hover:bg-[var(--gold-soft)]"
              >
                Get quotes
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 bg-black">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                href="/"
                className="font-serif text-xl tracking-[0.18em] text-[var(--gold)]"
              >
                {BRAND.name.toUpperCase()}
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                {BRAND.tagline}.
              </p>
              <div className="mt-5 flex gap-3">
                {["Instagram", "Facebook", "Pinterest", "YouTube"].map((s) => (
                  <span
                    key={s}
                    title={s}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-neutral-400 hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    {s[0]}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="eyebrow">For Couples</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li>
                  <Link href="/search" className="hover:text-[var(--gold)]">
                    Find vendors
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[var(--gold)]">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[var(--gold)]">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[var(--gold)]">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="eyebrow">For Vendors</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li>
                  <Link href="/vendor/register" className="hover:text-[var(--gold)]">
                    Free listing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[var(--gold)]">
                    Credit pricing
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/login" className="hover:text-[var(--gold)]">
                    Vendor sign-in
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--gold)]">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="eyebrow">Contact</h3>
              <p className="mt-4 text-sm text-neutral-300">Pretoria, South Africa</p>
              <a
                href={`mailto:${BRAND.email}`}
                className="mt-1 block text-sm text-[var(--gold)] hover:text-[var(--gold-soft)]"
              >
                {BRAND.email}
              </a>
            </div>
          </div>
          <div className="border-t border-white/5 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            © {new Date().getFullYear()} {BRAND.name} · Built with care in
            South Africa
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
