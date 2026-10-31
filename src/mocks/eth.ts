// Aritmética decimal exata para valores em ETH, usando BigInt com 18 casas (wei).
// Nunca usamos Number/parseFloat em cálculos: 0.1 + 0.2 daria 0.30000000000000004.
const SCALE = 18;
const ONE = 10n ** BigInt(SCALE);

export function toWei(value: string): bigint {
  const [whole = '0', fraction = ''] = value.trim().split('.');
  const padded = fraction.padEnd(SCALE, '0').slice(0, SCALE);
  return BigInt(whole || '0') * ONE + BigInt(padded || '0');
}

export function fromWei(wei: bigint): string {
  const negative = wei < 0n;
  const digits = (negative ? -wei : wei).toString().padStart(SCALE + 1, '0');
  const whole = digits.slice(0, digits.length - SCALE);
  let fraction = digits.slice(digits.length - SCALE).replace(/0+$/, '');
  if (fraction.length < 2) fraction = fraction.padEnd(2, '0');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}
