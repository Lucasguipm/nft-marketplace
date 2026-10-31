import { Link } from '@tanstack/react-router';
import { useLogout, useSession } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export function Header() {
  const { user, isLoading } = useSession();
  const logout = useLogout();
  const cart = useCart();
  const count = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <header className="flex justify-between items-center mb-10 border-b border-amber-900/30 pb-4">
      <Link to="/" className="text-xl font-bold tracking-widest text-amber-500">
        KURIO
      </Link>

      <nav aria-label="Principal" className="flex items-center gap-3 text-sm">
        <Link
          to="/cart"
          aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Carrinho'}
          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg border border-amber-900/50 transition"
        >
          Carrinho{count > 0 && <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">{count}</span>}
        </Link>

        {isLoading ? (
          <span className="skeleton h-9 w-24" aria-hidden="true" />
        ) : user ? (
          <>
            <Link to="/profile" className="text-amber-200/80 hover:text-amber-400 transition px-2">
              {user.name}
            </Link>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="border border-amber-900/50 hover:bg-amber-900/20 text-amber-300 px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-lg shadow-amber-900/20"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
