import { useState } from 'react'

export function UserInfo() {
    const [activeTab, setActiveTab] = useState<'nfts' | 'wallets' | 'settings'>('nfts');
    
    const [wallets, setWallets] = useState([
        { id: '1', name: 'MetaMask (Principal)', address: '0x71C...39A2', network: 'Ethereum', primary: true },
        { id: '2', name: 'Coinbase Wallet', address: '0x3A9...F104', network: 'Polygon', primary: false },
    ]);
    
    const removeWallet = (id: string) => {
        setWallets(prev => prev.filter(w => w.id !== id));
    };
  
    return (
        <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] p-6 md:p-12">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8 border-b border-amber-900/30 pb-4">
            <div className="text-xl font-bold tracking-widest text-amber-500">KURIO</div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="/" className="hover:text-amber-400 transition">Início</a>
            <a href="/cart" className="hover:text-amber-400 transition">Carrinho</a>
            <a href="/profile" className="text-amber-400 border-b-2 border-amber-500 pb-1">Perfil</a>
            </nav>
            <div className="flex items-center gap-4">
            <a href="/login" className="text-xs text-amber-400 hover:underline">Sair</a>
            </div>
        </header>

        {/* Banner de Perfil */}
        <div className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-amber-600/20 border-2 border-amber-500 flex items-center justify-center text-3xl font-bold text-amber-400 shrink-0">
            CK
            </div>
            <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">Colecionador Kurio</h1>
                <span className="bg-amber-600/20 border border-amber-900/50 text-amber-400 text-xs px-3 py-1 rounded-full w-max mx-auto md:mx-0">
                Verificado
                </span>
            </div>
            <p className="text-xs text-amber-200/60 mb-4">@kurio_collector • Entrou em Agosto de 2026</p>

            <div className="flex justify-center md:justify-start gap-6 text-sm">
                <div>
                <span className="font-bold text-white block">12</span>
                <span className="text-xs text-amber-200/50">NFTs Colecionados</span>
                </div>
                <div className="border-r border-amber-900/30"></div>
                <div>
                <span className="font-bold text-emerald-400 block">45.2 ETH</span>
                <span className="text-xs text-amber-200/50">Valor Estimado</span>
                </div>
            </div>
            </div>
        </div>

        {/* Navegação por Abas */}
        <div className="flex border-b border-amber-900/30 mb-8">
            <button
            onClick={() => setActiveTab('nfts')}
            className={`pb-3 px-6 font-semibold text-sm transition ${
                activeTab === 'nfts'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-amber-200/50 hover:text-amber-300'
            }`}
            >
            Minha Coleção (3)
            </button>
            <button
            onClick={() => setActiveTab('wallets')}
            className={`pb-3 px-6 font-semibold text-sm transition ${
                activeTab === 'wallets'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-amber-200/50 hover:text-amber-300'
            }`}
            >
            Carteiras Conectadas ({wallets.length})
            </button>
            <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-6 font-semibold text-sm transition ${
                activeTab === 'settings'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-amber-200/50 hover:text-amber-300'
            }`}
            >
            Configurações da Conta
            </button>
        </div>

        {/* Conteúdo da Aba: NFTs */}
        {activeTab === 'nfts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { id: '1', title: 'Emerald Ape #842', price: '1.19 ETH', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500' },
                { id: '2', title: 'Violet Nomad #314', price: '1.39 ETH', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=500' },
                { id: '3', title: 'Ivory Baron #088', price: '1.79 ETH', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500' },
            ].map((item) => (
                <div key={item.id} className="bg-[#1a110a] border border-amber-900/30 rounded-xl overflow-hidden">
                <div className="h-64 bg-black/50 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex justify-between items-center">
                    <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <span className="text-xs text-emerald-400 font-semibold">{item.price}</span>
                    </div>
                    <a href="/details" className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs transition">
                    Ver Detalhes
                    </a>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* Conteúdo da Aba: Carteiras */}
        {activeTab === 'wallets' && (
            <div className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 space-y-4 max-w-3xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-white">Sua Lista de Carteiras Web3</h2>
                <button onClick={() => alert('Conectar nova carteira simulada')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition">
                + Adicionar Carteira
                </button>
            </div>

            {wallets.map((w) => (
                <div key={w.id} className="flex justify-between items-center bg-black/40 border border-amber-900/30 p-4 rounded-xl">
                <div>
                    <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{w.name}</span>
                    {w.primary && <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded">Principal</span>}
                    </div>
                    <span className="text-xs text-amber-200/50 block mt-1">{w.address} • Rede: {w.network}</span>
                </div>
                <button onClick={() => removeWallet(w.id)} className="text-red-400 hover:text-red-300 text-xs transition">
                    Desconectar
                </button>
                </div>
            ))}
            </div>
        )}

        {/* Conteúdo da Aba: Configurações */}
        {activeTab === 'settings' && (
            <div className="bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 max-w-2xl space-y-4">
            <h2 className="text-base font-bold text-white border-b border-amber-900/30 pb-3">Editar Perfil</h2>
            <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">E-mail de Notificações</label>
                <input type="email" defaultValue="colecionador@kurio.io" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Bio do Criador / Colecionador</label>
                <textarea rows={3} defaultValue="Entusiasta de arte digital e colecionador de edições limitadas." className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"></textarea>
            </div>
            <button onClick={() => alert('Alterações salvas com sucesso!')} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                Salvar Alterações
            </button>
            </div>
        )}
        </div>
    )
}

export default UserInfo