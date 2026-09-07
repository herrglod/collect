import { redirect } from 'next/navigation';
import { getServerSession } from '../../../lib/auth-server';
import { query, queryOne } from '../../../lib/db';

export default async function PartnerArtistMediaPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const links = await query<{ key: string; label: string; section: string; url: string | null }>(
    `SELECT key, label, section, url FROM public.artist_media_links ORDER BY section, key`
  );
  const profile = await queryOne<{ photo_url: string | null; bio_short: string | null }>(
    `SELECT photo_url, bio_short FROM public.artist_media_profile WHERE id = 1`
  );

  const sections = Array.from(new Set(links.map((l) => l.section)));

  return (
    <>
      <div className="eyebrow">Gallery Partner</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Artist Media
      </h1>
      <p className="subtitle" style={{ maxWidth: 600 }}>
        Resources for presenting and promoting the artist's work at your gallery.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
        {profile?.photo_url && (
          <img
            src={profile.photo_url}
            alt="Marcin Glod"
            style={{ width: 120, height: 120, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        {profile?.bio_short && (
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}>{profile.bio_short}</p>
        )}
      </div>

      {sections.map((section) => {
        const sectionLinks = links.filter((l) => l.section === section && l.url);
        if (sectionLinks.length === 0) return null;
        return (
          <div key={section} style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>
              {section}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {sectionLinks.map((l) => (
                <a
                  key={l.key}
                  href={l.url!}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    border: '1px solid var(--line)',
                    padding: '10px 18px',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                  }}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
