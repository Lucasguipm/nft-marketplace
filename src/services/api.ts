import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../config';
import type { ApiErrorBody } from './types';

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // sem localStorage: a sessão vale só até o refresh
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nada a fazer
    }
  },
};

export const SESSION_EXPIRED_EVENT = 'kurio:session-expired';

// Toda chamada REST do app passa por esta instância.
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Identifica o visitante (sem login) para que o carrinho dele sobreviva ao refresh.
const GUEST_KEY = 'kurio-guest-id';
function guestId(): string {
  try {
    let id = localStorage.getItem(GUEST_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(GUEST_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Guest-Id'] = guestId();
  return config;
});

// 401 com token guardado = sessão expirada: limpa o token e avisa o app.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export function getStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ECONNABORTED') return 'A requisição demorou demais. Tente novamente.';
    if (!error.response) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorBody>(error)) return error.response?.data?.fields ?? {};
  return {};
}

// Corpo de erro estruturado da API (inclui `code` e, em conflitos de compra, a nova `quote`).
export function getErrorData(error: unknown): ApiErrorBody | null {
  return axios.isAxiosError<ApiErrorBody>(error) ? (error.response?.data ?? null) : null;
}

export function isNetworkOrTimeout(error: unknown): boolean {
  return axios.isAxiosError(error) && (!error.response || error.code === 'ECONNABORTED');
}
