import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';

type NewsPost = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
};

export default async function NewsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const posts = await query<NewsPost>(
    `SELECT id, content, image_url, created_at FROM public.news_posts ORDER BY created_at DESC`
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <div className="brand">
            GLOD <span>Collection</span>
          </div>
          <nav className="primary-nav">
            <Link href="/collector">My Collection</Link>
            <Link href="/collector/news">News</Link>
            <Link href="/collector/exclusive">Exclusive</Link>
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <div className="eyebrow">News</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Latest from GLOD
      </h1>
      <p className="subtitle">Updates, studio news, and announcements.</p>

      {posts.length === 0 ? (
        <div className="empty-state">No news yet — check back soon.</div>
      ) : (
        <div className="news-feed">
          {posts.map((p) => (
            <div className="news-card" key={p.id}>
              {p.image_url && <img className="news-image" src={p.image_url} alt="" />}
              <div className="news-body">
                <div className="news-date">
                  {new Date(p.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="news-content">{p.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
