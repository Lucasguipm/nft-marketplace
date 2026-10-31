import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-white">Página não encontrada</h1>
      <p className="text-amber-200/70">O endereço que você abriu não existe ou foi movido.</p>
      <Link to="/" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition">
        Voltar ao mercado
      </Link>
    </main>
  );
}
