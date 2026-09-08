'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error resetting password.');
        setLoading(false);
        return;
      }
      const home = data.role === 'admin' ? '/admin' : data.role === 'gallery_partner' ? '/partner' : '/collector';
      router.push(home);
      router.refresh();
    } catch {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Saving…' : 'Set New Password'}
        </button>
      </form>
    </div>
  );
}
