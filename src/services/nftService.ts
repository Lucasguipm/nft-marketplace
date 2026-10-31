import { api } from './api';
import type { NFT, NftListParams, Paginated } from './types';

export async function fetchNfts(params: NftListParams, signal?: AbortSignal): Promise<Paginated<NFT>> {
  const { data } = await api.get<Paginated<NFT>>('/nfts', { params, signal });
  return data;
}

export async function fetchNft(id: string, signal?: AbortSignal): Promise<NFT> {
  const { data } = await api.get<NFT>(`/nfts/${encodeURIComponent(id)}`, { signal });
  return data;
}

export async function fetchFavorites(): Promise<string[]> {
  const { data } = await api.get<{ ids: string[] }>('/favorites');
  return data.ids;
}

export async function setFavorite(nftId: string, favorite: boolean): Promise<void> {
  const path = `/favorites/${encodeURIComponent(nftId)}`;
  if (favorite) await api.put(path);
  else await api.delete(path);
}
