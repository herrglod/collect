import Link from 'next/link';

export default function AdminNav({
  active,
}: {
  active: 'assign' | 'available' | 'requests' | 'news' | 'events' | 'artworks' | 'inquiries' | 'accounts';
}) {
  return (
    <nav className="admin-subnav">
      <Link href="/admin" className={active === 'assign' ? 'active' : ''}>
        Assignments
      </Link>
      <Link href="/admin/available" className={active === 'available' ? 'active' : ''}>
        Available
      </Link>
      <Link href="/admin/requests" className={active === 'requests' ? 'active' : ''}>
        Connect Art Requests
      </Link>
      <Link href="/admin/inquiries" className={active === 'inquiries' ? 'active' : ''}>
        Purchase Inquiries
      </Link>
      <Link href="/admin/news" className={active === 'news' ? 'active' : ''}>
        News
      </Link>
      <Link href="/admin/events" className={active === 'events' ? 'active' : ''}>
        Events
      </Link>
      <Link href="/admin/artworks" className={active === 'artworks' ? 'active' : ''}>
        Artworks
      </Link>
      <Link href="/admin/accounts" className={active === 'accounts' ? 'active' : ''}>
        Access
      </Link>
    </nav>
  );
}
