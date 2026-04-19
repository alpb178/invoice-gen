'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyTeams, updateTeam } from '@/lib/api';
import { getUser, getActiveTeamId, setActiveTeamId } from '@/lib/auth';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BOB'];

export default function SettingsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
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
      } catch (e: any) {
        setFlash({ type: 'err', text: e.message });
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
    setFlash(null);
    try {
      await updateTeam(teamId, form);
      setFlash({ type: 'ok', text: 'Configuración guardada' });
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
    setSaving(false);
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-ink-900 text-sm focus:outline-none focus:border-ink-900 disabled:bg-ink-50';
  const labelClass = 'text-xs text-ink-600 mb-1.5 block';

  if (loading) return <div className="text-center py-20 text-ink-500">Cargando...</div>;

  if (!teamId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-ink-700 mb-4">No perteneces a ningún equipo.</p>
        <Link href="/teams" className="text-ink-900 font-medium underline">
          Ir a equipos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <Link href="/app" className="text-ink-500 hover:text-ink-900 text-sm mb-1 inline-block">
            ← Facturas
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">Configuración</h1>
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

      {flash && (
        <div
          className={`mb-4 text-sm rounded-lg px-3 py-2 border ${
            flash.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {flash.text}
        </div>
      )}

      <div className="bg-paper border border-ink-200 rounded-2xl p-6 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Equipo</h2>
        <div>
          <label className={labelClass}>Nombre del equipo</label>
          <input
            disabled={!isOwner}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-paper border border-ink-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Datos del emisor</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Empresa</label>
              <input
                disabled={!isOwner}
                value={form.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                placeholder="Emx Comunicaciones S.L.U."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CIF</label>
              <input
                disabled={!isOwner}
                value={form.companyCIF}
                onChange={(e) => setField('companyCIF', e.target.value)}
                placeholder="B85173963"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <textarea
                disabled={!isOwner}
                value={form.companyAddress}
                onChange={(e) => setField('companyAddress', e.target.value)}
                className={inputClass + ' resize-none h-20'}
                placeholder="Calle..."
              />
            </div>
          </div>
        </div>

        <div className="bg-paper border border-ink-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Receptor por defecto</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                disabled={!isOwner}
                value={form.defaultClientName}
                onChange={(e) => setField('defaultClientName', e.target.value)}
                placeholder="Alejandro Pérez"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>IBAN</label>
              <input
                disabled={!isOwner}
                value={form.defaultClientIBAN}
                onChange={(e) => setField('defaultClientIBAN', e.target.value)}
                placeholder="BE95905522553858"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Swift/BIC</label>
              <input
                disabled={!isOwner}
                value={form.defaultClientSwift}
                onChange={(e) => setField('defaultClientSwift', e.target.value)}
                placeholder="TRWIBEB1XXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Banco</label>
              <input
                disabled={!isOwner}
                value={form.defaultClientBank}
                onChange={(e) => setField('defaultClientBank', e.target.value)}
                placeholder="Wise, Rue du Trône 100, Brussels..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-paper border border-ink-200 rounded-2xl p-6 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Preferencias por defecto</h2>
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
            <label className={labelClass}>Nota por defecto (opcional)</label>
            <input
              disabled={!isOwner}
              value={form.defaultNotes}
              onChange={(e) => setField('defaultNotes', e.target.value)}
              className={inputClass}
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
