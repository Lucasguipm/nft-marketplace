import { hashString } from '../lib/hash';
import { fromWei, toWei } from './eth';
import type { Db, StoredCart } from './db';
import type { Quote, QuoteItem } from '../services/types';

export const NETWORK_FEE = '0.016';

// Cupons de teste: KURIO10 vale 10% (1000 pontos-base); KURIO20 está expirado de propósito.
export const COUPONS: Record<string, { bps: number; expired?: boolean }> = {
  KURIO10: { bps: 1000 },
  KURIO20: { bps: 2000, expired: true },
};

export function buildQuote(db: Db, cart: StoredCart): Quote {
  const items: QuoteItem[] = [];
  let subtotal = 0n;

  for (const cartItem of cart.items) {
    const nft = db.nfts.find((candidate) => candidate.id === cartItem.nftId);
    if (!nft) continue;
    const available = nft.editions.find((edition) => edition.label === cartItem.edition)?.stock ?? 0;
    const lineWei = toWei(nft.price) * BigInt(cartItem.quantity);
    subtotal += lineWei;
    items.push({
      nftId: nft.id,
      edition: cartItem.edition,
      title: nft.title,
      image: nft.image,
      unitPrice: nft.price,
      quantity: cartItem.quantity,
      lineTotal: fromWei(lineWei),
      available,
      issue: available === 0 ? 'out_of_stock' : cartItem.quantity > available ? 'insufficient_stock' : undefined,
    });
  }

  let discount = 0n;
  let couponCode: string | null = null;
  let couponError: string | undefined;
  if (cart.coupon) {
    const coupon = COUPONS[cart.coupon];
    if (!coupon) couponError = 'Cupom inválido.';
    else if (coupon.expired) couponError = 'Este cupom expirou.';
    else {
      couponCode = cart.coupon;
      discount = (subtotal * BigInt(coupon.bps)) / 10000n;
    }
  }

  const fee = items.length > 0 ? toWei(NETWORK_FEE) : 0n;
  const total = subtotal - discount + fee;

  const quote: Omit<Quote, 'quoteId'> = {
    items,
    subtotal: fromWei(subtotal),
    discount: fromWei(discount),
    couponCode,
    couponError,
    networkFee: fromWei(fee),
    total: fromWei(total),
    hasIssues: items.some((item) => item.issue !== undefined),
  };

  // O identificador muda sempre que algo relevante muda (preço, estoque, quantidade, cupom, taxa).
  const quoteId = `q_${hashString(JSON.stringify([items.map((i) => [i.nftId, i.edition, i.quantity, i.unitPrice, i.issue]), couponCode, quote.total]))}`;
  return { quoteId, ...quote };
}
