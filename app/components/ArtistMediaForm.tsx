'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Link = { key: string; label: string; section: string; url: string | null };

export default function ArtistMediaForm({
  links,
  profile,
}: {
  links: Link[];
  profile: { photo_url: string | null; bio_short: string | null };
}) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || '');
  const [bioShort, setBioShort] = useState(profile.bio_short || '');
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(links.map((l) => [l.key, l.url || '']))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sections = Array.from(new Set(links.map((l) => l.section)));

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/update-artist-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: links.map((l) => ({ key: l.key, url: values[l.key] || null })),
          profile: true,
          photo_url: photoUrl,
          bio_short: bioShort,
        }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 640 }}>
      {saved && <div className="success-msg">Saved.</div>}

      <div className="field">
        <label>Artist Photo URL</label>
        <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="field">
        <label>Short Bio</label>
        <textarea value={bioShort} onChange={(e) => setBioShort(e.target.value)} placeholder="A short paragraph about the artist…" />
      </div>

      {sections.map((section) => (
        <div key={section} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            {section}
          </h3>
          {links
            .filter((l) => l.section === section)
            .map((l) => (
              <div className="field" key={l.key}>
                <label>{l.label}</label>
                <input
                  value={values[l.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [l.key]: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            ))}
        </div>
      ))}

      <button className="btn" type="button" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
