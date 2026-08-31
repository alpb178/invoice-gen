'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyTeams, updateTeam } from '@/lib/api';
import { getUser, getActiveTeamId, setActiveTeamId } from '@/lib/auth';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import ClearableField from '@/components/ClearableField';
import { useToast } from '@/components/Toast';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BOB'];

export default function SettingsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const { owned, memberOf } = await getMyTeams();
        const merged = [...owned, ...memberOf.filter((m: any) => !owned.find((o: any) => o.id === m.id))];
        setTeams(merged);
        const user = getUser();
        const saved = getActiveTeamId();
        const pick = merged.find((t: any) => t.id === saved) || merged[0];
        if (pick) {
          setTeamId(pick.id);
          setActiveTeamId(pick.id);
          setIsOwner(pick.owner?.id === user?.id);
          setForm({
            name: pick.name || '',
            companyName: pick.companyName || '',
            companyCIF: pick.companyCIF || '',
            companyAddress: pick.companyAddress || '',
            defaultClientName: pick.defaultClientName || '',
            defaultClientIBAN: pick.defaultClientIBAN || '',
            defaultClientSwift: pick.defaultClientSwift || '',
            defaultClientBank: pick.defaultClientBank || '',
            defaultCurrency: pick.defaultCurrency || 'USD',
            defaultNotes: pick.defaultNotes || '',
          });
        }
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const switchTeam = (id: number) => {
    const team = teams.find((t) => t.id === id);
    const user = getUser();
    setTeamId(id);
    setActiveTeamId(id);
    setIsOwner(team?.owner?.id === user?.id);
    setForm({
      name: team.name || '',
      companyName: team.companyName || '',
      companyCIF: team.companyCIF || '',
      companyAddress: team.companyAddress || '',
      defaultClientName: team.defaultClientName || '',
      defaultClientIBAN: team.defaultClientIBAN || '',
      defaultClientSwift: team.defaultClientSwift || '',
      defaultClientBank: team.defaultClientBank || '',
      defaultCurrency: team.defaultCurrency || 'USD',
      defaultNotes: team.defaultNotes || '',
    });
  };

  const setField = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!teamId) return;
    setSaving(true);
    try {
      await updateTeam(teamId, form);
      toast.success('Configuración guardada.');
    } catch (e) {
      toast.error(e);
    }
    setSaving(false);
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-ink-900 text-sm focus:outline-none focus:border-ink-900 disabled:bg-ink-50';
  const labelClass = 'text-xs text-ink-600 mb-1.5 block';

  if (loading) {
    return (
      <div className="w-full px-4 md:px-10 lg:px-16 py-8 space-y-4">
        <Skeleton className="h-7 w-40" />
        <SkeletonCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="w-full px-4 md:px-10 lg:px-16 py-10 text-center">
        <p className="text-ink-700 mb-4">No perteneces a ningún equipo.</p>
        <Link href="/teams" className="text-ink-900 font-medium underline">
          Ir a equipos
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-10 lg:px-16 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-serif-display text-3xl md:text-4xl font-medium tracking-tight text-ink-900">Configuración</h1>
          <p className="text-xs text-ink-500 mt-1">
            Define los datos del emisor y los valores por defecto del receptor para este equipo.
          </p>
        </div>
        {teams.length > 1 && (
          <select
            value={teamId}
            onChange={(e) => switchTeam(Number(e.target.value))}
            className="px-3 py-2 text-sm bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!isOwner && (
        <div className="mb-5 text-xs text-ink-700 bg-ink-50 border border-ink-200 rounded-xl px-3 py-2">
          Solo el dueño del equipo puede cambiar esta configuración.
        </div>
      )}

      <div className="bg-paper border border-ink-200 rounded-2xl p-6 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider font-mono-tight mb-4">Equipo</h2>
        <ClearableField
          label="Nombre del equipo"
          value={form.name}
          onChange={(v) => setField('name', v)}
          disabled={!isOwner}
          inputClassName={inputClass}
          labelClassName={labelClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-paper border border-ink-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider font-mono-tight mb-4">Datos del emisor</h2>
          <div className="space-y-3">
            <ClearableField
              label="Empresa"
              value={form.companyName}
              onChange={(v) => setField('companyName', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
            <ClearableField
              label="CIF"
              value={form.companyCIF}
              onChange={(v) => setField('companyCIF', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
            <ClearableField
              label="Dirección"
              value={form.companyAddress}
              onChange={(v) => setField('companyAddress', v)}
              disabled={!isOwner}
              placeholder="Calle..."
              multiline
              heightClass="h-20"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
          </div>
        </div>

        <div className="bg-paper border border-ink-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider font-mono-tight mb-4">Receptor por defecto</h2>
          <div className="space-y-3">
            <ClearableField
              label="Nombre"
              value={form.defaultClientName}
              onChange={(v) => setField('defaultClientName', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
            <ClearableField
              label="IBAN"
              value={form.defaultClientIBAN}
              onChange={(v) => setField('defaultClientIBAN', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
            <ClearableField
              label="Swift/BIC"
              value={form.defaultClientSwift}
              onChange={(v) => setField('defaultClientSwift', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
            <ClearableField
              label="Banco"
              value={form.defaultClientBank}
              onChange={(v) => setField('defaultClientBank', v)}
              disabled={!isOwner}
              placeholder="XXXX"
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
          </div>
        </div>
      </div>

      <div className="bg-paper border border-ink-200 rounded-2xl p-6 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider font-mono-tight mb-4">Preferencias por defecto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Moneda</label>
            <select
              disabled={!isOwner}
              value={form.defaultCurrency}
              onChange={(e) => setField('defaultCurrency', e.target.value)}
              className={inputClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <ClearableField
              label="Nota por defecto (opcional)"
              value={form.defaultNotes}
              onChange={(v) => setField('defaultNotes', v)}
              disabled={!isOwner}
              inputClassName={inputClass}
              labelClassName={labelClass}
            />
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper font-semibold rounded-xl text-sm transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  );
}
