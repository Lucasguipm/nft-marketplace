import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, getRouteApi, useRouter } from '@tanstack/react-router';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../../services/api';

const route = getRouteApi('/login');

const inputClass =
  'w-full bg-black/40 border rounded-lg p-3 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-red-300 mt-1">
      {message}
    </p>
  );
}

export function Login() {
  const router = useRouter();
  const { redirect } = route.useSearch();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const mutation = isLogin ? loginMutation : registerMutation;

  // Erros de campo vindos da API (422/409) somam-se aos erros locais.
  const fieldErrors = { ...getFieldErrors(mutation.error), ...localErrors };
  const formError = mutation.isError && Object.keys(getFieldErrors(mutation.error)).length === 0
    ? getErrorMessage(mutation.error)
    : '';

  function finish() {
    router.history.push(redirect ?? '/');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalErrors({});

    if (isLogin) {
      loginMutation.mutate({ email, password }, { onSuccess: finish });
      return;
    }

    if (password !== confirmPassword) {
      setLocalErrors({ confirmPassword: 'As senhas não coincidem.' });
      return;
    }
    registerMutation.mutate({ name, email, password }, { onSuccess: finish });
  }

  function switchMode(login: boolean) {
    setIsLogin(login);
    setLocalErrors({});
    loginMutation.reset();
    registerMutation.reset();
  }

  const borderFor = (field: string) => (fieldErrors[field] ? 'border-red-500/70' : 'border-amber-900/50');

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-[#1a110a] border border-amber-900/40 rounded-2xl p-8 shadow-2xl">
        <div role="tablist" aria-label="Acesso" className="flex border-b border-amber-900/30 mb-6">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            onClick={() => switchMode(true)}
            className={`flex-1 pb-3 text-center font-semibold text-sm transition ${
              isLogin ? 'text-amber-500 border-b-2 border-amber-500' : 'text-amber-200/50 hover:text-amber-300'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            onClick={() => switchMode(false)}
            className={`flex-1 pb-3 text-center font-semibold text-sm transition ${
              !isLogin ? 'text-amber-500 border-b-2 border-amber-500' : 'text-amber-200/50 hover:text-amber-300'
            }`}
          >
            Criar conta
          </button>
        </div>

        <p className="text-xs text-amber-200/60 text-center mb-6">
          {isLogin
            ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
            : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
        </p>

        {formError && (
          <p role="alert" className="bg-red-950/40 border border-red-900/60 text-red-200 text-sm rounded-lg p-3 mb-4">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div>
              <label htmlFor="nome" className="sr-only">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                required
                placeholder="Nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'erro-nome' : undefined}
                className={`${inputClass} ${borderFor('name')}`}
              />
              <FieldError id="erro-nome" message={fieldErrors.name} />
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'erro-email' : undefined}
              className={`${inputClass} ${borderFor('email')}`}
            />
            <FieldError id="erro-email" message={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor="senha" className="sr-only">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'erro-senha' : undefined}
              className={`${inputClass} ${borderFor('password')}`}
            />
            <FieldError id="erro-senha" message={fieldErrors.password} />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmar-senha" className="sr-only">
                Confirmar senha
              </label>
              <input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? 'erro-confirmar' : undefined}
                className={`${inputClass} ${borderFor('confirmPassword')}`}
              />
              <FieldError id="erro-confirmar" message={fieldErrors.confirmPassword} />
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-wait text-white font-medium py-3 rounded-xl transition shadow-lg shadow-amber-900/20 mt-2"
          >
            {mutation.isPending ? 'Aguarde…' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-xs text-amber-200/50 text-center">
          Conta de teste: ana@kurio.io • senha Senha@123
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-amber-400 underline hover:text-amber-300">
            Voltar ao mercado
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
