import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getSession } from "@/lib/session";
import SignOutButton from "@/app/components/sign-out";

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
              <Link href="/vendor/register" className="hover:text-pink-600">
                Free Business Listing
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
        <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline} ·{" "}
          <Link href="/privacy" className="hover:text-pink-600">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-pink-600">
            Terms
          </Link>
        </footer>
      </body>
    </html>
  );
}
