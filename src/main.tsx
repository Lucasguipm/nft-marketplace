// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { RouterProvider } from '@tanstack/react-router';
// import { router } from './router';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { RouterProvider } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { router } from './router';
// import './index.css';

// // Criação do cliente de cache e gestão de estado remoto
// const queryClient = new QueryClient();

// ReactDOM.createRoot(getElementByIdSafe()!).render(
//   <React.StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <RouterProvider router={router} />
//     </QueryClientProvider>
//   </React.StrictMode>
// );

// function getElementByIdSafe() {
//   return document.getElementById('root');
// }

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { RouterProvider } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { router } from './router';
// import './index.css';

// const queryClient = new QueryClient();

// async function enableMocking() {
//   if (import.meta.env.DEV) {
//     const { worker } = await import('./mocks/browser');
//     return worker.start();
//   }
// }

// enableMocking().then(() => {
//   ReactDOM.createRoot(document.getElementById('root')!).render(
//     <React.StrictMode>
//       <QueryClientProvider client={queryClient}>
//         <RouterProvider router={router} />
//       </QueryClientProvider>
//     </React.StrictMode>
//   );
// });

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

async function prepareApp() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start();
    } catch (err) {
      console.warn('MSW ignorado:', err);
    }
  }
}

prepareApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
});