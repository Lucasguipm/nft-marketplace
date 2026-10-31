import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFavorites, setFavorite } from '../services/nftService';

// A chave inclui o id do usuário: favoritos de uma conta nunca aparecem em outra.
export const favoritesKey = (userId: string | undefined) => ['favorites', userId] as const;

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: favoritesKey(userId),
    queryFn: fetchFavorites,
    enabled: Boolean(userId),
  });
}

interface ToggleInput {
  nftId: string;
  favorite: boolean;
}

// Atualização otimista: a UI muda na hora e volta atrás (rollback) se a API falhar.
export function useToggleFavorite(userId: string | undefined) {
  const queryClient = useQueryClient();
  const key = favoritesKey(userId);

  return useMutation({
    mutationFn: ({ nftId, favorite }: ToggleInput) => setFavorite(nftId, favorite),
    onMutate: async ({ nftId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (current = []) =>
        favorite ? Array.from(new Set([...current, nftId])) : current.filter((id) => id !== nftId),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
