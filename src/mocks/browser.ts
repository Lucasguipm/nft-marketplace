import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Configura o worker com os nossos handlers REST
export const worker = setupWorker(...handlers);