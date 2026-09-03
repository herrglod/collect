import Link from 'next/link';

export default function AdminNav({
  active,
}: {
  active: 'assign' | 'requests' | 'news' | 'artworks' | 'inquiries';
}) {
  return (
    <nav className="admin-subnav">
      <Link href="/admin" className={active === 'assign' ? 'active' : ''}>
        Zuordnungen
      </Link>
      <Link href="/admin/requests" className={active === 'requests' ? 'active' : ''}>
        Connect-Art-Anfragen
      </Link>
      <Link href="/admin/inquiries" className={active === 'inquiries' ? 'active' : ''}>
        Kaufanfragen
      </Link>
      <Link href="/admin/news" className={active === 'news' ? 'active' : ''}>
        News
      </Link>
      <Link href="/admin/artworks" className={active === 'artworks' ? 'active' : ''}>
        Kunstwerke
      </Link>
    </nav>
  );
}
