import axios from 'axios';

const CSRF_KEY = 'csrftoken';

const getCSRFToken = () => {
  let token = null;
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === CSRF_KEY) {
        token = value;
        break;
      }
    }
  }
  return token;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    console.log('Response error:', error.response?.status, error.message);

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) {
      console.log('Already retried, rejecting');
      return Promise.reject(error);
    }

    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    console.log('Stored tokens:', tokens ? 'yes' : 'no');
    console.log('Refresh token:', tokens?.refresh ? 'yes' : 'no');

    if (!tokens?.refresh) {
      console.log('No refresh token, clearing auth');
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      console.log('Already refreshing, queuing request');
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          const retryConfig = { ...original, _retry: false };
          retryConfig.headers.Authorization = `Bearer ${token}`;
          resolve(api(retryConfig));
        });
      });
    }

    isRefreshing = true;
    console.log('Attempting refresh...');

    try {
      console.log('Making refresh request to:', `${api.defaults.baseURL}/auth/token/refresh/`);
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        { refresh: tokens.refresh },
        { withCredentials: true }
      );
      console.log('Refresh success! New access:', data.access?.slice(0, 20) + '...');
      localStorage.setItem('tokens', JSON.stringify({ ...tokens, access: data.access }));
      isRefreshing = false;
      onTokenRefreshed(data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (err) {
      console.log('Refresh failed:', err.response?.data || err.message);
      console.log('Status:', err.response?.status);
      isRefreshing = false;
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      if (!window.__authErrorShown) {
        window.__authErrorShown = true;
        alert('Your session has expired. Please log in again.');
        window.__authErrorShown = false;
      }
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default api;