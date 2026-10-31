import { 
  Outlet,
  createRootRoute, 
  createRoute, 
  createRouter 
} from '@tanstack/react-router';
import { Home } from './routes/Home.tsx';
import { Details } from './routes/Details.tsx';
import { Cart } from './routes/Cart.tsx';
import { Checkout } from './routes/Checkout.tsx';
import { Auth } from './routes/Auth.tsx';
import { Profile } from './routes/Profile.tsx';
import { Success } from './routes/Success.tsx';

// 1. Rota raiz (Layout principal que envolve a aplicação)
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] font-sans selection:bg-amber-600 selection:text-white">
      <Outlet />
    </div>
  ),
});

// 2. Página Inicial (Catálogo)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

// 3. Página de Carrinho
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});

// 4. Página de Login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Auth,
});

// 5. Página de Perfil do Colecionador e Página de Carteiras
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

// 6. Página de Detalhes do NFT
const detailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/details',
  component: Details,
});

// 7. Página de Pagamento-Checkout
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

// 8. Página de Sucesso após a compra
const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  component: Success,
});

// Agrupamento das rotas
const routeTree = rootRoute.addChildren([
  indexRoute,
  cartRoute,
  loginRoute,
  profileRoute,
  detailsRoute,
  checkoutRoute,
  successRoute,
]);

// Configuração final do router
export const router = createRouter({ routeTree });

// Registo de tipos para o TypeScript reconhecer as rotas com segurança
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}