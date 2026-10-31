import { http, HttpResponse } from 'msw';
import { API_URL } from '../config';
import { hashString } from '../lib/hash';
import { getCart, getDb, persist } from './db';
import type { StoredOrder } from './db';
import { cartOwner, currentUser, preflight, unauthorized } from './helpers';
import { COUPONS, buildQuote } from './pricing';
import { resolveIfDue, resolveOrder, toPublicOrder } from './orders';
import { getScenario, sleep } from './scenarios';
import { MAX_PER_ORDER, NETWORKS } from '../services/types';
import type { CartItem, CreateOrderInput, Network } from '../services/types';

const ORDER_DECISION_MS = 2500;

interface ItemBody {
  nftId?: string;
  edition?: string;
  quantity?: number;
}

function maxFor(stock: number) {
  return Math.min(stock, MAX_PER_ORDER);
}

export const commerceHandlers = [
  // ---------- Carrinho (visitante ou usuário) ----------
  http.get(`${API_URL}/cart`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const db = await getDb();
    return HttpResponse.json(getCart(db, owner));
  }),

  // Soma a quantidade informada à que já está no carrinho.
  // Usado por "Adicionar ao carrinho" e, com quantity negativa fora do escopo, nunca para remover.
  http.post(`${API_URL}/cart/items`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const body = (await request.json().catch(() => ({}))) as ItemBody;
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return HttpResponse.json({ message: 'Informe uma quantidade inteira maior que zero.' }, { status: 422 });
    }
    const db = await getDb();
    const nft = db.nfts.find((item) => item.id === body.nftId);
    const edition = nft?.editions.find((item) => item.label === body.edition);
    if (!nft || !edition) return HttpResponse.json({ message: 'NFT ou edição não encontrados.' }, { status: 404 });

    const cart = getCart(db, owner);
    const entry = cart.items.find((item) => item.nftId === nft.id && item.edition === edition.label);
    const next = (entry?.quantity ?? 0) + quantity;
    const limit = maxFor(edition.stock);
    if (edition.stock === 0) {
      return HttpResponse.json({ message: 'Esta edição está esgotada.', code: 'out_of_stock' }, { status: 409 });
    }
    if (next > limit) {
      return HttpResponse.json(
        { message: `Você pode ter no máximo ${limit} unidade(s) desta edição no carrinho.`, code: 'stock_limit' },
        { status: 409 },
      );
    }
    if (entry) entry.quantity = next;
    else cart.items.push({ nftId: nft.id, edition: edition.label, quantity: next } satisfies CartItem);
    persist();
    return HttpResponse.json(cart, { status: 201 });
  }),

  // Define a quantidade exata (0 remove o item).
  http.put(`${API_URL}/cart/items`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const body = (await request.json().catch(() => ({}))) as ItemBody;
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return HttpResponse.json({ message: 'A quantidade precisa ser um número inteiro.' }, { status: 422 });
    }
    const db = await getDb();
    const nft = db.nfts.find((item) => item.id === body.nftId);
    const edition = nft?.editions.find((item) => item.label === body.edition);
    if (!nft || !edition) return HttpResponse.json({ message: 'NFT ou edição não encontrados.' }, { status: 404 });

    const cart = getCart(db, owner);
    const index = cart.items.findIndex((item) => item.nftId === nft.id && item.edition === edition.label);
    if (quantity === 0) {
      if (index >= 0) cart.items.splice(index, 1);
    } else {
      const limit = maxFor(edition.stock);
      if (quantity > limit) {
        return HttpResponse.json(
          { message: `Disponibilidade máxima nesta edição: ${limit} unidade(s).`, code: 'stock_limit' },
          { status: 409 },
        );
      }
      if (index >= 0) cart.items[index].quantity = quantity;
      else cart.items.push({ nftId: nft.id, edition: edition.label, quantity });
    }
    persist();
    return HttpResponse.json(cart);
  }),

  http.delete(`${API_URL}/cart/items/:nftId/:edition`, async ({ request, params }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const db = await getDb();
    const cart = getCart(db, owner);
    cart.items = cart.items.filter(
      (item) => !(item.nftId === String(params.nftId) && item.edition === decodeURIComponent(String(params.edition))),
    );
    persist();
    return HttpResponse.json(cart);
  }),

  http.put(`${API_URL}/cart/coupon`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    const code = (body.code ?? '').trim().toUpperCase();
    const coupon = COUPONS[code];
    if (!code || !coupon) return HttpResponse.json({ message: 'Cupom inválido.' }, { status: 404 });
    if (coupon.expired) return HttpResponse.json({ message: 'Este cupom expirou.' }, { status: 410 });
    const db = await getDb();
    const cart = getCart(db, owner);
    cart.coupon = code;
    persist();
    return HttpResponse.json(cart);
  }),

  http.delete(`${API_URL}/cart/coupon`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const db = await getDb();
    const cart = getCart(db, owner);
    cart.coupon = null;
    persist();
    return HttpResponse.json(cart);
  }),

  // Ao entrar, os itens do visitante passam para a conta (respeitando o limite de estoque).
  http.post(`${API_URL}/cart/merge`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const guestKey = `guest:${request.headers.get('X-Guest-Id') ?? 'anon'}`;
    const db = await getDb();
    const guestCart = db.carts[guestKey];
    const userCart = getCart(db, user.id);
    if (guestCart) {
      for (const item of guestCart.items) {
        const stock = db.nfts.find((nft) => nft.id === item.nftId)?.editions.find((e) => e.label === item.edition)?.stock ?? 0;
        const entry = userCart.items.find((candidate) => candidate.nftId === item.nftId && candidate.edition === item.edition);
        const merged = Math.min((entry?.quantity ?? 0) + item.quantity, maxFor(stock));
        if (merged < 1) continue;
        if (entry) entry.quantity = merged;
        else userCart.items.push({ ...item, quantity: merged });
      }
      userCart.coupon ??= guestCart.coupon;
      delete db.carts[guestKey];
      persist();
    }
    return HttpResponse.json(userCart);
  }),

  // ---------- Cotação: a referência de preço para finalizar o pedido ----------
  http.post(`${API_URL}/quote`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const { owner } = await cartOwner(request);
    const db = await getDb();
    return HttpResponse.json(buildQuote(db, getCart(db, owner)));
  }),

  // ---------- Carteiras (exigem login) ----------
  http.get(`${API_URL}/wallets`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    return HttpResponse.json({ items: db.wallets[user.id] ?? [] });
  }),

  http.post(`${API_URL}/wallets/:id/connect`, async ({ request, params }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    if (!(db.wallets[user.id] ?? []).some((wallet) => wallet.id === String(params.id))) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }
    if (getScenario() === 'wallet-rejected') {
      return HttpResponse.json({ message: 'A carteira recusou a conexão. Tente novamente.' }, { status: 403 });
    }
    return HttpResponse.json({ connected: true });
  }),

  http.post(`${API_URL}/wallets/:id/disconnect`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Pedidos (exigem login) ----------
  http.post(`${API_URL}/orders`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();

    const key = request.headers.get('Idempotency-Key');
    if (!key) {
      return HttpResponse.json({ message: 'O cabeçalho Idempotency-Key é obrigatório.' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as Partial<CreateOrderInput>;
    const db = await getDb();

    // 1) Idempotência: mesma chave + mesmo conteúdo = mesmo pedido; mesmo conteúdo diferente = conflito.
    const payloadHash = hashString(JSON.stringify([body.quoteId, body.collector, body.walletId, body.network]));
    const idemKey = `${user.id}:${key}`;
    const existingId = db.idempotency[idemKey];
    if (existingId) {
      const existing = db.orders[existingId];
      if (existing.payloadHash !== payloadHash) {
        return HttpResponse.json(
          { message: 'Esta chave de idempotência já foi usada com outro conteúdo.', code: 'idempotency_conflict' },
          { status: 409 },
        );
      }
      await resolveIfDue(existing);
      return HttpResponse.json(toPublicOrder(existing), { status: 200 });
    }

    // 2) Validação dos campos do formulário.
    const fields: Record<string, string> = {};
    const collector = body.collector;
    if (!collector?.displayName || collector.displayName.trim().length < 2) {
      fields.displayName = 'Informe o nome de exibição (mínimo de 2 caracteres).';
    }
    if (!collector?.username || !/^@?[a-z0-9_]{3,20}$/i.test(collector.username.trim())) {
      fields.username = 'Use de 3 a 20 letras, números ou _.';
    }
    if (!collector?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collector.email)) {
      fields.email = 'Informe um e-mail válido.';
    }
    if (!NETWORKS.includes(body.network as Network)) fields.network = 'Escolha uma rede válida.';
    const wallet = (db.wallets[user.id] ?? []).find((item) => item.id === body.walletId);
    if (!wallet) fields.walletId = 'Escolha uma das suas carteiras.';
    if (Object.keys(fields).length > 0 || !collector || !wallet) {
      return HttpResponse.json({ message: 'Confira os campos destacados.', fields }, { status: 422 });
    }

    // 3) Revalida preço, disponibilidade, cupom e taxas contra o estado atual.
    const quote = buildQuote(db, getCart(db, user.id));
    if (quote.items.length === 0) {
      return HttpResponse.json({ message: 'Seu carrinho está vazio.', code: 'empty_cart' }, { status: 409 });
    }
    if (quote.hasIssues) {
      return HttpResponse.json(
        { message: 'Alguns itens ficaram indisponíveis. Revise o carrinho.', code: 'availability_conflict', quote },
        { status: 409 },
      );
    }
    if (quote.quoteId !== body.quoteId) {
      return HttpResponse.json(
        { message: 'Os valores mudaram desde a sua revisão. Confira e confirme novamente.', code: 'quote_changed', quote },
        { status: 409 },
      );
    }

    // 4) Cria o pedido (pendente). A "rede" decide em alguns segundos.
    const id = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const order: StoredOrder = {
      id,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: quote.items.map((item) => ({
        nftId: item.nftId,
        title: item.title,
        edition: item.edition,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      couponCode: quote.couponCode,
      networkFee: quote.networkFee,
      total: quote.total,
      network: body.network as Network,
      wallet: { provider: wallet.provider, address: wallet.address, label: wallet.label },
      collector: {
        displayName: collector.displayName.trim(),
        username: collector.username.trim(),
        email: collector.email.trim(),
        note: collector.note?.trim() || undefined,
      },
      txHash: null,
      version: 1,
      confirmAt: Date.now() + ORDER_DECISION_MS,
      outcome: getScenario() === 'payment-declined' ? 'declined' : 'confirmed',
      payloadHash,
    };
    db.orders[id] = order;
    db.idempotency[idemKey] = id;
    persist();
    setTimeout(() => {
      void resolveOrder(id);
    }, ORDER_DECISION_MS);

    // Cenário de timeout: o pedido JÁ existe, mas a resposta demora mais que o timeout do cliente.
    // Ao tentar de novo com a mesma chave, o cliente recupera este mesmo pedido.
    if (getScenario() === 'order-timeout') await sleep(11_000);

    return HttpResponse.json(toPublicOrder(order), { status: 201 });
  }),

  http.get(`${API_URL}/orders`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const status = new URL(request.url).searchParams.get('status');
    const db = await getDb();
    const own = Object.values(db.orders).filter((order) => order.userId === user.id);
    for (const order of own) await resolveIfDue(order);
    const items = own
      .filter((order) => !status || order.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toPublicOrder);
    return HttpResponse.json({ items });
  }),

  http.get(`${API_URL}/orders/:id`, async ({ request, params }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    const order = db.orders[String(params.id)];
    // Pedido de outro usuário responde 404 (não revela que existe).
    if (!order || order.userId !== user.id) {
      return HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }
    await resolveIfDue(order);
    return HttpResponse.json(toPublicOrder(order));
  }),
];
