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
}
