'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Inquiry = {
  id: number;
  archive_number: string;
  artwork_name: string;
  fulfillment: 'pickup' | 'shipping';
  shipping_city: string | null;
  shipping_country: string | null;
  contact_method: 'email' | 'whatsapp';
  contact_value: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
  contact_name: string;
};

const STATUS_OPTIONS: Inquiry['status'][] = ['pending', 'contacted', 'completed', 'cancelled'];

export default function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(inquiry.status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: Inquiry['status']) {
    setStatus(next);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/update-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry_id: inquiry.id, status: next }),
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
    <div style={{ border: '1px solid var(--line)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {inquiry.artwork_name} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({inquiry.archive_number})</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
            {inquiry.contact_name} · {new Date(inquiry.created_at).toLocaleDateString('en-GB')}
          </div>
        </div>
        <select
          value={status}
          disabled={loading}
          onChange={(e) => updateStatus(e.target.value as Inquiry['status'])}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, height: 'fit-content' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 13, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>
          <strong>Fulfillment:</strong> {inquiry.fulfillment === 'shipping' ? 'Shipping' : 'Pick-Up'}
          {inquiry.fulfillment === 'shipping' && (
            <> — {inquiry.shipping_city}, {inquiry.shipping_country}</>
          )}
        </div>
        <div>
          <strong>Contact:</strong> {inquiry.contact_method === 'whatsapp' ? 'WhatsApp' : 'Email'} —{' '}
          {inquiry.contact_value}
        </div>
        {inquiry.message && (
          <div>
            <strong>Message:</strong> {inquiry.message}
          </div>
        )}
      </div>
    </div>
  );
}
