import { MOCK_NFTS} from '../../services/nftService';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] p-6 md:p-12">
          {/* Cabeçalho */}
          <header className="flex justify-between items-center mb-12 border-b border-amber-900/30 pb-4">
            <div className="text-xl font-bold tracking-widest text-amber-500">KURIO</div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <a href="/" className="text-amber-400 border-b-2 border-amber-500 pb-1">Início</a>
              <a href="/" className="hover:text-amber-400 transition">Mercado</a>
              <a href="/" className="hover:text-amber-400 transition">Criadores</a>
              <a href="/" className="hover:text-amber-400 transition">Aprenda</a>
            </nav>
            <div className="flex items-center gap-4">
              <a href="/cart" className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg text-sm border border-amber-900/50 transition">
                Carrinho
              </a>
              <a href="/login" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-amber-900/20">
                Entrar
              </a>
            </div>
          </header>
    
          {/* Banner Principal */}
          <section className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 md:p-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Bem-vindo à Kurio</span>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 text-white leading-tight">
                SEJA DONO DO FUTURO DA ARTE DIGITAL
              </h1>
              <p className="text-amber-200/70 mb-6 text-sm md:text-base">
                Descubra NFTs selecionados de criadores de arte digital verificada.
              </p>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition">
                EXPLORAR
              </button>
            </div>
            <div className="w-full md:w-80 h-80 bg-black/40 rounded-xl border border-amber-900/30 overflow-hidden flex items-center justify-center">
              <img src={MOCK_NFTS[0]?.image} alt="NFT Destaque" className="w-full h-full object-cover" />
            </div>
          </section>
    
          {/* Catálogo de NFTs */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">Todos os NFTs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_NFTS.map((nft) => (
                <div key={nft.id} className="bg-[#1a110a] border border-amber-900/30 rounded-xl overflow-hidden hover:border-amber-600/50 transition group">
                  <div className="h-72 overflow-hidden bg-black/50">
                    <img src={nft.image} alt={nft.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">{nft.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-emerald-400 font-bold">{nft.price} ETH</span>
                      <a href="/details" className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-4 py-2 rounded-lg text-sm transition">
                        Ver Detalhes
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
  )
}

export default HomePage