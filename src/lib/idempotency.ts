import { hashString } from './hash';

const PREFIX = 'kurio-idem:';

// Uma chave por tentativa de compra. Enquanto o pedido não chega a um estado final,
// reenviar (clique repetido, timeout, refresh) reutiliza a MESMA chave, então o servidor devolve o mesmo pedido.
export function getIdempotencyKey(signature: string): string {
  const storageKey = PREFIX + hashString(signature);
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) return stored;
    const key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return crypto.randomUUID();
  }
}

// Chame depois de um estado final (confirmado ou recusado) para permitir uma nova tentativa.
export function renewIdempotencyKey(signature: string) {
  try {
    sessionStorage.removeItem(PREFIX + hashString(signature));
  } catch {
    // nada a fazer
  }
}
