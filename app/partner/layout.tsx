import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../lib/auth-server';
import UserMenu from '../components/UserMenu';
import PartnerNav from '../components/PartnerNav';

const PARTNER_MENU_LINKS = [{ href: '/partner/requests', label: 'My Requests' }];

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'gallery_partner' && session.role !== 'admin') redirect('/collector');
  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/partner" className="brand">
            GLOD <span>Collection</span>
          </Link>
          <PartnerNav />
        </div>
        <UserMenu name={displayName} links={PARTNER_MENU_LINKS} />
      </header>

      {children}
    </div>
  );
}
