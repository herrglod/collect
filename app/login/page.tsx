'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      const next = params.get('next');
      router.push(next || (data.role === 'admin' ? '/admin' : '/collector'));
      router.refresh();
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
        <div className="eyebrow">Sign In</div>
        <h1 className="title" style={{ fontSize: 26, marginBottom: 24 }}>
          Login
        </h1>
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
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center' }}>
          Forgot your password? Contact us at{' '}
          <a href="mailto:hello@marcinglod.com" style={{ color: 'var(--ink)' }}>
            hello@marcinglod.com
          </a>{' '}
          and we'll reset it for you.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
