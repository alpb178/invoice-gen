'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  getInvitationByToken,
  acceptInvitation,
  rejectInvitation,
} from '@/lib/api';
import { getToken, getUser, setActiveTeamId } from '@/lib/auth';
import { useToast } from '@/components/Toast';

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
  const toast = useToast();
  const t = useTranslations('invitation');

  useEffect(() => {
    (async () => {
      try {
        const data = await getInvitationByToken(token);
        setInfo(data);
      } catch (e) {
        toast.error(e);
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
      setResult({ type: 'ok', text: t('joined', { team: data?.team?.name || '' }) });
      setTimeout(() => router.replace('/app'), 900);
    } catch (e) {
      toast.error(e);
      setProcessing(false);
    }
  };

  // Auto-accept when the user is already signed in with the right email and
  // the invitation is still live. That way, coming in through the email link
  // + login goes straight to the team dashboard with no extra steps.
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
      setResult({ type: 'ok', text: t('rejected') });
    } catch (e) {
      toast.error(e);
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-paper border border-ink-200 rounded-2xl p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink-900 mb-2">{t('title')}</h1>

        {loading ? (
          <p className="text-ink-500 text-sm">{t('loading')}</p>
        ) : !info ? (
          <p className="text-red-600 text-sm">{t('notFound')}</p>
        ) : (
          <>
            <p className="text-sm text-ink-700 mb-4">
              {t.rich(info.invitedBy?.email ? 'invitedBy' : 'invitedAnonymous', {
                inviter: info.invitedBy?.email ?? '',
                team: info.team?.name || t('aTeam'),
                who: (chunks) => <span className="font-medium">{chunks}</span>,
                strong: (chunks) => <span className="font-semibold text-ink-900">{chunks}</span>,
              })}
            </p>
            <p className="text-xs text-ink-500 mb-5">
              {t.rich('forEmail', {
                email: info.email,
                strong: (chunks) => <span className="text-ink-800">{chunks}</span>,
              })}
            </p>

            {info.status === 'accepted' && !result && (
              <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 mb-4">
                {t('alreadyAccepted')}{' '}
                <Link href="/app" className="font-semibold underline">
                  {t('goToDashboard')}
                </Link>
              </div>
            )}
            {info.status === 'rejected' && (
              <div className="text-sm bg-ink-50 border border-ink-200 text-ink-800 rounded-lg px-3 py-2 mb-4">
                {t('wasRejected')}
              </div>
            )}
            {info.status === 'cancelled' && (
              <div className="text-sm bg-ink-50 border border-ink-200 text-ink-800 rounded-lg px-3 py-2 mb-4">
                {t('cancelled')}
              </div>
            )}
            {info.expired && info.status === 'pending' && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4">
                {t('expired')}
              </div>
            )}

            {!authed && info.status === 'pending' && !info.expired && (
              <div className="text-xs text-ink-700 bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 mb-4">
                {t.rich('signInHint', { email: info.email, strong: (chunks) => <strong>{chunks}</strong> })}
              </div>
            )}

            {authed && emailMismatch && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {t.rich('wrongAccount', {
                  current: user?.email ?? '',
                  email: info.email,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
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
                      {t('signIn')}
                    </Link>
                    <Link
                      href={`/register?next=${encodeURIComponent(`/invitations/${token}`)}&email=${encodeURIComponent(info.email)}`}
                      className="flex-1 px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 text-sm font-semibold rounded-xl text-center transition-colors"
                    >
                      {t('createAccount')}
                    </Link>
                  </>
                ) : emailMismatch ? (
                  <button
                    onClick={() => {
                      // sign out and go back to login with next
                      if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('invoice_jwt');
                        window.localStorage.removeItem('invoice_user');
                        router.push(`/login?next=${encodeURIComponent(`/invitations/${token}`)}`);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-paper text-sm font-semibold rounded-xl transition-colors"
                  >
                    {t('switchAccount')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper text-sm font-semibold rounded-xl transition-colors"
                    >
                      {processing ? t('joining') : t('accept')}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 text-sm font-medium rounded-xl transition-colors"
                    >
                      {t('reject')}
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
