import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../lib/auth-server';
import UserMenu from '../components/UserMenu';
import CollectorNav from '../components/CollectorNav';

export default async function CollectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/collector" className="brand">
            GLOD <span>Collection</span>
          </Link>
          <CollectorNav />
        </div>
        <UserMenu name={displayName} />
      </header>

      {children}
    </div>
  );
}
