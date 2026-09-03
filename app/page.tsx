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
      <h1 className="title">Private Collector &amp; Admin Platform</h1>
      <p className="subtitle">
        Access is reserved for invited collectors, partners, and the GLOD team.
      </p>
      <Link href="/login" className="btn">
        Go to Login
      </Link>
    </div>
  );
}
