# 🎮 NFT Marketplace (Jungle Gaming)

> Plataforma web profissional de comércio de NFTs focada em arte digital e colecionáveis de jogos, desenvolvida como teste técnico de Frontend.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna e orientada a boas práticas de mercado:

* **React** + **TypeScript** — Tipagem estática robusta e componentes reativos.
* **Vite** — Empacotador e servidor de desenvolvimento ultrarrápido.
* **Tailwind CSS** — Estilização modular e design system responsivo em Dark Mode.
* **TanStack Router** — Sistema de rotas tipado e baseado em árvore de navegação.
* **Axios** — Cliente HTTP para integração com APIs e serviços remotos.

---

## 🎨 Identidade Visual & Design System

O marketplace segue rigorosamente uma paleta de cores temática de alta fidelidade visual (Dark Mode com tons de âmbar e castanho):
* **Fundo Principal**: `#110a05`
* **Textos e Destaques**: `#e6d5c3` / `#b45309`
* **Acabamentos**: Bordas em tons de âmbar escuro com efeito *glassmorphism*.

---

## 🧭 Módulos e Rotas da Aplicação

1. **Início / Mercado (`/`)**: Catálogo dinâmico de NFTs em destaque e listagem completa.
2. **Detalhes do NFT (`/details`)**: Galeria de visualização com miniaturas, informações do criador e seletor de edições.
3. **Carrinho de Compras (`/cart`)**: Gestão de edições em tempo real, aplicação de cupom promocional (`KURIO10`) e cálculo dinâmico de taxas de rede.
4. **Pagamento / Checkout (`/checkout`)**: Formulário de dados do colecionador, seleção de rede blockchain e provedor de carteira (MetaMask, Coinbase Wallet, WalletConnect).
5. **Confirmação de Pedido (`/success`)**: Recibo detalhado da transação com hash simulado na blockchain.
6. **Autenticação (`/login`)**: Sistema unificado de abas para **Entrar** e **Criar conta**, incluindo acessos sociais.
7. **Perfil do Colecionador (`/profile`)**: Painel do utilizador com estatísticas de portefólio, gestão de carteiras Web3 e configurações de conta.

