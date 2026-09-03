'use client';

import { useState } from 'react';

type Contact = {
  contact_id: number;
  name: string;
  type: string;
  contact_email: string | null;
  platform_user_id: number | null;
  login_email: string | null;
  role: string | null;
};

export default function AdminAccountRow({ contact }: { contact: Contact }) {
  const [hasAccount, setHasAccount] = useState(!!contact.platform_user_id);
  const [platformUserId, setPlatformUserId] = useState(contact.platform_user_id);
  const [loginEmail, setLoginEmail] = useState(contact.login_email);
  const [emailInput, setEmailInput] = useState(contact.contact_email || '');
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createAccount() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contact.contact_id, email: emailInput.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anlegen.');
        return;
      }
      setResult({ email: data.email, tempPassword: data.tempPassword });
      setHasAccount(true);
      setLoginEmail(data.email);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!platformUserId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform_user_id: platformUserId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Fehler beim Zurücksetzen.');
        return;
      }
      setResult({ email: data.email, tempPassword: data.tempPassword });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: '1px solid var(--line)', padding: '14px 18px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {contact.name}{' '}
            <span
              style={{
                fontSize: 11,
                color: 'var(--ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {contact.type}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
            {hasAccount
              ? `Login: ${loginEmail}`
              : contact.contact_email
              ? contact.contact_email
              : 'Keine Email hinterlegt'}
          </div>
        </div>

        {!hasAccount ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!contact.contact_email && (
              <input
                placeholder="Login-Email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
              />
            )}
            <button className="btn-subtle" disabled={loading} onClick={createAccount}>
              {loading ? 'Wird angelegt…' : 'Zugang anlegen'}
            </button>
          </div>
        ) : (
          <button className="btn-subtle" disabled={loading} onClick={resetPassword}>
            {loading ? 'Wird zurückgesetzt…' : 'Passwort zurücksetzen'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-msg" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            border: '1px solid var(--ink)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <strong>Temporäres Passwort (nur jetzt sichtbar):</strong>
          <br />
          Email: {result.email}
          <br />
          Passwort: <code>{result.tempPassword}</code>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>
            Bitte jetzt kopieren und dem Sammler sicher übermitteln. Diese Anzeige verschwindet beim Neuladen der
            Seite.
          </div>
        </div>
      )}
    </div>
  );
}
