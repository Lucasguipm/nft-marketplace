import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { Header } from '../Header';
import {
  useApplyCoupon,
  useQuote,
  useRemoveCoupon,
  useRemoveFromCart,
  useSetQuantity,
} from '../../hooks/useCart';
import { getErrorMessage } from '../../services/api';
import { MAX_PER_ORDER } from '../../services/types';
import type { QuoteItem } from '../../services/types';

function CartSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Carregando carrinho">
      {[0, 1, 2].map((index) => (
        <li key={index} className="flex items-center gap-4 py-4 border-b border-amber-900/20">
          <div className="skeleton w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
          <div className="skeleton h-6 w-24" />
        </li>
      ))}
    </ul>
  );
}

function CartRow({ item, busy }: { item: QuoteItem; busy: boolean }) {
  const setQuantity = useSetQuantity();
  const remove = useRemoveFromCart();
  const limit = Math.min(item.available, MAX_PER_ORDER);
  const pending = busy || setQuantity.isPending || remove.isPending;

  return (
    <li className="grid grid-cols-1 md:grid-cols-12 items-center py-4 border-b border-amber-900/20 last:border-none gap-3">
      <div className="md:col-span-6 flex items-center gap-4">
        <img
          src={item.image}
          alt=""
          width={56}
          height={56}
          className="w-14 h-14 rounded-xl object-cover border border-amber-900/40"
        />
        <div>
          <h3 className="font-bold text-white text-sm">{item.title}</h3>
          <span className="text-xs text-amber-200/50">Edição {item.edition}</span>
          {item.issue === 'out_of_stock' && (
            <p role="status" className="text-xs text-red-300 mt-1">
              Esta edição esgotou. Remova o item para continuar.
            </p>
          )}
          {item.issue === 'insufficient_stock' && (
            <p role="status" className="text-xs text-red-300 mt-1">
              Restam só {item.available} unidade(s). Reduza a quantidade para continuar.
            </p>
          )}
        </div>
      </div>

      <div className="md:col-span-2 md:text-center text-sm text-amber-200/90">
        <span className="md:hidden text-amber-200/50">Preço: </span>
        {item.unitPrice} ETH
      </div>

      <div className="md:col-span-2 flex md:justify-center items-center gap-2">
        <button
          type="button"
          aria-label={`Diminuir quantidade de ${item.title}`}
          disabled={pending || item.quantity <= 1}
          onClick={() => setQuantity.mutate({ nftId: item.nftId, edition: item.edition, quantity: item.quantity - 1 })}
          className="w-7 h-7 rounded bg-black/40 border border-amber-900/40 text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition disabled:opacity-40"
        >
          −
        </button>
        <span aria-live="polite" className="text-sm font-semibold text-white w-6 text-center">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${item.title}`}
          disabled={pending || item.quantity >= limit}
          onClick={() => setQuantity.mutate({ nftId: item.nftId, edition: item.edition, quantity: item.quantity + 1 })}
          className="w-7 h-7 rounded bg-black/40 border border-amber-900/40 text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition disabled:opacity-40"
        >
          +
        </button>
      </div>

      <div className="md:col-span-2 flex items-center md:justify-end gap-3">
        <span className="text-sm font-bold text-emerald-400">{item.lineTotal} ETH</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => remove.mutate({ nftId: item.nftId, edition: item.edition })}
          className="text-red-400 hover:text-red-300 text-xs underline transition disabled:opacity-40"
        >
          Remover<span className="sr-only"> {item.title}</span>
        </button>
      </div>

      {(setQuantity.isError || remove.isError) && (
        <p role="alert" className="md:col-span-12 text-xs text-red-300">
          {getErrorMessage(setQuantity.error ?? remove.error, 'Não foi possível atualizar o item.')}
        </p>
      )}
    </li>
  );
}

export function CartComponent() {
  const quoteQuery = useQuote();
  const quote = quoteQuery.data;
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState('');

  function handleApply(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    applyCoupon.mutate(code, { onSuccess: () => setCode('') });
  }

  const isEmpty = quote ? quote.items.length === 0 : false;
  const canCheckout = Boolean(quote) && !isEmpty && !quote?.hasIssues;

  return (
    <div className="p-6 md:p-12">
      <Header />

      <main>
        <nav aria-label="Você está em" className="text-xs text-amber-200/50 mb-8">
          <Link to="/" className="hover:underline">
            Mercado
          </Link>{' '}
          / <span className="text-amber-400">Carrinho</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-8">Carrinho de compras</h1>

        {quoteQuery.isError && (
          <div role="alert" className="bg-red-950/40 border border-red-900/60 rounded-xl p-6 text-center mb-8">
            <p className="text-red-200 mb-4">{getErrorMessage(quoteQuery.error, 'Não foi possível carregar o carrinho.')}</p>
            <button
              type="button"
              onClick={() => quoteQuery.refetch()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section aria-labelledby="itens-titulo" className="lg:col-span-8 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6">
            <h2 id="itens-titulo" className="sr-only">
              Itens do carrinho
            </h2>
            <div
              aria-hidden="true"
              className="hidden md:grid grid-cols-12 text-xs font-semibold text-amber-500 pb-4 border-b border-amber-900/30 mb-2"
            >
              <span className="col-span-6">NFTs</span>
              <span className="col-span-2 text-center">Preço</span>
              <span className="col-span-2 text-center">Quantidade</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {quoteQuery.isPending && <CartSkeleton />}

            {isEmpty && (
              <div className="text-center py-12 text-amber-200/60">
                Seu carrinho está vazio.
                <br />
                <Link to="/" className="text-amber-400 underline mt-2 inline-block">
                  Explorar o mercado
                </Link>
              </div>
            )}

            {quote && quote.items.length > 0 && (
              <ul>
                {quote.items.map((item) => (
                  <CartRow key={`${item.nftId}-${item.edition}`} item={item} busy={quoteQuery.isFetching} />
                ))}
              </ul>
            )}
          </section>

          <aside aria-labelledby="resumo-titulo" className="lg:col-span-4 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 id="resumo-titulo" className="text-lg font-bold text-white mb-6 border-b border-amber-900/30 pb-3">
                Resumo do pedido
              </h2>

              <form onSubmit={handleApply} className="mb-6">
                <label htmlFor="cupom" className="block text-xs font-semibold text-amber-400 mb-2">
                  Código promocional
                </label>
                {quote?.couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-emerald-300">{quote.couponCode} aplicado</span>
                    <button
                      type="button"
                      onClick={() => removeCoupon.mutate()}
                      disabled={removeCoupon.isPending}
                      className="text-xs text-amber-300 underline hover:text-amber-200"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="cupom"
                      type="text"
                      placeholder="Ex.: KURIO10"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      aria-invalid={applyCoupon.isError}
                      aria-describedby={applyCoupon.isError ? 'erro-cupom' : undefined}
                      className="flex-1 min-w-0 bg-black/40 border border-amber-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={applyCoupon.isPending || !code.trim()}
                      className="bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-amber-900/50 disabled:opacity-50"
                    >
                      {applyCoupon.isPending ? 'Aplicando…' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {applyCoupon.isError && (
                  <p id="erro-cupom" role="alert" className="text-xs text-red-300 mt-2">
                    {getErrorMessage(applyCoupon.error, 'Não foi possível aplicar o cupom.')}
                  </p>
                )}
                {quote?.couponError && (
                  <p role="alert" className="text-xs text-red-300 mt-2">
                    {quote.couponError} Remova o cupom para continuar.
                  </p>
                )}
              </form>

              {quoteQuery.isPending ? (
                <div className="space-y-3 border-t border-amber-900/30 pt-4 mb-6" aria-hidden="true">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-6 w-full" />
                </div>
              ) : (
                quote && (
                  <>
                    <dl className="space-y-3 text-sm border-t border-amber-900/30 pt-4 mb-6">
                      <div className="flex justify-between text-amber-200/70">
                        <dt>Subtotal</dt>
                        <dd className="text-white font-medium">{quote.subtotal} ETH</dd>
                      </div>
                      {quote.couponCode && (
                        <div className="flex justify-between text-emerald-400">
                          <dt>Desconto ({quote.couponCode})</dt>
                          <dd>− {quote.discount} ETH</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-amber-200/70">
                        <dt>Taxa de rede</dt>
                        <dd className="text-white font-medium">{quote.networkFee} ETH</dd>
                      </div>
                    </dl>
                    <div className="border-t border-amber-900/30 pt-4 flex justify-between items-center mb-8">
                      <span className="text-base font-bold text-white">Total</span>
                      <span className="text-xl font-extrabold text-emerald-400">{quote.total} ETH</span>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="space-y-3">
              {canCheckout ? (
                <Link
                  to="/checkout"
                  className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-3 rounded-xl font-medium transition shadow-lg shadow-amber-900/20"
                >
                  Ir para o pagamento
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="block w-full bg-black/30 text-amber-200/40 text-center py-3 rounded-xl font-medium"
                >
                  Ir para o pagamento
                </span>
              )}
              <Link to="/" className="block w-full text-center text-xs text-amber-400/80 hover:text-amber-400 py-2 transition">
                Continuar explorando
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
