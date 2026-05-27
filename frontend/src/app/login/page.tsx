'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithPassword } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/app';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-paper border border-ink-200 rounded-2xl p-8 space-y-5 shadow-card"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Image src="/logo.png" alt="Invoice Generator" width={64} height={64} priority />
          </div>
          <h1 className="text-xl font-semibold text-ink-900">Iniciar sesión</h1>
          <p className="text-ink-500 text-sm mt-1">Generador de facturas</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-ink-600">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-ink-600">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 pr-10 py-2.5 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-500 hover:text-ink-900"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
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
            href={`/register${next !== '/app' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-ink-900 font-medium hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-3.2 4" />
      <path d="M6.3 7.6A17.7 17.7 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </svg>
  );
}
