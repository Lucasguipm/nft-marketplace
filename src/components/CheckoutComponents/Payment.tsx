import React from 'react'
import { useState } from 'react';

export function Payment() {
    const [selectedWallet, setSelectedWallet] = useState('MetaMask');
    const [network, setNetwork] = useState('Ethereum');
    
    const handleConfirmPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Compra confirmada com sucesso via ${selectedWallet} na rede ${network}!`);
    };
  return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] p-6 md:p-12">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-8 border-b border-amber-900/30 pb-4">
        <div className="text-xl font-bold tracking-widest text-amber-500">KURIO</div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="/" className="hover:text-amber-400 transition">Início</a>
          <a href="/cart" className="hover:text-amber-400 transition">Carrinho</a>
          <a href="/checkout" className="text-amber-400 border-b-2 border-amber-500 pb-1">Pagamento</a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs text-amber-200/70">Conectado</span>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="text-xs text-amber-200/50 mb-8">
        <a href="/" className="hover:underline">Início</a> / <a href="/cart" className="hover:underline">Mercado</a> / <span className="text-amber-400">Pagamento</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Perfil do colecionador e Pagamento</h1>

      <form onSubmit={handleConfirmPurchase} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Dados e Carteira (Esquerda) */}
        <div className="lg:col-span-8 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-amber-900/30 pb-3">Dados da transação</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Nome de exibição *</label>
              <input type="text" required placeholder="Ex: Colecionador Kurio" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Nome de usuário *</label>
              <input type="text" required placeholder="Ex: @kurio_collector" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Rede *</label>
              <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500">
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
                <option value="Solana">Solana</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Nome do perfil *</label>
              <input type="text" required placeholder="Perfil principal" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Endereço da carteira *</label>
              <input type="text" required placeholder="Endereço 0x da carteira" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">E-mail *</label>
              <input type="email" required placeholder="contato@email.com" className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Observação do colecionador (opcional)</label>
            <textarea rows={3} placeholder="Notas adicionais para a transação..." className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"></textarea>
          </div>
        </div>

        {/* Resumo e Seleção de Carteira (Direita) */}
        <div className="lg:col-span-4 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 border-b border-amber-900/30 pb-3">Seus NFTs</h2>

            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
              {[
                { name: 'Emerald Ape #842', editions: 'x 2', price: '2.38 ETH' },
                { name: 'Violet Nomad #314', editions: 'x 6', price: '8.34 ETH' },
                { name: 'Ivory Baron #088', editions: 'x 9', price: '16.11 ETH' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-amber-900/20 pb-2">
                  <div>
                    <span className="text-white font-medium block">{item.name}</span>
                    <span className="text-amber-200/50">{item.editions}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-amber-900/30 pt-4 mb-4">
              <div className="flex justify-between text-amber-200/70">
                <span>Subtotal</span>
                <span className="text-white font-medium">26.83 ETH</span>
              </div>
              <div className="flex justify-between text-amber-200/70">
                <span>Desconto do lançamento</span>
                <span className="text-emerald-400">(-) 00.00</span>
              </div>
              <div className="flex justify-between text-amber-200/70">
                <span>Taxa de rede</span>
                <span className="text-white font-medium">0.016 ETH</span>
              </div>
            </div>

            <div className="border-t border-amber-900/30 pt-4 flex justify-between items-center mb-6">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-xl font-extrabold text-emerald-400">26.846 ETH</span>
            </div>

            {/* Seleção de Provedor de Carteira */}
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Carteira e rede</label>
              {['MetaMask', 'Coinbase Wallet', 'WalletConnect'].map((wallet) => (
                <button
                  type="button"
                  key={wallet}
                  onClick={() => setSelectedWallet(wallet)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition flex justify-between items-center ${
                    selectedWallet === wallet 
                      ? 'bg-amber-600/20 border-amber-500 text-white font-medium' 
                      : 'bg-black/40 border-amber-900/40 text-amber-200/70 hover:border-amber-600'
                  }`}
                >
                  <span>{wallet}</span>
                  {selectedWallet === wallet && <span className="text-amber-400">●</span>}
                </button>
              ))}
            </div>
          </div>
          
          <a href="/success">
            <button 
            type="button" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-medium transition shadow-lg shadow-amber-900/20 text-center"
            >
            Confirmar compra
            </button>
          </a>
          
        </div>

      </form>
    </div>
  )
}

export default Payment