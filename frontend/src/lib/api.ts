// src/lib/api.ts

import { clearSession, getToken } from './auth';
import { ApiError, NETWORK_MESSAGE, SESSION_EXPIRED_MESSAGE, translateMessage } from './errors';
import { queueNotice } from './notify';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Todos los errores salen de aquí ya traducidos al español, así ninguna pantalla
// tiene que preocuparse de los textos en inglés que devuelve Strapi.
async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${STRAPI_URL}/api${path}`;
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // Servidor caído, CORS o sin internet: fetch lanza TypeError.
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  if (res.status === 401) {
    clearSession();
    // La redirección recarga la página, así que el aviso se deja en cola para
    // que el ToastProvider lo muestre ya en /login.
    queueNotice('error', SESSION_EXPIRED_MESSAGE);
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(translateMessage(body?.error?.message, res.status), res.status);
  }
  return res.json();
}

// ── Teams ──

export async function getMyTeams() {
  const res = await fetchAPI('/teams/mine');
  return res.data as { owned: any[]; memberOf: any[] };
}

export async function getTeam(id: number) {
  const res = await fetchAPI(`/teams/${id}`);
  return res.data;
}

export async function createTeam(data: { name: string; companyName?: string; companyCIF?: string; companyAddress?: string }) {
  const res = await fetchAPI('/teams', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateTeam(id: number, data: any) {
  const res = await fetchAPI(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function deleteTeam(id: number) {
  return fetchAPI(`/teams/${id}`, { method: 'DELETE' });
}

export async function removeTeamMember(teamId: number, userId: number) {
  const res = await fetchAPI(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
  return res.data;
}

// ── Invitations ──

export async function inviteTeamMember(teamId: number, email: string) {
  const res = await fetchAPI(`/teams/${teamId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return res.data;
}

export async function listTeamInvitations(teamId: number) {
  const res = await fetchAPI(`/teams/${teamId}/invitations`);
  return res.data;
}

export async function cancelInvitation(id: number) {
  const res = await fetchAPI(`/invitations/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function getMyInvitations() {
  const res = await fetchAPI('/invitations/mine');
  return res.data;
}

export async function getInvitationByToken(token: string) {
  const res = await fetchAPI(`/invitations/by-token/${token}`);
  return res.data;
}

export async function acceptInvitation(token: string) {
  const res = await fetchAPI(`/invitations/${token}/accept`, { method: 'POST' });
  return res.data;
}

export async function rejectInvitation(token: string) {
  const res = await fetchAPI(`/invitations/${token}/reject`, { method: 'POST' });
  return res.data;
}

// ── Invoices ──

export async function getInvoices(teamId?: number) {
  const q = teamId ? `?team=${teamId}` : '';
  const res = await fetchAPI(`/invoices${q}`);
  return res.data;
}

export async function getInvoice(id: number) {
  const res = await fetchAPI(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(data: any) {
  const res = await fetchAPI('/invoices', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateInvoice(id: number, data: any) {
  const res = await fetchAPI(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function deleteInvoice(id: number) {
  return fetchAPI(`/invoices/${id}`, { method: 'DELETE' });
}

export async function markInvoiceExported(id: number) {
  const res = await fetchAPI(`/invoices/${id}/export`, { method: 'POST' });
  return res.data;
}

export async function parseTasksFromText(text: string) {
  const res = await fetchAPI('/invoices/parse-tasks', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return res.data as { source: 'text' | 'pdf'; tasks: Array<{ code?: string; description: string; amount: number; hours?: number }> };
}

export async function parseTasksFromPdf(file: File) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}/api/invoices/parse-tasks`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(translateMessage(err?.error?.message, res.status), res.status);
  }
  const json = await res.json();
  return json.data as { source: 'text' | 'pdf'; tasks: Array<{ code?: string; description: string; amount: number; hours?: number }>; raw?: string };
}

// ── Sections ──

export async function createSection(data: any) {
  const res = await fetchAPI('/sections', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateSection(id: number, data: any) {
  const res = await fetchAPI(`/sections/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function deleteSection(id: number) {
  return fetchAPI(`/sections/${id}`, { method: 'DELETE' });
}

// ── Tasks ──

export async function createTask(data: any) {
  const res = await fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateTask(id: number, data: any) {
  const res = await fetchAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function deleteTask(id: number) {
  return fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
}

// ── Utility: Save full invoice with sections and tasks ──
//
// Una sola llamada al backend: POST /invoices/save-full envía el árbol completo
// y el servidor reconcilia cabecera + secciones + tareas dentro de una
// transacción, aplicando permisos por item. Los opts se mantienen por
// compatibilidad con llamadores antiguos, pero hoy no se usan: la autorización
// real vive en el backend.

interface SaveOpts {
  canEditHeader?: boolean;
  canEditSection?: (sec: any) => boolean;
}

export async function saveFullInvoice(invoice: any, teamId: number, _opts: SaveOpts = {}) {
  const payload: any = {
    id: invoice.id,
    team: teamId,
    number: invoice.number,
    date: invoice.date,
    status: invoice.status,
    currency: invoice.currency,
    companyName: invoice.companyName,
    companyCIF: invoice.companyCIF,
    companyAddress: invoice.companyAddress,
    clientName: invoice.clientName,
    clientIBAN: invoice.clientIBAN,
    clientSwift: invoice.clientSwift,
    clientBank: invoice.clientBank,
    notes: invoice.notes,
    sections: (invoice.sections || []).map((sec: any, i: number) => ({
      id: sec.id,
      title: sec.title,
      subtitle: sec.subtitle || '',
      sortOrder: i,
      tasks: (sec.tasks || []).map((t: any, j: number) => ({
        id: t.id,
        number: t.number ?? j + 1,
        code: t.code || '',
        description: t.description,
        amount: Number(t.amount) || 0,
        hours: t.hours ?? null,
        sortOrder: j,
      })),
    })),
  };

  const res = await fetchAPI('/invoices/save-full', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  });
  return res.data?.id as number;
}

// Guarda solo los datos de emisor y cliente. Se usa cuando la factura está
// congelada (pagada): esos campos se pueden corregir en cualquier estado, pero
// el backend rechaza el guardado completo, así que el payload no lleva
// secciones ni el resto de la cabecera.
export async function saveInvoiceParties(invoice: any) {
  const payload = {
    id: invoice.id,
    partiesOnly: true,
    companyName: invoice.companyName,
    companyCIF: invoice.companyCIF,
    companyAddress: invoice.companyAddress,
    clientName: invoice.clientName,
    clientIBAN: invoice.clientIBAN,
    clientSwift: invoice.clientSwift,
    clientBank: invoice.clientBank,
  };

  const res = await fetchAPI('/invoices/save-full', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  });
  return res.data?.id as number;
}
