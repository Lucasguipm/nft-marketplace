import { QueryClient } from '@tanstack/react-query';

// Política de cache (documentada no ARCHITECTURE.md):
// - staleTime 30s: dentro desse prazo, voltar a uma tela não refaz a requisição.
// - gcTime 5min: dados sem uso são descartados depois disso.
// - retry 1: uma nova tentativa para falhas transitórias; mutations nunca repetem sozinhas.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
