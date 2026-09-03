import { SITE_URL } from './site';

const RESEND_API_URL = 'https://api.resend.com/emails/batch';
const RESEND_SINGLE_URL = 'https://api.resend.com/emails';

type NewsEmailPost = {
  title: string | null;
  content: string;
  image_url: string | null;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildNewsEmailHtml(post: NewsEmailPost): string {
  const heading = post.title ? post.title : 'New update from GLOD Collection';
  const image = post.image_url
    ? `<img src="${post.image_url}" alt="" style="width:100%;max-width:560px;display:block;margin:0 0 20px;" />`
    : '';
  const paragraph = post.content
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#111;">${line}</p>`)
    .join('');

  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:18px;">
      GLOD Collection
    </div>
    <h1 style="font-size:20px;margin:0 0 20px;color:#111;">${heading}</h1>
    ${image}
    ${paragraph}
    <a href="${SITE_URL}/collector/news" style="display:inline-block;margin-top:12px;padding:10px 18px;border:1px solid #111;color:#111;text-decoration:none;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">
      View on GLOD Collection
    </a>
    <p style="margin-top:32px;font-size:11px;color:#999;">
      You are receiving this because you opted in to news notifications in your GLOD Collection settings.
    </p>
  </div>`;
}

/**
 * Sends a "new news post" notification to a list of recipient emails via Resend.
 * Fails silently per-batch (logs, doesn't throw) so a broken email provider never
 * blocks the news post itself from being created.
 */
export async function sendNewsNotification(post: NewsEmailPost, recipientEmails: string[]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    console.warn('RESEND_API_KEY or RESEND_FROM_EMAIL not set — skipping news email notifications.');
    return;
  }

  const uniqueEmails = Array.from(new Set(recipientEmails.filter(Boolean)));
  if (uniqueEmails.length === 0) return;

  const html = buildNewsEmailHtml(post);
  const subject = post.title ? `GLOD Collection: ${post.title}` : 'GLOD Collection: New update';

  const batches = chunk(uniqueEmails, 100);

  for (const batch of batches) {
    const payload = batch.map((to) => ({
      from: fromAddress,
      to: [to],
      subject,
      html,
    }));

    try {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Resend batch send failed:', res.status, text);
      }
    } catch (err) {
      console.error('Resend batch send threw an error:', err);
    }
  }
}

function buildWelcomeEmailHtml(name: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:18px;">
      GLOD Collection
    </div>
    <h1 style="font-size:20px;margin:0 0 20px;color:#111;">Welcome to the GLOD Collectors Circle, ${name}</h1>
    <p style="font-size:15px;line-height:1.6;color:#111;">
      Your personal collector account is now active. From here you can:
    </p>
    <ul style="font-size:15px;line-height:1.8;color:#111;padding-left:20px;margin:0 0 20px;">
      <li>View your artworks and their history in one place</li>
      <li>Follow artist news and studio updates</li>
      <li>Get early, collector-only access to new and available works</li>
      <li>Reach out directly if you'd like to add a piece to your collection</li>
    </ul>
    <a href="${SITE_URL}/collector" style="display:inline-block;margin-top:4px;padding:10px 18px;border:1px solid #111;color:#111;text-decoration:none;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">
      Go to My Collection
    </a>
    <p style="margin-top:32px;font-size:11px;color:#999;">
      You're receiving this because a GLOD Collection account was just created for you.
    </p>
  </div>`;
}

/**
 * Sends the one-time welcome email after a collector activates their invite.
 * Fails silently (logs, doesn't throw) so a broken email provider never blocks activation.
 */
export async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    console.warn('RESEND_API_KEY or RESEND_FROM_EMAIL not set — skipping welcome email.');
    return;
  }

  try {
    const res = await fetch(RESEND_SINGLE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: 'Welcome to the GLOD Collectors Circle',
        html: buildWelcomeEmailHtml(name),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Resend welcome email failed:', res.status, text);
    }
  } catch (err) {
    console.error('Resend welcome email threw an error:', err);
  }
}
