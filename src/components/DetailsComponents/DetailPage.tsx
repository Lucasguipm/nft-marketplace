import { useState } from 'react';

export function DetailPage() {
    // Simulação de receção do ID pela rota (ex: /nft/1)
    const [selectedEdition, setSelectedEdition] = useState('1/1');
    const [isFavorited, setIsFavorited] = useState(false);
  
    return (
        <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] p-6 md:p-12">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8 border-b border-amber-900/30 pb-4">
            <div className="text-xl font-bold tracking-widest text-amber-500">KURIO</div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="/" className="hover:text-amber-400 transition">Início</a>
            <a href="/" className="text-amber-400 border-b-2 border-amber-500 pb-1">Mercado</a>
            <a href="/" className="hover:text-amber-400 transition">Criadores</a>
            </nav>
            <div className="flex items-center gap-4">
            <a href="/cart" className="bg-amber-600/20 text-amber-400 px-4 py-2 rounded-lg text-sm border border-amber-900/50">Carrinho</a>
            </div>
        </header>

        {/* Breadcrumb */}
        <div className="text-xs text-amber-200/50 mb-8">
            <a href="/" className="hover:underline">Início</a> / <a href="/" className="hover:underline">Mercado</a> / <span className="text-amber-400">Emerald Ape #042</span>
        </div>

        {/* Conteúdo Principal de Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#1a110a] border border-amber-900/40 p-6 md:p-10 rounded-2xl">
            
            {/* Coluna Esquerda: Miniaturas e Imagem Principal */}
            <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto">
                {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 rounded-lg bg-black/50 border border-amber-900/40 overflow-hidden cursor-pointer hover:border-amber-500">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop" alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
                ))}
            </div>
            <div className="flex-1 h-[450px] rounded-xl overflow-hidden border border-amber-900/40 bg-black/50">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" alt="Emerald Ape" className="w-full h-full object-cover" />
            </div>
            </div>

            {/* Coluna Direita: Informações e Ações */}
            <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-white">Emerald Ape #042</h1>
                <span className="text-emerald-400 font-extrabold text-2xl">1.19 ETH</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-amber-500 mb-6">
                <span>★★★★★</span> <span className="text-amber-200/70">19 avaliações de colecionadores</span>
                </div>

                <div className="bg-black/30 border border-amber-900/30 p-4 rounded-xl mb-6">
                <h3 className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-2">Sobre este NFT</h3>
                <p className="text-sm text-amber-200/80 leading-relaxed">
                    Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.
                </p>
                </div>

                {/* Seletor de Edições */}
                <div className="mb-6">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2">Edição:</span>
                <div className="flex gap-3">
                    {['1/1', '1/10', '1/50', 'Aberta'].map((ed) => (
                    <button
                        key={ed}
                        onClick={() => setSelectedEdition(ed)}
                        className={`px-4 py-2 rounded-lg text-sm border transition ${
                        selectedEdition === ed 
                            ? 'bg-amber-600 text-white border-amber-500' 
                            : 'bg-black/40 text-amber-200/70 border-amber-900/40 hover:border-amber-600'
                        }`}
                    >
                        {ed}
                    </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6 border-t border-amber-900/30">
                <a href="/cart" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium text-center transition shadow-lg shadow-amber-900/20">
                COMPRAR
                </a>
                <button 
                onClick={() => setIsFavorited(!isFavorited)}
                className={`px-6 py-3 rounded-xl border text-sm font-medium transition ${
                    isFavorited 
                    ? 'bg-amber-600/30 border-amber-500 text-white' 
                    : 'border-amber-900/50 hover:bg-amber-900/20 text-amber-300'
                }`}
                >
                {isFavorited ? '❤️ Favoritado' : '🤍 Favoritar'}
                </button>
            </div>
            </div>

            </div>
        </div>
    )
}

export default DetailPage