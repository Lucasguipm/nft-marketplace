import type { ReactNode } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import { useOrder } from '../../hooks/useOrders';
import { getErrorMessage, getStatus } from '../../services/api';

const route = getRouteApi('/success');

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 md:p-10 shadow-2xl text-center">
        {children}
      </div>
    </main>
  );
}

export function Confirmation() {
  const { order: orderId } = route.useSearch();
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId);

  if (!orderId) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white mb-3">Nenhum pedido selecionado</h1>
        <p className="text-sm text-amber-200/60 mb-6">Abra esta página a partir de uma compra finalizada.</p>
        <Link to="/" className="text-amber-400 underline">Voltar ao mercado</Link>
      </Shell>
    );
  }

  if (isPending) {
    return (
      <Shell>
        <div aria-busy="true" aria-label="Carregando pedido" className="space-y-4">
          <div className="skeleton w-20 h-20 rounded-full mx-auto" />
          <div className="skeleton h-8 w-3/4 mx-auto" />
          <div className="skeleton h-40 w-full" />
        </div>
      </Shell>
    );
  }

  if (isError) {
    const notFound = getStatus(error) === 404;
    return (
      <Shell>
        <div role="alert">
          <h1 className="text-2xl font-bold text-white mb-3">{notFound ? 'Pedido não encontrado' : 'Não foi possível carregar o pedido'}</h1>
          <p className="text-sm text-amber-200/60 mb-6">
            {notFound ? 'Esse pedido não existe ou pertence a outra conta.' : getErrorMessage(error)}
          </p>
        </div>
        {!notFound && (
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition mb-4"
          >
            Tentar novamente
          </button>
        )}
        <div>
          <Link to="/" className="text-amber-400 underline text-sm">Voltar ao mercado</Link>
        </div>
      </Shell>
    );
  }

  // A confirmação só aparece para pedido efetivamente confirmado.
  if (order.status === 'pending') {
    return (
      <Shell>
        <div role="status" aria-live="polite">
          <h1 className="text-2xl font-bold text-white mb-3">Aguardando confirmação da rede…</h1>
          <p className="text-sm text-amber-200/60">
            Pedido <span className="font-mono">{order.id}</span>. Esta página atualiza sozinha quando a rede decidir.
          </p>
        </div>
      </Shell>
    );
  }

  if (order.status === 'declined') {
    return (
      <Shell>
        <div role="alert">
          <div aria-hidden="true" className="w-20 h-20 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 text-3xl">
            ✕
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Pagamento recusado</h1>
          <p className="text-sm text-amber-200/60 mb-6">{order.declineReason}</p>
        </div>
        <Link
          to="/checkout"
          className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition text-center text-sm"
        >
          Tentar novamente
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div aria-hidden="true" className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 text-3xl">
        ✓
      </div>
      <p className="text-xs text-emerald-400 font-semibold mb-1">Transação concluída</p>
      <h1 className="text-3xl font-extrabold text-white mb-3">Compra realizada com sucesso!</h1>
      <p className="text-xs text-amber-200/60 mb-8">
        Obrigado por apoiar criadores digitais na Kurio. Seus NFTs estão a caminho da sua carteira.
      </p>

      <div className="bg-black/40 border border-amber-900/30 rounded-xl p-4 text-left mb-8 text-xs">
        <ul className="space-y-2 mb-4 border-b border-amber-900/20 pb-4">
          {order.items.map((item) => (
            <li key={`${item.nftId}-${item.edition}`} className="flex justify-between gap-3">
              <span className="text-white">
                {item.title} <span className="text-amber-200/50">({item.edition}) × {item.quantity}</span>
              </span>
              <span className="text-emerald-400 font-bold whitespace-nowrap">{item.lineTotal} ETH</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2">
          <div className="flex justify-between"><dt className="text-amber-200/50">Subtotal</dt><dd className="text-white">{order.subtotal} ETH</dd></div>
          {order.couponCode && (
            <div className="flex justify-between"><dt className="text-amber-200/50">Desconto ({order.couponCode})</dt><dd className="text-emerald-400">− {order.discount} ETH</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-amber-200/50">Taxa de rede</dt><dd className="text-white">{order.networkFee} ETH</dd></div>
          <div className="flex justify-between"><dt className="text-amber-200/50">Total pago</dt><dd className="text-emerald-400 font-bold">{order.total} ETH</dd></div>
          <div className="flex justify-between"><dt className="text-amber-200/50">Número do pedido</dt><dd className="text-white font-mono">{order.id}</dd></div>
          <div className="flex justify-between"><dt className="text-amber-200/50">Rede</dt><dd className="text-white">{order.network}</dd></div>
          <div className="flex justify-between"><dt className="text-amber-200/50">Carteira</dt><dd className="text-white">{order.wallet.provider} ({order.wallet.label})</dd></div>
        </dl>
        <div className="pt-3 mt-3 border-t border-amber-900/20">
          <span className="text-amber-200/50 block mb-1">Hash da transação (simulado):</span>
          <span className="text-amber-400 font-mono text-[10px] break-all block bg-black/60 p-2 rounded border border-amber-900/20">
            {order.txHash}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          to="/profile"
          className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-amber-900/20 text-center text-sm"
        >
          Ver no meu perfil
        </Link>
        <Link
          to="/"
          className="block w-full bg-black/40 hover:bg-black/60 border border-amber-900/40 text-amber-300 font-medium py-3 rounded-xl transition text-center text-sm"
        >
          Voltar ao mercado
        </Link>
      </div>
    </Shell>
  );
}

export default Confirmation;
