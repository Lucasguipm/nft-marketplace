import { TOKEN_KEY } from '../config';
import { NFT_FIXTURES } from './fixtures';
import type { NFT } from '../services/types';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // nunca a senha em claro
}

export interface Db {
  nfts: NFT[];
  users: StoredUser[];
  sessions: Record<string, string>; // token -> id do usuário
  favorites: Record<string, string[]>; // id do usuário -> ids de NFTs
}

const KEY = 'kurio-mock-db-v1';
let cache: Db | null = null;

export async function sha256(text: string): Promise<string> {
  const salted = `kurio:${text}`;
  if (globalThis.crypto?.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback para contextos sem crypto.subtle (HTTP fora do localhost). Só vale para o mock.
  return btoa(unescape(encodeURIComponent(salted)));
}

async function seed(): Promise<Db> {
  const passwordHash = await sha256('Senha@123');
  return {
    nfts: structuredClone(NFT_FIXTURES),
    users: [
      { id: 'u1', name: 'Ana Colecionadora', email: 'ana@kurio.io', passwordHash },
      { id: 'u2', name: 'Bruno Colecionador', email: 'bruno@kurio.io', passwordHash },
    ],
    sessions: {},
    favorites: {},
  };
}

export async function getDb(): Promise<Db> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as Db;
      return cache;
    }
  } catch {
    // dado corrompido ou storage indisponível: recomeça do cenário conhecido
  }
  cache = await seed();
  persist();
  return cache;
}

export function persist() {
  if (!cache) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // sem localStorage: o estado vale só até o refresh
  }
}

// Restaura integralmente o cenário conhecido (usuários, favoritos e sessões).
export function resetDb() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada a fazer
  }
}
