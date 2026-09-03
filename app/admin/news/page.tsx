import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import NewsComposer from '../../components/NewsComposer';
import NewsPostRow from '../../components/NewsPostRow';

type NewsPost = {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  posted_at: string;
};

export default async function AdminNewsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const posts = await query<NewsPost>(
    `SELECT id, title, content, image_url, posted_at FROM public.news_posts ORDER BY posted_at DESC, id DESC`
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/admin" className="brand">
            GLOD <span>Collection</span>
          </Link>
        </div>
        <UserMenu name={displayName} />
      </header>

      <AdminNav active="news" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">News verfassen</h1>
      <p className="subtitle">Beiträge erscheinen im News-Feed der Sammler, sortiert nach Beitragsdatum.</p>

      <NewsComposer />

      <h2 className="section-title">Veröffentlichte Beiträge</h2>
      {posts.length === 0 ? (
        <div className="empty-state">Noch keine Beiträge.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((p) => (
            <NewsPostRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
