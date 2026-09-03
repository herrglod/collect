import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';

type NewsPost = {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  posted_at: string;
};

export default async function NewsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const posts = await query<NewsPost>(
    `SELECT id, title, content, image_url, posted_at FROM public.news_posts ORDER BY posted_at DESC, id DESC`
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/collector" className="brand">
            GLOD <span>Collection</span>
          </Link>
          <nav className="primary-nav">
            <Link href="/collector">My Artworks</Link>
            <Link href="/collector/news">News</Link>
            <Link href="/collector/exclusive">Exclusive</Link>
            <Link href="/collector/events">Events</Link>
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

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
                  {new Date(p.posted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {p.title && (
                  <h3 className="card-title" style={{ marginBottom: 8 }}>
                    {p.title}
                  </h3>
                )}
                <div className="news-content">{p.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
