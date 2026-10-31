import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from './useAuth';
import * as cartService from '../services/cartService';

// As chaves incluem o dono (usuário ou "guest"): carrinho e cotação nunca se misturam entre contas.
function useOwnerKey() {
  const { user, isLoading } = useSession();
  return { owner: user?.id ?? 'guest', ready: !isLoading };
}

export function useCart() {
  const { owner, ready } = useOwnerKey();
  return useQuery({
    queryKey: ['cart', owner],
    queryFn: ({ signal }) => cartService.fetchCart(signal),
    enabled: ready,
  });
}

export function useQuote() {
  const { owner, ready } = useOwnerKey();
  return useQuery({
    queryKey: ['quote', owner],
    queryFn: ({ signal }) => cartService.fetchQuote(signal),
    enabled: ready,
  });
}

// Depois de qualquer alteração no carrinho, carrinho e cotação são recarregados juntos.
function useRefreshCart() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cart'] }),
      queryClient.invalidateQueries({ queryKey: ['quote'] }),
    ]);
}

export function useAddToCart() {
  const refresh = useRefreshCart();
  return useMutation({ mutationFn: cartService.addToCart, onSuccess: refresh });
}

export function useSetQuantity() {
  const refresh = useRefreshCart();
  return useMutation({ mutationFn: cartService.setCartQuantity, onSuccess: refresh });
}

export function useRemoveFromCart() {
  const refresh = useRefreshCart();
  return useMutation({ mutationFn: cartService.removeCartItem, onSuccess: refresh });
}

export function useApplyCoupon() {
  const refresh = useRefreshCart();
  return useMutation({ mutationFn: cartService.applyCoupon, onSuccess: refresh });
}

export function useRemoveCoupon() {
  const refresh = useRefreshCart();
  return useMutation({ mutationFn: cartService.removeCoupon, onSuccess: refresh });
}
