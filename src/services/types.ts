export const CATEGORIES = ['Art', 'Collectibles', 'Virtual Worlds', 'Games'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais curtidos' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export interface Edition {
  label: string;
  stock: number;
}

export interface NFT {
  id: string;
  title: string;
  description: string;
  // ETH sempre como string decimal, nunca como number (evita erros de ponto flutuante).
  price: string;
  image: string;
  gallery: string[];
  creator: string;
  category: Category;
  likes: number;
  editions: Edition[];
  version: number;
}

export interface NftListParams {
  q?: string;
  category?: Category;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface ApiErrorBody {
  message: string;
  fields?: Record<string, string>;
  code?: string;
  quote?: Quote;
}

export const NETWORKS = ['Ethereum', 'Polygon', 'Arbitrum'] as const;
export type Network = (typeof NETWORKS)[number];
export const MAX_PER_ORDER = 10;

export interface CartItem {
  nftId: string;
  edition: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  coupon: string | null;
}

export interface QuoteItem {
  nftId: string;
  edition: string;
  title: string;
  image: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  available: number;
  issue?: 'out_of_stock' | 'insufficient_stock';
}

// A cotação da API é a referência para finalizar o pedido: o front só exibe, nunca recalcula.
export interface Quote {
  quoteId: string;
  items: QuoteItem[];
  subtotal: string;
  discount: string;
  couponCode: string | null;
  couponError?: string;
  networkFee: string;
  total: string;
  hasIssues: boolean;
}

export interface Wallet {
  id: string;
  provider: string;
  address: string;
  label: string;
  primary: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'declined';

export interface OrderItem {
  nftId: string;
  title: string;
  edition: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface Collector {
  displayName: string;
  username: string;
  email: string;
  note?: string;
}

// O recibo é um snapshot: mudanças posteriores no catálogo não alteram estes valores.
export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  subtotal: string;
  discount: string;
  couponCode: string | null;
  networkFee: string;
  total: string;
  network: Network;
  wallet: { provider: string; address: string; label: string };
  collector: Collector;
  txHash: string | null;
  declineReason?: string;
  version: number;
}

export interface CreateOrderInput {
  quoteId: string;
  collector: Collector;
  walletId: string;
  network: Network;
}
