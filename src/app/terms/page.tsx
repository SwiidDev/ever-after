import { BRAND } from "@/lib/brand";

export const metadata = { title: `Terms — ${BRAND.name}` };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="mb-4 font-serif text-3xl font-bold">Terms of Service</h1>
      <h2 className="mt-6 font-semibold">1. The service</h2>
      <p className="mt-2 text-neutral-600">
        {BRAND.name} provides free wedding-planning tools to couples and
        connects them with wedding vendors. Couples use the platform free of
        charge. Vendors purchase introductions (leads) with prepaid credits.
      </p>
      <h2 className="mt-6 font-semibold">2. Credits and leads</h2>
      <p className="mt-2 text-neutral-600">
        Credits are purchased per vendor account, are non-transferable, and
        expire 12 months after purchase unless stated otherwise. A lead is an
        introduction to a couple who requested quotes; we do not guarantee
        bookings. Where a lead is materially defective (out of area, invalid
        contact details), vendors may request a credit reversal within 48 hours
        of unlocking.
      </p>
      <h2 className="mt-6 font-semibold">3. Vendor conduct</h2>
      <p className="mt-2 text-neutral-600">
        Listings must be accurate. Vendors must respond timeously and may not
        resell couple contact details. We may suspend listings that breach
        these terms.
      </p>
      <h2 className="mt-6 font-semibold">4. Reviews</h2>
      <p className="mt-2 text-neutral-600">
        Reviews may only be left by couples who engaged a vendor through the
        platform and must reflect genuine experience.
      </p>
      <h2 className="mt-6 font-semibold">5. Liability</h2>
      <p className="mt-2 text-neutral-600">
        {BRAND.name} facilitates introductions and is not a party to contracts
        between couples and vendors. Contact {BRAND.email} for questions.
      </p>
    </div>
  );
}
