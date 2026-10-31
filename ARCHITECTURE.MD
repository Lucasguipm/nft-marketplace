# Arquitetura e decisões

Este documento descreve como o projeto funciona, as decisões tomadas e, principalmente, **o que não foi feito**. O estado de cada requisito está na tabela do [README](./README.md).

## Visão geral

```
Componentes (React)
      │ usam
Hooks (TanStack Query)  ── cache, estados de carregamento/erro, mutations
      │ chamam
Services (Axios)  ── única porta de saída HTTP; injeta token e identificação do visitante
      │ HTTP
MSW (service worker no navegador)  ── "servidor" simulado
      │ lê e grava
"Banco" simulado em memória + localStorage
```

Regra seguida: componentes, hooks e o cliente Axios **não contêm respostas fictícias nem caminhos alternativos de negócio**. Quem simula o servidor é só o MSW.

## Rotas

TanStack Router, com rotas definidas em código.

| Rota | Acesso | Observação |
|---|---|---|
| `/` | Público | Catálogo. Busca, categoria, ordenação e página ficam nos parâmetros da URL |
| `/nft/$id` | Público | Detalhe do NFT |
| `/cart` | Público | Carrinho de visitante ou de usuário |
| `/login` | Público | Login e cadastro; aceita `?redirect=` com caminho interno |
| `/checkout`, `/success`, `/profile` | **Privado** | Sem token, redireciona ao login guardando o endereço |
| qualquer outra | Público | Página 404 |

A proteção de rotas só verifica se existe um token guardado. A validade real da sessão é confirmada pela API.

**Busca na URL:** `validateSearch` aceita apenas valores válidos (categoria e ordenação conhecidas, página inteira maior que 1) e descarta o resto. A digitação na busca espera 350 ms antes de atualizar a URL, usando `replace` para não poluir o histórico. Mudar filtro, busca ou ordenação reinicia a página.

## Cache e estado do servidor (TanStack Query)

| Decisão | Valor | Motivo |
|---|---|---|
| `staleTime` | 30 s | Voltar a uma tela não refaz a requisição imediatamente |
| `gcTime` | 5 min | Dados sem uso são descartados |
| `retry` (consultas) | 1 | Uma nova tentativa para falhas transitórias |
| `retry` (mutations) | 0 | Nenhuma operação é repetida automaticamente |
| `refetchOnWindowFocus` | desligado | Evita recarregamentos inesperados |
| Lista de NFTs | `keepPreviousData` | A página anterior fica na tela, esmaecida, enquanto a próxima carrega |
| NFT inexistente (404) | sem retry | Repetir não adianta |
| Pedido pendente | polling a cada 1,5 s | Para quando o pedido chega a um estado final |

**Chaves de cache**

- Consultas de NFTs incluem **todos os parâmetros** na chave, então cada combinação tem seu próprio cache.
- Dados privados incluem o **id do usuário** (ou `guest`): `['favorites', userId]`, `['cart', owner]`, `['quote', owner]`, `['wallets', userId]`.
- A requisição recebe o `AbortSignal` da consulta: ao mudar os parâmetros, a requisição anterior é cancelada e uma resposta atrasada não sobrescreve a mais recente.

**Invalidação:** qualquer mudança no carrinho (adicionar, alterar quantidade, remover, cupom) invalida carrinho e cotação juntos. Criar um pedido invalida a lista de pedidos.

**Atualização otimista:** feita nos **favoritos**. A UI muda na hora; se a API falha, o estado anterior é restaurado e uma mensagem aparece. Só essa interação usa atualização otimista.

## Sessão

- O login devolve um token, guardado no `localStorage` (`kurio-token`). O Axios o envia em toda requisição.
- Ao abrir o app, a consulta `['session']` pergunta à API quem é o usuário. Assim a sessão sobrevive a refresh.
- **Expiração:** se uma resposta 401 chega com um token guardado, o token é apagado e o app avisa o layout raiz. Ele limpa os dados privados do cache e, se a tela atual é privada, leva ao login com `?redirect=` para retomar depois.
- **Logout e troca de usuário:** removem do cache favoritos, carrinho, cotação, carteiras e pedidos, mesmo que a chamada de logout falhe.
- **Senhas:** o mock guarda apenas hash (SHA-256 com sal fixo). É suficiente para a simulação, **não** é um esquema de senha real.

## Carrinho

O carrinho vive no "servidor" simulado, não no navegador, e é identificado por dono:

- **Usuário logado:** pelo id da conta.
- **Visitante:** pelo cabeçalho `X-Guest-Id`, um UUID guardado no `localStorage`.

Ao entrar, o front chama `POST /cart/merge`: os itens do visitante são somados aos da conta, respeitando o estoque, e o carrinho do visitante é apagado. Cada item é uma linha por NFT + edição, com limite de 10 unidades e de acordo com o estoque.

**Cotação:** `POST /quote` devolve os itens, subtotal, desconto, taxa de rede (0,016 ETH fixa), total, problemas de disponibilidade e um `quoteId`. O front **nunca recalcula** valores: exibe o que a API devolve. O `quoteId` muda sempre que algo relevante muda (preço, estoque, quantidade, cupom).

## Valores em ETH

Valores trafegam como **strings decimais** (`"1.53"`). No servidor simulado, os cálculos usam BigInt com 18 casas (`src/mocks/eth.ts`), então não há erro de ponto flutuante. A ordenação por preço usa `Number` apenas para comparar, sem fazer contas.

## Pedido, idempotência e recuperação

1. **Revisão:** o usuário vê a cotação e aprova. O `quoteId` aprovado é enviado no pedido.
2. **Criação:** `POST /orders` exige o cabeçalho `Idempotency-Key`. O servidor:
   - se já conhece a chave com o mesmo conteúdo, devolve o **mesmo pedido**;
   - se a chave foi usada com conteúdo diferente, responde 409 (`idempotency_conflict`);
   - revalida a cotação: se mudou, responde 409 (`quote_changed`) com a nova cotação; se algo ficou indisponível, 409 (`availability_conflict`).
3. **Pendente:** o pedido nasce `pending`. Cerca de 2,5 s depois a "rede" o decide como `confirmed` ou `declined`. Esses estados são **terminais**.
4. **Efeitos da confirmação:** baixa o estoque, gera um hash de transação simulado e remove do carrinho **só** os itens e quantidades comprados. Em recusa, o carrinho fica intacto.
5. **Recibo:** o pedido guarda um snapshot (itens, preços, totais). Mudanças posteriores no catálogo não o alteram.

**Chave de idempotência no cliente:** gerada uma vez por tentativa e guardada no `sessionStorage`, indexada por um hash do conteúdo. Clique repetido, timeout e refresh reaproveitam a mesma chave. Depois de um estado final, a chave é renovada para permitir nova tentativa.

**Cotação desatualizada:** na revisão, o front guarda o `quoteId` aprovado. Se a cotação atual diferir, o botão de confirmar fica bloqueado até o usuário revisar de novo.

**Recuperação:** o checkout consulta `GET /orders?status=pending` ao abrir. Se existir um pedido pendente (após refresh ou queda de conexão), a tela o retoma e continua acompanhando, sem criar outro.

**A confirmação só aparece para pedido confirmado:** `/success?order=...` mostra o recibo apenas se o status for `confirmed`; pendente e recusado têm telas próprias.

## Mocks (MSW)

- Ligados em desenvolvimento **e** no build publicado, porque o service worker é servido de `public/mockServiceWorker.js`.
- Os dados ficam em memória e são persistidos no `localStorage` (`kurio-mock-db-v2`) para sobreviver a refresh. `resetMocks=1` ou `kurioMocks.reset()` restauram o cenário conhecido.
- Dados de fixture: 24 NFTs determinísticos (4 categorias, edições com estoques diferentes, alguns com edição esgotada) e 2 usuários.
- **Imagens geradas localmente** como SVG embutido: nenhuma requisição a hosts externos. A imagem do destaque da página inicial é `public/nft.png`.
- Cenários de rede e falha: ver tabela no README.

## Contratos REST

Todas as chamadas passam pelo Axios (`baseURL` fictícia `https://api.kurio-nft-mock.local`, timeout de 10 s).

| Método e caminho | Auth | Resumo | Erros relevantes |
|---|---|---|---|
| `POST /auth/register` | não | Cria conta e abre sessão | 422 validação por campo, 409 e-mail já cadastrado |
| `POST /auth/login` | não | Abre sessão | 401 credenciais inválidas |
| `GET /auth/me` | sim | Usuário da sessão | 401 |
| `POST /auth/logout` | sim | Encerra a sessão | — |
| `GET /nfts` | não | Lista com `q`, `category`, `sort`, `page`, `pageSize` | 500 (cenário) |
| `GET /nfts/:id` | não | Detalhe | 404 |
| `GET /favorites` | sim | Ids favoritados | 401 |
| `PUT /favorites/:id` | sim | Favorita | 401, 404, 500 (cenário) |
| `DELETE /favorites/:id` | sim | Remove o favorito | 401, 500 (cenário) |
| `GET /cart` | não* | Itens e cupom | — |
| `POST /cart/items` | não* | Soma quantidade | 409 estoque, 422 |
| `PUT /cart/items` | não* | Define quantidade (0 remove) | 409 estoque, 422 |
| `DELETE /cart/items/:nftId/:edition` | não* | Remove o item | — |
| `PUT /cart/coupon` | não* | Aplica cupom | 404 inválido, 410 expirado |
| `DELETE /cart/coupon` | não* | Remove cupom | — |
| `POST /cart/merge` | sim | Une o carrinho do visitante ao da conta | 401 |
| `POST /quote` | não* | Cotação do carrinho | — |
| `GET /wallets` | sim | Carteiras da conta | 401 |
| `POST /wallets/:id/connect` | sim | Simula conexão | 403 recusada (cenário), 404 |
| `POST /wallets/:id/disconnect` | sim | Simula desconexão | — |
| `POST /orders` | sim | Cria pedido (exige `Idempotency-Key`) | 400, 409 (`idempotency_conflict`, `quote_changed`, `availability_conflict`, `empty_cart`), 422 |
| `GET /orders` | sim | Lista, com filtro `status` | 401 |
| `GET /orders/:id` | sim | Estado e recibo | 404 (inclusive pedido de outro usuário) |

\* Sem login, o dono do carrinho é identificado por `X-Guest-Id`.

Os contratos não têm documentação em formato OpenAPI; os tipos estão em `src/services/types.ts`.

## Acessibilidade: o que foi feito (sem auditoria)

- Campos com `label` e erros ligados por `aria-describedby`, com `aria-invalid`.
- Resultados da busca, mutations e estados do pedido anunciados por regiões `aria-live` (`role="status"` e `role="alert"`).
- Foco visível em todos os elementos interativos.
- Botões de filtro, edição e favorito com `aria-pressed`.
- Skeletons respeitam `prefers-reduced-motion` e têm as mesmas dimensões do conteúdo, para evitar deslocamento de layout.
- Imagens com texto alternativo quando relevantes; decorativas com `alt=""`.

**Não verificado:** contraste de cores, leitor de tela, navegação completa por teclado, zoom, Lighthouse. Não há diálogos nem drawers no projeto, então o controle de foco nesses componentes não se aplica.

## Desvios do layout e do enunciado

- Removi da interface os botões de login social e "Esqueceu a senha?", porque as funções não existem e não devem parecer funcionar. O mesmo vale para links de páginas fora do escopo no cabeçalho.
- O botão "Comprar" do detalhe virou "Adicionar ao carrinho".
- No pagamento, o campo livre de endereço da carteira virou uma lista das carteiras cadastradas, como o enunciado pede.
- O cabeçalho foi unificado em um componente só.
- **Não comparei as telas com o Figma de forma sistemática.** Podem existir diferenças de espaçamento e tipografia.
- Telas de perfil e carteiras: **apenas visuais**, com as ações desabilitadas.

## Limitações conhecidas e dívida técnica

**Requisitos do enunciado não atendidos**
- **Socket.IO e `nft.updated`/`order.updated`:** não implementados. Hoje, preço e estoque só mudam na tela quando a consulta é refeita; o pedido é acompanhado por polling. A reconciliação entre REST e eventos, a tolerância a eventos duplicados ou antigos e o isolamento de eventos entre usuários **não existem**.
- **Playwright e regressão visual:** nenhum teste automatizado.
- **Lighthouse:** nenhuma medição, portanto não sei as pontuações.
- **shadcn/ui:** não usado.
- **Edição de perfil, avatar, alteração de senha e cadastro/edição de carteiras:** não implementados.
- **`@mswjs/socket.io-binding`:** não instalado.

**Limitações da simulação**
- O "banco" fica em memória por aba e é gravado no `localStorage`. Com **duas abas abertas**, uma pode sobrescrever o que a outra gravou.
- A decisão do pedido depende de um `setTimeout`; se a página for fechada antes, a decisão é aplicada na próxima consulta ao pedido.
- Depois de um pagamento recusado, se a página for recarregada e a compra confirmada de novo sem clicar em "Tentar novamente", a chave de idempotência antiga devolve o mesmo pedido recusado.
- O carrinho de visitante é identificado por um UUID no navegador, sem nenhuma proteção.

**Outros pontos**
- Sem tratamento de pedidos antigos ou histórico de compras.
- Imagens são ilustrações geradas, não os assets do Figma.
- Não revisei a estrutura de componentes das telas originais (Perfil, por exemplo) além do necessário.

## Próximos passos, se houvesse mais tempo

1. Socket.IO com MSW, eventos versionados e reconciliação com REST.
2. Testes Playwright dos fluxos principais (compra completa, falha de pagamento, clique repetido, timeout).
3. Perfil e carteiras com API e validação.
4. shadcn/ui nos componentes de formulário e botões.
5. Auditoria Lighthouse e correção do que ela apontar.
6. Revisão visual contra o Figma em 390, 768 e 1440 px.