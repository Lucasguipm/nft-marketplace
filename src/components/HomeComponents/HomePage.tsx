import { useEffect, useRef, useState } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import { Header } from '../Header';
import { useNfts } from '../../hooks/useNfts';
import { getErrorMessage } from '../../services/api';
import { CATEGORIES, SORT_OPTIONS } from '../../services/types';
import type { Category, NFT, SortKey } from '../../services/types';

const route = getRouteApi('/');
const PAGE_SIZE = 9;

function NftCard({ nft }: { nft: NFT }) {
  return (
    <li className="bg-[#1a110a] border border-amber-900/30 rounded-xl overflow-hidden hover:border-amber-600/50 transition group">
      <div className="h-72 overflow-hidden bg-black/50">
        <img
          src={nft.image}
          alt={`Arte do NFT ${nft.title}`}
          width={600}
          height={600}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1">{nft.title}</h3>
        <p className="text-xs text-amber-200/60">
          {nft.creator} • {nft.category}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-emerald-400 font-bold">{nft.price} ETH</span>
          <Link
            to="/nft/$id"
            params={{ id: nft.id }}
            className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </li>
  );
}

// Mesmas dimensões do card real: nada "pula" quando os dados chegam.
function NftCardSkeleton() {
  return (
    <li className="bg-[#1a110a] border border-amber-900/30 rounded-xl overflow-hidden" aria-hidden="true">
      <div className="skeleton h-72 rounded-none" />
      <div className="p-5">
        <div className="skeleton h-6 w-3/4 mb-2" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-9 w-28" />
        </div>
      </div>
    </li>
  );
}

export function HomePage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // O campo de busca tem estado local; a URL só muda depois de uma pausa na digitação.
  const [term, setTerm] = useState(search.q ?? '');
  const lastSent = useRef(search.q);

  // Mudança externa da URL (botão voltar/avançar): sincroniza o campo.
  useEffect(() => {
    if (search.q !== lastSent.current) {
      lastSent.current = search.q;
      setTerm(search.q ?? '');
    }
  }, [search.q]);

  useEffect(() => {
    const next = term.trim() || undefined;
    if (next === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = next;
      navigateRef.current({ search: (prev) => ({ ...prev, q: next, page: undefined }), replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [term]);

  const page = search.page ?? 1;
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useNfts({
    q: search.q,
    category: search.category,
    sort: search.sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const hasFilters = Boolean(search.q || search.category || search.sort);

  function setCategory(category: Category | undefined) {
    navigate({ search: (prev) => ({ ...prev, category, page: undefined }) });
  }

  function setSort(sort: SortKey | undefined) {
    navigate({ search: (prev) => ({ ...prev, sort, page: undefined }) });
  }

  function scrollToCatalog() {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }

  const statusText = isPending
    ? 'Carregando NFTs…'
    : isError
      ? ''
      : `${data.total} ${data.total === 1 ? 'NFT encontrado' : 'NFTs encontrados'}`;

  return (
    <div className="p-6 md:p-12">
      <Header />

      <main>
        <section className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 md:p-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl">
            <p className="text-xs tracking-widest text-amber-500 font-semibold">Bem-vindo à Kurio</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 text-white leading-tight">
              Seja dono do futuro da arte digital
            </h1>
            <p className="text-amber-200/70 mb-6 text-sm md:text-base">
              Descubra NFTs selecionados de criadores de arte digital verificada.
            </p>
            <button
              type="button"
              onClick={scrollToCatalog}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Explorar o catálogo
            </button>
          </div>
          <div className="w-full md:w-80 h-80 bg-black/40 rounded-xl border border-amber-900/30 overflow-hidden">
            <img
              src="/nft.png"
              alt="NFT em destaque"
              width={320}
              height={320}
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <section id="catalogo" aria-labelledby="catalogo-titulo">
          <h2 id="catalogo-titulo" className="text-2xl font-bold mb-6 text-white">
            Catálogo
          </h2>

          <div className="flex flex-col lg:flex-row gap-4 lg:items-end mb-6">
            <div className="flex-1">
              <label htmlFor="busca" className="block text-xs font-semibold text-amber-400 mb-2">
                Buscar por nome ou criador
              </label>
              <input
                id="busca"
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Ex.: Emerald, Kurio Editions"
                className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="ordenacao" className="block text-xs font-semibold text-amber-400 mb-2">
                Ordenar por
              </label>
              <select
                id="ordenacao"
                value={search.sort ?? 'recent'}
                onChange={(event) => setSort(event.target.value === 'recent' ? undefined : (event.target.value as SortKey))}
                className="w-full lg:w-48 bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              aria-pressed={!search.category}
              onClick={() => setCategory(undefined)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                !search.category
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-black/40 text-amber-200/70 border-amber-900/40 hover:border-amber-600'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={search.category === category}
                onClick={() => setCategory(category)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  search.category === category
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-black/40 text-amber-200/70 border-amber-900/40 hover:border-amber-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Anuncia o resultado para leitores de tela sem mover o foco. */}
          <p role="status" aria-live="polite" className="text-sm text-amber-200/60 mb-4 min-h-5">
            {statusText}
            {isFetching && !isPending ? ' (atualizando…)' : ''}
          </p>

          {isPending && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <NftCardSkeleton key={index} />
              ))}
            </ul>
          )}

          {isError && (
            <div role="alert" className="bg-red-950/40 border border-red-900/60 rounded-xl p-6 text-center">
              <p className="text-red-200 mb-4">{getErrorMessage(error, 'Não foi possível carregar o catálogo.')}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="bg-[#1a110a] border border-amber-900/30 rounded-xl p-10 text-center">
              <p className="text-white font-semibold mb-2">Nenhum NFT encontrado</p>
              <p className="text-amber-200/60 text-sm mb-4">
                {hasFilters ? 'Tente outro termo ou remova os filtros.' : 'O catálogo está vazio no momento.'}
              </p>
              {hasFilters && (
                <Link
                  to="/"
                  search={{}}
                  className="inline-block bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          )}

          {data && data.items.length > 0 && (
            <ul
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${
                isPlaceholderData ? 'opacity-60' : ''
              }`}
            >
              {data.items.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </ul>
          )}

          {data && data.totalPages > 1 && (
            <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-2 mt-10">
              {data.page > 1 ? (
                <Link
                  to="/"
                  search={(prev) => ({ ...prev, page: data.page - 1 <= 1 ? undefined : data.page - 1 })}
                  className="px-4 py-2 rounded-lg border border-amber-900/50 text-amber-300 hover:bg-amber-900/20 text-sm transition"
                >
                  Anterior
                </Link>
              ) : (
                <span aria-disabled="true" className="px-4 py-2 rounded-lg border border-amber-900/20 text-amber-200/30 text-sm">
                  Anterior
                </span>
              )}

              {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((number) => (
                <Link
                  key={number}
                  to="/"
                  search={(prev) => ({ ...prev, page: number === 1 ? undefined : number })}
                  aria-label={`Página ${number}`}
                  aria-current={number === data.page ? 'page' : undefined}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm transition ${
                    number === data.page
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'border-amber-900/50 text-amber-300 hover:bg-amber-900/20'
                  }`}
                >
                  {number}
                </Link>
              ))}

              {data.page < data.totalPages ? (
                <Link
                  to="/"
                  search={(prev) => ({ ...prev, page: data.page + 1 })}
                  className="px-4 py-2 rounded-lg border border-amber-900/50 text-amber-300 hover:bg-amber-900/20 text-sm transition"
                >
                  Próxima
                </Link>
              ) : (
                <span aria-disabled="true" className="px-4 py-2 rounded-lg border border-amber-900/20 text-amber-200/30 text-sm">
                  Próxima
                </span>
              )}
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
