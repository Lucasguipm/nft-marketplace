import React from 'react'
import { useState } from 'react';

export function Login() {
    const [isLogin, setIsLogin] = useState(true);
    
      // Estados do formulário
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [username, setUsername] = useState('');
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
          alert(`Login efetuado com sucesso para: ${email}`);
        } else {
          if (password !== confirmPassword) {
            alert('As palavras-passe não coincidem!');
            return;
          }
          alert(`Conta criada com sucesso para: ${username}`);
        }
      };

    return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Elementos visuais de fundo */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200")' }}></div>

      {/* Card Principal do Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Abas Entrar / Criar conta */}
        <div className="flex border-b border-amber-900/30 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-center font-semibold text-sm transition ${
              isLogin 
                ? 'text-amber-500 border-b-2 border-amber-500' 
                : 'text-amber-200/50 hover:text-amber-300'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-center font-semibold text-sm transition ${
              !isLogin 
                ? 'text-amber-500 border-b-2 border-amber-500' 
                : 'text-amber-200/50 hover:text-amber-300'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Descrição */}
        <p className="text-xs text-amber-200/60 text-center mb-6">
          {isLogin 
            ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.' 
            : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <input
                type="text"
                required
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              required
              placeholder={isLogin ? 'contato@email.com' : 'Digite seu e-mail'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <input
              type="password"
              required
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
            />
          </div>

          {!isLogin && (
            <div>
              <input
                type="password"
                required
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <a href="#" className="text-xs text-amber-400/80 hover:text-amber-400 transition">
                Esqueceu a senha?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-amber-900/20 mt-2"
          >
            {isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {/* Divisor social */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-900/30"></div>
          </div>
          <span className="relative bg-[#1a110a] px-3 text-xs text-amber-200/40 uppercase tracking-wider">
            Ou continue com
          </span>
        </div>

        {/* Botões Sociais */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-black/40 hover:bg-black/60 border border-amber-900/40 py-2.5 rounded-xl text-xs font-medium text-amber-200/80 transition flex items-center justify-center gap-2"
          >
            <span className="text-amber-500 font-bold">G</span> Continuar com Google
          </button>
          <button
            type="button"
            className="w-full bg-black/40 hover:bg-black/60 border border-amber-900/40 py-2.5 rounded-xl text-xs font-medium text-amber-200/80 transition flex items-center justify-center gap-2"
          >
            <span className="text-blue-500 font-bold">f</span> Continuar com Facebook
          </button>
        </div>

        {/* Link para voltar ao Início */}
        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-amber-400 underline hover:text-amber-300">
            Voltar ao Início
          </a>
        </div>

      </div>
    </div>
  );

}

