'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ConnectRequest = {
  id: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  contact_name: string;
  contact_email: string | null;
};

export default function RequestRow({ request }: { request: ConnectRequest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function review(status: 'approved' | 'rejected') {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/review-request', {
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
      <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>{request.description}</td>
      <td>{new Date(request.created_at).toLocaleDateString('en-GB')}</td>
      <td>
        <span className={`status-pill ${request.status}`}>{request.status}</span>
      </td>
      <td>
        {request.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => review('approved')}
              disabled={loading}
              style={{
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Approve
            </button>
            <button
              onClick={() => review('rejected')}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
