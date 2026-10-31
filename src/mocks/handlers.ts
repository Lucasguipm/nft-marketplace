// import { http, HttpResponse } from 'msw';
// import { MOCK_NFTS } from '../services/nftService';

// export const handlers = [
//   // 1. Endpoint para listar NFTs (com suporte básico a filtros)
//   http.get('https://api.kurio-nft-mock.local/nfts', () => {
//     return HttpResponse.json(MOCK_NFTS, { status: 200 });
//   }),

//   // 2. Endpoint para detalhar um NFT específico por ID
//   http.get('https://api.kurio-nft-mock.local/nfts/:id', ({ params }) => {
//     const { id } = params;
//     const nft = MOCK_NFTS.find((item) => item.id === id);
    
//     if (!nft) {
//       return new HttpResponse(JSON.stringify({ message: 'NFT não encontrado' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     return HttpResponse.json(nft, { status: 200 });
//   }),

//   // 3. Endpoint de Autenticação (Login simulado)
//   http.post('https://api.kurio-nft-mock.local/auth/login', async ({ request }) => {
//     const body = (await request.json()) as { email?: string };
    
//     if (body?.email === 'erro@teste.com') {
//       return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
//     }

//     return HttpResponse.json({
//       token: 'mock-jwt-token-kurio-123',
//       user: { name: 'Colecionador Kurio', email: body?.email || 'colecionador@kurio.io' }
//     }, { status: 200 });
//   }),
// ];

// import { http, HttpResponse } from 'msw';
// import { MOCK_NFTS } from '../services/nftService';

// export const handlers = [
//   // 1. Endpoint para listar NFTs
//   http.get('https://api.kurio-nft-mock.local/nfts', () => {
//     return HttpResponse.json(MOCK_NFTS);
//   }),

//   // 2. Endpoint para detalhar um NFT específico por ID
//   http.get('https://api.kurio-nft-mock.local/nfts/:id', ({ params }) => {
//     const { id } = params;
//     const nft = MOCK_NFTS.find((item) => item.id === id);
    
//     if (!nft) {
//       return HttpResponse.json({ message: 'NFT não encontrado' }, { status: 404 });
//     }

//     return HttpResponse.json(nft);
//   }),

//   // 3. Endpoint de Autenticação (Login simulado)
//   http.post('https://api.kurio-nft-mock.local/auth/login', async ({ request }) => {
//     const body = (await request.json().catch(() => ({}))) as { email?: string };
    
//     if (body?.email === 'erro@teste.com') {
//       return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
//     }

//     return HttpResponse.json({
//       token: 'mock-jwt-token-kurio-123',
//       user: { name: 'Colecionador Kurio', email: body?.email || 'colecionador@kurio.io' }
//     });
//   }),
// ];

import { http, HttpResponse } from 'msw';

// Dados simulados locais para os handlers do MSW
export const MOCK_NFTS = [
  {
    id: "1",
    title: "Emerald Ape #042",
    price: "1.19",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
    creator: "Kurio Editions",
    category: "Art",
    likes: 142,
  },
  {
    id: "2",
    title: "Violet Nomad #314",
    price: "1.39",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=500&auto=format&fit=crop",
    creator: "NovaVisions",
    category: "Collectibles",
    likes: 89,
  },
  {
    id: "3",
    title: "Ivory Baron #088",
    price: "1.79",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500&auto=format&fit=crop",
    creator: "CyberNinja",
    category: "Virtual Worlds",
    likes: 230,
  }
];

export const handlers = [
  // 1. Endpoint para listar NFTs
  http.get('https://api.kurio-nft-mock.local/nfts', () => {
    return HttpResponse.json(MOCK_NFTS);
  }),

  // 2. Endpoint para detalhar um NFT específico por ID
  http.get('https://api.kurio-nft-mock.local/nfts/:id', ({ params }) => {
    const { id } = params;
    const nft = MOCK_NFTS.find((item) => item.id === id);
    
    if (!nft) {
      return HttpResponse.json({ message: 'NFT não encontrado' }, { status: 404 });
    }

    return HttpResponse.json(nft);
  }),

  // 3. Endpoint de Autenticação (Login simulado)
  http.post('https://api.kurio-nft-mock.local/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    
    if (body?.email === 'erro@teste.com') {
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    return HttpResponse.json({
      token: 'mock-jwt-token-kurio-123',
      user: { name: 'Colecionador Kurio', email: body?.email || 'colecionador@kurio.io' }
    });
  }),
];