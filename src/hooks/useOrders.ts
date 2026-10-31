import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from './useAuth';
import { getStatus } from '../services/api';
import * as orderService from '../services/orderService';
import type { CreateOrderInput } from '../services/types';

export function useWallets() {
  const { user } = useSession();
  return useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: orderService.fetchWallets,
    enabled: Boolean(user),
  });
}

export function useConnectWallet() {
  return useMutation({ mutationFn: orderService.connectWallet });
}

export function useDisconnectWallet() {
  return useMutation({ mutationFn: orderService.disconnectWallet });
}

// Enquanto o pedido está pendente, consulta a API a cada 1,5 s. Estados finais (confirmado/recusado) param o polling.
export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: ({ signal }) => orderService.fetchOrder(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 1500 : false),
    retry: (failureCount, error) => getStatus(error) !== 404 && failureCount < 1,
  });
}

// Permite retomar um pedido pendente depois de refresh ou queda de conexão, sem criar outra compra.
export function usePendingOrders() {
  const { user } = useSession();
  return useQuery({
    queryKey: ['orders', 'pending', user?.id],
    queryFn: orderService.fetchPendingOrders,
    enabled: Boolean(user),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, key }: { payload: CreateOrderInput; key: string }) =>
      orderService.createOrder(payload, key),
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
