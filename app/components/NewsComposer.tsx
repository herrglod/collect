'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const CATEGORIES = ['Press', 'Artist', 'Project', 'Exhibition', 'Streetart', 'Collaboration'];

export default function NewsComposer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postedAt, setPostedAt] = useState(todayISO());
  const [category, setCategory] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [visibleCollectors, setVisibleCollectors] = useState(true);
  const [visiblePartners, setVisiblePartners] = useState(false);
  const [emailCollectors, setEmailCollectors] = useState(false);
  const [emailPartners, setEmailPartners] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string | null>(null);

  async function handleSendTest() {
    if (!testEmail.trim()) return;
    setTestStatus('loading');
    setTestMessage(null);
    try {
      const res = await fetch('/api/admin/send-test-news-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail.trim(),
          title: title.trim() || null,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestStatus('error');
        setTestMessage(data.error || 'Failed to send.');
        return;
      }
      setTestStatus('sent');
      setTestMessage(`Test email sent to ${testEmail.trim()}.`);
    } catch {
      setTestStatus('error');
      setTestMessage('Unexpected error.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Please enter some text.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          posted_at: postedAt,
          category: category || null,
          source_url: sourceUrl.trim() || null,
          visible_collectors: visibleCollectors,
          visible_partners: visiblePartners,
          email_collectors: emailCollectors,
          email_partners: emailPartners,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error publishing.');
        setLoading(false);
        return;
      }
      setTitle('');
      setContent('');
      setImageUrl('');
      setPostedAt(todayISO());
      setCategory('');
      setSourceUrl('');
      setVisibleCollectors(true);
      setVisiblePartners(false);
      setEmailCollectors(false);
      setEmailPartners(false);
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 560 }}>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title (optional)</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="content">Post</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's new?"
          />
        </div>
        <div className="field">
          <label htmlFor="image_url">Image URL (optional)</label>
          <input
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="field">
          <label htmlFor="posted_at">Post Date</label>
          <input
            id="posted_at"
            type="date"
            value={postedAt}
            onChange={(e) => setPostedAt(e.target.value)}
          />
          <div className="field-hint">For backdated news, you can adjust the date.</div>
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— None —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="source_url">Source / Reference Link (optional)</label>
          <input
            id="source_url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://… (opens in a new tab)"
          />
        </div>
        <div className="field">
          <label>Visible to</label>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={visibleCollectors}
                onChange={(e) => setVisibleCollectors(e.target.checked)}
              />
              Collectors
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={visiblePartners}
                onChange={(e) => setVisiblePartners(e.target.checked)}
              />
              Gallery Partners
            </label>
          </div>
        </div>
        <div className="field">
          <label>Send a mail to</label>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={emailCollectors}
                onChange={(e) => setEmailCollectors(e.target.checked)}
              />
              Collectors
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={emailPartners}
                onChange={(e) => setEmailPartners(e.target.checked)}
              />
              Gallery Partners
            </label>
          </div>
          <div className="field-hint">
            Both off by default. Only tick these once the post is ready to go out — this immediately
            emails everyone in that group who has news notifications turned on
            {emailCollectors || emailPartners ? ' (will send on publish)' : ' (nothing will be sent)'}.
          </div>
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      </form>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
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
          Preview: send yourself a test email
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="you@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, minWidth: 220 }}
          />
          <button
            type="button"
            className="btn-subtle"
            onClick={handleSendTest}
            disabled={testStatus === 'loading' || !content.trim() || !testEmail.trim()}
          >
            {testStatus === 'loading' ? 'Sending…' : 'Send Test Email'}
          </button>
        </div>
        <div className="field-hint">
          Sends the post exactly as written above to just this address — doesn't publish it and doesn't
          notify collectors or partners.
        </div>
        {testMessage && (
          <div style={{ marginTop: 8, fontSize: 12, color: testStatus === 'error' ? '#b0281a' : '#2f6b2f' }}>
            {testMessage}
          </div>
        )}
      </div>
    </div>
  );
}
