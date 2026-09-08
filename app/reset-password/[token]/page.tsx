import { queryOne } from '../../../lib/db';
import ResetPasswordForm from '../../components/ResetPasswordForm';

function ResetShell({ children }: { children: React.ReactNode }) {
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

export default async function ResetPasswordPage({ params }: { params: { token: string } }) {
  const reset = await queryOne<{ id: number; expires_at: string; used_at: string | null }>(
    `SELECT id, expires_at, used_at FROM public.password_resets WHERE token = $1`,
    [params.token]
  );

  if (!reset) {
    return (
      <ResetShell>
        <div className="empty-state">This reset link is invalid.</div>
      </ResetShell>
    );
  }
  if (reset.used_at) {
    return (
      <ResetShell>
        <div className="empty-state">
          This reset link has already been used. <a href="/login">Sign in</a> or{' '}
          <a href="/forgot-password">request a new link</a>.
        </div>
      </ResetShell>
    );
  }
  if (new Date(reset.expires_at) < new Date()) {
    return (
      <ResetShell>
        <div className="empty-state">
          This reset link has expired. <a href="/forgot-password">Request a new one</a>.
        </div>
      </ResetShell>
    );
  }

  return (
    <ResetShell>
      <div className="eyebrow">Reset Password</div>
      <h1 className="title" style={{ fontSize: 26, marginBottom: 24 }}>
        Choose a new password
      </h1>
      <ResetPasswordForm token={params.token} />
    </ResetShell>
  );
}
