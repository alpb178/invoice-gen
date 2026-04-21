'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getInvoices, getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, setActiveTeamId } from '@/lib/auth';
import { Skeleton, SkeletonCard, SkeletonKpiGrid } from '@/components/Skeleton';

type Grouping = 'day' | 'month' | 'year';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  cancelled: 'Cancelada',
};

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

function groupLabel(key: string, grouping: Grouping) {
  if (grouping === 'year') return key;
  if (grouping === 'month') {
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
  const [y, m, day] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, Number(day));
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grouping, setGrouping] = useState<Grouping>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
        setIsOwner(pick.owner?.id === u?.id);
        const data = await getInvoices(pick.id);
        setInvoices(data || []);
      } catch (e) {
        console.error(e);
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
      const entry = map.get(key) || { key, label: groupLabel(key, grouping), total: 0, count: 0, rows: [] };
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
  }, [filtered, grouping, isOwner]);

  const grandTotal = useMemo(() => groups.reduce((a, g) => a + g.total, 0), [groups]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link href="/app" className="text-ink-500 hover:text-ink-900 text-sm mb-2 inline-block">← Volver</Link>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Reportes</h1>
          <p className="text-ink-500 text-sm mt-1">
            {activeTeam ? (
              <>
                <span className="text-ink-800 font-medium">{activeTeam.name}</span> · moneda {cur}
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
                {g === 'day' ? 'Día' : g === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="paid">Pagada</option>
            <option value="cancelled">Cancelada</option>
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
              <div className="text-xs text-ink-500 uppercase tracking-wider">Total del periodo</div>
              <div className="text-3xl font-bold font-mono text-ink-900 mt-1">{fmtMoney(grandTotal)}</div>
            </div>
            <div className="text-right text-sm text-ink-500">
              {filtered.length} factura{filtered.length === 1 ? '' : 's'} · {groups.length} grupo
              {groups.length === 1 ? '' : 's'}
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-20 bg-paper border border-ink-200 rounded-2xl shadow-card">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-ink-500 text-sm">No hay facturas en este equipo con los filtros actuales.</p>
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
                          <div className="text-xs text-ink-500">{g.count} factura{g.count === 1 ? '' : 's'}</div>
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
                                    {STATUS_LABELS[status]}
                                  </span>
                                  {a.exportedAt && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-900 text-ink-900 uppercase tracking-wide">
                                      exportada
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
                                Ver
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
