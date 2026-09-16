import axios from 'axios';

function resolveApiBaseURL() {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  return '';
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
headers: {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
},
});

api.interceptors.request.use((config) => {
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';

  if ((config.method || '').toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('thekedaar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          localStorage.removeItem('thekedaar_token');
          localStorage.removeItem('thekedaar_user');
          localStorage.removeItem('thekedaar_subscription');
          window.location.href = '/login';
        }
      }
    }

    // 402 = the plan lapsed. Stay logged in; SubscriptionContext listens for this
    // event, re-reads the status, and the shell swaps in the plans screen.
    if (err.response?.status === 402 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('thekedaari:subscription-required', {
          detail: err.response.data?.subscription || null,
        })
      );
    }

    return Promise.reject(err);
  }
);

export default api;
