/**
 * Razorpay Checkout loader + a single place that runs the buy flow.
 *
 * Flow: POST /subscription/orders -> open Checkout -> POST /subscription/verify.
 * The backend webhook credits the same order independently, so a browser that dies
 * mid-payment still ends up subscribed.
 */

import api from '@/lib/api';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loaderPromise = null;

/** Injects checkout.js once; resolves true when window.Razorpay is usable. */
export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener('error', () => {
        loaderPromise = null;
        resolve(false);
      });
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      loaderPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loaderPromise;
}

/** Turns any checkout/API failure into a message safe to show a contractor on a phone. */
function readableError(err, fallback) {
  const data = err?.response?.data;
  if (data?.error) return data.error;
  if (err?.message && !/^Request failed/.test(err.message)) return err.message;
  return fallback;
}

/**
 * Runs the full purchase for one plan.
 *
 * @param {object} args
 * @param {string} args.planCode
 * @param {object} [args.user]      logged-in user, used to prefill name/phone
 * @param {'en'|'hi'} [args.lang]
 * @param {(result:object)=>void} args.onSuccess  called after the server confirms payment
 * @param {(message:string, meta?:object)=>void} args.onError
 * @param {()=>void} [args.onDismiss] user closed the checkout sheet without paying
 */
export async function startCheckout({ planCode, user, lang = 'en', onSuccess, onError, onDismiss }) {
  const hi = lang === 'hi';

  let order;
  try {
    const res = await api.post('/subscription/orders', { planCode });
    order = res.data;
  } catch (err) {
    const data = err?.response?.data;
    return onError(
      readableError(
        err,
        hi ? 'भुगतान शुरू नहीं हो पाया। दोबारा कोशिश करें।' : 'Could not start the payment. Please try again.'
      ),
      { code: data?.code, supportPhone: data?.supportPhone }
    );
  }

  const ready = await loadRazorpayScript();
  if (!ready) {
    return onError(
      hi
        ? 'पेमेंट पेज लोड नहीं हुआ। इंटरनेट जाँचकर दोबारा कोशिश करें।'
        : 'Payment page did not load. Check your internet and try again.',
      { code: 'CHECKOUT_SCRIPT_FAILED' }
    );
  }

  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: order.amountInPaise,
    currency: order.currency || 'INR',
    name: 'Thekedaari',
    description: `${order.plan?.name || planCode} — ${hi ? 'सब्सक्रिप्शन' : 'Subscription'}`,
    image: `${window.location.origin}/thekedaari-logo.png`,
    order_id: order.razorpayOrderId,
    prefill: {
      name: order.prefill?.name || user?.name || '',
      contact: order.prefill?.contact || user?.phone || '',
    },
    notes: { planCode },
    theme: { color: '#2563eb' },
    modal: {
      ondismiss: () => onDismiss?.(),
      confirm_close: true,
      escape: false,
    },
    handler: async (response) => {
      try {
        const verified = await api.post('/subscription/verify', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        onSuccess({ ...verified.data, plan: verified.data.plan || order.plan });
      } catch (err) {
        // Money may well have left the account — never say "failed" here.
        onError(
          readableError(
            err,
            hi
              ? 'भुगतान हो गया है पर पुष्टि नहीं हो पाई। ऐप दोबारा खोलें या सपोर्ट से संपर्क करें।'
              : 'Payment went through but we could not confirm it. Reopen the app or contact support.'
          ),
          { code: 'VERIFY_FAILED', paymentId: response?.razorpay_payment_id }
        );
      }
    },
  });

  rzp.on('payment.failed', (event) => {
    onError(
      event?.error?.description ||
        (hi ? 'भुगतान पूरा नहीं हुआ।' : 'The payment did not go through.'),
      { code: 'PAYMENT_FAILED' }
    );
  });

  rzp.open();
}
