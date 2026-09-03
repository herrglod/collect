'use client';

import { useState } from 'react';

export default function SettingsForm({
  initial,
}: {
  initial: { prefEmail: boolean; prefPhone: boolean };
}) {
  const [prefEmail, setPrefEmail] = useState(initial.prefEmail);
  const [prefPhone, setPrefPhone] = useState(initial.prefPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: { prefEmail: boolean; prefPhone: boolean }) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/collector/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pref_contact_email: next.prefEmail,
          pref_contact_phone: next.prefPhone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not save preferences.');
        return;
      }
      setSaved(true);
    } catch {
      setError('Unexpected error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 520 }}>
      {error && <div className="error-msg">{error}</div>}
      {saved && !error && <div className="success-msg">Preferences saved.</div>}

      <div className="toggle-row">
        <div>
          <div className="toggle-row-label">Contact me by email</div>
          <div className="toggle-row-hint">Receive inquiries and updates about your artworks via email.</div>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefEmail}
            onChange={(e) => {
              setPrefEmail(e.target.checked);
              save({ prefEmail: e.target.checked, prefPhone });
            }}
            disabled={saving}
          />
          <span className="switch-track" />
        </label>
      </div>

      <div className="toggle-row">
        <div>
          <div className="toggle-row-label">Contact me by phone</div>
          <div className="toggle-row-hint">Allow the GLOD team to call you regarding artwork inquiries.</div>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefPhone}
            onChange={(e) => {
              setPrefPhone(e.target.checked);
              save({ prefEmail, prefPhone: e.target.checked });
            }}
            disabled={saving}
          />
          <span className="switch-track" />
        </label>
      </div>
    </div>
  );
}
