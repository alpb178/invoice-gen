import { ApiError, NETWORK_MESSAGE, translateMessage } from './errors';

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
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Strapi contesta en inglés ("Invalid identifier or password"): se traduce
    // aquí para que la pantalla de login solo tenga que mostrar el mensaje.
    throw new ApiError(translateMessage(body?.error?.message, res.status), res.status);
  }
  setSession(body.jwt, body.user);
  return body.user as StrapiUser;
}

export async function registerUser(email: string, password: string) {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, email, password }),
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(translateMessage(body?.error?.message, res.status), res.status);
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
