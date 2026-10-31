import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getStatus } from '../services/api';
import { fetchNft, fetchNfts } from '../services/nftService';
import type { NftListParams } from '../services/types';

// A chave inclui TODOS os parâmetros: cada combinação de busca/filtro/página tem seu cache.
// O `signal` cancela a requisição anterior quando os parâmetros mudam (respostas obsoletas são descartadas).
export function useNfts(params: NftListParams) {
  return useQuery({
    queryKey: ['nfts', params],
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData, // mantém a página anterior na tela enquanto a nova carrega
  });
}

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => fetchNft(id, signal),
    // NFT inexistente (404) não adianta tentar de novo.
    retry: (failureCount, error) => getStatus(error) !== 404 && failureCount < 1,
  });
}
