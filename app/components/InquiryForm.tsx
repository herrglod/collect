'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InquiryForm({
  archiveNumber,
  artworkName,
  defaultEmail,
  defaultPhone,
}: {
  archiveNumber: string;
  artworkName: string;
  defaultEmail: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<'pickup' | 'shipping'>('pickup');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [contactValue, setContactValue] = useState(defaultEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleMethodChange(method: 'email' | 'whatsapp') {
    setContactMethod(method);
    if (method === 'email' && !contactValue) setContactValue(defaultEmail);
    if (method === 'whatsapp' && (!contactValue || contactValue === defaultEmail)) {
      setContactValue(defaultPhone);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fulfillment === 'shipping' && (!city.trim() || !country.trim())) {
      setError('Please provide a city and country for shipping.');
      return;
    }
    if (!contactValue.trim()) {
      setError(contactMethod === 'email' ? 'Please provide an email address.' : 'Please provide a WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/collector/purchase-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_number: archiveNumber,
          fulfillment,
          shipping_city: fulfillment === 'shipping' ? city.trim() : null,
          shipping_country: fulfillment === 'shipping' ? country.trim() : null,
          contact_method: contactMethod,
          contact_value: contactValue.trim(),
          message: message.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not submit your inquiry.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="form-card" style={{ maxWidth: 520 }}>
        <div className="success-msg" style={{ marginBottom: 0 }}>
          Thank you — your inquiry about "{artworkName || archiveNumber}" has been sent. The GLOD
          team will get in touch with you shortly.
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: 520 }}>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Pick-Up or Shipping</label>
          <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textTransform: 'none', fontWeight: 400 }}>
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillment === 'pickup'}
                onChange={() => setFulfillment('pickup')}
              />
              Pick-Up
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textTransform: 'none', fontWeight: 400 }}>
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillment === 'shipping'}
                onChange={() => setFulfillment('shipping')}
              />
              Shipping
            </label>
          </div>
        </div>

        {fulfillment === 'shipping' && (
          <>
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="country">Country</label>
              <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </>
        )}

        <div className="field">
          <label>Preferred Contact Method</label>
          <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textTransform: 'none', fontWeight: 400 }}>
              <input
                type="radio"
                name="contact_method"
                checked={contactMethod === 'email'}
                onChange={() => handleMethodChange('email')}
              />
              Email
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, textTransform: 'none', fontWeight: 400 }}>
              <input
                type="radio"
                name="contact_method"
                checked={contactMethod === 'whatsapp'}
                onChange={() => handleMethodChange('whatsapp')}
              />
              WhatsApp
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="contact_value">{contactMethod === 'email' ? 'Email Address' : 'WhatsApp Number'}</label>
          <input
            id="contact_value"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={contactMethod === 'email' ? 'you@example.com' : '+1 234 567 8901'}
          />
        </div>

        <div className="field">
          <label htmlFor="message">Message (optional)</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Submitting…' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}
