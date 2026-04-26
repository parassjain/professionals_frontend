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

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (accessToken) => {
  refreshSubscribers.forEach((cb) => cb(accessToken));
  refreshSubscribers = [];
};

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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }

    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    if (!tokens?.refresh) {
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    original._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/token/refresh/`,
          { refresh: tokens.refresh },
          { withCredentials: true }
        );
        const newTokens = { ...tokens, access: data.access };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        isRefreshing = false;
        onTokenRefreshed(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        const csrfToken = getCSRFToken();
        if (csrfToken) {
          original.headers['X-CSRFToken'] = csrfToken;
        }
        return api(original);
      } catch {
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

    return new Promise((resolve) => {
      subscribeTokenRefresh((accessToken) => {
        original.headers.Authorization = `Bearer ${accessToken}`;
        const csrfToken = getCSRFToken();
        if (csrfToken) {
          original.headers['X-CSRFToken'] = csrfToken;
        }
        resolve(api(original));
      });
    });
  }
);

export default api;
