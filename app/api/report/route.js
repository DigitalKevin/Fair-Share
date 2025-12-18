import nodemailer from 'nodemailer';
export const runtime = 'nodejs';

// Simple in-memory rate limiting (IP -> timestamp of last request)
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function getRateLimitKey(req) {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

function checkRateLimit(key) {
  const now = Date.now();
  const requests = requestLog.get(key) || [];
  const recentRequests = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  requestLog.set(key, recentRequests);
  return true;
}

export async function POST(req) {
  try {
    const clientKey = getRateLimitKey(req);
    if (!checkRateLimit(clientKey)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }), { status: 429 });
    }

    const { name, email, subject, description } = await req.json();

    const to = process.env.REPORT_TO || 'kevinhoang670@gmail.com';

    // Prefer SMTP creds; user must set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    const host = process.env.SMTP_HOST;
    if (!host) {
      // If no SMTP configured, return helpful message
      return new Response(JSON.stringify({ error: 'SMTP not configured. Set SMTP_HOST env var.' }), { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = process.env.SMTP_FROM || (process.env.SMTP_USER || 'noreply@example.com');

    const mail = await transporter.sendMail({
      from,
      to,
      subject: `[TabTogether report] ${subject || 'Bug report'}`,
      text: `Reporter: ${name || 'Anonymous'}\nReporter email: ${email || 'N/A'}\n\n${description}`,
      html: `<p><strong>Reporter:</strong> ${name || 'Anonymous'}</p><p><strong>Reporter email:</strong> ${email || 'N/A'}</p><hr/><p>${description.replace(/\n/g,'<br/>')}</p>`,
    });

    return new Response(JSON.stringify({ ok: true, messageId: mail.messageId }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'Send failed' }), { status: 500 });
  }
}
