'use client';

import { useRef, useState } from 'react';
import { parseTasksFromText, parseTasksFromPdf } from '@/lib/api';
import { Task } from '@/types';

interface Props {
  open: boolean;
  currency?: string;
  onClose: () => void;
  onImport: (tasks: Task[]) => void;
}

type Mode = 'text' | 'pdf';

const EXAMPLE =
  '1  TF-352  Feature: Events — group chat   15\n2  TF-351  feat(maintenance): add products   6\n3  Checklist General (torneo, empleados, general)   70.00';

export default function TaskImportModal({ open, currency = 'USD', onClose, onImport }: Props) {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Task[] | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setText('');
    setPreview(null);
    setError(null);
    setPdfName(null);
  };

  const handleParseText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parseTasksFromText(text);
      if (!data.tasks.length) {
        setError('No se detectaron tareas en el texto. Revisa el formato.');
        setPreview([]);
      } else {
        setPreview(data.tasks as Task[]);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPdfName(file.name);
    setLoading(true);
    setError(null);
    try {
      const data = await parseTasksFromPdf(file);
      if (!data.tasks.length) {
        setError('No se detectaron tareas en el PDF. Puedes pegar el texto manualmente.');
        setPreview([]);
      } else {
        setPreview(data.tasks as Task[]);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const updatePreview = (idx: number, field: keyof Task, value: any) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removePreview = (idx: number) => {
    setPreview((prev) => (prev ? prev.filter((_, i) => i !== idx) : prev));
  };

  const addEmpty = () => {
    setPreview((prev) => [...(prev || []), { description: '', amount: 0 }]);
  };

  const handleInsert = () => {
    if (!preview || preview.length === 0) return;
    onImport(preview);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inputClass =
    'w-full px-2 py-1.5 bg-paper border border-ink-200 rounded-lg text-ink-900 text-xs focus:outline-none focus:border-ink-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-paper border border-ink-200 rounded-2xl shadow-card flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Importar tareas</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Pega texto (ej. Jira, Linear) o sube un PDF. Detectamos código, descripción y montos.
            </p>
          </div>
          <button onClick={handleClose} className="text-ink-500 hover:text-ink-900 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-4 border-b border-ink-200 flex gap-2">
          <button
            onClick={() => {
              setMode('text');
              setPreview(null);
              setError(null);
            }}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === 'text'
                ? 'bg-ink-900 text-paper border-ink-900'
                : 'bg-paper text-ink-900 border-ink-200 hover:bg-ink-100'
            }`}
          >
            Pegar texto
          </button>
          <button
            onClick={() => {
              setMode('pdf');
              setPreview(null);
              setError(null);
            }}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === 'pdf'
                ? 'bg-ink-900 text-paper border-ink-900'
                : 'bg-paper text-ink-900 border-ink-200 hover:bg-ink-100'
            }`}
          >
            Subir PDF
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          {mode === 'text' && (
            <div>
              <label className="text-xs text-ink-600 mb-1.5 block">Pega aquí las tareas</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={EXAMPLE}
                className="w-full h-40 px-3 py-2 bg-paper border border-ink-200 rounded-xl text-ink-900 text-sm font-mono focus:outline-none focus:border-ink-900"
              />
              <button
                onClick={handleParseText}
                disabled={loading || !text.trim()}
                className="mt-2 px-4 py-2 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Analizando...' : 'Detectar tareas'}
              </button>
            </div>
          )}

          {mode === 'pdf' && (
            <div>
              <label className="text-xs text-ink-600 mb-1.5 block">Sube un PDF con texto</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-ink-300 rounded-xl p-8 text-center cursor-pointer hover:border-ink-900 transition-colors"
              >
                <p className="text-sm text-ink-700">
                  {pdfName ? `📄 ${pdfName}` : 'Arrastra un PDF aquí o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-ink-500 mt-1">
                  Solo PDFs con capa de texto (no escaneados)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
              {loading && <p className="text-xs text-ink-500 mt-2">Analizando PDF...</p>}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {preview && preview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-ink-900">
                  Vista previa · {preview.length} tarea{preview.length === 1 ? '' : 's'}
                </h3>
                <button onClick={addEmpty} className="text-xs text-ink-700 hover:text-ink-900">
                  + Añadir fila
                </button>
              </div>
              <div className="border border-ink-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-ink-50">
                    <tr className="text-ink-700 uppercase tracking-wide">
                      <th className="text-left py-2 px-2 w-20">Código</th>
                      <th className="text-left py-2 px-2">Descripción</th>
                      <th className="text-right py-2 px-2 w-20">Horas</th>
                      <th className="text-right py-2 px-2 w-24">Monto ({currency})</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((t, i) => (
                      <tr key={i} className="border-t border-ink-200">
                        <td className="py-1 px-2">
                          <input
                            value={t.code || ''}
                            onChange={(e) => updatePreview(i, 'code', e.target.value)}
                            className={inputClass + ' font-mono'}
                            placeholder="TF-123"
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            value={t.description}
                            onChange={(e) => updatePreview(i, 'description', e.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="number"
                            step="0.5"
                            value={t.hours ?? ''}
                            onChange={(e) =>
                              updatePreview(i, 'hours', e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            className={inputClass + ' text-right font-mono'}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={t.amount ?? 0}
                            onChange={(e) => updatePreview(i, 'amount', parseFloat(e.target.value) || 0)}
                            className={inputClass + ' text-right font-mono'}
                          />
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button
                            onClick={() => removePreview(i)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Eliminar"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-500">
            Puedes editar cualquier valor antes de insertar.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleInsert}
              disabled={!preview || preview.length === 0}
              className="px-5 py-2 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper text-sm font-semibold rounded-lg transition-colors"
            >
              Insertar {preview?.length || 0} tarea{(preview?.length || 0) === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
