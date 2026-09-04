import Link from 'next/link';
import { queryOne } from '../../lib/db';

type ActiveKey =
  | 'assign'
  | 'available'
  | 'artworks'
  | 'warehouses'
  | 'events'
  | 'requests'
  | 'inquiries'
  | 'news'
  | 'accounts';

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="nav-badge">{count > 99 ? '99+' : count}</span>;
}

export default async function AdminNav({ active }: { active: ActiveKey }) {
  const counts = await queryOne<{ pending_requests: number; pending_inquiries: number }>(
    `SELECT
       (SELECT count(*)::int FROM public.connect_requests WHERE status = 'pending') AS pending_requests,
       (SELECT count(*)::int FROM public.purchase_inquiries WHERE status = 'pending') AS pending_inquiries`
  );
  const pendingRequests = counts?.pending_requests ?? 0;
  const pendingInquiries = counts?.pending_inquiries ?? 0;
  const pendingTotal = pendingRequests + pendingInquiries;

  const artworksActive = active === 'available' || active === 'artworks' || active === 'warehouses';
  const requestActive = active === 'requests' || active === 'inquiries';

  return (
    <nav className="admin-subnav">
      <Link href="/admin" className={active === 'assign' ? 'active' : ''}>
        Manage
      </Link>

      <div className={`admin-subnav-item${artworksActive ? ' active' : ''}`} tabIndex={0}>
        <span>Artworks</span>
        <div className="admin-subnav-dropdown">
          <Link href="/admin/available" className={active === 'available' ? 'active' : ''}>
            Available
          </Link>
          <Link href="/admin/artworks" className={active === 'artworks' ? 'active' : ''}>
            For Sale
          </Link>
          <Link href="/admin/warehouses" className={active === 'warehouses' ? 'active' : ''}>
            Warehouse
          </Link>
        </div>
      </div>

      <Link href="/admin/events" className={active === 'events' ? 'active' : ''}>
        Events
      </Link>

      <div className={`admin-subnav-item${requestActive ? ' active' : ''}`} tabIndex={0}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Request
          <Badge count={pendingTotal} />
        </span>
        <div className="admin-subnav-dropdown">
          <Link href="/admin/requests" className={active === 'requests' ? 'active' : ''}>
            Connect Art
            <Badge count={pendingRequests} />
          </Link>
          <Link href="/admin/inquiries" className={active === 'inquiries' ? 'active' : ''}>
            Purchase
            <Badge count={pendingInquiries} />
          </Link>
        </div>
      </div>

      <Link href="/admin/news" className={active === 'news' ? 'active' : ''}>
        News
      </Link>
      <Link href="/admin/accounts" className={active === 'accounts' ? 'active' : ''}>
        Access
      </Link>
    </nav>
  );
}
