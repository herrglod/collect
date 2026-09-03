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
        setMessage(data.error || 'Failed to send.');
        return;
      }
      setStatus('success');
      setMessage(`Test email sent to ${email}.`);
    } catch {
      setStatus('error');
      setMessage('Unexpected error.');
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
        Test the Welcome Email
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, minWidth: 220 }}
        />
        <input
          placeholder="Name (optional, e.g. Philipp)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, minWidth: 200 }}
        />
        <button className="btn-subtle" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Send Test Email'}
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
