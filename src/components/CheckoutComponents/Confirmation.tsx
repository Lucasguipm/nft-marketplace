export function Confirmation() {
    const orderId = "KURIO-984210";
    const transactionHash = "0x71c9a4b2e811f32a09c8d76e4f3a21b8c9d0e1f2";

  return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Card de Confirmação */}
      <div className="relative z-10 w-full max-w-lg bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 md:p-10 shadow-2xl text-center">
        
        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 text-3xl">
          ✓
        </div>

        <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block mb-1">Transação Concluída</span>
        <h1 className="text-3xl font-extrabold text-white mb-3">Compra Realizada com Sucesso!</h1>
        <p className="text-xs text-amber-200/60 mb-8">
          Obrigado por apoiar criadores digitais na Kurio. Os seus NFTs já estão a ser transferidos para a sua carteira Web3.
        </p>

        {/* Detalhes do Recibo */}
        <div className="bg-black/40 border border-amber-900/30 rounded-xl p-4 text-left space-y-3 mb-8 text-xs">
          <div className="flex justify-between">
            <span className="text-amber-200/50">Número do Pedido:</span>
            <span className="text-white font-mono font-bold">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-200/50">Rede:</span>
            <span className="text-white font-medium">Ethereum (Mainnet)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-200/50">Total Pago:</span>
            <span className="text-emerald-400 font-bold">26.846 ETH</span>
          </div>
          <div className="pt-2 border-t border-amber-900/20">
            <span className="text-amber-200/50 block mb-1">Hash da Transação (TxID):</span>
            <span className="text-amber-400 font-mono text-[10px] break-all block bg-black/60 p-2 rounded border border-amber-900/20">
              {transactionHash}
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <a
            href="/profile"
            className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-amber-900/20 text-center text-sm"
          >
            Ver no meu Perfil
          </a>
          <a
            href="/"
            className="block w-full bg-black/40 hover:bg-black/60 border border-amber-900/40 text-amber-300 font-medium py-3 rounded-xl transition text-center text-sm"
          >
            Voltar ao Início
          </a>
        </div>

      </div>
    </div>
  )
}

export default Confirmation