export interface NFT {
  id: string;
  title: string;
  price: string;
  image: string;
  creator: string;
  category: string;
  likes: number;
}

// Dados iniciais simulados para o catálogo do Marketplace
export const MOCK_NFTS: NFT[] = [
  {
    id: "1",
    title: "Cosmic Odyssey #01",
    price: "1.25",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
    creator: "AstroArt",
    category: "Art",
    likes: 142,
  },
  {
    id: "2",
    title: "Cybernetic Apex",
    price: "2.40",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=500&auto=format&fit=crop",
    creator: "CyberNinja",
    category: "Collectibles",
    likes: 89,
  },
  {
    id: "3",
    title: "Ethereal Dimension",
    price: "0.85",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500&auto=format&fit=crop",
    creator: "NovaVisions",
    category: "Virtual Worlds",
    likes: 230,
  }
];



//////////////////////////////////////////////////////////////////////////
// import { api } from './api';

// export interface NFT {
//   id: string;
//   title: string;
//   price: string;
//   image: string;
//   creator: string;
//   category: string;
//   likes: number;
// }

// // Função assíncrona que faz o pedido GET à API (interceptado pelo MSW)
// export async function fetchNFTs(): Promise<NFT[]> {
//   const response = await api.get<NFT[]>('/nfts');
//   return response.data;
// }


// export interface NFT {
//   id: string;
//   title: string;
//   price: string;
//   image: string;
//   creator: string;
//   category: string;
//   likes: number;
// }

// // Dados simulados locais oficiais da Kurio
// const MOCK_NFTS: NFT[] = [
//   {
//     id: "1",
//     title: "Emerald Ape #042",
//     price: "1.19",
//     image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
//     creator: "Kurio Editions",
//     category: "Art",
//     likes: 142,
//   },
//   {
//     id: "2",
//     title: "Violet Nomad #314",
//     price: "1.39",
//     image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=500&auto=format&fit=crop",
//     creator: "NovaVisions",
//     category: "Collectibles",
//     likes: 89,
//   },
//   {
//     id: "3",
//     title: "Ivory Baron #088",
//     price: "1.79",
//     image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500&auto=format&fit=crop",
//     creator: "CyberNinja",
//     category: "Virtual Worlds",
//     likes: 230,
//   }
// ];

// // Função assíncrona simulando uma chamada de API real com atraso de rede
// export async function fetchNFTs(): Promise<NFT[]> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(MOCK_NFTS);
//     }, 500); // Meio segundo de delay para simular rede
//   });
// }