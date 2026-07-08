export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6 text-sm text-foreground">
      <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="text-xs text-muted">Last updated: 8 July 2026</p>

      <p>
        This policy explains what personal information BondProof collects,
        why, and what rights you have over it, consistent with the
        Australian Privacy Principles under the Privacy Act 1988 (Cth).
      </p>

      <h2 className="text-lg font-semibold text-foreground">1. What we collect</h2>
      <ul className="list-disc pl-5">
        <li>Account details: name, email address.</li>
        <li>
          Tenancy details: property address, lease dates, agent/landlord name
          and email, bond amount, RBO number.
        </li>
        <li>
          Photos you take of the property, including embedded EXIF metadata
          (timestamp, GPS location if your device records it) — this is kept
          intact deliberately, as timestamped photos are your evidence.
        </li>
        <li>Condition ratings and notes you enter during capture.</li>
        <li>Claimed deduction amounts and descriptions you enter during a dispute.</li>
        <li>Payment information for the Dispute Kit, processed by Stripe — we don&apos;t store your card details ourselves.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground">2. Why we collect it</h2>
      <p>
        Solely to provide the service: generating your entry/exit condition
        reports, comparison views, evidence packs, response letters, and
        pre-filled NCAT forms, and to process your Dispute Kit payment.
      </p>

      <h2 className="text-lg font-semibold text-foreground">3. Where it&apos;s stored</h2>
      <p>
        Data is stored with Supabase (Postgres database and file storage).
        Photos and generated documents are kept in a private storage bucket
        — never public — and are only ever accessed by you, or by our
        servers acting on your behalf to generate a document you requested.
      </p>

      <h2 className="text-lg font-semibold text-foreground">4. Third parties</h2>
      <p>We share the minimum necessary data with:</p>
      <ul className="list-disc pl-5">
        <li>Supabase — database, authentication, and file storage.</li>
        <li>Anthropic — evidence summaries and claim details are sent to generate a draft response letter. We instruct the model to use only the evidence you&apos;ve provided.</li>
        <li>Resend — your email address, to send deadline reminders and magic-link sign-in emails.</li>
        <li>Stripe — payment details for the Dispute Kit purchase.</li>
      </ul>
      <p>We do not sell your data to anyone.</p>

      <h2 className="text-lg font-semibold text-foreground">5. Retention</h2>
      <p>
        We keep your data for as long as your account is active, plus a
        reasonable period afterwards in case you return or need to lodge a
        dispute. You can request deletion at any time (see below).
      </p>

      <h2 className="text-lg font-semibold text-foreground">6. Your rights</h2>
      <p>
        You can request a copy of your data (export) or deletion of your
        account and all associated photos and documents at any time by
        emailing us. We&apos;ll action deletion requests within a reasonable
        timeframe, except where we&apos;re required to retain records by law.
      </p>

      <h2 className="text-lg font-semibold text-foreground">7. Security</h2>
      <p>
        Photos are stored in a private bucket with row-level access control —
        only you can access your own tenancy&apos;s data. Every photo is
        hashed (SHA-256) at upload for tamper-evidence.
      </p>

      <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
      <p>
        Questions about this policy or a data request? Contact us at the
        support email shown in the app.
      </p>

      <p className="mt-4 text-xs text-muted">
        This is a draft template and has not been reviewed by a solicitor.
        Have it reviewed before relying on it commercially.
      </p>
    </main>
  )
}
