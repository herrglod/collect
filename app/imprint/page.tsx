import Link from 'next/link';

export default function ImprintPage() {
  return (
    <div className="page">
      <header className="masthead">
        <Link href="/" className="brand">
          GLOD <span>Collection</span>
        </Link>
      </header>

      <div className="eyebrow">Legal</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Imprint
      </h1>

      <div style={{ maxWidth: 560, fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}>
        <p>
          <strong>Marcin Glod</strong>
          <br />
          [Street Address]
          <br />
          [Postal Code, City, Country]
        </p>
        <p>
          Email: [contact@example.com]
          <br />
          Phone: [+00 000 000 0000]
        </p>
        <p>
          Responsible for content: Marcin Glod
          <br />
          VAT ID / Registration: [insert if applicable]
        </p>
        <p style={{ color: 'var(--ink-soft)', fontSize: 12, marginTop: 32 }}>
          Placeholder — please replace the bracketed fields above with your actual legal details.
        </p>
      </div>
    </div>
  );
}
