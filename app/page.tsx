import Link from 'next/link';

const ACCESS_MAILTO =
  'mailto:atelier@glod.art?subject=' +
  encodeURIComponent('Access request – GLOD Collection') +
  '&body=' +
  encodeURIComponent(
    'Hello GLOD team,\n\n' +
      'I would like to get access to the GLOD Collection portal.\n\n' +
      'Name:\n' +
      'I am a: collector / gallery partner (please keep one)\n' +
      'Artwork(s) I own (title or archive number, e.g. A25042):\n' +
      'Gallery name (partners only):\n\n' +
      'Thank you!'
  );

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
        <a href={ACCESS_MAILTO} style={{ color: 'inherit', textDecoration: 'underline' }}>
          atelier@glod.art
        </a>{' '}
        and we will check and set you up.
      </p>
    </div>
  );
}
