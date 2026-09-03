import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          GLOD <span>Archive</span>
        </div>
      </header>
      <div className="eyebrow">Collector Platform</div>
      <h1 className="title">Private Sammler- &amp; Admin-Plattform</h1>
      <p className="subtitle">
        Zugang nur für eingeladene Sammler:innen, Partner und das GLOD-Team.
      </p>
      <Link href="/login" className="btn">
        Zum Login
      </Link>
    </div>
  );
}
