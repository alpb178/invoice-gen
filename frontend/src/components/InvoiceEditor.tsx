// src/components/InvoiceEditor.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Section, Task } from '@/types';
import { saveFullInvoice, markInvoiceExported, getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, setActiveTeamId } from '@/lib/auth';
import InvoicePDFButton from './InvoicePDFButton';
import TaskImportModal from './TaskImportModal';

const emptyTask = (): Task => ({ description: '', amount: 0, code: '', hours: undefined });
const emptySection = (): Section => ({ title: '', subtitle: '', tasks: [emptyTask()] });

const defaultInvoice: Invoice = {
  number: '',
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  currency: 'USD',
  companyName: '',
  companyCIF: '',
  companyAddress: '',
  clientName: '',
  clientIBAN: '',
  clientSwift: '',
  clientBank: '',
  notes: '',
  sections: [emptySection()],
};

interface Props {
  initial?: Invoice;
}

export default function InvoiceEditor({ initial }: Props) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>(initial || defaultInvoice);
  const [saving, setSaving] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isTeamOwner, setIsTeamOwner] = useState(false);
  const [importSectionIdx, setImportSectionIdx] = useState<number | null>(null);
  const [partiesOpen, setPartiesOpen] = useState(false);
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    (async () => {
      try {
        const { owned, memberOf } = await getMyTeams();
        const merged = [...owned, ...memberOf.filter((m: any) => !owned.find((o: any) => o.id === m.id))];
        setTeams(merged);
        if (initial?.team && 'id' in initial.team) {
          setTeamId((initial.team as any).id);
        } else {
          const saved = getActiveTeamId();
          const pick = merged.find((t: any) => t.id === saved) || merged[0];
          if (pick) {
            setTeamId(pick.id);
            setActiveTeamId(pick.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [initial]);

  useEffect(() => {
    if (!teamId || teams.length === 0) return;
    const team = teams.find((t: any) => t.id === teamId);
    const ownerId = team?.owner?.id;
    setIsTeamOwner(ownerId != null && ownerId === user?.id);

    if (!initial && team) {
      setInvoice((prev) => ({
        ...prev,
        companyName: prev.companyName || team.companyName || '',
        companyCIF: prev.companyCIF || team.companyCIF || '',
        companyAddress: prev.companyAddress || team.companyAddress || '',
        clientName: prev.clientName || team.defaultClientName || '',
        clientIBAN: prev.clientIBAN || team.defaultClientIBAN || '',
        clientSwift: prev.clientSwift || team.defaultClientSwift || '',
        clientBank: prev.clientBank || team.defaultClientBank || '',
        currency: prev.currency || team.defaultCurrency || 'USD',
        notes: prev.notes || team.defaultNotes || '',
      }));
    }
  }, [teamId, teams, user?.id, initial]);

  const creatorId = initial?.createdBy?.id;
  const mine = !initial || creatorId === user?.id;
  const canEdit = mine || isTeamOwner;

  const update = (field: keyof Invoice, value: any) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const updateSection = (sIdx: number, field: keyof Section, value: any) => {
    setInvoice((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], [field]: value };
      return { ...prev, sections };
    });
  };

  const updateTask = (sIdx: number, tIdx: number, field: keyof Task, value: any) => {
    setInvoice((prev) => {
      const sections = [...prev.sections];
      const tasks = [...sections[sIdx].tasks];
      tasks[tIdx] = { ...tasks[tIdx], [field]: value };
      sections[sIdx] = { ...sections[sIdx], tasks };
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setInvoice((prev) => ({ ...prev, sections: [...prev.sections, emptySection()] }));
  };

  const removeSection = (sIdx: number) => {
    if (invoice.sections.length <= 1) return;
    setInvoice((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== sIdx) }));
  };

  const addTask = (sIdx: number) => {
    setInvoice((prev) => {
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], tasks: [...sections[sIdx].tasks, emptyTask()] };
      return { ...prev, sections };
    });
  };

  const importTasksIntoSection = (sIdx: number, newTasks: Task[]) => {
    if (!newTasks.length) return;
    setInvoice((prev) => {
      const sections = [...prev.sections];
      const current = sections[sIdx];
      const existing = current.tasks;
      const isEmptyRow = (t: Task) => !t.description && !t.code && !(t.amount > 0);
      const keptExisting = existing.filter((t) => !isEmptyRow(t));
      const merged = [...keptExisting, ...newTasks.map((t) => ({
        description: t.description,
        code: t.code,
        amount: t.amount || 0,
        hours: t.hours,
      }))];
      sections[sIdx] = { ...current, tasks: merged };
      return { ...prev, sections };
    });
  };

  const removeTask = (sIdx: number, tIdx: number) => {
    setInvoice((prev) => {
      const sections = [...prev.sections];
      if (sections[sIdx].tasks.length <= 1) return prev;
      sections[sIdx] = { ...sections[sIdx], tasks: sections[sIdx].tasks.filter((_, i) => i !== tIdx) };
      return { ...prev, sections };
    });
  };

  const calcSectionTotal = (sec: Section) => sec.tasks.reduce((a, t) => a + (t.amount || 0), 0);
  const calcTotal = () => invoice.sections.reduce((a, s) => a + calcSectionTotal(s), 0);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(n || 0);

  const handleSave = async () => {
    if (!teamId) {
      alert('Selecciona un equipo antes de guardar');
      return;
    }
    setSaving(true);
    try {
      await saveFullInvoice(invoice, teamId);
      router.push('/');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setSaving(false);
  };

  const handleMarkExported = async () => {
    if (!invoice.id) return;
    try {
      await markInvoiceExported(invoice.id);
    } catch (e: any) {
      console.error(e);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-ink-900 transition-colors disabled:bg-ink-50 disabled:text-ink-500';
  const labelClass = 'text-xs text-ink-600 mb-1.5 block tracking-wide';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <button onClick={() => router.push('/')} className="text-ink-500 hover:text-ink-900 text-sm mb-2 inline-block">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-ink-900">{initial ? `Factura #${initial.number}` : 'Nueva Factura'}</h1>
          {initial?.createdBy && (
            <p className="text-xs text-ink-500 mt-1">
              Creada por <span className="text-ink-900 font-medium">{initial.createdBy.email}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showHours}
              onChange={(e) => setShowHours(e.target.checked)}
              className="accent-ink-900"
            />
            Mostrar horas
          </label>
          {teams.length > 1 && !initial && (
            <select
              value={teamId || ''}
              onChange={(e) => setTeamId(Number(e.target.value))}
              className="px-3 py-2 text-sm bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
            >
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          {isTeamOwner ? (
            <InvoicePDFButton
              invoice={{ ...invoice, totalAmount: calcTotal() }}
              showHours={showHours}
              onExported={handleMarkExported}
            />
          ) : (
            <span className="text-xs text-ink-500 italic">Solo el dueño puede exportar PDF</span>
          )}
          {canEdit ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          ) : (
            <span className="text-xs text-ink-500 italic">Solo el creador o el dueño pueden editar</span>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="mb-5 text-xs text-ink-700 bg-ink-50 border border-ink-200 rounded-xl px-3 py-2">
          Estás viendo una factura de otro miembro. No puedes modificarla.
        </div>
      )}

      <div className="bg-paper border border-ink-200 rounded-2xl p-6 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Datos de la Factura</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Nº Factura</label>
            <input disabled={!canEdit} className={inputClass} placeholder="29/2025" value={invoice.number} onChange={(e) => update('number', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input disabled={!canEdit} className={inputClass} type="date" value={invoice.date} onChange={(e) => update('date', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select disabled={!canEdit} className={inputClass} value={invoice.status} onChange={(e) => update('status', e.target.value)}>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <select disabled={!canEdit} className={inputClass} value={invoice.currency} onChange={(e) => update('currency', e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="BOB">BOB</option>
            </select>
          </div>
        </div>
      </div>

      {isTeamOwner && (
        <div className="bg-paper border border-ink-200 rounded-2xl mb-6 shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setPartiesOpen((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-ink-50 transition-colors"
            aria-expanded={partiesOpen}
          >
            <div>
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">Emisor y Cliente</h2>
              <p className="text-xs text-ink-500 mt-0.5">Datos opcionales — por defecto se usan los del equipo</p>
            </div>
            <span className={`text-ink-500 transition-transform ${partiesOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {partiesOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6 border-t border-ink-200 pt-6">
              <div>
                <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-3">Emisor</h3>
                <div className="space-y-3">
                  <div><label className={labelClass}>Empresa</label><input disabled={!canEdit} className={inputClass} placeholder="Emx Comunicaciones S.L.U." value={invoice.companyName || ''} onChange={(e) => update('companyName', e.target.value)} /></div>
                  <div><label className={labelClass}>CIF</label><input disabled={!canEdit} className={inputClass} placeholder="B85173963" value={invoice.companyCIF || ''} onChange={(e) => update('companyCIF', e.target.value)} /></div>
                  <div><label className={labelClass}>Dirección</label><textarea disabled={!canEdit} className={inputClass + ' resize-none h-16'} placeholder="Calle..." value={invoice.companyAddress || ''} onChange={(e) => update('companyAddress', e.target.value)} /></div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-3">Cliente</h3>
                <div className="space-y-3">
                  <div><label className={labelClass}>Nombre</label><input disabled={!canEdit} className={inputClass} placeholder="Alejandro Pérez" value={invoice.clientName || ''} onChange={(e) => update('clientName', e.target.value)} /></div>
                  <div><label className={labelClass}>IBAN</label><input disabled={!canEdit} className={inputClass} placeholder="BE95905522553858" value={invoice.clientIBAN || ''} onChange={(e) => update('clientIBAN', e.target.value)} /></div>
                  <div><label className={labelClass}>Swift/BIC</label><input disabled={!canEdit} className={inputClass} placeholder="TRWIBEB1XXX" value={invoice.clientSwift || ''} onChange={(e) => update('clientSwift', e.target.value)} /></div>
                  <div><label className={labelClass}>Banco</label><input disabled={!canEdit} className={inputClass} placeholder="Wise, ..." value={invoice.clientBank || ''} onChange={(e) => update('clientBank', e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {invoice.sections.map((sec, sIdx) => (
        <div key={sIdx} className="bg-paper border border-ink-200 rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Título de sección</label>
                <input disabled={!canEdit} className={inputClass} placeholder="Tareas de Desarrollo (Front-Diciembre)" value={sec.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Responsable</label>
                <input disabled={!canEdit} className={inputClass} placeholder="Richard, Jhoan..." value={sec.subtitle || ''} onChange={(e) => updateSection(sIdx, 'subtitle', e.target.value)} />
              </div>
            </div>
            {canEdit && invoice.sections.length > 1 && (
              <button onClick={() => removeSection(sIdx)} className="ml-3 mt-5 text-red-600 hover:text-red-700 text-lg" title="Eliminar sección">✕</button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-ink-500 text-xs uppercase tracking-wider border-b border-ink-200">
                  <th className="text-left py-2 w-12">Nº</th>
                  <th className="text-left py-2 w-28">Código</th>
                  <th className="text-left py-2">Descripción</th>
                  {showHours && <th className="text-right py-2 w-20">Horas</th>}
                  <th className="text-right py-2 w-28">Monto ({invoice.currency})</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sec.tasks.map((task, tIdx) => (
                  <tr key={tIdx} className="border-b border-ink-200/70 group">
                    <td className="py-2 pr-2">
                      <input
                        disabled={!canEdit}
                        className="w-10 px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-700 text-xs text-center focus:outline-none focus:border-ink-900 disabled:bg-ink-50"
                        type="number"
                        value={task.number || tIdx + 1}
                        onChange={(e) => updateTask(sIdx, tIdx, 'number', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        disabled={!canEdit}
                        className="w-full px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-800 text-xs font-mono focus:outline-none focus:border-ink-900 disabled:bg-ink-50"
                        placeholder="TIK-230"
                        value={task.code || ''}
                        onChange={(e) => updateTask(sIdx, tIdx, 'code', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        disabled={!canEdit}
                        className="w-full px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-800 text-xs focus:outline-none focus:border-ink-900 disabled:bg-ink-50"
                        placeholder="Descripción de la tarea..."
                        value={task.description}
                        onChange={(e) => updateTask(sIdx, tIdx, 'description', e.target.value)}
                      />
                    </td>
                    {showHours && (
                      <td className="py-2 pr-2">
                        <input
                          disabled={!canEdit}
                          className="w-full px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-800 text-xs text-right font-mono focus:outline-none focus:border-ink-900 disabled:bg-ink-50"
                          type="number"
                          step="0.5"
                          placeholder="0"
                          value={task.hours || ''}
                          onChange={(e) => updateTask(sIdx, tIdx, 'hours', parseFloat(e.target.value) || undefined)}
                        />
                      </td>
                    )}
                    <td className="py-2 pr-2">
                      <input
                        disabled={!canEdit}
                        className="w-full px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-900 text-xs text-right font-mono focus:outline-none focus:border-ink-900 disabled:bg-ink-50"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={task.amount || ''}
                        onChange={(e) => updateTask(sIdx, tIdx, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2 text-center">
                      {canEdit && (
                        <button
                          onClick={() => removeTask(sIdx, tIdx)}
                          className="text-red-500/60 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            {canEdit ? (
              <div className="flex gap-2">
                <button
                  onClick={() => addTask(sIdx)}
                  className="text-xs text-ink-600 hover:text-ink-900 border border-dashed border-ink-300 rounded-lg px-3 py-1.5 transition-colors"
                >
                  + Agregar tarea
                </button>
                <button
                  onClick={() => setImportSectionIdx(sIdx)}
                  className="text-xs text-ink-900 bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg px-3 py-1.5 transition-colors"
                >
                  📥 Importar (texto o PDF)
                </button>
              </div>
            ) : <span />}
            <div className="text-right">
              <span className="text-xs text-ink-500 mr-3">Subtotal Sección {sIdx + 1}:</span>
              <span className="font-mono font-semibold text-ink-900">{fmtMoney(calcSectionTotal(sec))}</span>
            </div>
          </div>
        </div>
      ))}

      {canEdit && (
        <button
          onClick={addSection}
          className="w-full py-3 border-2 border-dashed border-ink-200 rounded-2xl text-ink-500 hover:text-ink-900 hover:border-ink-400 text-sm transition-colors mb-6"
        >
          + Agregar Sección
        </button>
      )}

      <div className="bg-paper border border-ink-300 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-900">💰 Total General</h3>
            <div className="text-ink-500 text-sm mt-1 space-y-0.5">
              {invoice.sections.map((sec, i) => (
                <div key={i}>
                  Subtotal Sección {i + 1} ({sec.title || '...'}): <span className="text-ink-800">{fmtMoney(calcSectionTotal(sec))}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-ink-900">{fmtMoney(calcTotal())}</div>
            <div className="text-ink-500 text-sm">{invoice.currency}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass}>Notas (opcional)</label>
        <textarea
          disabled={!canEdit}
          className={inputClass + ' resize-none h-20'}
          placeholder="Notas adicionales..."
          value={invoice.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>

      <TaskImportModal
        open={importSectionIdx !== null}
        currency={invoice.currency}
        onClose={() => setImportSectionIdx(null)}
        onImport={(tasks) => {
          if (importSectionIdx !== null) importTasksIntoSection(importSectionIdx, tasks);
          setImportSectionIdx(null);
        }}
      />
    </div>
  );
}
