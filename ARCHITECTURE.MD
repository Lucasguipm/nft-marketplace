# 🏛️ Arquitetura do Projeto - Kurio NFT Marketplace

Este documento descreve as decisões arquiteturais, o padrão de organização de pastas e os princípios de engenharia aplicados no desenvolvimento da aplicação.

---

## 📂 Estrutura de Pastas e Separação de Responsabilidades

O projeto adota uma arquitetura modularizada, separando claramente as **Rotas** (camada de integração com o router) dos **Componentes Visuais** (camada de UI reutilizável) e dos **Serviços** (camada de dados e comunicação HTTP).

```text
src/
├── assets/             # Recursos estáticos e imagens
├── components/         # Componentes visuais desacoplados por domínio
│   ├── AuthComponents/ # Componentes de Login e Registo
│   ├── CartComponents/ # Componentes da tabela e resumo do carrinho
│   ├── DetailsComponents/ # Galeria e ações do NFT
│   ├── HomeComponents/ # Hero banner e grid do catálogo
│   └── ProfileComponents/ # Estatísticas e gestão de carteiras
├── mocks/              # Dados simulados e handlers de rede
├── routes/             # Componentes de página (ligação ao TanStack Router)
├── services/           # Configuração do Axios e serviços de API (nftService.ts)
├── App.tsx             # Componente raiz
├── main.tsx            # Ponto de entrada e renderização do React DOM
├── router.tsx          # Configuração da árvore de rotas (TanStack Router)
└── index.css           # Configurações globais e diretivas do Tailwind CSS