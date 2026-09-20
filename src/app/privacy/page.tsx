import { BRAND } from "@/lib/brand";

export const metadata = { title: `Privacy (POPIA) — ${BRAND.name}` };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="mb-4 font-serif text-3xl font-bold">
        Privacy Notice (POPIA)
      </h1>
      <p className="text-neutral-600">
        {BRAND.name} processes personal information under South Africa&apos;s
        Protection of Personal Information Act, 2013. This notice explains what
        we collect and why.
      </p>
      <h2 className="mt-6 font-semibold">What we collect</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <strong>Couples:</strong> email, wedding details (date, region,
          budget band, guest count), guest-list entries you add, budget and
          checklist data.
        </li>
        <li>
          <strong>Vendors:</strong> business details, service categories and
          coverage areas, credit-purchase records.
        </li>
        <li>
          <strong>Lead sharing:</strong> when you request quotes, your contact
          details are shared with up to 5 matching wedding professionals
          (explicit consent requested at submission). Vendors only see your
          details after paying for the introduction.
        </li>
      </ul>
      <h2 className="mt-6 font-semibold">Your rights</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Access and export your data at any time (from your dashboard).</li>
        <li>
          Request deletion of your account — we purge personal data within 30
          days; financial ledger records are retained in pseudonymised form as
          required by law.
        </li>
        <li>Object to processing or withdraw consent by contacting{" "}
          {BRAND.email}.</li>
      </ul>
      <h2 className="mt-6 font-semibold">Contact</h2>
      <p className="mt-2 text-neutral-600">
        Information Officer: {BRAND.email}
      </p>
    </div>
  );
}
