import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// Use your machine's local IP (not localhost) so phone/emulator can reach it
export const API_BASE_URL = 'https://thekedaari.com/api';

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

export const setLogoutCallback = (fn) => { _logoutCallback = fn; };

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('thekedaar_token');
      await AsyncStorage.removeItem('thekedaar_user');
      if (_logoutCallback) _logoutCallback();
    }
    return Promise.reject(err);
  }
);

export default client;
