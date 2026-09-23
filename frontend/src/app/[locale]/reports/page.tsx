'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { intlTag } from '@/i18n/config';
import { getInvoices, getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, setActiveTeamId } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { Skeleton, SkeletonCard, SkeletonKpiGrid } from '@/components/Skeleton';
import { LineChart } from '@/components/Charts';

type Grouping = 'day' | 'month' | 'year';

const STATUS_PILL: Record<string, string> = {
  draft: 'bg-ink-100 text-ink-700 border-ink-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function groupKey(dateStr: string, grouping: Grouping) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (grouping === 'year') return `${y}`;
  if (grouping === 'month') return `${y}-${m}`;
  return `${y}-${m}-${day}`;
}

function groupLabel(key: string, grouping: Grouping, tag: string) {
  if (grouping === 'year') return key;
  if (grouping === 'month') {
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(tag, { month: 'long', year: 'numeric' });
  }
  const [y, m, day] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, Number(day));
  return d.toLocaleDateString(tag, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [grouping, setGrouping] = useState<Grouping>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [membersOpen, setMembersOpen] = useState<Record<string, boolean>>({});
  const t = useTranslations('reports');
  const ts = useTranslations('status');
  const td = useTranslations('dashboard');
  const tag = intlTag[useLocale()];

  useEffect(() => {
    (async () => {
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
        setActiveTeamId(pick.id);
        setActiveTeam(pick);
        const u = getUser();
        setMe(u);
        setIsOwner(pick.owner?.id === u?.id);
        const data = await getInvoices(pick.id);
        setInvoices(data || []);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    })();
  }, [router]);

  const invoiceAmount = (inv: any) => {
    const a = inv.attributes || inv;
    if (isOwner) return a.totalAmount || 0;
    const sections = a.sections?.data || a.sections || [];
    return sections.reduce((sum: number, s: any) => {
      const sa = s.attributes || s;
      return sum + (Number(sa.subtotal) || 0);
    }, 0);
  };

  // An invoice's sections, with the author normalized.
  const sectionsOf = (inv: any) => {
    const a = inv.attributes || inv;
    const list = a.sections?.data || a.sections || [];
    return list.map((s: any) => {
      const sa = s.attributes || s;
      const author = sa.author?.data?.attributes || sa.author || a.author || null;
      return { subtotal: Number(sa.subtotal) || 0, authorId: author?.id ?? null, authorEmail: author?.email || '—' };
    });
  };

  // What the signed-in user contributed: only their own sections. For a member
  // it matches the visible total (the API already filters out other people's);
  // for the owner it separates their contribution from the rest of the team.
  const myAmount = (inv: any) =>
    sectionsOf(inv)
      .filter((s: any) => (s.authorId != null && me?.id != null ? s.authorId === me.id : s.authorEmail === me?.email))
      .reduce((sum: number, s: any) => sum + s.subtotal, 0);

  const cur = activeTeam?.defaultCurrency || 'USD';
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n || 0);
  const filtered = useMemo(() => {
    return invoices.filter((inv: any) => {
      const a = inv.attributes || inv;
      if (!a.date) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, statusFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; label: string; total: number; count: number; rows: any[] }>();
    for (const inv of filtered) {
      const a = inv.attributes || inv;
      const key = groupKey(a.date, grouping);
      const entry = map.get(key) || { key, label: groupLabel(key, grouping, tag), total: 0, count: 0, rows: [] };
      entry.total += invoiceAmount(inv);
      entry.count += 1;
      entry.rows.push(inv);
      map.set(key, entry);
    }
    const arr = Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
    for (const g of arr) {
      g.rows.sort((a: any, b: any) => {
        const da = (a.attributes || a).date;
        const db = (b.attributes || b).date;
        return da < db ? 1 : -1;
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, grouping, isOwner, tag]);

  const grandTotal = useMemo(() => groups.reduce((a, g) => a + g.total, 0), [groups]);

  // Earnings per month — only what the signed-in user contributed. A continuous
  // range between the first and last month with data (months without invoices
  // show as zero, they are not skipped), trimmed to the last 12 so the bars do
  // not get crammed.
  const monthlyEarnings = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const inv of filtered) {
      const a = inv.attributes || inv;
      const key = groupKey(a.date, 'month');
      buckets.set(key, (buckets.get(key) || 0) + myAmount(inv));
    }
    if (buckets.size === 0) return [];

    const keys = Array.from(buckets.keys()).sort();
    const [firstY, firstM] = keys[0].split('-').map(Number);
    const [lastY, lastM] = keys[keys.length - 1].split('-').map(Number);

    const out: { key: string; label: string; value: number }[] = [];
    let y = firstY;
    let m = firstM;
    while (y < lastY || (y === lastY && m <= lastM)) {
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const d = new Date(y, m - 1, 1);
      out.push({
        key,
        label: `${d.toLocaleDateString(tag, { month: 'short' })} ${String(y).slice(2)}`,
        value: buckets.get(key) || 0,
      });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return out.slice(-12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, me, tag]);

  const myTotal = useMemo(() => monthlyEarnings.reduce((a, m) => a + m.value, 0), [monthlyEarnings]);

  // Earnings per member — attributed to each section's author, who is the one
  // who actually contributed that subtotal. The owner sees the whole team; a
  // member only receives their own sections from the API, so they see
  // themselves.
  const perMember = useMemo(() => {
    const map = new Map<
      string,
      { email: string; total: number; invoices: Set<number>; sections: number; months: Map<string, number> }
    >();

    for (const inv of filtered) {
      const a = inv.attributes || inv;
      const monthK = groupKey(a.date, 'month');
      for (const s of sectionsOf(inv)) {
        const email = s.authorEmail;
        const entry =
          map.get(email) || { email, total: 0, invoices: new Set<number>(), sections: 0, months: new Map() };
        entry.total += s.subtotal;
        entry.invoices.add(inv.id);
        entry.sections += 1;
        entry.months.set(monthK, (entry.months.get(monthK) || 0) + s.subtotal);
        map.set(email, entry);
      }
    }

    const arr = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const sum = arr.reduce((acc, m) => acc + m.total, 0);
    return arr.map((m) => ({
      email: m.email,
      total: m.total,
      sections: m.sections,
      invoiceCount: m.invoices.size,
      share: sum > 0 ? m.total / sum : 0,
      months: Array.from(m.months.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1)),
    }));
  }, [filtered]);

  const membersTotal = useMemo(() => perMember.reduce((a, m) => a + m.total, 0), [perMember]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleMember = (email: string) => setMembersOpen((prev) => ({ ...prev, [email]: !prev[email] }));

  return (
    <div className="w-full px-4 md:px-10 lg:px-16 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif-display text-3xl md:text-4xl font-medium tracking-tight text-ink-900">{t('title')}</h1>
          <p className="text-ink-500 text-sm mt-1">
            {activeTeam ? (
              <>
                <span className="text-ink-800 font-medium">{activeTeam.name}</span> · {t('currency', { currency: cur })}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl border border-ink-200 bg-paper overflow-hidden">
            {(['day', 'month', 'year'] as Grouping[]).map((g) => (
              <button
                key={g}
                onClick={() => setGrouping(g)}
                className={`px-3 py-2 text-xs transition-colors ${
                  grouping === g ? 'bg-ink-900 text-paper' : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                {t(`grouping.${g}`)}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="draft">{ts('draft')}</option>
            <option value="sent">{ts('sent')}</option>
            <option value="paid">{ts('paid')}</option>
            <option value="cancelled">{ts('cancelled')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonKpiGrid count={3} />
          <SkeletonCard className="h-48">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-32 w-full mt-4 rounded-xl" />
          </SkeletonCard>
        </div>
      ) : (
        <>
          <div className="bg-paper border border-ink-200 rounded-2xl p-5 mb-6 shadow-card flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-ink-500 uppercase tracking-wider">{t('periodTotal')}</div>
              <div className="text-3xl font-bold font-mono text-ink-900 mt-1">{fmtMoney(grandTotal)}</div>
            </div>
            <div className="text-right text-sm text-ink-500">
              {td('invoiceCount', { count: filtered.length })} · {t('groupCount', { count: groups.length })}
            </div>
          </div>

          {/* Earnings per month */}
          <div className="bg-paper border border-ink-200 rounded-2xl p-5 mb-4 shadow-card">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-ink-900">{t('myMonthly')}</h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isOwner ? t('onlyYourSectionsOwner') : t('onlyYourSections')}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-ink-900">{fmtMoney(myTotal)}</div>
                <div className="text-xs text-ink-500">
                  {t('monthCount', { count: monthlyEarnings.length })} · {cur}
                </div>
              </div>
            </div>
            {monthlyEarnings.length === 0 ? (
              <p className="text-sm text-ink-500 py-8 text-center">{t('noData')}</p>
            ) : (
              <LineChart points={monthlyEarnings} format={fmtMoney} />
            )}
          </div>

          {/* Earnings per member */}
          <div className="bg-paper border border-ink-200 rounded-2xl p-5 mb-6 shadow-card">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-sm font-semibold text-ink-900">{t('perMember')}</h2>
              <span className="text-xs text-ink-500">
                {t('memberCount', { count: perMember.length })}
              </span>
            </div>

            {perMember.length === 0 ? (
              <p className="text-sm text-ink-500 py-8 text-center">
                {t('noSections')}
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {perMember.map((m) => {
                    const open = !!membersOpen[m.email];
                    return (
                      <li key={m.email} className="border border-ink-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleMember(m.email)}
                          aria-expanded={open}
                          className="w-full px-4 py-3 text-left hover:bg-ink-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-paper uppercase">
                              {m.email.slice(0, 2)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-ink-900 truncate">{m.email}</div>
                              <div className="text-xs text-ink-500">
                                {td('invoiceCount', { count: m.invoiceCount })} · {t('sectionCount', { count: m.sections })}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-mono font-bold text-ink-900">{fmtMoney(m.total)}</div>
                              <div className="text-xs text-ink-500">{t('shareOfTotal', { pct: Math.round(m.share * 100) })}</div>
                            </div>
                            <span className={`text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mt-3">
                            <div
                              className="h-full rounded-full bg-ink-900 transition-all duration-500"
                              style={{ width: `${Math.max(m.share * 100, 1)}%` }}
                            />
                          </div>
                        </button>

                        {open && (
                          <ul className="border-t border-ink-200 divide-y divide-ink-200 bg-ink-50/60">
                            {m.months.map(([key, value]) => (
                              <li key={key} className="flex items-center justify-between px-4 py-2 text-sm">
                                <span className="text-ink-700 capitalize">{groupLabel(key, 'month', tag)}</span>
                                <span className="font-mono text-ink-900">{fmtMoney(value)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-between border-t border-ink-200 mt-4 pt-3 text-sm">
                  <span className="text-ink-500">{t('sectionsSum')}</span>
                  <span className="font-mono font-semibold text-ink-900">{fmtMoney(membersTotal)}</span>
                </div>
              </>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-20 bg-paper border border-ink-200 rounded-2xl shadow-card">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-ink-500 text-sm">{t('noInvoices')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {groups.map((g) => {
                const open = !!expanded[g.key];
                return (
                  <li key={g.key} className="bg-paper border border-ink-200 rounded-2xl shadow-card overflow-hidden">
                    <button
                      onClick={() => toggle(g.key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-ink-50 transition-colors"
                      aria-expanded={open}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
                        <div>
                          <div className="font-semibold text-ink-900 capitalize">{g.label}</div>
                          <div className="text-xs text-ink-500">{td('invoiceCount', { count: g.count })}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-ink-900 text-lg">{fmtMoney(g.total)}</div>
                    </button>
                    {open && (
                      <ul className="border-t border-ink-200 divide-y divide-ink-200">
                        {g.rows.map((inv: any) => {
                          const a = inv.attributes || inv;
                          const status = a.status || 'draft';
                          return (
                            <li key={inv.id} className="flex items-center justify-between px-5 py-3 gap-3 hover:bg-ink-50 transition-colors">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-ink-900 text-sm">#{a.number}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_PILL[status]}`}>
                                    {ts(status)}
                                  </span>
                                  {a.exportedAt && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-900 text-ink-900 uppercase tracking-wide">
                                      {td('exportedBadge')}
                                    </span>
                                  )}
                                </div>
                                <div className="text-ink-500 text-xs mt-0.5 truncate">
                                  {a.clientName || '—'} · {a.date} · {a.author?.email || '—'}
                                </div>
                              </div>
                              <span className="font-mono font-semibold text-ink-900 text-sm shrink-0">
                                {fmtMoney(invoiceAmount(inv))}
                              </span>
                              <Link
                                href={`/invoices/${inv.id}`}
                                className="px-2.5 py-1 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors shrink-0"
                              >
                                {td('view')}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
