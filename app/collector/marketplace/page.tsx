import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';

export default async function MarketplacePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <>
      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Marketplace</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Coming Soon
      </h1>
      <p className="subtitle" style={{ maxWidth: 560 }}>
        The GLOD Marketplace is currently in development. Once live, it will let you buy artworks
        directly from other collectors in the community — and offer your own pieces for sale to
        fellow GLOD collectors.
      </p>

      <div className="empty-state">We'll let you know as soon as it's ready.</div>
    </>
  );
}
