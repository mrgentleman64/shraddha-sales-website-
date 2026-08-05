import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
