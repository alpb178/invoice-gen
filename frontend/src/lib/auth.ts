const TOKEN_KEY = 'invoice_jwt';
const USER_KEY = 'invoice_user';
const TEAM_KEY = 'invoice_active_team';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export type StrapiUser = {
  id: number;
  username: string;
  email: string;
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StrapiUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StrapiUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: StrapiUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(TEAM_KEY);
}

export function getActiveTeamId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(TEAM_KEY);
  return raw ? Number(raw) : null;
}

export function setActiveTeamId(id: number | null) {
  if (typeof window === 'undefined') return;
  if (id == null) {
    window.localStorage.removeItem(TEAM_KEY);
  } else {
    window.localStorage.setItem(TEAM_KEY, String(id));
  }
}

export async function loginWithPassword(identifier: string, password: string) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || 'Credenciales inválidas';
    throw new Error(msg);
  }
  setSession(body.jwt, body.user);
  return body.user as StrapiUser;
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || 'No se pudo registrar';
    throw new Error(msg);
  }
  setSession(body.jwt, body.user);
  return body.user as StrapiUser;
}

export function logout() {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
