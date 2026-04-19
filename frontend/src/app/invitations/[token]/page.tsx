'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  getInvitationByToken,
  acceptInvitation,
  rejectInvitation,
} from '@/lib/api';
import { getToken, getUser, setActiveTeamId } from '@/lib/auth';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = String(rawToken || '');
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const autoRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getInvitationByToken(token);
        setInfo(data);
      } catch (e: any) {
        setResult({ type: 'err', text: e.message });
      }
      setLoading(false);
    })();
  }, [token]);

  const authed = typeof window !== 'undefined' && !!getToken();
  const user = typeof window !== 'undefined' ? getUser() : null;
  const emailMismatch =
    authed && info?.email && user?.email && user.email.toLowerCase() !== info.email.toLowerCase();

  const acceptNow = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const data = await acceptInvitation(token);
      if (data?.team?.id) setActiveTeamId(data.team.id);
      setResult({ type: 'ok', text: `¡Te uniste al equipo ${data?.team?.name || ''}! Redirigiendo…` });
      setTimeout(() => router.replace('/app'), 900);
    } catch (e: any) {
      setResult({ type: 'err', text: e.message });
      setProcessing(false);
    }
  };

  // Auto-accept cuando el usuario ya está autenticado con el email correcto
  // y la invitación sigue viva. Así al entrar por el link del email + login
  // va directo al dashboard del equipo sin pasos extra.
  useEffect(() => {
    if (autoRef.current) return;
    if (!info || loading) return;
    if (!authed) return;
    if (info.status !== 'pending' || info.expired) return;
    if (emailMismatch) return;
    autoRef.current = true;
    acceptNow();
  }, [info, loading, authed, emailMismatch]);

  const handleAccept = async () => {
    if (!authed) {
      const next = encodeURIComponent(`/invitations/${token}`);
      router.push(`/login?next=${next}`);
      return;
    }
    acceptNow();
  };

  const handleReject = async () => {
    if (!authed) return;
    setProcessing(true);
    try {
      await rejectInvitation(token);
      setResult({ type: 'ok', text: 'Invitación rechazada.' });
    } catch (e: any) {
      setResult({ type: 'err', text: e.message });
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-md bg-paper border border-ink-200 rounded-2xl p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink-900 mb-2">Invitación a un equipo</h1>

        {loading ? (
          <p className="text-ink-500 text-sm">Cargando…</p>
        ) : !info ? (
          <p className="text-red-600 text-sm">Invitación no encontrada.</p>
        ) : (
          <>
            <p className="text-sm text-ink-700 mb-4">
              {info.invitedBy?.email ? (
                <>
                  <span className="font-medium">{info.invitedBy.email}</span> te ha invitado a unirte a{' '}
                </>
              ) : (
                'Te han invitado a unirte a '
              )}
              <span className="font-semibold text-ink-900">{info.team?.name || 'un equipo'}</span>.
            </p>
            <p className="text-xs text-ink-500 mb-5">
              Invitación para <span className="text-ink-800">{info.email}</span>
            </p>

            {info.status === 'accepted' && !result && (
              <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 mb-4">
                Esta invitación ya fue aceptada.{' '}
                <Link href="/app" className="font-semibold underline">
                  Ir al dashboard →
                </Link>
              </div>
            )}
            {info.status === 'rejected' && (
              <div className="text-sm bg-ink-50 border border-ink-200 text-ink-800 rounded-lg px-3 py-2 mb-4">
                Esta invitación fue rechazada.
              </div>
            )}
            {info.status === 'cancelled' && (
              <div className="text-sm bg-ink-50 border border-ink-200 text-ink-800 rounded-lg px-3 py-2 mb-4">
                El dueño canceló esta invitación.
              </div>
            )}
            {info.expired && info.status === 'pending' && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4">
                Esta invitación expiró.
              </div>
            )}

            {!authed && info.status === 'pending' && !info.expired && (
              <div className="text-xs text-ink-700 bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 mb-4">
                Inicia sesión o regístrate con <strong>{info.email}</strong>. Te uniremos al equipo automáticamente.
              </div>
            )}

            {authed && emailMismatch && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                Has iniciado sesión con {user?.email}. Inicia sesión con <strong>{info.email}</strong> para aceptar.
              </div>
            )}

            {result && (
              <div
                className={`text-sm rounded-lg px-3 py-2 border mb-4 ${
                  result.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {result.text}
              </div>
            )}

            {info.status === 'pending' && !info.expired && !result && (
              <div className="flex gap-2">
                {!authed ? (
                  <>
                    <Link
                      href={`/login?next=${encodeURIComponent(`/invitations/${token}`)}`}
                      className="flex-1 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-paper text-sm font-semibold rounded-xl text-center transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href={`/register?next=${encodeURIComponent(`/invitations/${token}`)}&email=${encodeURIComponent(info.email)}`}
                      className="flex-1 px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 text-sm font-semibold rounded-xl text-center transition-colors"
                    >
                      Crear cuenta
                    </Link>
                  </>
                ) : emailMismatch ? (
                  <button
                    onClick={() => {
                      // cerrar sesión y volver a login con next
                      if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('invoice_jwt');
                        window.localStorage.removeItem('invoice_user');
                        router.push(`/login?next=${encodeURIComponent(`/invitations/${token}`)}`);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-paper text-sm font-semibold rounded-xl transition-colors"
                  >
                    Cambiar de cuenta
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper text-sm font-semibold rounded-xl transition-colors"
                    >
                      {processing ? 'Uniéndote…' : 'Aceptar'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 text-sm font-medium rounded-xl transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
