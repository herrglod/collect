'use client';

import { useState } from 'react';

export default function TestEmailForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);
    try {
      const res = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Versand fehlgeschlagen.');
        return;
      }
      setStatus('success');
      setMessage(`Test-Mail an ${email} gesendet.`);
    } catch {
      setStatus('error');
      setMessage('Unerwarteter Fehler.');
    }
  }

  return (
    <div style={{ border: '1px solid var(--line)', padding: '14px 18px', marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-soft)',
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        Welcome-Mail testen
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="email"
          required
          placeholder="deine@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, minWidth: 220 }}
        />
        <input
          placeholder="Name (optional, z. B. Philipp)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, minWidth: 200 }}
        />
        <button className="btn-subtle" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Wird gesendet…' : 'Test-Mail senden'}
        </button>
      </form>
      {message && (
        <div style={{ marginTop: 10, fontSize: 12, color: status === 'error' ? '#b0281a' : 'var(--ink-soft)' }}>
          {message}
        </div>
      )}
    </div>
  );
}
