import { api } from './api';
import type { CartItem, CartState, Quote } from './types';

export async function fetchCart(signal?: AbortSignal): Promise<CartState> {
  const { data } = await api.get<CartState>('/cart', { signal });
  return data;
}

// Soma à quantidade que já está no carrinho.
export async function addToCart(item: CartItem): Promise<CartState> {
  const { data } = await api.post<CartState>('/cart/items', item);
  return data;
}

// Define a quantidade exata (0 remove).
export async function setCartQuantity(item: CartItem): Promise<CartState> {
  const { data } = await api.put<CartState>('/cart/items', item);
  return data;
}

export async function removeCartItem(item: Pick<CartItem, 'nftId' | 'edition'>): Promise<CartState> {
  const { data } = await api.delete<CartState>(
    `/cart/items/${encodeURIComponent(item.nftId)}/${encodeURIComponent(item.edition)}`,
  );
  return data;
}

export async function applyCoupon(code: string): Promise<CartState> {
  const { data } = await api.put<CartState>('/cart/coupon', { code });
  return data;
}

export async function removeCoupon(): Promise<CartState> {
  const { data } = await api.delete<CartState>('/cart/coupon');
  return data;
}

export async function mergeCart(): Promise<CartState> {
  const { data } = await api.post<CartState>('/cart/merge');
  return data;
}

export async function fetchQuote(signal?: AbortSignal): Promise<Quote> {
  const { data } = await api.post<Quote>('/quote', undefined, { signal });
  return data;
}
