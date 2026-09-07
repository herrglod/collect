'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Contact = { id: number; name: string; email: string | null; type?: string | null };
type Artwork = { archive_number: string; name: string };

function contactLabel(c: Contact): string {
  const galleryTag = c.type === 'gallery' ? ' [Gallery]' : '';
  const emailTag = c.email ? ` (${c.email})` : '';
  return `${c.name}${galleryTag}${emailTag} — #${c.id}`;
}

export default function AssignForm({
  contacts,
  artworks,
  initialArchiveNumber,
}: {
  contacts: Contact[];
  artworks: Artwork[];
  initialArchiveNumber?: string;
}) {
  const router = useRouter();
  const [contactQuery, setContactQuery] = useState('');
  const [archiveNumber, setArchiveNumber] = useState(initialArchiveNumber ?? '');
  const [editionNumbers, setEditionNumbers] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const matchedContact = contacts.find((c) => contactLabel(c) === contactQuery);

  const selectedArtwork = artworks.find((a) => a.archive_number === archiveNumber.trim().toUpperCase());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!matchedContact) {
      setError('Please select a contact from the list.');
      return;
    }
    if (!selectedArtwork) {
      setError('Please select a valid archive number from the list.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: matchedContact.id,
          archive_number: selectedArtwork.archive_number,
          edition_numbers: editionNumbers.map((v) => v.trim()),
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error assigning artwork.');
        setLoading(false);
        return;
      }
      const count = data.assignedCount ?? 1;
      setSuccess(
        `"${data.artwork_name}" was assigned to ${matchedContact.name}${count > 1 ? ` (${count} copies)` : ''}.` +
          (data.errors ? ` ${data.errors.join(' ')}` : '')
      );
      setContactQuery('');
      setArchiveNumber('');
      setEditionNumbers(['']);
      setNotes('');
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  function updateEditionNumber(index: number, value: string) {
    setEditionNumbers((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addEditionNumberField() {
    setEditionNumbers((prev) => [...prev, '']);
  }

  function removeEditionNumberField(index: number) {
    setEditionNumbers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <div className="form-card" style={{ maxWidth: 520 }}>
      {error && <div className="error-msg">{error}</div>}
      {success && (
        <div style={{ color: '#2f6b2f', fontSize: 13, marginBottom: 16 }}>{success}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="contact">Collector / Contact</label>
          <input
            id="contact"
            list="contact-list"
            value={contactQuery}
            onChange={(e) => setContactQuery(e.target.value)}
            placeholder="Type a name…"
            required
          />
          <datalist id="contact-list">
            {contacts.map((c) => (
              <option key={c.id} value={contactLabel(c)} />
            ))}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="archive">Archive Number</label>
          <input
            id="archive"
            list="artwork-list"
            value={archiveNumber}
            onChange={(e) => setArchiveNumber(e.target.value)}
            placeholder="e.g. A26706"
            required
          />
          <datalist id="artwork-list">
            {artworks.map((a) => (
              <option key={a.archive_number} value={a.archive_number}>
                {a.name}
              </option>
            ))}
          </datalist>
          {selectedArtwork && (
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>
              {selectedArtwork.name}
            </div>
          )}
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="edition" style={{ marginBottom: 0 }}>
              Edition Number (Optional)
            </label>
            <button
              type="button"
              onClick={addEditionNumberField}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              + Add
            </button>
          </div>
          {editionNumbers.map((value, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginTop: index === 0 ? 0 : 8 }}>
              <input
                id={index === 0 ? 'edition' : undefined}
                value={value}
                onChange={(e) => updateEditionNumber(index, e.target.value)}
                placeholder="e.g. 3/20"
              />
              {editionNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEditionNumberField(index)}
                  aria-label="Remove"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    padding: '0 12px',
                    fontSize: 14,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <div className="field-hint">
            Display-only text for the collector (e.g. "Edition Number: 3/20"). Whether the piece counts
            as Unique or Limited Edition is controlled by the category under "Manage Artworks". Add
            multiple fields to assign several copies (e.g. editions 1/10 – 10/10) to the same contact
            at once.
          </div>
        </div>

        <div className="field">
          <label htmlFor="notes">Note (optional)</label>
          <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Assigning…' : 'Assign'}
        </button>
      </form>
    </div>
  );
}
