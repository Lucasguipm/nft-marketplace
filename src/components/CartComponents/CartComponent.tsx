import { useState } from 'react';

interface CartItem {
  id: string;
  title: string;
  tokenId: string;
  price: number;
  editions: number;
  image: string;
}

export function CartComponent() {
    const [items, setItems] = useState<CartItem[]>([
        {
          id: '1',
          title: 'Emerald Ape #842',
          tokenId: '#0042',
          price: 1.19,
          editions: 2,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
        },
        {
          id: '2',
          title: 'Violet Nomad #314',
          tokenId: '#0314',
          price: 1.39,
          editions: 6,
          image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200&auto=format&fit=crop',
        },
        {
          id: '3',
          title: 'Ivory Baron #088',
          tokenId: '#0088',
          price: 1.79,
          editions: 9,
          image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=200&auto=format&fit=crop',
        }
      ]);
    
      const [promoCode, setPromoCode] = useState('');
      const [discount, setDiscount] = useState(0);
    
      // Funções para gerir quantidade de edições
      const updateEditions = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
          if (item.id === id) {
            const newEditions = Math.max(1, item.editions + delta);
            return { ...item, editions: newEditions };
          }
          return item;
        }));
      };
    
      const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
      };
    
      const applyPromo = () => {
        if (promoCode.trim().toUpperCase() === 'KURIO10') {
          setDiscount(0.1); // 10% de desconto
        } else {
          alert('Código promocional inválido (experimente KURIO10)');
        }
      };
    
      // Cálculos financeiros
      const subtotal = items.reduce((acc, item) => acc + (item.price * item.editions), 0);
      const discountAmount = subtotal * discount;
      const networkFee = items.length > 0 ? 0.016 : 0;
      const total = subtotal - discountAmount + networkFee;
  
  return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] p-6 md:p-12">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-8 border-b border-amber-900/30 pb-4">
        <div className="text-xl font-bold tracking-widest text-amber-500">KURIO</div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="/" className="hover:text-amber-400 transition">Início</a>
          <a href="/" className="hover:text-amber-400 transition">Mercado</a>
          <a href="/cart" className="text-amber-400 border-b-2 border-amber-500 pb-1">Carrinho</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/profile" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
            Perfil
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="text-xs text-amber-200/50 mb-8">
        <a href="/" className="hover:underline">Início</a> / <a href="/" className="hover:underline">Mercado</a> / <span className="text-amber-400">Carrinho</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tabela de NFTs no Carrinho (Esquerda) */}
        <div className="lg:col-span-8 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6">
          <div className="grid grid-cols-12 text-xs font-semibold text-amber-500 uppercase tracking-wider pb-4 border-b border-amber-900/30 mb-4">
            <span className="col-span-6">NFTs</span>
            <span className="col-span-2 text-center">Preço</span>
            <span className="col-span-2 text-center">Edições</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-amber-200/60">
              O seu carrinho está vazio. <br />
              <a href="/" className="text-amber-400 underline mt-2 inline-block">Explorar o mercado</a>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="grid grid-cols-12 items-center py-4 border-b border-amber-900/20 last:border-none gap-2">
                
                {/* Informação do NFT */}
                <div className="col-span-6 flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-amber-900/40" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <span className="text-xs text-amber-200/50">ID do token: {item.tokenId}</span>
                  </div>
                </div>

                {/* Preço Unitário */}
                <div className="col-span-2 text-center text-sm text-amber-200/90">
                  {item.price.toFixed(2)} ETH
                </div>

                {/* Seletor de Edições (+ / -) */}
                <div className="col-span-2 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => updateEditions(item.id, -1)}
                    className="w-6 h-6 rounded bg-black/40 border border-amber-900/40 text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold text-white">{item.editions}</span>
                  <button 
                    onClick={() => updateEditions(item.id, 1)}
                    className="w-6 h-6 rounded bg-black/40 border border-amber-900/40 text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal e Remover */}
                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className="text-sm font-bold text-emerald-400">
                    {(item.price * item.editions).toFixed(2)} ETH
                  </span>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 text-xs transition"
                    title="Remover item"
                  >
                    🗑️
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Resumo da Carteira / Checkout (Direita) */}
        <div className="lg:col-span-4 bg-[#1a110a] border border-amber-900/40 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 border-b border-amber-900/30 pb-3">Resumo da carteira</h2>

            {/* Código Promocional */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Código promocional</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ex: KURIO10" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-black/40 border border-amber-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button 
                  onClick={applyPromo}
                  className="bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-amber-900/50"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Linhas de Valores */}
            <div className="space-y-3 text-sm border-t border-amber-900/30 pt-4 mb-6">
              <div className="flex justify-between text-amber-200/70">
                <span>Subtotal</span>
                <span className="text-white font-medium">{subtotal.toFixed(2)} ETH</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto ({discount * 100}%)</span>
                  <span>- {discountAmount.toFixed(2)} ETH</span>
                </div>
              )}
              <div className="flex justify-between text-amber-200/70">
                <span>Taxa de rede</span>
                <span className="text-white font-medium">{networkFee.toFixed(3)} ETH</span>
              </div>
              <div className="text-[10px] text-amber-200/40 text-right">Taxa estimada na Ethereum</div>
            </div>

            <div className="border-t border-amber-900/30 pt-4 flex justify-between items-center mb-8">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-xl font-extrabold text-emerald-400">{total.toFixed(3)} ETH</span>
            </div>
          </div>

          {/* Botões de Ação Final */}
          <div className="space-y-3">
            <a 
              href="/checkout" 
              className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-3 rounded-xl font-medium transition shadow-lg shadow-amber-900/20"
            >
              Pagamento
            </a>
            <a 
              href="/" 
              className="block w-full text-center text-xs text-amber-400/80 hover:text-amber-400 py-2 transition"
            >
              Continuar explorando
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

