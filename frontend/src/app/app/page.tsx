// src/app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getInvoices,
  deleteInvoice,
  getMyTeams,
  getMyInvitations,
} from '@/lib/api';
import { getUser, logout, getActiveTeamId, setActiveTeamId } from '@/lib/auth';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  cancelled: 'Cancelada',
};

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

function monthLabel(d: Date) {
  return d.toLocaleDateString('es-ES', { month: 'short' });
}

function lastMonths(n: number): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return out;
}

interface LineChartProps {
  points: { label: string; value: number }[];
  currency?: string;
}

function LineChart({ points, currency = 'USD' }: LineChartProps) {
  const width = 560;
  const height = 180;
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const coords = points.map((p, i) => {
    const x = pad.left + step * i;
    const y = pad.top + innerH - (p.value / max) * innerH;
    return { x, y, ...p };
  });

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area =
    coords.length > 0
      ? `${path} L ${coords[coords.length - 1].x} ${pad.top + innerH} L ${coords[0].x} ${pad.top + innerH} Z`
      : '';

  const gridY = [0, 0.5, 1].map((t) => ({
    y: pad.top + innerH - t * innerH,
    value: Math.round(max * t),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridY.map((g, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={g.y}
            y2={g.y}
            stroke="#ece9f3"
            strokeDasharray="3 3"
          />
          <text x={pad.left - 6} y={g.y + 3} textAnchor="end" fontSize="9" fill="#71717a">
            {fmtMoney(g.value, currency)}
          </text>
        </g>
      ))}
      {area && <path d={area} fill="url(#lineArea)" />}
      {path && <path d={path} fill="none" stroke="url(#lineStroke)" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />}
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={4} fill="#ffffff" stroke="#8b5cf6" strokeWidth={2} />
          <text x={c.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#52525b">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface DonutProps {
  segments: { key: string; label: string; value: number; color: string }[];
}

function Donut({ segments }: DonutProps) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const size = 140;
  const r = 56;
  const stroke = 18;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s, i) => {
            const frac = s.value / total;
            const len = C * frac;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#18181b">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="10" fill="#71717a">
          facturas
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs flex-1">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-ink-700 flex-1">{s.label}</span>
            <span className="text-ink-900 font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [activeTeamId, setActiveTeamIdState] = useState<number | null>(null);
  const [isOwnerOfActive, setIsOwnerOfActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

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
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
      await deleteInvoice(id);
      await loadAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const changeTeam = (id: number) => {
    setActiveTeamId(id);
    window.location.reload();
  };

  // Dueño: muestra todas las facturas con el total de la factura.
  // Miembro: muestra todas las facturas del equipo también (para poder entrar
  // y añadir su sección), pero el importe visible es su aporte (suma de los
  // subtotales de SUS secciones); 0 si aún no ha añadido ninguna.
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
    return months.map((d) => ({ label: monthLabel(d), value: buckets.get(monthKey(d)) || 0 }));
  }, [myInvoices]);

  const statusSegments = useMemo(
    () => [
      { key: 'draft', label: 'Borradores', value: kpi.drafts, color: STATUS_COLORS.draft },
      { key: 'sent', label: 'Enviadas', value: kpi.sent, color: STATUS_COLORS.sent },
      { key: 'paid', label: 'Pagadas', value: kpi.paid, color: STATUS_COLORS.paid },
      { key: 'cancelled', label: 'Canceladas', value: kpi.cancelled, color: STATUS_COLORS.cancelled },
    ],
    [kpi],
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {activeTeam ? (
              <>
                <span className="text-ink-800 font-medium">{activeTeam.name}</span>
                {isOwnerOfActive ? ' · eres dueño' : ' · eres miembro'}
              </>
            ) : (
              'Registro del equipo'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {user?.email && <span className="text-xs text-ink-500 hidden sm:inline">{user.email}</span>}
          {teams.length > 0 && (
            <select
              value={activeTeamId || ''}
              onChange={(e) => changeTeam(Number(e.target.value))}
              className="px-3 py-2 text-sm bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <Link
            href="/invoices"
            className="px-3 py-2 text-sm bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Facturas
          </Link>
          <Link
            href="/reports"
            className="px-3 py-2 text-sm bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Reportes
          </Link>
          <Link
            href="/teams"
            className="px-3 py-2 text-sm bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Equipos
          </Link>
          <Link
            href="/settings"
            className="px-3 py-2 text-sm bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Ajustes
          </Link>
          {isOwnerOfActive && (
            <Link
              href="/invoices/new"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-paper font-semibold rounded-xl text-sm shadow-sm shadow-violet-500/30 transition-all"
            >
              + Nueva Factura
            </Link>
          )}
          <button
            onClick={logout}
            className="px-3 py-2 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="mb-5 text-sm bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-ink-800">
            Tienes {pendingInvitations.length} invitación{pendingInvitations.length === 1 ? '' : 'es'} pendiente
            {pendingInvitations.length === 1 ? '' : 's'}.
          </span>
          <div className="flex gap-2">
            {pendingInvitations.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/invitations/${inv.token}`}
                className="text-xs px-3 py-1.5 bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
              >
                {inv.team?.name || 'Equipo'}
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-ink-500">Cargando dashboard...</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              tone="violet"
              label={isOwnerOfActive ? 'Total facturado' : 'Mi aporte'}
              value={fmtMoney(kpi.total, cur)}
              hint={`${myInvoices.length} factura${myInvoices.length === 1 ? '' : 's'}`}
            />
            <KpiCard tone="sky" label="Este mes" value={fmtMoney(kpi.thisMonth, cur)} hint={new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} />
            <KpiCard
              tone="amber"
              label="Pendientes"
              value={`${kpi.drafts + kpi.sent}`}
              hint={`${kpi.drafts} borradores · ${kpi.sent} enviadas`}
            />
            <KpiCard tone="emerald" label="Exportadas" value={`${kpi.exported}`} hint={`${kpi.paid} pagadas`} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">Facturación · últimos 6 meses</h2>
                <span className="text-xs text-ink-500">{cur}</span>
              </div>
              <LineChart points={monthlySeries} currency={cur} />
            </div>
            <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Distribución por estado</h2>
              <Donut segments={statusSegments} />
            </div>
          </div>

          {/* Recent + team panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">Últimas facturas</h2>
                <span className="text-xs text-ink-500">{myInvoices.length} total</span>
              </div>

              {myInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-ink-500 text-sm">
                    {isOwnerOfActive
                      ? 'Todavía no hay facturas en este equipo.'
                      : 'El dueño aún no ha creado ninguna factura.'}
                  </p>
                  {isOwnerOfActive && (
                    <Link href="/invoices/new" className="text-ink-900 text-sm mt-2 inline-block hover:underline font-medium">
                      Crear la primera →
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
                              {STATUS_LABELS[status]}
                            </span>
                            {a.exportedAt && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-900 text-ink-900 uppercase tracking-wide">
                                exportada
                              </span>
                            )}
                          </div>
                          <div className="text-ink-500 text-xs mt-0.5 truncate">
                            {a.clientName} · {a.date} · por {a.author?.email || '—'}
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
                            Editar
                          </Link>
                          {isOwnerOfActive && (
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                              aria-label="Eliminar"
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
                    Ver todas ({myInvoices.length}) →
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">Equipo</h2>
                <div className="text-xs text-ink-500 mb-3">
                  {memberCount} persona{memberCount === 1 ? '' : 's'}
                </div>
                <ul className="space-y-2">
                  {activeTeam?.owner && (
                    <li className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        <span className="font-medium text-ink-900">{activeTeam.owner.email}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-900 text-paper uppercase tracking-wide">
                        dueño
                      </span>
                    </li>
                  )}
                  {(activeTeam?.members || []).map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        <span className="font-medium text-ink-900">{m.email}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-200 text-ink-700 uppercase tracking-wide">
                        miembro
                      </span>
                    </li>
                  ))}
                </ul>
                {isOwnerOfActive && (
                  <Link
                    href="/teams"
                    className="mt-3 inline-block text-xs text-ink-900 hover:underline font-medium"
                  >
                    Gestionar equipo →
                  </Link>
                )}
              </div>

              {isOwnerOfActive && perMember.length > 0 && (
                <div className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
                  <h2 className="text-sm font-semibold text-ink-900 mb-3">Facturación por miembro</h2>
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

const KPI_TONES: Record<KpiTone, { card: string; value: string; dot: string }> = {
  violet: {
    card: 'bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 border-violet-100',
    value: 'bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent',
    dot: 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
  },
  sky: {
    card: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-sky-100',
    value: 'bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent',
    dot: 'bg-gradient-to-r from-sky-500 to-indigo-500',
  },
  amber: {
    card: 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100',
    value: 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent',
    dot: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
  emerald: {
    card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-100',
    value: 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent',
    dot: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
};

function KpiCard({
  label,
  value,
  hint,
  tone = 'violet',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
}) {
  const t = KPI_TONES[tone];
  return (
    <div className={`relative overflow-hidden border rounded-2xl p-5 shadow-card ${t.card}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${t.dot}`} />
        <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      </div>
      <div className={`text-2xl font-bold mt-1 font-mono ${t.value}`}>{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
    </div>
  );
}
