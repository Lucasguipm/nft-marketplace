import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { tokenStore } from '../services/api';
import * as authService from '../services/authService';
import type { Session, User } from '../services/types';

export const sessionQueryKey = ['session'] as const;

async function loadSession(): Promise<User | null> {
  if (!tokenStore.get()) return null;
  return authService.fetchMe();
}

// Recupera a sessão após refresh: se há token guardado, confirma na API quem é o usuário.
export function useSession() {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: loadSession,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return { user: query.data ?? null, isLoading: query.isPending };
}

function startSession({ token, user }: Session) {
  tokenStore.set(token);
  // Troca de usuário: descarta tudo que era privado da sessão anterior.
  queryClient.removeQueries({ queryKey: ['favorites'] });
  queryClient.setQueryData(sessionQueryKey, user);
}

export function useLogin() {
  return useMutation({ mutationFn: authService.login, onSuccess: startSession });
}

export function useRegister() {
  return useMutation({ mutationFn: authService.register, onSuccess: startSession });
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Mesmo que a API falhe, a sessão local termina e os dados privados saem do cache.
      tokenStore.clear();
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}
