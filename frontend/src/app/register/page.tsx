'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, setActiveTeamId } from '@/lib/auth';
import { createTeam } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const presetEmail = searchParams.get('email') || '';
  const invitationFlow = Boolean(next);

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCIF, setCompanyCIF] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password);
      if (!invitationFlow) {
        const team = await createTeam({
          name: teamName,
          companyName: companyName || teamName,
          companyCIF,
          companyAddress,
        });
        setActiveTeamId(team.id);
      }
      router.replace(next || '/app');
    } catch (err: any) {
      setError(err.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg bg-paper border border-ink-200 rounded-2xl p-8 space-y-5 shadow-card"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🧾</div>
          <h1 className="text-xl font-semibold text-ink-900">
            {invitationFlow ? 'Crea tu cuenta' : 'Crea tu cuenta y tu equipo'}
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {invitationFlow
              ? 'Después podrás aceptar la invitación.'
              : 'Tú serás el dueño del equipo.'}
          </p>
        </div>

        <div>
          <label className="block text-xs text-ink-600 mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-ink-600 mb-1">Contraseña</label>
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + ' pr-10'}
              minLength={6}
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

        {!invitationFlow && (
          <div className="pt-3 border-t border-ink-200">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Datos del equipo / empresa</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-600 mb-1">Nombre del equipo</label>
                <input
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-600 mb-1">Razón social (opcional)</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-ink-600 mb-1">CIF (opcional)</label>
                  <input value={companyCIF} onChange={(e) => setCompanyCIF(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-600 mb-1">Dirección (opcional)</label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className={inputClass + ' resize-none h-16'}
                />
              </div>
            </div>
          </div>
        )}

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
          {loading ? 'Creando…' : invitationFlow ? 'Crear cuenta' : 'Crear cuenta y equipo'}
        </button>

        <p className="text-xs text-ink-500 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-ink-900 font-medium hover:underline"
          >
            Inicia sesión
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
