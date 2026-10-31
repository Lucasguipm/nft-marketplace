# Kurio — Marketplace de NFTs (desafio frontend)

Implementação parcial do desafio de frontend da Jungle Gaming: um marketplace de NFTs em React e TypeScript, com API **totalmente simulada** (MSW). Nenhuma blockchain, carteira ou pagamento reais.

- **Aplicação publicada:** https://nft-marketplace-lgpm.vercel.app/
- **Repositório:** https://github.com/Lucasguipm/nft-marketplace

> **Leia isto primeiro:** este projeto **não cobre todo o enunciado**. Faltam tempo real com Socket.IO, testes E2E com Playwright, auditoria Lighthouse, shadcn/ui e a edição de perfil e carteiras. A tabela abaixo diz exatamente o que funciona e o que não. Detalhes das decisões e das limitações estão em [ARCHITECTURE.md](./ARCHITECTURE.md).

## O que funciona e o que não

| Área | Estado | Observação |
|---|---|---|
| Catálogo: busca, categoria, ordenação e paginação | ✅ Funciona | Tudo fica na URL; sobrevive a refresh e ao botão voltar |
| Detalhe do NFT | ✅ Funciona | Acesso direto, NFT inexistente (404), edição esgotada, limite de quantidade |
| Favoritos | ✅ Funciona | Exige login; atualização otimista com rollback em caso de falha |
| Cadastro, login, logout e sessão | ✅ Funciona | Sessão recuperada após refresh; retorno ao fluxo anterior após o login |
| Carrinho | ✅ Funciona | Visitante e usuário; persiste após refresh; itens do visitante passam para a conta ao entrar |
| Cupom, subtotal, desconto, taxa e total | ✅ Funciona | Valores vêm da API (cotação); o front só exibe |
| Pagamento: formulário, revisão e confirmação | ✅ Funciona | Validação de campos, seleção de carteira e rede, conexão simulada |
| Pedido com idempotência | ✅ Funciona | Reenvio com a mesma chave devolve o mesmo pedido; pedido pendente é recuperado após refresh |
| Valores em ETH sem perda de precisão | ✅ Funciona | Strings decimais; cálculos em BigInt (no servidor simulado) |
| Mocks com MSW e cenários de falha | ✅ Funciona | Ligado também no build publicado; ver "Cenários" abaixo |
| Skeleton com shimmer, estados de erro e vazio | ⚠️ Parcial | Catálogo, detalhe, carrinho, pagamento e recibo; não revisei cada tela contra o Figma |
| Acessibilidade | ⚠️ Parcial | Labels, erros associados aos campos, regiões `aria-live`, foco visível; **não foi auditada** com ferramenta |
| Responsividade | ⚠️ Parcial | Layouts com classes responsivas do Tailwind; **não verifiquei** formalmente 390, 768 e 1440 px |
| Perfil (dados, avatar, senha) | ❌ Só visual | A tela existe, mas as ações estão desabilitadas |
| Carteiras (cadastro e edição) | ❌ Não feito | O checkout usa carteiras já cadastradas no mock; conta nova recebe uma carteira padrão |
| Tempo real com Socket.IO | ❌ Não feito | `socket.io-client` está instalado, mas **não é usado**. O pedido é acompanhado por polling |
| Eventos `nft.updated` e `order.updated` | ❌ Não feito | Consequência do item acima |
| Testes E2E com Playwright e regressão visual | ❌ Não feito | O projeto não tem testes automatizados |
| Auditoria Lighthouse | ❌ Não feito | Não rodei as medições |
| shadcn/ui | ❌ Não usado | A interface é Tailwind puro, sem a biblioteca |
| Fidelidade ao Figma | ⚠️ Não medida | Segui o layout, mas não fiz comparação detalhada |

**O que foi testado:** manualmente, em desenvolvimento, no Chrome (desktop) [ajuste esta frase para o que você realmente testou, inclusive o site publicado].

## Stack realmente usada

React 19, TypeScript, Vite, TanStack Router, TanStack Query, Axios, MSW e Tailwind CSS 3.

Instalado mas **não usado**: `socket.io-client`, `lucide-react`.
Do enunciado e **ausente**: shadcn/ui, Socket.IO (uso real), `@mswjs/socket.io-binding`, Playwright, Lighthouse.

## Como rodar

Pré-requisito: uma versão LTS atual do Node.js.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

O arquivo `public/mockServiceWorker.js` é necessário para os mocks e **está versionado**. Se ele sumir, gere de novo com:

```bash
npx msw init public/ --save
```

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento, já com os mocks |
| `npm run build` | Checagem de tipos (`tsc -b`) e build de produção |
| `npm run preview` | Serve o build localmente (os mocks também funcionam aqui) |
| `npm run lint` | Linter (oxlint) |

Não há comando de testes nem de auditoria, porque esses itens não foram feitos.

### Variáveis de ambiente

| Variável | Padrão | Efeito |
|---|---|---|
| `VITE_ENABLE_MOCKS` | ligado | Defina como `false` para desligar o MSW. A API é fictícia, então o app deixa de funcionar |

## Credenciais fictícias

| Usuário | E-mail | Senha |
|---|---|---|
| Ana | `ana@kurio.io` | `Senha@123` |
| Bruno | `bruno@kurio.io` | `Senha@123` |

Também é possível criar uma conta nova pelo cadastro. As senhas ficam no mock apenas como hash.

**Cupons:** `KURIO10` (10% de desconto), `KURIO20` (expirado, para testar o erro). Qualquer outro código é inválido.

## Cenários de rede e falhas

Os cenários são configuráveis e reproduzíveis. Escolha de uma destas formas:

- **Pela URL:** `http://localhost:5173/?scenario=slow`
- **Pelo console do navegador:** `kurioMocks.setScenario('slow')`

O cenário fica salvo no navegador. Para voltar ao normal: `?scenario=default`.

| Cenário | Efeito |
|---|---|
| `default` | Respostas normais (cerca de 250 ms) |
| `slow` | Todas as chamadas levam 2,5 s |
| `jitter` | Latência variável (200 ms a 2,7 s); respostas podem chegar fora de ordem |
| `empty` | A listagem de NFTs volta vazia |
| `server-error` | A listagem responde HTTP 500 |
| `offline` | Todas as chamadas falham como queda de conexão |
| `session-expired` | Rotas autenticadas respondem HTTP 401 |
| `favorites-fail` | Favoritar e desfavoritar respondem 500 (exercita o rollback) |
| `wallet-rejected` | A carteira recusa a conexão |
| `payment-declined` | O pedido termina recusado; os itens continuam no carrinho |
| `order-timeout` | O pedido é criado, mas a resposta demora mais que o timeout de 10 s |

### Reproduzir os fluxos de falha

- **Erro e recuperação do catálogo:** `?scenario=server-error`, depois "Tentar novamente" após voltar para `default`.
- **Skeleton:** `?scenario=slow` e recarregue a página inicial.
- **Rollback de favorito:** entre, use `?scenario=favorites-fail` e favorite um NFT.
- **Sessão expirada:** entre, vá ao pagamento e ative `?scenario=session-expired`; você é levado ao login e volta ao pagamento depois.
- **Pagamento recusado:** `?scenario=payment-declined`, confirme uma compra.
- **Timeout com recuperação sem duplicar:** `?scenario=order-timeout`, confirme a compra, aguarde cerca de 10 s pela mensagem de demora e confirme de novo: o mesmo pedido é recuperado.
- **Cupom inválido ou expirado:** no carrinho, use `ABC` e `KURIO20`.

### Resetar os dados simulados

Os dados (usuários, favoritos, carrinhos, pedidos e sessões) ficam no `localStorage`. Para restaurar o estado inicial:

- abra `/?resetMocks=1`, ou
- rode `kurioMocks.reset()` no console.

## Deploy

Publicado na Vercel. O `vercel.json` redireciona todas as rotas para `index.html`, então refresh e acesso direto a qualquer tela funcionam. Os mocks funcionam no site publicado porque o service worker do MSW é servido de `public/`.

## Estrutura

```
src/
  components/   telas e componentes (Home, Detalhes, Carrinho, Pagamento, Confirmação, Login, Perfil)
  hooks/        hooks do TanStack Query (NFTs, sessão, favoritos, carrinho, pedidos)
  services/     chamadas HTTP com Axios e os tipos dos contratos
  mocks/        MSW: handlers, "banco" em localStorage, cenários, cotação e pedidos
  lib/          utilitários (chave de idempotência, hash curto)
  routes/       ponto de entrada de cada rota
  router.tsx    rotas, parâmetros de busca e proteção de rotas privadas
```

## Como este projeto foi feito

As telas e o layout partiram do Figma e foram montados por mim. A camada de integração (TanStack Query, Axios, MSW, sessão, carrinho, cotação e pedido idempotente) foi construída com ajuda de uma IA (Claude), que usei como assistente, e eu revisei, testei e estou estudando esse código. Escrevo isso porque prefiro ser transparente sobre o que fiz sozinho e o que aprendi no caminho.