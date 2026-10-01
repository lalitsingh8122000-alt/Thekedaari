import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://thekedaari.com/api';
// export const API_BASE_URL = 'http://10.215.221.79:5000/api';
console.log('[API] Connecting to:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('thekedaar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if ((config.method || '').toLowerCase() === 'get') {
    config.params = { ...(config.params || {}), _t: Date.now() };
  }
  return config;
});

let _logoutCallback = null;
let _subscriptionRequiredCallback = null;

export const setLogoutCallback = (fn) => { _logoutCallback = fn; };
export const setSubscriptionRequiredCallback = (fn) => { _subscriptionRequiredCallback = fn; };

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('thekedaar_token');
      await AsyncStorage.removeItem('thekedaar_user');
      await AsyncStorage.removeItem('thekedaar_subscription');
      if (_logoutCallback) _logoutCallback();
    } else if (err.response?.status === 402) {
      // 402 = subscription expired or required. Do not log out!
      if (_subscriptionRequiredCallback) {
        _subscriptionRequiredCallback(err.response?.data?.subscription || null);
      }
    }
    return Promise.reject(err);
  }
);

export default client;
