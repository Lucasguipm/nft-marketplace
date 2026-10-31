import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from './queryClient';
import './index.css';

// Os mocks (MSW) ficam ligados em desenvolvimento E no build publicado.
// Para desligar: VITE_ENABLE_MOCKS=false
async function prepareMocks() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return;
  try {
    const { startMocks } = await import('./mocks/browser');
    await startMocks();
  } catch (error) {
    console.error(
      '[MSW] Não foi possível iniciar os mocks. Rode "npx msw init public/ --save" e confira se public/mockServiceWorker.js existe.',
      error,
    );
  }
}

prepareMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
});
