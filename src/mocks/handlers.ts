import { http, HttpResponse } from 'msw';
import { API_URL } from '../config';
import { getDb, persist, sha256 } from './db';
import type { StoredUser } from './db';
import { getScenario, latencyFor, sleep } from './scenarios';
import type { NFT, SortKey } from '../services/types';

// Latência simulada + falha de conexão quando o cenário pede.
async function preflight(): Promise<Response | null> {
  const scenario = getScenario();
  await sleep(latencyFor(scenario));
  if (scenario === 'offline') return HttpResponse.error();
  return null;
}

async function currentUser(request: Request): Promise<StoredUser | null> {
  if (getScenario() === 'session-expired') return null;
  const header = request.headers.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const db = await getDb();
  const userId = db.sessions[token];
  return db.users.find((user) => user.id === userId) ?? null;
}

const unauthorized = () =>
  HttpResponse.json({ message: 'Sessão inválida ou expirada. Entre novamente.' }, { status: 401 });

function sortItems(items: NFT[], sort: SortKey): NFT[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => Number(a.price) - Number(b.price)); // só ordena; nenhuma conta é feita com Number
    case 'price-desc':
      return copy.sort((a, b) => Number(b.price) - Number(a.price));
    case 'popular':
      return copy.sort((a, b) => b.likes - a.likes);
    default:
      return copy.sort((a, b) => Number(b.id) - Number(a.id));
  }
}

interface Credentials {
  name?: string;
  email?: string;
  password?: string;
}

async function openSession(user: StoredUser) {
  const db = await getDb();
  const token = crypto.randomUUID();
  db.sessions[token] = user.id;
  persist();
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export const handlers = [
  // ---------- NFTs ----------
  http.get(`${API_URL}/nfts`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    if (getScenario() === 'server-error') {
      return HttpResponse.json({ message: 'Erro interno no servidor. Tente novamente.' }, { status: 500 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const category = url.searchParams.get('category');
    const sort = (url.searchParams.get('sort') ?? 'recent') as SortKey;
    const pageSize = Math.min(24, Math.max(1, Number(url.searchParams.get('pageSize')) || 9));
    const requestedPage = Math.max(1, Number(url.searchParams.get('page')) || 1);

    const db = await getDb();
    let items = db.nfts.filter(
      (nft) =>
        (!category || nft.category === category) &&
        (!q || nft.title.toLowerCase().includes(q) || nft.creator.toLowerCase().includes(q)),
    );
    if (getScenario() === 'empty') items = [];

    items = sortItems(items, sort);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);

    return HttpResponse.json({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages,
    });
  }),

  http.get(`${API_URL}/nfts/:id`, async ({ params }) => {
    const early = await preflight();
    if (early) return early;
    const db = await getDb();
    const nft = db.nfts.find((item) => item.id === String(params.id));
    if (!nft) return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    return HttpResponse.json(nft);
  }),

  // ---------- Conta e sessão ----------
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const body = (await request.json().catch(() => ({}))) as Credentials;
    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';

    const fields: Record<string, string> = {};
    if (name.length < 2) fields.name = 'Informe seu nome (mínimo de 2 caracteres).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Informe um e-mail válido.';
    if (password.length < 8) fields.password = 'A senha precisa ter pelo menos 8 caracteres.';
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ message: 'Confira os campos destacados.', fields }, { status: 422 });
    }

    const db = await getDb();
    if (db.users.some((user) => user.email === email)) {
      return HttpResponse.json(
        { message: 'Este e-mail já está cadastrado.', fields: { email: 'Este e-mail já está cadastrado.' } },
        { status: 409 },
      );
    }

    const user: StoredUser = {
      id: `u${db.users.length + 1}`,
      name,
      email,
      passwordHash: await sha256(password),
    };
    db.users.push(user);
    return HttpResponse.json(await openSession(user), { status: 201 });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const body = (await request.json().catch(() => ({}))) as Credentials;
    const email = (body.email ?? '').trim().toLowerCase();
    const db = await getDb();
    const user = db.users.find((item) => item.email === email);
    if (!user || user.passwordHash !== (await sha256(body.password ?? ''))) {
      return HttpResponse.json({ message: 'E-mail ou senha incorretos.' }, { status: 401 });
    }
    return HttpResponse.json(await openSession(user));
  }),

  http.get(`${API_URL}/auth/me`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  }),

  http.post(`${API_URL}/auth/logout`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const header = request.headers.get('Authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const db = await getDb();
      delete db.sessions[token];
      persist();
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Favoritos (exigem login) ----------
  http.get(`${API_URL}/favorites`, async ({ request }) => {
    const early = await preflight();
    if (early) return early;
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    return HttpResponse.json({ ids: db.favorites[user.id] ?? [] });
  }),

  http.put(`${API_URL}/favorites/:id`, async ({ request, params }) => {
    const early = await preflight();
    if (early) return early;
    if (getScenario() === 'favorites-fail') {
      return HttpResponse.json({ message: 'Não foi possível salvar o favorito.' }, { status: 500 });
    }
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    const id = String(params.id);
    if (!db.nfts.some((nft) => nft.id === id)) {
      return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    }
    const current = db.favorites[user.id] ?? [];
    db.favorites[user.id] = current.includes(id) ? current : [...current, id];
    persist();
    return HttpResponse.json({ ids: db.favorites[user.id] });
  }),

  http.delete(`${API_URL}/favorites/:id`, async ({ request, params }) => {
    const early = await preflight();
    if (early) return early;
    if (getScenario() === 'favorites-fail') {
      return HttpResponse.json({ message: 'Não foi possível remover o favorito.' }, { status: 500 });
    }
    const user = await currentUser(request);
    if (!user) return unauthorized();
    const db = await getDb();
    db.favorites[user.id] = (db.favorites[user.id] ?? []).filter((id) => id !== String(params.id));
    persist();
    return HttpResponse.json({ ids: db.favorites[user.id] });
  }),
];
