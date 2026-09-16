/**
 * Minimal Razorpay client — talks to the REST API over the built-in https module
 * so the backend picks up no new npm dependency.
 *
 * Required env once the Razorpay account is ready:
 *   RAZORPAY_KEY_ID        rzp_live_xxx / rzp_test_xxx
 *   RAZORPAY_KEY_SECRET    the matching secret (server-side only, never sent to the browser)
 *   RAZORPAY_WEBHOOK_SECRET  the secret typed into Dashboard → Settings → Webhooks
 *
 * Until those are set, isConfigured() returns false and the API answers checkout
 * requests with a clear "payments not live yet" error instead of crashing.
 */

const https = require('https');
const crypto = require('crypto');

const API_HOST = 'api.razorpay.com';

function keyId() {
  return String(process.env.RAZORPAY_KEY_ID || '').trim();
}

function keySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || '').trim();
}

function webhookSecret() {
  return String(process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
}

/** True once both API credentials are present. */
function isConfigured() {
  return Boolean(keyId() && keySecret());
}

function isTestMode() {
  return keyId().startsWith('rzp_test');
}

function request(method, path, payload) {
  const body = payload ? JSON.stringify(payload) : null;
  const auth = Buffer.from(`${keyId()}:${keySecret()}`).toString('base64');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: API_HOST,
        path,
        method,
        timeout: 20000,
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...(body && { 'Content-Length': Buffer.byteLength(body) }),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (e) {
            return reject(new Error(`Razorpay returned a non-JSON response (HTTP ${res.statusCode})`));
          }
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
          const description = parsed?.error?.description || `HTTP ${res.statusCode}`;
          const err = new Error(`Razorpay: ${description}`);
          err.statusCode = res.statusCode;
          err.razorpayError = parsed?.error || null;
          return reject(err);
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('Razorpay request timed out')));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Creates a Razorpay order.
 * @param {{ amountInPaise: number, currency?: string, receipt: string, notes?: object }} input
 */
function createOrder({ amountInPaise, currency = 'INR', receipt, notes = {} }) {
  return request('POST', '/v1/orders', {
    amount: amountInPaise,
    currency,
    receipt,
    payment_capture: 1,
    notes,
  });
}

function fetchPayment(paymentId) {
  return request('GET', `/v1/payments/${encodeURIComponent(paymentId)}`);
}

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checkout handoff signature: HMAC_SHA256("<order_id>|<payment_id>", key_secret).
 * This is what proves a browser-reported success is genuine.
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!keySecret() || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', keySecret())
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
}

/** Webhook signature: HMAC_SHA256(<raw request body>, webhook_secret). */
function verifyWebhookSignature({ rawBody, signature }) {
  const secret = webhookSecret();
  if (!secret || !rawBody || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeEqualHex(expected, signature);
}

module.exports = {
  isConfigured,
  isTestMode,
  keyId,
  webhookSecret,
  createOrder,
  fetchPayment,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
