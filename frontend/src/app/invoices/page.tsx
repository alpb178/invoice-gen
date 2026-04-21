'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getInvoices, deleteInvoice, getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, setActiveTeamId } from '@/lib/auth';
import { SkeletonList } from '@/components/Skeleton';

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

function fmtMoney(n: number, cur = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n || 0);
}

export default function InvoicesIndexPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { owned, memberOf } = await getMyTeams();
      const merged = [...owned, ...memberOf.filter((m: any) => !owned.find((o: any) => o.id === m.id))];
      if (merged.length === 0) {
        router.replace('/teams');
        return;
      }
      const saved = getActiveTeamId();
      const pick = merged.find((t: any) => t.id === saved) || merged[0];
      setActiveTeamId(pick.id);
      const user = getUser();
      setIsOwner(pick.owner?.id === user?.id);
      const data = await getInvoices(pick.id);
      setInvoices(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
      await deleteInvoice(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter((inv: any) => {
        const a = inv.attributes || inv;
        if (status !== 'all' && a.status !== status) return false;
        if (!q) return true;
        const hay = [a.number, a.clientName, a.companyName, a.author?.email].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      })
      .map((inv: any) => {
        const a = inv.attributes || inv;
        if (isOwner) return { ...inv, displayAmount: a.totalAmount || 0 };
        const sections = a.sections?.data || a.sections || [];
        const own = sections.reduce((sum: number, s: any) => {
          const sa = s.attributes || s;
          return sum + (Number(sa.subtotal) || 0);
        }, 0);
        return { ...inv, displayAmount: own };
      });
  }, [invoices, query, status, isOwner]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link href="/app" className="text-ink-500 hover:text-ink-900 text-sm mb-1 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">Todas las facturas</h1>
        </div>
        {isOwner && (
          <Link
            href="/invoices/new"
            className="px-5 py-2 bg-ink-900 hover:bg-ink-800 text-paper font-semibold rounded-xl text-sm transition-colors"
          >
            + Nueva Factura
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por número, cliente, autor..."
          className="flex-1 min-w-[220px] px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-sm text-ink-900 focus:outline-none focus:border-ink-900"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-sm text-ink-900 focus:outline-none focus:border-ink-900"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borradores</option>
          <option value="sent">Enviadas</option>
          <option value="paid">Pagadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-ink-500">Sin resultados.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv: any) => {
            const a = inv.attributes || inv;
            const st = a.status || 'draft';
            return (
              <div
                key={inv.id}
                className="bg-paper border border-ink-200 rounded-2xl p-5 flex items-center justify-between hover:border-ink-400 transition-colors shadow-card"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center text-xl border border-ink-200 shrink-0">
                    🧾
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-ink-900">Factura #{a.number}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_PILL[st]}`}>
                        {STATUS_LABELS[st]}
                      </span>
                      {a.exportedAt && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-ink-900 text-ink-900 uppercase tracking-wide">
                          exportada
                        </span>
                      )}
                    </div>
                    <div className="text-ink-500 text-sm mt-0.5 truncate">
                      {a.clientName} · {a.date} · por {a.author?.email || '—'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-semibold text-ink-900 text-lg">
                    {fmtMoney(inv.displayAmount || 0, a.currency || 'USD')}
                  </span>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="px-3 py-1.5 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
                  >
                    Editar
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
