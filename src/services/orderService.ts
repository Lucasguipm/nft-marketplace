import { api } from './api';
import type { CreateOrderInput, Order, Wallet } from './types';

export async function createOrder(input: CreateOrderInput, idempotencyKey: string): Promise<Order> {
  const { data } = await api.post<Order>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } });
  return data;
}

export async function fetchOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal });
  return data;
}

export async function fetchPendingOrders(): Promise<Order[]> {
  const { data } = await api.get<{ items: Order[] }>('/orders', { params: { status: 'pending' } });
  return data.items;
}

export async function fetchWallets(): Promise<Wallet[]> {
  const { data } = await api.get<{ items: Wallet[] }>('/wallets');
  return data.items;
}

export async function connectWallet(id: string): Promise<void> {
  await api.post(`/wallets/${encodeURIComponent(id)}/connect`);
}

export async function disconnectWallet(id: string): Promise<void> {
  await api.post(`/wallets/${encodeURIComponent(id)}/disconnect`);
}
