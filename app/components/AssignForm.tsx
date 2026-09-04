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
  const [editionNumber, setEditionNumber] = useState('');
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
          edition_number: editionNumber.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error assigning artwork.');
        setLoading(false);
        return;
      }
      setSuccess(`"${data.artwork_name}" was assigned to ${matchedContact.name}.`);
      setContactQuery('');
      setArchiveNumber('');
      setEditionNumber('');
      setNotes('');
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
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
          <label htmlFor="edition">Edition Number (Optional)</label>
          <input
            id="edition"
            value={editionNumber}
            onChange={(e) => setEditionNumber(e.target.value)}
            placeholder="e.g. 3/20"
          />
          <div className="field-hint">
            Display-only text for the collector (e.g. "Edition Number: 3/20"). Whether the piece counts
            as Unique or Limited Edition is controlled by the category under "Manage Artworks".
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
