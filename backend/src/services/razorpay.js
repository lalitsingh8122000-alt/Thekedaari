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

/**
 * Creates a Razorpay Payment Link — a hosted checkout page on Razorpay's own domain.
 *
 * Unlike the in-page Checkout popup, this needs no script in the browser and no TLS
 * certificate on our side: the customer is redirected to https://rzp.io/... to pay,
 * then bounced back to `callbackUrl` with a signature we verify.
 *
 * @param {{ amountInPaise:number, currency?:string, description:string, referenceId:string,
 *           customer?:{name?:string, contact?:string}, notes?:object, callbackUrl:string,
 *           notifySms?:boolean, expiresInMinutes?:number }} input
 */
function createPaymentLink({
  amountInPaise,
  currency = 'INR',
  description,
  referenceId,
  customer = {},
  notes = {},
  callbackUrl,
  notifySms = false,
  expiresInMinutes = 60 * 24,
}) {
  const body = {
    amount: amountInPaise,
    currency,
    accept_partial: false,
    reference_id: referenceId,
    description: String(description || '').slice(0, 2048),
    customer: {
      ...(customer.name && { name: customer.name }),
      ...(customer.contact && { contact: `+91${String(customer.contact).replace(/\D/g, '').slice(-10)}` }),
    },
    notify: { sms: Boolean(notifySms), email: false },
    reminder_enable: false,
    notes,
    callback_url: callbackUrl,
    callback_method: 'get',
  };

  // Razorpay requires expire_by to be at least 15 minutes out; skip it if misconfigured.
  if (expiresInMinutes >= 16) {
    body.expire_by = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  }

  return request('POST', '/v1/payment_links', body);
}

function fetchPaymentLink(linkId) {
  return request('GET', `/v1/payment_links/${encodeURIComponent(linkId)}`);
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

/**
 * Payment Link return signature. Razorpay redirects the browser back with
 * razorpay_payment_link_id, _reference_id, _status and razorpay_payment_id, signed as
 *   HMAC_SHA256("<link_id>|<reference_id>|<status>|<payment_id>", key_secret)
 * Note the field order differs from the Checkout signature — it is not interchangeable.
 */
function verifyPaymentLinkSignature({ paymentLinkId, referenceId, status, paymentId, signature }) {
  if (!keySecret() || !paymentLinkId || !referenceId || !status || !paymentId || !signature) {
    return false;
  }
  const expected = crypto
    .createHmac('sha256', keySecret())
    .update(`${paymentLinkId}|${referenceId}|${status}|${paymentId}`)
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
  createPaymentLink,
  fetchPaymentLink,
  verifyPaymentSignature,
  verifyPaymentLinkSignature,
  verifyWebhookSignature,
};
