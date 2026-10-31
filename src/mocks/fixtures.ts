import { CATEGORIES } from '../services/types';
import type { NFT } from '../services/types';

const CREATORS = ['Kurio Editions', 'NovaVisions', 'CyberNinja', 'AstroArt', 'PixelForge', 'Lumen Lab'];
const ADJECTIVES = ['Emerald', 'Violet', 'Ivory', 'Crimson', 'Azure', 'Golden', 'Shadow', 'Cosmic', 'Neon', 'Amber', 'Onyx', 'Solar'];
const NOUNS = ['Ape', 'Nomad', 'Baron', 'Oracle', 'Drifter', 'Sentinel', 'Phantom', 'Voyager', 'Titan', 'Specter', 'Runner', 'Warden'];

// Imagens geradas localmente (SVG): nenhuma requisição externa, sem custo de rede.
function svgImage(seed: number): string {
  const h1 = (seed * 47) % 360;
  const h2 = (h1 + 70) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${h1} 70% 45%)"/><stop offset="1" stop-color="hsl(${h2} 70% 18%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<circle cx="300" cy="250" r="130" fill="hsl(${h2} 80% 70% / .85)"/>` +
    `<rect x="150" y="410" width="300" height="48" rx="24" fill="hsl(${h1} 80% 80% / .6)"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 24 NFTs determinísticos: variedade suficiente para exercitar busca, filtros e paginação.
export const NFT_FIXTURES: NFT[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const gallery = [svgImage(n), svgImage(n + 100), svgImage(n + 200), svgImage(n + 300)];
  return {
    id: String(n),
    title: `${ADJECTIVES[i % ADJECTIVES.length]} ${NOUNS[(i * 5) % NOUNS.length]} #${String(n * 7).padStart(3, '0')}`,
    description:
      'Colecionável digital da coleção Kurio, verificado na Ethereum, com arte desbloqueável e acesso exclusivo para colecionadores.',
    price: (0.45 + ((n * 37) % 260) / 100).toFixed(2),
    image: gallery[0],
    gallery,
    creator: CREATORS[i % CREATORS.length],
    category: CATEGORIES[i % CATEGORIES.length],
    likes: 20 + ((n * 53) % 300),
    editions: [
      { label: '1/1', stock: n % 5 === 0 ? 0 : 1 }, // alguns NFTs com edição esgotada
      { label: '1/10', stock: 10 - (n % 4) },
      { label: '1/50', stock: 50 - n },
      { label: 'Aberta', stock: 999 },
    ],
    version: 1,
  };
});
