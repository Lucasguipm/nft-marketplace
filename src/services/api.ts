import axios from 'axios';

// Instância base do Axios para o nosso Marketplace
export const api = axios.create({
  baseURL: 'https://api.kurio-nft-mock.local', // Endereço simulado (será interceptado pelo MSW)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});