// src/app/[locale]/app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { intlTag } from '@/i18n/config';
import {
  getInvoices,
  deleteInvoice,
  getMyTeams,
  getMyInvitations,
} from '@/lib/api';
import { getUser, getActiveTeamId, setActiveTeamId } from '@/lib/auth';
import { Skeleton, SkeletonCard, SkeletonKpiGrid, SkeletonList } from '@/components/Skeleton';
import { HBarChart, LineChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';

const STATUS_COLORS: Record<string, string> = {
  draft: '#a1a1aa',
  sent: '#6366f1',
  paid: '#10b981',
  cancelled: '#f43f5e',
};

const STATUS_PILL: Record<string, string> = {
  draft: 'bg-ink-100 text-ink-700 border-ink-200',
  sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

function fmtMoney(n: number, cur = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date, tag: string) {
  return d.toLocaleDateString(tag, { month: 'short' });
}

function lastMonths(n: number): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return out;
}

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [activeTeamId, setActiveTeamIdState] = useState<number | null>(null);
  const [isOwnerOfActive, setIsOwnerOfActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const t = useTranslations('dashboard');
  const ts = useTranslations('status');
  const tp = useTranslations('statusPlural');
  const tag = intlTag[useLocale()];

  useEffect(() => {
    setUser(getUser());
  }, []);

  const loadAll = async () => {
    try {
      const { owned, memberOf } = await getMyTeams();
      const merged = [...owned, ...memberOf.filter((m: any) => !owned.find((o: any) => o.id === m.id))];
      setTeams(merged);
      if (merged.length === 0) {
        router.replace('/teams');
        return;
      }
      const saved = getActiveTeamId();
      const pick = merged.find((t: any) => t.id === saved) || merged[0];
      setActiveTeamIdState(pick.id);
      setActiveTeamId(pick.id);
      setActiveTeam(pick);
      const u = getUser();
      setIsOwnerOfActive(pick.owner?.id === u?.id);

      const data = await getInvoices(pick.id);
      setInvoices(data || []);

      try {
        const inv = await getMyInvitations();
        setPendingInvitations(inv || []);
      } catch {}
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await deleteInvoice(id);
      toast.success(t('deleted'));
      router.push('/invoices');
    } catch (e) {
      toast.error(e);
    }
  };

  // Owner: shows every invoice with the invoice total.
  // Member: also shows every team invoice (so they can open it and add their
  // section), but the visible amount is their contribution (sum of the
  // subtotals of THEIR sections); 0 if they have not added any yet.
  const myInvoices = useMemo(() => {
    if (isOwnerOfActive) {
      return invoices.map((inv: any) => {
        const a = inv.attributes || inv;
        return { ...inv, displayAmount: a.totalAmount || 0 };
      });
    }
    return invoices.map((inv: any) => {
      const a = inv.attributes || inv;
      const sections = a.sections?.data || a.sections || [];
      const mine = sections.filter((s: any) => {
        const sa = s.attributes || s;
        const au = sa.author?.data || sa.author;
        return au?.id === user?.id;
      });
      const own = mine.reduce((sum: number, s: any) => {
        const sa = s.attributes || s;
        return sum + (Number(sa.subtotal) || 0);
      }, 0);
      return { ...inv, displayAmount: own };
    });
  }, [invoices, isOwnerOfActive, user?.id]);

  const kpi = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let total = 0;
    let thisMonth = 0;
    let drafts = 0;
    let sent = 0;
    let paid = 0;
    let cancelled = 0;
    let exported = 0;

    for (const inv of myInvoices) {
      const a = inv.attributes || inv;
      const amount = inv.displayAmount || 0;
      total += amount;
      if (a.date) {
        const d = new Date(a.date);
        if (d.getFullYear() === year && d.getMonth() === month) thisMonth += amount;
      }
      if (a.status === 'draft') drafts++;
      else if (a.status === 'sent') sent++;
      else if (a.status === 'paid') paid++;
      else if (a.status === 'cancelled') cancelled++;
      if (a.exportedAt) exported++;
    }

    return { total, thisMonth, drafts, sent, paid, cancelled, exported };
  }, [myInvoices]);

  const monthlySeries = useMemo(() => {
    const months = lastMonths(6);
    const buckets = new Map(months.map((d) => [monthKey(d), 0]));
    for (const inv of myInvoices) {
      const a = inv.attributes || inv;
      if (!a.date) continue;
      const d = new Date(a.date);
      const key = monthKey(d);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + (inv.displayAmount || 0));
    }
    return months.map((d) => ({ label: monthLabel(d, tag), value: buckets.get(monthKey(d)) || 0 }));
  }, [myInvoices, tag]);

  const statusSegments = useMemo(
    () => [
      { key: 'draft', label: tp('draft'), value: kpi.drafts, color: STATUS_COLORS.draft },
      { key: 'sent', label: tp('sent'), value: kpi.sent, color: STATUS_COLORS.sent },
      { key: 'paid', label: tp('paid'), value: kpi.paid, color: STATUS_COLORS.paid },
      { key: 'cancelled', label: tp('cancelled'), value: kpi.cancelled, color: STATUS_COLORS.cancelled },
    ],
    [kpi, tp],
  );

  const perMember = useMemo(() => {
    const map = new Map<string, { email: string; count: number; total: number }>();
    for (const inv of invoices) {
      const a = inv.attributes || inv;
      const name = a.author?.email || '—';
      const entry = map.get(name) || { email: name, count: 0, total: 0 };
      entry.count += 1;
      entry.total += a.totalAmount || 0;
      map.set(name, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [invoices]);

  const recent = useMemo(() => myInvoices.slice(0, 5), [myInvoices]);

  const cur = activeTeam?.defaultCurrency || 'USD';
  const memberCount = (activeTeam?.members?.length || 0) + 1;

  return (
    <div className="w-full px-4 md:px-10 lg:px-16 py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif-display text-3xl md:text-4xl font-medium tracking-tight text-ink-900">
            Dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {activeTeam ? (
              <>
                <span className="text-ink-800 font-medium">{activeTeam.name}</span>
                {isOwnerOfActive ? t('youAreOwner') : t('youAreMember')}
              </>
            ) : (
              t('teamRecord')
            )}
          </p>
        </div>
        {isOwnerOfActive && (
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink-950 hover:bg-ink-800 text-[#f5f1e8] font-medium rounded-full text-sm transition-colors"
          >
            {t('newInvoice')}
          </Link>
        )}
      </div>

      {pendingInvitations.length > 0 && (
        <div className="mb-5 text-sm bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-ink-800">
            {t('pendingInvitations', { count: pendingInvitations.length })}
          </span>
          <div className="flex gap-2">
            {pendingInvitations.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/invitations/${inv.token}`}
                className="text-xs px-3 py-1.5 bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
              >
                {inv.team?.name || t('team')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <SkeletonKpiGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SkeletonCard className="lg:col-span-2 h-56">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-40 w-full mt-4 rounded-xl" />
            </SkeletonCard>
            <SkeletonCard className="h-56">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-32 w-32 rounded-full mt-4 mx-auto" />
            </SkeletonCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SkeletonList count={3} />
            </div>
            <SkeletonCard>
              <Skeleton className="h-3 w-20" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </SkeletonCard>
          </div>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              tone="violet"
              label={isOwnerOfActive ? t('totalBilled') : t('myContribution')}
              value={fmtMoney(kpi.total, cur)}
              hint={t('invoiceCount', { count: myInvoices.length })}
            />
            <KpiCard tone="sky" label={t('thisMonth')} value={fmtMoney(kpi.thisMonth, cur)} hint={new Date().toLocaleDateString(tag, { month: 'long', year: 'numeric' })} />
            <KpiCard
              tone="amber"
              label={t('pending')}
              value={`${kpi.drafts + kpi.sent}`}
              hint={t('pendingHint', { drafts: kpi.drafts, sent: kpi.sent })}
            />
            <KpiCard tone="emerald" label={t('exported')} value={`${kpi.exported}`} hint={t('paidHint', { paid: kpi.paid })} />
          </div>

          {/* Charts row */}
          <div className="space-y-4 mb-6">
            <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">{t('earnings6m')}</h2>
                <span className="text-xs text-ink-500">{cur}</span>
              </div>
              <LineChart points={monthlySeries} format={(n) => fmtMoney(n, cur)} />
            </div>
            <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">{t('byStatus')}</h2>
                <span className="text-xs text-ink-500">
                  {t('invoiceCount', { count: myInvoices.length })}
                </span>
              </div>
              <HBarChart bars={statusSegments} format={(n) => String(n)} showShare />
            </div>
          </div>

          {/* Recent + team panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">{t('recent')}</h2>
                <span className="text-xs text-ink-500">{t('totalCount', { count: myInvoices.length })}</span>
              </div>

              {myInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-ink-500 text-sm">
                    {isOwnerOfActive
                      ? t('emptyOwner')
                      : t('emptyMember')}
                  </p>
                  {isOwnerOfActive && (
                    <Link href="/invoices/new" className="text-ink-900 text-sm mt-2 inline-block hover:underline font-medium">
                      {t('createFirst')}
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-ink-200">
                  {recent.map((inv: any) => {
                    const a = inv.attributes || inv;
                    const status = a.status || 'draft';
                    return (
                      <li key={inv.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-ink-900">#{a.number}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_PILL[status]}`}>
                              {ts(status)}
                            </span>
                            {a.exportedAt && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-900 text-ink-900 uppercase tracking-wide">
                                {t('exportedBadge')}
                              </span>
                            )}
                          </div>
                          <div className="text-ink-500 text-xs mt-0.5 truncate">
                            {t('rowMeta', { client: a.clientName ?? '', date: a.date ?? '', author: a.author?.email || '—' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-semibold text-ink-900 text-sm">
                            {fmtMoney(inv.displayAmount || 0, cur)}
                          </span>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2.5 py-1 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
                          >
                            {status === 'paid' ? t('view') : t('edit')}
                          </Link>
                          {isOwnerOfActive && status !== 'paid' && (
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                              aria-label={t('delete')}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {myInvoices.length > recent.length && (
                <div className="mt-3 text-right">
                  <Link href="/invoices" className="text-xs text-ink-900 hover:underline font-medium">
                    {t('viewAll', { count: myInvoices.length })}
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">{t('team')}</h2>
                <div className="text-xs text-ink-500 mb-3">
                  {t('people', { count: memberCount })}
                </div>
                <ul className="space-y-2">
                  {activeTeam?.owner && (
                    <li className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        <span className="font-medium text-ink-900">{activeTeam.owner.email}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-900 text-paper uppercase tracking-wide">
                        {t('ownerBadge')}
                      </span>
                    </li>
                  )}
                  {(activeTeam?.members || []).map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        <span className="font-medium text-ink-900">{m.email}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-200 text-ink-700 uppercase tracking-wide">
                        {t('memberBadge')}
                      </span>
                    </li>
                  ))}
                </ul>
                {isOwnerOfActive && (
                  <Link
                    href="/teams"
                    className="mt-3 inline-block text-xs text-ink-900 hover:underline font-medium"
                  >
                    {t('manageTeam')}
                  </Link>
                )}
              </div>

              {isOwnerOfActive && perMember.length > 0 && (
                <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
                  <h2 className="text-sm font-semibold text-ink-900 mb-3">{t('perMember')}</h2>
                  <ul className="space-y-2">
                    {perMember.slice(0, 6).map((m) => {
                      const pct = kpi.total > 0 ? Math.round((m.total / kpi.total) * 100) : 0;
                      return (
                        <li key={m.email}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-ink-800 truncate mr-2">{m.email}</span>
                            <span className="text-ink-500">
                              {m.count} · <span className="text-ink-900 font-semibold">{fmtMoney(m.total, cur)}</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div className="h-full bg-ink-900" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type KpiTone = 'violet' | 'sky' | 'amber' | 'emerald';

// Editorial KPI card: white, ink border, uppercase mono label and a mono value
// with aligned figures. Same as the landing preview (no colour accent). `tone`
// is kept for call-site compatibility, unused.
function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
}) {
  return (
    <div className="border border-ink-200 rounded-2xl p-5 shadow-card bg-paper">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500 font-mono-tight">{label}</div>
      <div className="text-2xl font-semibold mt-1.5 font-mono-tight num-dot text-ink-900">{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
    </div>
  );
}
