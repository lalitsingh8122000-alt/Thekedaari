import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NativeModules, Platform } from 'react-native';

// Dynamically detect your PC's IP from Metro bundler, with local IP fallback
function getDevApiUrl() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:\/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:5000/api`;
      }
    }
  } catch (e) {}

  return 'http://192.168.161.79:5000/api';
}

export const API_BASE_URL = __DEV__ ? getDevApiUrl() : 'http://192.168.161.79:5000/api';
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
