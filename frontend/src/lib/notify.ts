// src/lib/notify.ts
//
// Cola de avisos para código que NO es un componente de React (por ejemplo
// `fetchAPI`, que al recibir un 401 limpia la sesión y recarga la página hacia
// /login). Un toast lanzado justo antes de una recarga no se vería, así que se
// guarda en sessionStorage y el ToastProvider lo saca al montar.

export type NoticeKind = 'error' | 'success' | 'info';
export interface Notice {
  kind: NoticeKind;
  text: string;
}

const KEY = 'invoice_pending_notices';

export function queueNotice(kind: NoticeKind, text: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const list: Notice[] = raw ? JSON.parse(raw) : [];
    // Sin duplicados: si el mismo aviso ya está en cola, no se repite.
    if (list.some((n) => n.kind === kind && n.text === text)) return;
    list.push({ kind, text });
    window.sessionStorage.setItem(KEY, JSON.stringify(list.slice(-5)));
  } catch {
    // sessionStorage puede fallar en modo privado: el aviso se pierde, no pasa nada.
  }
}

export function drainNotices(): Notice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    window.sessionStorage.removeItem(KEY);
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
