'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CertRequest = {
  id: number;
  archive_number: string;
  artwork_name: string;
  contact_name: string;
  contact_email: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
};

export default function CertificateRequestRow({ request }: { request: CertRequest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/review-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: request.id, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error updating.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr>
      <td>
        {request.contact_name}
        {request.contact_email && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{request.contact_email}</div>
        )}
      </td>
      <td>
        {request.archive_number} — {request.artwork_name}
      </td>
      <td>{new Date(request.created_at).toLocaleDateString('en-GB')}</td>
      <td>
        <span className={`status-pill ${request.status}`}>{request.status}</span>
      </td>
      <td>
        {request.status !== 'completed' && request.status !== 'cancelled' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {request.status === 'pending' && (
              <button
                onClick={() => setStatus('contacted')}
                disabled={loading}
                style={{ background: 'transparent', border: '1px solid var(--line)', padding: '4px 10px', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Contacted
              </button>
            )}
            <button
              onClick={() => setStatus('completed')}
              disabled={loading}
              style={{ background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '4px 10px', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Completed
            </button>
            <button
              onClick={() => setStatus('cancelled')}
              disabled={loading}
              style={{ background: 'transparent', border: '1px solid var(--line)', padding: '4px 10px', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
