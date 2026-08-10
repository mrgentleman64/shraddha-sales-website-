// Base API URL (without trailing slash). Use VITE_API_URL in .env or .env.production.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const API_PREFIX = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
const defaultHeaders = {};

async function request(path, options = {}) {
  const headers = { ...defaultHeaders, ...(options.headers || {}) };
  const init = {
    method: options.method || 'GET',
    credentials: 'include',
    headers,
  };

  if (options.body instanceof FormData) {
    init.body = options.body;
  } else if (options.body !== undefined && options.body !== null) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    init.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, init);
  } catch (error) {
    const wrapped = new Error('Network Error');
    wrapped.response = null;
    throw wrapped;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(typeof data === 'string' ? data : data?.detail || 'Request failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status, headers: response.headers };
}

export const api = {
  defaults: {
    headers: defaultHeaders,
  },
  get: (path, config = {}) => request(path, { ...config, method: 'GET' }),
  post: (path, data, config = {}) => request(path, { ...config, method: 'POST', body: data }),
  put: (path, data, config = {}) => request(path, { ...config, method: 'PUT', body: data }),
  delete: (path, config = {}) => request(path, { ...config, method: 'DELETE' }),
};

export function fmtError(detail) {
  if (!detail) return 'Something went wrong.';
  if (detail === 'Network Error') return 'Cannot connect to the server. Please start the backend and try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || JSON.stringify(item)).join(' ');
  if (typeof detail === 'object' && detail?.msg) return detail.msg;
  return String(detail);
}

export const inr = (value) => {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
};
