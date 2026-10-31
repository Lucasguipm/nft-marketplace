import { getDb, persist, sha256 } from './db';
import type { StoredOrder } from './db';
import type { Order } from '../services/types';

export function toPublicOrder(order: StoredOrder): Order {
  // Remove os campos internos do "servidor" antes de responder ao cliente.
  const { userId: _userId, confirmAt: _confirmAt, outcome: _outcome, payloadHash: _payloadHash, ...publicOrder } = order;
  return publicOrder;
}

// A "rede" decide o pedido. Estados confirmado e recusado são terminais: nunca mudam depois.
export async function resolveOrder(orderId: string): Promise<StoredOrder | null> {
  const db = await getDb();
  const order = db.orders[orderId];
  if (!order || order.status !== 'pending') return null;

  order.status = order.outcome;
  order.version += 1;

  if (order.outcome === 'confirmed') {
    order.txHash = `0x${await sha256(`tx:${order.id}`)}`.slice(0, 66);

    // Baixa o estoque e avança a versão do NFT (base para o evento nft.updated).
    for (const item of order.items) {
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId);
      const edition = nft?.editions.find((candidate) => candidate.label === item.edition);
      if (nft && edition) {
        edition.stock = Math.max(0, edition.stock - item.quantity);
        nft.version += 1;
      }
    }

    // Remove do carrinho apenas o que foi comprado.
    const cart = db.carts[order.userId];
    if (cart) {
      for (const item of order.items) {
        const entry = cart.items.find((candidate) => candidate.nftId === item.nftId && candidate.edition === item.edition);
        if (entry) entry.quantity -= item.quantity;
      }
      cart.items = cart.items.filter((entry) => entry.quantity > 0);
      cart.coupon = null;
    }
  } else {
    order.declineReason = 'O pagamento foi recusado pela rede (simulação). Seus itens continuam no carrinho.';
  }

  persist();
  return order;
}

export async function resolveIfDue(order: StoredOrder) {
  if (order.status === 'pending' && Date.now() >= order.confirmAt) {
    await resolveOrder(order.id);
  }
}
