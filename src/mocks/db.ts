import { TOKEN_KEY } from '../config';
import { NFT_FIXTURES } from './fixtures';
import type { CartItem, NFT, Order, Wallet } from '../services/types';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // nunca a senha em claro
}

export interface StoredCart {
  items: CartItem[];
  coupon: string | null;
}

export interface StoredOrder extends Order {
  userId: string;
  confirmAt: number; // quando a "rede" decide o pedido
  outcome: 'confirmed' | 'declined';
  payloadHash: string; // detecta reuso da chave de idempotência com conteúdo diferente
}

export interface Db {
  nfts: NFT[];
  users: StoredUser[];
  sessions: Record<string, string>; // token -> id do usuário
  favorites: Record<string, string[]>; // id do usuário -> ids de NFTs
  carts: Record<string, StoredCart>; // id do usuário ou "guest:<id>" -> carrinho
  wallets: Record<string, Wallet[]>; // id do usuário -> carteiras
  orders: Record<string, StoredOrder>;
  idempotency: Record<string, string>; // "<usuário>:<chave>" -> id do pedido
}

const KEY = 'kurio-mock-db-v2';
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
    carts: {},
    wallets: {
      u1: [
        { id: 'w1', provider: 'MetaMask', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', label: 'Principal', primary: true },
        { id: 'w2', provider: 'WalletConnect', address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72', label: 'Secundária', primary: false },
      ],
      u2: [
        { id: 'w3', provider: 'Coinbase Wallet', address: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0', label: 'Principal', primary: true },
      ],
    },
    orders: {},
    idempotency: {},
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

export function getCart(db: Db, owner: string): StoredCart {
  db.carts[owner] ??= { items: [], coupon: null };
  return db.carts[owner];
}

// Restaura integralmente o cenário conhecido (usuários, favoritos, carrinhos, pedidos e sessões).
export function resetDb() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem('kurio-mock-db-v1');
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada a fazer
  }
}
