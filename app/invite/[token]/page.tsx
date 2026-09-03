import { queryOne, query } from '../../../lib/db';
import InviteActivateForm from '../../components/InviteActivateForm';

type Artwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
};

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          GLOD <span>Collection</span>
        </div>
      </header>
      {children}
    </div>
  );
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const invite = await queryOne<{
    id: number;
    contact_id: number;
    email: string | null;
    expires_at: string;
    accepted_at: string | null;
    contact_name: string;
    contact_email: string | null;
  }>(
    `SELECT i.id, i.contact_id, i.email, i.expires_at, i.accepted_at,
            c.name AS contact_name, c.email AS contact_email
     FROM public.collector_invites i
     JOIN public.contacts c ON c.id = i.contact_id
     WHERE i.token = $1`,
    [params.token]
  );

  if (!invite) {
    return (
      <InviteShell>
        <div className="empty-state">This invite link is invalid.</div>
      </InviteShell>
    );
  }

  if (invite.accepted_at) {
    return (
      <InviteShell>
        <div className="empty-state">
          This invite has already been used. <a href="/login">Sign in</a> instead.
        </div>
      </InviteShell>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <InviteShell>
        <div className="empty-state">This invite link has expired. Please ask GLOD for a new one.</div>
      </InviteShell>
    );
  }

  const artworks = await query<Artwork>(
    `SELECT a.archive_number, a.name, a.featured_image_url
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.contact_id = $1 AND o.transferred_at IS NULL
     ORDER BY o.acquired_at DESC`,
    [invite.contact_id]
  );

  return (
    <InviteShell>
      <div className="eyebrow">You're Invited</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Welcome, {invite.contact_name}
      </h1>
      <p className="subtitle" style={{ maxWidth: 560 }}>
        We'd like to invite you to your personal GLOD Collection — a private space where you can view
        your artworks, follow artist news, and get collector-only access to available works.
      </p>

      {artworks.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 32 }}>
            You are the owner of {artworks.length} artwork{artworks.length > 1 ? 's' : ''}
          </h2>
          <div className="grid" style={{ marginBottom: 32 }}>
            {artworks.map((a) => (
              <div className="card" key={a.archive_number}>
                {a.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="card-image"
                    src={a.featured_image_url}
                    alt={a.name}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="card-image" />
                )}
                <div className="card-body">
                  <div className="card-number">{a.archive_number}</div>
                  <h3 className="card-title">{a.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title" style={{ marginTop: 32 }}>
        Set Up Your Access
      </h2>
      <InviteActivateForm token={params.token} defaultEmail={invite.email || invite.contact_email || ''} />
    </InviteShell>
  );
}
