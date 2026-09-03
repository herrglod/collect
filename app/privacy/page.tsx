import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="page">
      <header className="masthead">
        <Link href="/" className="brand">
          GLOD <span>Collection</span>
        </Link>
      </header>

      <div className="eyebrow">Legal</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Privacy Policy
      </h1>

      <div style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Last updated: [date]</p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>1. Controller</h3>
        <p>
          The party responsible for data processing on this platform ("we", "us") is:
          <br />
          <strong>Marcin Glod</strong>
          <br />
          [Street Address]
          <br />
          [Postal Code, City, Country]
          <br />
          Email: [contact@example.com]
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>2. What data we collect</h3>
        <p>
          When you use the GLOD Collection platform as an invited collector, we process: your name, email
          address, phone number, and Instagram handle (if provided); shipping-related details (city,
          country) if you submit a purchase inquiry; the artworks associated with your account; the content
          of any request you submit (e.g. Connect Art requests, purchase inquiries); and your notification
          preferences.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>3. Purpose and legal basis</h3>
        <p>
          We process this data to give you access to your collection, to handle requests linking artworks
          to your account, and to process purchase inquiries for exclusive works. If you opt in, we also use
          your email address to notify you about new artist news. The legal basis is the performance of our
          collector relationship with you (Art. 6(1)(b) GDPR) and, for optional news emails, your consent
          (Art. 6(1)(a) GDPR), which you can withdraw at any time in your account settings.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>4. Hosting and third-party processors</h3>
        <p>
          This platform is hosted on Vercel Inc., with its database hosted by Neon Inc. Both act as data
          processors on our behalf. If you opt into news email notifications, emails are sent via Resend, an
          email delivery service. We do not sell your data or share it with third parties for marketing
          purposes.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>5. Cookies</h3>
        <p>
          We use a single, strictly necessary session cookie to keep you signed in. It does not track you
          across other websites and is not used for advertising.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>6. Data retention</h3>
        <p>
          We retain your account and collection data for as long as your collector relationship with us is
          active, or as required to meet legal and archival obligations. You may request deletion at any
          time, subject to our legitimate need to keep provenance records for the artworks you own.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>7. Your rights</h3>
        <p>
          Under GDPR, you have the right to access, correct, or delete your personal data, to restrict or
          object to processing, and to data portability. To exercise any of these rights, contact us at
          [contact@example.com]. You also have the right to lodge a complaint with your local data
          protection authority.
        </p>

        <p style={{ color: 'var(--ink-soft)', fontSize: 12, marginTop: 32 }}>
          Placeholder — please review this draft with a legal advisor and replace the bracketed fields with
          your actual details before publishing.
        </p>
      </div>
    </div>
  );
}
