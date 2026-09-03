import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        marginTop: 80,
        padding: '24px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 11,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--ink-soft)',
        }}
      >
        <span>© {year} Marcin Glod. All rights reserved.</span>
        <Link href="/imprint" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>
          Imprint
        </Link>
      </div>
    </footer>
  );
}
