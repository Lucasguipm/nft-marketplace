import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { Home } from './routes/Home.tsx';
import { Details } from './routes/Details.tsx';
import { Cart } from './routes/Cart.tsx';
import { Checkout } from './routes/Checkout.tsx';
import { Auth } from './routes/Auth.tsx';
import { Profile } from './routes/Profile.tsx';
import { Success } from './routes/Success.tsx';
import { RootLayout } from './components/RootLayout.tsx';
import { NotFound } from './components/NotFound.tsx';
import { tokenStore } from './services/api';
import { CATEGORIES, SORT_OPTIONS } from './services/types';
import type { Category, SortKey } from './services/types';

// Rotas privadas: sem token, redireciona para o login e volta ao fluxo depois.
function requireAuth({ location }: { location: { href: string } }) {
  if (!tokenStore.get()) {
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

// Busca, filtro, ordenação e página vivem na URL: sobrevivem a refresh e ao botão voltar.
export interface HomeSearch {
  q?: string;
  category?: Category;
  sort?: SortKey;
  page?: number;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const page = Number(search.page);
    return {
      q: typeof search.q === 'string' && search.q.trim() ? search.q : undefined,
      category: (CATEGORIES as readonly unknown[]).includes(search.category)
        ? (search.category as Category)
        : undefined,
      sort: SORT_OPTIONS.some((option) => option.value === search.sort)
        ? (search.sort as SortKey)
        : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  component: Home,
});

const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$id',
  component: Details,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    // Só aceita caminhos internos (evita redirecionar o usuário para outro site).
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/') && !search.redirect.startsWith('//')
        ? search.redirect
        : undefined,
  }),
  component: Auth,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: requireAuth,
  component: Profile,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  beforeLoad: requireAuth,
  component: Checkout,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  validateSearch: (search: Record<string, unknown>): { order?: string } => ({
    order: typeof search.order === 'string' && search.order ? search.order : undefined,
  }),
  beforeLoad: requireAuth,
  component: Success,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftRoute,
  cartRoute,
  loginRoute,
  profileRoute,
  checkoutRoute,
  successRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

