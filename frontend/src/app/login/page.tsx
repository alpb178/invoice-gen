'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithPassword } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithPassword(identifier, password);
      router.replace(next);
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-paper border border-ink-200 rounded-2xl p-8 space-y-5 shadow-card"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Image src="/icon.png" alt="Invoice Generator" width={64} height={64} priority />
          </div>
          <h1 className="text-xl font-semibold text-ink-900">Iniciar sesión</h1>
          <p className="text-ink-500 text-sm mt-1">Generador de facturas</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-ink-600">Email o usuario</label>
          <input
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-ink-600">Contraseña</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper font-semibold rounded-xl text-sm transition-colors"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-xs text-ink-500 text-center">
          ¿No tienes cuenta?{' '}
          <Link
            href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-ink-900 font-medium hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
