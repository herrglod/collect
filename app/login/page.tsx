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
        setError(data.error || 'Login fehlgeschlagen.');
        setLoading(false);
        return;
      }
      const next = params.get('next');
      router.push(next || (data.role === 'admin' ? '/admin' : '/collector'));
      router.refresh();
    } catch {
      setError('Unerwarteter Fehler. Bitte erneut versuchen.');
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          GLOD <span>Archive</span>
        </div>
      </header>
      <div className="form-card">
        <div className="eyebrow">Anmeldung</div>
        <h1 className="title" style={{ fontSize: 26, marginBottom: 24 }}>
          Login
        </h1>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">E-Mail</label>
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
            <label htmlFor="password">Passwort</label>
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
            {loading ? 'Wird geprüft…' : 'Einloggen'}
          </button>
        </form>
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
