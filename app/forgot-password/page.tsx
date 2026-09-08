'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          GLOD <span>Collection</span>
        </div>
      </header>
      <div className="form-card">
        <div className="eyebrow">Reset Password</div>
        <h1 className="title" style={{ fontSize: 26, marginBottom: 24 }}>
          Forgot your password?
        </h1>

        {done ? (
          <div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your
              password. It's valid for 1 hour — check your inbox (and spam folder).
            </p>
            <Link href="/login" className="btn-subtle" style={{ display: 'inline-block' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20, color: 'var(--ink-soft)' }}>
              Enter the email address linked to your account and we'll send you a link to set a new
              password.
            </p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <div style={{ marginTop: 20, fontSize: 12, textAlign: 'center' }}>
              <Link href="/login" style={{ color: 'var(--ink-soft)' }}>
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
