import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          GLOD <span>Collection</span>
        </div>
      </header>
      <div className="eyebrow">Collector Platform</div>
      <h1 className="title">Private Collectors &amp; Art Galleries</h1>
      <p className="subtitle">
        Access is reserved for invited collectors, partners, and the GLOD team.
      </p>
      <Link href="/login" className="btn">
        Go to Login
      </Link>
      <p className="subtitle" style={{ marginTop: 28, maxWidth: 520, fontSize: 14 }}>
        Own a GLOD artwork or work with us as a gallery partner, but don&apos;t have access yet? Write to us at{' '}
        <a href="mailto:atelier@glod.art" style={{ color: 'inherit', textDecoration: 'underline' }}>
          atelier@glod.art
        </a>{' '}
        and we will check and set you up.
      </p>
    </div>
  );
}
