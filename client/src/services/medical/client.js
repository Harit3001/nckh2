import { ENDPOINTS } from './endpoints.js';

export const BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://work-flow-production-a826.up.railway.app'
).replace(/\/$/, '');
const MODE = import.meta.env.VITE_USE_MOCK || 'auto'; // 'true' | 'false' | 'auto'

let token = sessionStorage.getItem('medical_token') || '';
export const setToken = (t) => {
  token = t || '';
  t ? sessionStorage.setItem('medical_token', t) : sessionStorage.removeItem('medical_token');
};

export async function http(method, path, { params, body } = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v != null) url.searchParams.set(k, v);
  });
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = new Error(`${res.status} ${res.statusText} — ${method} ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

/** Bóc lớp bọc phổ biến: mảng thẳng, {data}, {items}, {results}. */
export const unwrap = (r) =>
  Array.isArray(r) ? r : r?.data ?? r?.items ?? r?.results ?? r;

/**
 * Gọi API thật; nếu lỗi (và MODE=auto) thì dùng dữ liệu mẫu
 * và bắn sự kiện để UI hiện banner "đang dùng dữ liệu mẫu".
 */
export async function call(realFn, mockFn) {
  if (MODE === 'true') return mockFn();
  try {
    return await realFn();
  } catch (err) {
    if (MODE === 'false') throw err;
    window.dispatchEvent(new CustomEvent('api:fallback', { detail: err.message }));
    return mockFn();
  }
}

export { ENDPOINTS };
