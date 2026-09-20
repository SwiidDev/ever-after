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
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-1 font-serif text-2xl font-bold"
            >
              {BRAND.name.replace(" ", "")}
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-pink-600 align-middle" />
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/dashboard" className="hover:text-pink-600">
                My Wedding
              </Link>
              <Link href="/search" className="hover:text-pink-600">
                Search
              </Link>
              <Link
                href="/pricing"
                className="hover:text-pink-600"
              >
                For Vendors
              </Link>
              <Link href="/about" className="hover:text-pink-600">
                About
              </Link>
              <Link href="/vendor/register" className="hover:text-pink-600">
                List business
              </Link>
              {session?.role === "ADMIN" && (
                <Link href="/admin" className="rounded-full bg-pink-600 px-4 py-1.5 font-medium text-white hover:bg-pink-700">
                  Admin
                </Link>
              )}
              {session ? (
                <SignOutButton />
              ) : (
                <Link href="/login" className="text-neutral-500 hover:text-pink-600">
                  Sign in
                </Link>
              )}
              <Link href="/privacy" className="hidden text-neutral-400 hover:text-pink-600 sm:inline">
                Privacy
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                href="/"
                className="flex items-center gap-1 font-serif text-xl font-bold"
              >
                {BRAND.name.replace(" ", "")}
                <span className="inline-block h-2 w-2 rounded-full bg-pink-600 align-middle" />
              </Link>
              <p className="mt-3 text-sm text-neutral-600">{BRAND.tagline}.</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                For Couples
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/search" className="hover:text-pink-600">
                    Find vendors
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-pink-600">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-pink-600">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                For Vendors
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/vendor/register" className="hover:text-pink-600">
                    Free listing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-pink-600">
                    Credit pricing
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/login" className="hover:text-pink-600">
                    Vendor sign-in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Company
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-pink-600">
                    Privacy (POPIA)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-pink-600">
                    Terms
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="hover:text-pink-600"
                  >
                    {BRAND.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} {BRAND.name}. Built with care in
            South Africa.
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
