import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '../Header';
import { useSession } from '../../hooks/useAuth';
import { useQuote } from '../../hooks/useCart';
import {
  useConnectWallet,
  useCreateOrder,
  useDisconnectWallet,
  useOrder,
  usePendingOrders,
  useWallets,
} from '../../hooks/useOrders';
import { getErrorData, getErrorMessage, getFieldErrors, isNetworkOrTimeout } from '../../services/api';
import { getIdempotencyKey, renewIdempotencyKey } from '../../lib/idempotency';
import { NETWORKS } from '../../services/types';
import type { Collector, CreateOrderInput, Network } from '../../services/types';

const inputClass =
  'w-full bg-black/40 border rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500';

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-amber-400 mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-erro`} className="text-xs text-red-300 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function Payment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const quoteQuery = useQuote();
  const quote = quoteQuery.data;
  const wallets = useWallets();
  const pendingOrders = usePendingOrders();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<'form' | 'review'>('form');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState('');
  const [network, setNetwork] = useState<Network>('Ethereum');
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Cotação que o usuário viu e aprovou na revisão. Se a cotação atual mudar, a confirmação fica bloqueada.
  const [reviewedQuoteId, setReviewedQuoteId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  // Pré-preenche com os dados da conta e escolhe a carteira principal.
  useEffect(() => {
    if (user) {
      setDisplayName((current) => current || user.name);
      setEmail((current) => current || user.email);
    }
  }, [user]);

  useEffect(() => {
    if (wallets.data && !walletId) {
      setWalletId((wallets.data.find((wallet) => wallet.primary) ?? wallets.data[0])?.id ?? '');
    }
  }, [wallets.data, walletId]);

  // Pedido em andamento: o que acabou de ser criado ou o pendente recuperado após refresh/queda de conexão.
  const activeOrderId = createOrder.data?.id ?? pendingOrders.data?.[0]?.id;
  const orderQuery = useOrder(activeOrderId);
  const order = orderQuery.data;

  const collector: Collector = { displayName: displayName.trim(), username: username.trim(), email: email.trim(), note: note.trim() || undefined };
  const payload: CreateOrderInput | null = reviewedQuoteId ? { quoteId: reviewedQuoteId, collector, walletId, network } : null;
  const signature = JSON.stringify(payload);

  // Confirmado: atualiza carrinho e cotação e abre o recibo.
  useEffect(() => {
    if (order?.status === 'confirmed') {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      router.history.push(`/success?order=${encodeURIComponent(order.id)}`);
    }
  }, [order?.status, order?.id, queryClient, router]);

  const stale = step === 'review' && Boolean(quote) && reviewedQuoteId !== quote?.quoteId;
  const isPending = order?.status === 'pending';
  const isDeclined = order?.status === 'declined';
  const locked = createOrder.isPending || isPending;
  const fieldErrors = { ...getFieldErrors(createOrder.error), ...errors };

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (displayName.trim().length < 2) found.displayName = 'Informe o nome de exibição (mínimo de 2 caracteres).';
    if (!/^@?[a-z0-9_]{3,20}$/i.test(username.trim())) found.username = 'Use de 3 a 20 letras, números ou _.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = 'Informe um e-mail válido.';
    if (!walletId) found.walletId = 'Escolha uma carteira.';
    else if (connectedId !== walletId) found.walletId = 'Conecte a carteira escolhida para continuar.';
    return found;
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !quote) return;
    setNotice('');
    setReviewedQuoteId(quote.quoteId);
    setStep('review');
  }

  function handleConfirm() {
    if (!payload || locked || stale) return;
    setNotice('');
    createOrder.mutate(
      { payload, key: getIdempotencyKey(signature) },
      {
        onError: (error) => {
          const data = getErrorData(error);
          if (data?.quote) {
            // Preço, estoque ou cupom mudaram: mostra a nova cotação e exige nova confirmação.
            queryClient.setQueryData(['quote', user?.id ?? 'guest'], data.quote);
            renewIdempotencyKey(signature);
            setNotice(data.message);
          } else if (isNetworkOrTimeout(error)) {
            // O pedido pode ter sido criado mesmo sem resposta: procura por pedidos pendentes.
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setNotice('A resposta demorou. Verificamos se o pedido foi criado; se não aparecer, tente confirmar de novo (nada será cobrado em duplicidade).');
          }
        },
      },
    );
  }

  function handleRetryAfterDecline() {
    renewIdempotencyKey(signature);
    createOrder.reset();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    setStep('review');
  }

  function handleConnect() {
    connectWallet.mutate(walletId, { onSuccess: () => setConnectedId(walletId) });
  }

  function handleDisconnect() {
    disconnectWallet.mutate(walletId, { onSuccess: () => setConnectedId(null) });
  }

  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId);
  const isEmpty = quote ? quote.items.length === 0 : false;

  return (
    <div className="p-6 md:p-12">
      <Header />

      <main>
        <nav aria-label="Você está em" className="text-xs text-amber-200/50 mb-8">
          <Link to="/" className="hover:underline">Mercado</Link> /{' '}
          <Link to="/cart" className="hover:underline">Carrinho</Link> / <span className="text-amber-400">Pagamento</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-8">Pagamento</h1>

        {isEmpty && !order && (
          <div className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-10 text-center">
            <p className="text-white font-semibold mb-4">Seu carrinho está vazio.</p>
            <Link to="/" className="text-amber-400 underline">Explorar o mercado</Link>
          </div>
        )}

        {!isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section aria-labelledby="dados-titulo" className="lg:col-span-8 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 md:p-8">
              {isPending && (
                <div role="status" aria-live="polite" className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 mb-6 text-sm text-amber-100">
                  <p className="font-semibold">Aguardando confirmação da rede…</p>
                  <p className="text-amber-200/70 mt-1">
                    Pedido <span className="font-mono">{order?.id}</span>. Você pode recarregar a página: o pedido continua e não será duplicado.
                  </p>
                </div>
              )}

              {isDeclined && (
                <div role="alert" className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 mb-6 text-sm">
                  <p className="text-red-200 font-semibold">Pagamento recusado</p>
                  <p className="text-red-200/80 mt-1">{order?.declineReason}</p>
                  <button
                    type="button"
                    onClick={handleRetryAfterDecline}
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {notice && (
                <p role="alert" className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 mb-6 text-sm text-amber-100">
                  {notice}
                </p>
              )}

              {createOrder.isError && !getErrorData(createOrder.error)?.quote && !isNetworkOrTimeout(createOrder.error) && Object.keys(getFieldErrors(createOrder.error)).length === 0 && (
                <p role="alert" className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 mb-6 text-sm text-red-200">
                  {getErrorMessage(createOrder.error, 'Não foi possível criar o pedido.')}
                </p>
              )}

              {step === 'form' && (
                <form onSubmit={handleReview} noValidate>
                  <h2 id="dados-titulo" className="text-lg font-bold text-white border-b border-amber-900/30 pb-3 mb-6">
                    Dados do colecionador
                  </h2>

                  <fieldset disabled={locked} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field id="displayName" label="Nome de exibição *" error={fieldErrors.displayName}>
                        <input
                          id="displayName"
                          value={displayName}
                          onChange={(event) => setDisplayName(event.target.value)}
                          autoComplete="name"
                          aria-invalid={Boolean(fieldErrors.displayName)}
                          aria-describedby={fieldErrors.displayName ? 'displayName-erro' : undefined}
                          className={`${inputClass} ${fieldErrors.displayName ? 'border-red-500/70' : 'border-amber-900/50'}`}
                        />
                      </Field>
                      <Field id="username" label="Nome de usuário *" error={fieldErrors.username}>
                        <input
                          id="username"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder="@kurio_collector"
                          autoComplete="username"
                          aria-invalid={Boolean(fieldErrors.username)}
                          aria-describedby={fieldErrors.username ? 'username-erro' : undefined}
                          className={`${inputClass} ${fieldErrors.username ? 'border-red-500/70' : 'border-amber-900/50'}`}
                        />
                      </Field>
                    </div>

                    <Field id="email" label="E-mail *" error={fieldErrors.email}>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'email-erro' : undefined}
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500/70' : 'border-amber-900/50'}`}
                      />
                    </Field>

                    <Field id="note" label="Observação do colecionador (opcional)">
                      <textarea
                        id="note"
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className={`${inputClass} border-amber-900/50`}
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field id="wallet" label="Carteira *" error={fieldErrors.walletId}>
                        <select
                          id="wallet"
                          value={walletId}
                          onChange={(event) => {
                            setWalletId(event.target.value);
                            setConnectedId(null);
                            connectWallet.reset();
                          }}
                          aria-invalid={Boolean(fieldErrors.walletId)}
                          aria-describedby={fieldErrors.walletId ? 'wallet-erro' : undefined}
                          className={`${inputClass} ${fieldErrors.walletId ? 'border-red-500/70' : 'border-amber-900/50'}`}
                        >
                          {wallets.isPending && <option value="">Carregando carteiras…</option>}
                          {wallets.data?.map((wallet) => (
                            <option key={wallet.id} value={wallet.id}>
                              {wallet.provider} — {wallet.label} ({wallet.address.slice(0, 6)}…{wallet.address.slice(-4)})
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="network" label="Rede *">
                        <select
                          id="network"
                          value={network}
                          onChange={(event) => setNetwork(event.target.value as Network)}
                          className={`${inputClass} border-amber-900/50`}
                        >
                          {NETWORKS.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {connectedId === walletId && walletId ? (
                        <>
                          <span role="status" className="text-sm text-emerald-400">● {selectedWallet?.provider} conectada</span>
                          <button
                            type="button"
                            onClick={handleDisconnect}
                            disabled={disconnectWallet.isPending}
                            className="border border-amber-900/50 hover:bg-amber-900/20 text-amber-300 px-4 py-2 rounded-lg text-sm transition"
                          >
                            Desconectar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConnect}
                          disabled={!walletId || connectWallet.isPending}
                          className="border border-amber-700 hover:bg-amber-900/30 text-amber-200 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {connectWallet.isPending ? 'Conectando…' : 'Conectar carteira'}
                        </button>
                      )}
                      {connectWallet.isError && (
                        <p role="alert" className="text-xs text-red-300">
                          {getErrorMessage(connectWallet.error, 'Não foi possível conectar a carteira.')}
                        </p>
                      )}
                    </div>
                  </fieldset>

                  <button
                    type="submit"
                    disabled={locked || !quote || quote.hasIssues}
                    className="mt-8 w-full md:w-auto bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition shadow-lg shadow-amber-900/20"
                  >
                    Revisar pedido
                  </button>
                </form>
              )}

              {step === 'review' && (
                <div>
                  <h2 id="dados-titulo" className="text-lg font-bold text-white border-b border-amber-900/30 pb-3 mb-6">
                    Revise antes de confirmar
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    <div><dt className="text-amber-200/50 text-xs">Colecionador</dt><dd className="text-white">{collector.displayName} ({collector.username})</dd></div>
                    <div><dt className="text-amber-200/50 text-xs">E-mail</dt><dd className="text-white">{collector.email}</dd></div>
                    <div><dt className="text-amber-200/50 text-xs">Carteira</dt><dd className="text-white">{selectedWallet?.provider} — {selectedWallet?.label}</dd></div>
                    <div><dt className="text-amber-200/50 text-xs">Rede</dt><dd className="text-white">{network}</dd></div>
                    {collector.note && <div className="md:col-span-2"><dt className="text-amber-200/50 text-xs">Observação</dt><dd className="text-white">{collector.note}</dd></div>}
                  </dl>

                  {stale && quote && (
                    <div role="alert" className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 mb-6 text-sm text-amber-100">
                      <p className="font-semibold">Os valores do seu pedido mudaram.</p>
                      <p className="text-amber-200/70 mt-1">
                        Confira o novo total ({quote.total} ETH) ao lado e confirme que quer continuar.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewedQuoteId(quote.quoteId);
                          setNotice('');
                        }}
                        className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Revisar novamente com os novos valores
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      disabled={locked}
                      className="border border-amber-900/50 hover:bg-amber-900/20 text-amber-300 px-6 py-3 rounded-xl text-sm transition disabled:opacity-50"
                    >
                      Voltar e editar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={locked || stale || isDeclined}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition shadow-lg shadow-amber-900/20"
                    >
                      {createOrder.isPending ? 'Enviando pedido…' : isPending ? 'Aguardando a rede…' : 'Confirmar compra'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside aria-labelledby="itens-titulo" className="lg:col-span-4 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6">
              <h2 id="itens-titulo" className="text-lg font-bold text-white mb-4 border-b border-amber-900/30 pb-3">
                Seus NFTs
              </h2>

              {quoteQuery.isPending && (
                <div className="space-y-3" aria-busy="true" aria-label="Carregando resumo">
                  <div className="skeleton h-10 w-full" />
                  <div className="skeleton h-10 w-full" />
                  <div className="skeleton h-6 w-full" />
                </div>
              )}

              {quote && (
                <>
                  <ul className="space-y-3 mb-6 max-h-56 overflow-y-auto pr-1">
                    {quote.items.map((item) => (
                      <li key={`${item.nftId}-${item.edition}`} className="flex justify-between items-center text-xs border-b border-amber-900/20 pb-2 gap-3">
                        <div>
                          <span className="text-white font-medium block">{item.title}</span>
                          <span className="text-amber-200/50">Edição {item.edition} × {item.quantity}</span>
                        </div>
                        <span className="text-emerald-400 font-bold whitespace-nowrap">{item.lineTotal} ETH</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="space-y-2 text-sm border-t border-amber-900/30 pt-4 mb-4">
                    <div className="flex justify-between text-amber-200/70"><dt>Subtotal</dt><dd className="text-white font-medium">{quote.subtotal} ETH</dd></div>
                    {quote.couponCode && (
                      <div className="flex justify-between text-emerald-400"><dt>Desconto ({quote.couponCode})</dt><dd>− {quote.discount} ETH</dd></div>
                    )}
                    <div className="flex justify-between text-amber-200/70"><dt>Taxa de rede</dt><dd className="text-white font-medium">{quote.networkFee} ETH</dd></div>
                  </dl>
                  <div className="border-t border-amber-900/30 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-xl font-extrabold text-emerald-400">{quote.total} ETH</span>
                  </div>
                  {quote.hasIssues && (
                    <p role="alert" className="text-xs text-red-300 mt-4">
                      Há itens indisponíveis. <Link to="/cart" className="underline">Revise o carrinho</Link>.
                    </p>
                  )}
                </>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Payment;
