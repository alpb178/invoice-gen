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
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper py-10">
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
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            minLength={6}
          />
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
