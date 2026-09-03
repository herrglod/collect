'use client';

import { useState } from 'react';

type Contact = {
  contact_id: number;
  name: string;
  type: string;
  contact_email: string | null;
  contact_phone: string | null;
  platform_user_id: number | null;
  login_email: string | null;
  role: string | null;
};

export default function AdminAccountRow({ contact }: { contact: Contact }) {
  const [hasAccount, setHasAccount] = useState(!!contact.platform_user_id);
  const [platformUserId, setPlatformUserId] = useState(contact.platform_user_id);
  const [loginEmail, setLoginEmail] = useState(contact.login_email);
  const [emailInput, setEmailInput] = useState(contact.contact_email || '');
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createInvite() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contact.contact_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error creating the invite link.');
        return;
      }
      setInviteUrl(data.url);
      setResult(null);
      setCopied(false);
    } finally {
      setLoading(false);
    }
  }

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
        setError(data.error || 'Error creating account.');
        return;
      }
      setResult({ email: data.email, tempPassword: data.tempPassword });
      setInviteUrl(null);
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
        setError(data.error || 'Error resetting password.');
        return;
      }
      setResult({ email: data.email, tempPassword: data.tempPassword });
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const waHref = (() => {
    if (!inviteUrl) return null;
    const digits = (contact.contact_phone || '').replace(/[^\d]/g, '');
    if (!digits) return null;
    const message = `Hi ${contact.name}, here's your private link to activate your GLOD Collection account: ${inviteUrl}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  })();

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
              : [contact.contact_email, contact.contact_phone].filter(Boolean).join(' · ') ||
                'No email/phone on file'}
          </div>
        </div>

        {!hasAccount ? (
          <button className="btn-subtle" disabled={loading} onClick={createInvite}>
            {loading ? 'Creating…' : 'Send Invite'}
          </button>
        ) : (
          <button className="btn-subtle" disabled={loading} onClick={resetPassword}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        )}
      </div>

      {!hasAccount && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: 'var(--ink-soft)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            or create access manually with a password
          </button>
          {showManual && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              {!contact.contact_email && (
                <input
                  placeholder="Login email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
                />
              )}
              <button className="btn-subtle" disabled={loading} onClick={createAccount}>
                {loading ? 'Creating…' : 'Create Access'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-msg" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {inviteUrl && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            border: '1px solid var(--ink)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <strong>Invite link (valid for 14 days):</strong>
          <br />
          <span style={{ wordBreak: 'break-all' }}>{inviteUrl}</span>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn-subtle" onClick={copyInviteLink}>
              {copied ? 'Copied ✓' : 'Copy Link'}
            </button>
            {waHref ? (
              <a className="btn-subtle" href={waHref} target="_blank" rel="noreferrer">
                Send via WhatsApp
              </a>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                No phone number on file — share the link manually.
              </span>
            )}
          </div>
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
          <strong>Temporary password (shown only now):</strong>
          <br />
          Email: {result.email}
          <br />
          Password: <code>{result.tempPassword}</code>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>
            Please copy this now and pass it on to the collector securely. This will disappear when the
            page reloads.
          </div>
        </div>
      )}
    </div>
  );
}
