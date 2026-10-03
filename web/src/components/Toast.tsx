// src/components/Toast.tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { translateError } from '@/lib/errors';
import { drainNotices, NoticeKind } from '@/lib/notify';

interface ToastItem {
  id: number;
  kind: NoticeKind;
  text: string;
}

interface ToastApi {
  /**
   * Shows an error. A string is UI copy the caller already localized and is
   * shown as is; anything else (what a `catch` hands over) is translated.
   */
  error: (err: unknown) => void;
  success: (text: string) => void;
  info: (text: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURATION: Record<NoticeKind, number> = {
  error: 7000,
  success: 4000,
  info: 5000,
};
const MAX_VISIBLE = 4;
// De-duplication window: the same text repeated (two screens loading the same
// broken endpoint, for example) does not stack identical toasts.
const DEDUPE_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const recent = useRef<Map<string, number>>(new Map());
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const t = useTranslations('toast');

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (kind: NoticeKind, text: string) => {
      const clean = (text || '').trim();
      if (!clean) return;

      const now = Date.now();
      const dedupeKey = `${kind}:${clean}`;
      const last = recent.current.get(dedupeKey);
      if (last && now - last < DEDUPE_MS) return;
      recent.current.set(dedupeKey, now);

      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, kind, text: clean }].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION[kind]),
      );
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      error: (err: unknown) => push('error', typeof err === 'string' ? err : translateError(err)),
      success: (text: string) => push('success', text),
      info: (text: string) => push('info', text),
      dismiss,
    }),
    [push, dismiss],
  );

  // Notices queued before a reload (expired session, etc.).
  useEffect(() => {
    drainNotices().forEach((n) => push(n.kind, n.text));
  }, [push]);

  // Safety net: any uncaught error or rejected promise ends up here instead of
  // dying in the console without the user noticing.
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      // Resource load failures (<img>, <script>) also fire 'error' and are
      // not interesting: they are not application errors.
      if (ev.target && ev.target !== window) return;
      push('error', translateError(ev.error ?? ev.message));
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      push('error', translateError(ev.reason));
    };
    const onOffline = () => push('error', t('offline'));

    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('offline', onOffline);
    };
  }, [push, t]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const STYLES: Record<NoticeKind, { accent: string; icon: string }> = {
  error: { accent: 'bg-red-600', icon: '!' },
  success: { accent: 'bg-emerald-600', icon: '✓' },
  info: { accent: 'bg-ink-900', icon: 'i' },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  const label = useTranslations('toast');
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => {
        const s = STYLES[t.kind];
        return (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex items-start gap-3 bg-paper border border-ink-200 rounded-xl shadow-card px-4 py-3 animate-toast-in"
          >
            <span
              aria-hidden
              className={`${s.accent} shrink-0 mt-0.5 w-5 h-5 rounded-full text-paper text-[11px] font-bold flex items-center justify-center`}
            >
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500 font-mono-tight">
                {label(t.kind)}
              </div>
              <p className="text-sm text-ink-900 mt-0.5 break-words">{t.text}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label={label('dismiss')}
              className="shrink-0 text-ink-400 hover:text-ink-900 transition-colors text-sm leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
