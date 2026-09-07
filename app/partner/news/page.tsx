import { redirect } from 'next/navigation';
import { getServerSession } from '../../../lib/auth-server';
import { query } from '../../../lib/db';

type NewsPost = {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  posted_at: string;
  category: string | null;
  source_url: string | null;
};

export default async function PartnerNewsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const posts = await query<NewsPost>(
    `SELECT id, title, content, image_url, posted_at, category, source_url
     FROM public.news_posts
     WHERE visible_partners = true
     ORDER BY posted_at DESC, id DESC`
  );

  return (
    <>
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
                <div className="news-header-row">
                  <div className="news-date">
                    {new Date(p.posted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {p.category && <span className="news-category-pill">{p.category}</span>}
                </div>
                {p.title && (
                  <h3 className="card-title" style={{ marginBottom: 8 }}>
                    {p.title}
                  </h3>
                )}
                <div className="news-content">{p.content}</div>
                {p.source_url && (
                  <a href={p.source_url} target="_blank" rel="noreferrer" className="news-source-link">
                    VIEW MORE <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
