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
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
      if (tokens?.refresh) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh: tokens.refresh },
            { withCredentials: true }
          );
          localStorage.setItem('tokens', JSON.stringify({ ...tokens, access: data.access }));
          original.headers.Authorization = `Bearer ${data.access}`;
          const csrfToken = getCSRFToken();
          if (csrfToken) {
            original.headers['X-CSRFToken'] = csrfToken;
          }
          return api(original);
        } catch (refreshError) {
          // Only log out on a genuine auth rejection (401/403).
          // Network errors, 502/503 during a server restart → keep tokens,
          // let the user retry rather than forcing a login.
          const status = refreshError.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem('tokens');
            localStorage.removeItem('user');
            if (!window.__authErrorShown) {
              window.__authErrorShown = true;
              alert('Your session has expired. Please log in again.');
              window.__authErrorShown = false;
            }
            window.location.href = '/login';
          }
          // For network/5xx errors: reject so the original caller can handle it
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
