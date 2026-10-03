// src/lib/notify.ts
//
// Notice queue for code that is NOT a React component (for example
// `fetchAPI`, which on a 401 clears the session and reloads the page to
// /login). A toast fired right before a reload would never be seen, so it is
// stored in sessionStorage and the ToastProvider drains it on mount.

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
    // No duplicates: if the same notice is already queued, it is not repeated.
    if (list.some((n) => n.kind === kind && n.text === text)) return;
    list.push({ kind, text });
    window.sessionStorage.setItem(KEY, JSON.stringify(list.slice(-5)));
  } catch {
    // sessionStorage can fail in private mode: the notice is lost, no harm done.
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
