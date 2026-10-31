import { useEffect } from 'react';
import { Outlet, useRouter } from '@tanstack/react-router';
import { queryClient } from '../queryClient';
import { sessionQueryKey } from '../hooks/useAuth';
import { SESSION_EXPIRED_EVENT } from '../services/api';

const PRIVATE_PATHS = ['/checkout', '/profile', '/success'];

export function RootLayout() {
  const router = useRouter();

  // Sessão expirada em qualquer chamada: limpa dados privados e, se a tela atual é privada,
  // leva ao login guardando o endereço para retomar o fluxo depois.
  useEffect(() => {
    function handleExpired() {
      queryClient.setQueryData(sessionQueryKey, null);
      queryClient.removeQueries({ queryKey: ['favorites'] });
      const { pathname, href } = router.state.location;
      if (PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
        router.history.push(`/login?redirect=${encodeURIComponent(href)}`);
      }
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#110a05] text-[#e6d5c3] font-sans selection:bg-amber-600 selection:text-white">
      <Outlet />
    </div>
  );
}
