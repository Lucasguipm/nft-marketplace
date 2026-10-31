import { HttpResponse } from 'msw';
import { getDb } from './db';
import type { StoredUser } from './db';
import { getScenario, latencyFor, sleep } from './scenarios';

// Latência simulada + falha de conexão quando o cenário pede.
export async function preflight(): Promise<Response | null> {
  const scenario = getScenario();
  await sleep(latencyFor(scenario));
  if (scenario === 'offline') return HttpResponse.error();
  return null;
}

export async function currentUser(request: Request): Promise<StoredUser | null> {
  if (getScenario() === 'session-expired') return null;
  const header = request.headers.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const db = await getDb();
  const userId = db.sessions[token];
  return db.users.find((user) => user.id === userId) ?? null;
}

export const unauthorized = () =>
  HttpResponse.json({ message: 'Sessão inválida ou expirada. Entre novamente.' }, { status: 401 });

// Dono do carrinho: o usuário logado ou, sem login, o visitante identificado pelo cabeçalho X-Guest-Id.
export async function cartOwner(request: Request): Promise<{ owner: string; user: StoredUser | null }> {
  const user = await currentUser(request);
  if (user) return { owner: user.id, user };
  return { owner: `guest:${request.headers.get('X-Guest-Id') ?? 'anon'}`, user: null };
}
