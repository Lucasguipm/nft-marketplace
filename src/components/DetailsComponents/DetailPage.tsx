import { useState } from 'react';
import { Link, getRouteApi, useRouter } from '@tanstack/react-router';
import { Header } from '../Header';
import { useNft } from '../../hooks/useNfts';
import { useSession } from '../../hooks/useAuth';
import { useFavorites, useToggleFavorite } from '../../hooks/useFavorites';
import { getErrorMessage, getStatus } from '../../services/api';

const route = getRouteApi('/nft/$id');
const MAX_PER_ORDER = 10;

function DetailSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#1a110a] border border-amber-900/40 p-6 md:p-10 rounded-2xl"
      aria-busy="true"
      aria-label="Carregando NFT"
    >
      <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
        <div className="flex md:flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-16 h-16" />
          ))}
        </div>
        <div className="skeleton flex-1 h-[450px]" />
      </div>
      <div className="lg:col-span-6 space-y-4">
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-10 w-2/3" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}

export function DetailPage() {
  const { id } = route.useParams();
  const router = useRouter();
  const { data: nft, isPending, isError, error, refetch } = useNft(id);

  const { user } = useSession();
  const favorites = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite(user?.id);
  const isFavorite = favorites.data?.includes(id) ?? false;

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  function handleFavorite() {
    if (!user) {
      router.history.push(`/login?redirect=${encodeURIComponent(router.state.location.href)}`);
      return;
    }
    toggleFavorite.mutate({ nftId: id, favorite: !isFavorite });
  }

  // Edição escolhida: a selecionada ou, por padrão, a primeira com estoque.
  const edition = nft ? (nft.editions.find((item) => item.label === selectedLabel) ?? nft.editions.find((item) => item.stock > 0)) : undefined;
  const maxQuantity = edition ? Math.min(edition.stock, MAX_PER_ORDER) : 0;
  const safeQuantity = Math.min(Math.max(1, quantity), Math.max(1, maxQuantity));

  return (
    <div className="p-6 md:p-12">
      <Header />

      <main>
        <nav aria-label="Você está em" className="text-xs text-amber-200/50 mb-8">
          <Link to="/" className="hover:underline">
            Mercado
          </Link>{' '}
          / <span className="text-amber-400">{nft?.title ?? 'NFT'}</span>
        </nav>

        {isPending && <DetailSkeleton />}

        {isError && getStatus(error) === 404 && (
          <div role="alert" className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-10 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">NFT não encontrado</h1>
            <p className="text-amber-200/70 mb-6">Esse NFT não existe ou foi removido do catálogo.</p>
            <Link to="/" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition">
              Voltar ao mercado
            </Link>
          </div>
        )}

        {isError && getStatus(error) !== 404 && (
          <div role="alert" className="bg-red-950/40 border border-red-900/60 rounded-2xl p-8 text-center">
            <p className="text-red-200 mb-4">{getErrorMessage(error, 'Não foi possível carregar este NFT.')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {nft && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#1a110a] border border-amber-900/40 p-6 md:p-10 rounded-2xl">
            <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-3 overflow-x-auto" role="group" aria-label="Galeria de imagens">
                {nft.gallery.map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Ver imagem ${index + 1} de ${nft.gallery.length}`}
                    aria-pressed={activeImage === index}
                    className={`w-16 h-16 shrink-0 rounded-lg bg-black/50 border overflow-hidden transition ${
                      activeImage === index ? 'border-amber-500' : 'border-amber-900/40 hover:border-amber-500'
                    }`}
                  >
                    <img src={src} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 h-[450px] rounded-xl overflow-hidden border border-amber-900/40 bg-black/50">
                <img
                  src={nft.gallery[activeImage] ?? nft.image}
                  alt={`Arte do NFT ${nft.title}`}
                  width={600}
                  height={600}
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-white">{nft.title}</h1>
                  <span className="text-emerald-400 font-extrabold text-2xl whitespace-nowrap">{nft.price} ETH</span>
                </div>
                <p className="text-xs text-amber-200/60 mb-6">
                  Criado por {nft.creator} • {nft.category} • {nft.likes} curtidas
                </p>

                <div className="bg-black/30 border border-amber-900/30 p-4 rounded-xl mb-6">
                  <h2 className="text-sm text-amber-500 font-semibold mb-2">Sobre este NFT</h2>
                  <p className="text-sm text-amber-200/80 leading-relaxed">{nft.description}</p>
                </div>

                <fieldset className="mb-6">
                  <legend className="text-sm font-semibold text-amber-400 mb-2">Edição</legend>
                  <div className="flex flex-wrap gap-3">
                    {nft.editions.map((item) => {
                      const soldOut = item.stock === 0;
                      const selected = edition?.label === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          disabled={soldOut}
                          aria-pressed={selected}
                          onClick={() => {
                            setSelectedLabel(item.label);
                            setQuantity(1);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm border transition ${
                            selected
                              ? 'bg-amber-600 text-white border-amber-500'
                              : soldOut
                                ? 'bg-black/20 text-amber-200/30 border-amber-900/20 line-through cursor-not-allowed'
                                : 'bg-black/40 text-amber-200/70 border-amber-900/40 hover:border-amber-600'
                          }`}
                        >
                          {item.label}
                          {soldOut && <span className="sr-only"> (esgotada)</span>}
                        </button>
                      );
                    })}
                  </div>
                  {edition ? (
                    <p className="text-xs text-amber-200/50 mt-2">{edition.stock} disponíveis nesta edição</p>
                  ) : (
                    <p className="text-xs text-red-300 mt-2" role="status">
                      Todas as edições deste NFT estão esgotadas.
                    </p>
                  )}
                </fieldset>

                {edition && (
                  <div className="mb-6">
                    <label htmlFor="quantidade" className="block text-sm font-semibold text-amber-400 mb-2">
                      Quantidade
                    </label>
                    <div className="inline-flex items-center border border-amber-900/50 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
                        disabled={safeQuantity <= 1}
                        className="px-4 py-2 text-amber-300 hover:bg-amber-900/20 disabled:opacity-40"
                      >
                        −
                      </button>
                      <output id="quantidade" aria-live="polite" className="w-12 text-center text-white">
                        {safeQuantity}
                      </output>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        onClick={() => setQuantity(Math.min(maxQuantity, safeQuantity + 1))}
                        disabled={safeQuantity >= maxQuantity}
                        className="px-4 py-2 text-amber-300 hover:bg-amber-900/20 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    {safeQuantity >= maxQuantity && (
                      <p className="text-xs text-amber-200/50 mt-2">Limite de {maxQuantity} por pedido nesta edição.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                {toggleFavorite.isError && (
                  <p role="alert" className="text-sm text-red-300 mb-3">
                    {getErrorMessage(toggleFavorite.error, 'Não foi possível atualizar seus favoritos.')} A alteração foi desfeita.
                  </p>
                )}
                <div className="flex gap-4 pt-6 border-t border-amber-900/30">
                  {edition ? (
                    <Link
                      to="/cart"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium text-center transition shadow-lg shadow-amber-900/20"
                    >
                      Comprar
                    </Link>
                  ) : (
                    <span aria-disabled="true" className="flex-1 bg-black/30 text-amber-200/40 py-3 rounded-xl font-medium text-center">
                      Esgotado
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleFavorite}
                    aria-pressed={isFavorite}
                    className={`px-6 py-3 rounded-xl border text-sm font-medium transition ${
                      isFavorite
                        ? 'bg-amber-600/30 border-amber-500 text-white'
                        : 'border-amber-900/50 hover:bg-amber-900/20 text-amber-300'
                    }`}
                  >
                    {isFavorite ? '♥ Favoritado' : '♡ Favoritar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DetailPage;
