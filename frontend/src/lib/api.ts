// src/lib/api.ts

import { clearSession, getToken } from './auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = `${STRAPI_URL}/api${path}`;
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API error: ${res.status}`);
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
  const res = await fetch(`${STRAPI_URL}/api/invoices/parse-tasks`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error ${res.status}`);
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

interface SaveOpts {
  canEditHeader?: boolean;
  canEditSection?: (sec: any) => boolean;
}

export async function saveFullInvoice(invoice: any, teamId: number, opts: SaveOpts = {}) {
  const canEditHeader = opts.canEditHeader ?? true;
  const canEditSection = opts.canEditSection ?? (() => true);

  const invoiceData: any = { ...invoice };
  delete invoiceData.sections;
  delete invoiceData.id;
  delete invoiceData.team;
  delete invoiceData.author;

  let invoiceId: number;
  if (invoice.id) {
    // Solo el dueño toca la cabecera; un miembro se salta esta llamada para
    // no recibir un 403 del backend.
    if (canEditHeader) {
      const rec = await updateInvoice(invoice.id, invoiceData);
      invoiceId = rec.id;
    } else {
      invoiceId = invoice.id;
    }
  } else {
    const rec = await createInvoice({ ...invoiceData, team: teamId });
    invoiceId = rec.id;
  }

  for (let i = 0; i < (invoice.sections || []).length; i++) {
    const sec = invoice.sections[i];
    // Secciones que no le corresponden a este usuario se saltan en silencio.
    if (!canEditSection(sec)) continue;

    const sectionData: any = {
      title: sec.title,
      subtitle: sec.subtitle || '',
      sortOrder: i,
      invoice: invoiceId,
    };

    let sectionRecord: any;
    if (sec.id) {
      sectionRecord = await updateSection(sec.id, sectionData);
    } else {
      sectionRecord = await createSection(sectionData);
    }
    const sectionId = sectionRecord.id;

    let subtotal = 0;
    for (let j = 0; j < (sec.tasks || []).length; j++) {
      const task = sec.tasks[j];
      const taskData: any = {
        number: task.number || j + 1,
        code: task.code || '',
        description: task.description,
        amount: task.amount || 0,
        hours: task.hours || null,
        sortOrder: j,
        section: sectionId,
      };
      subtotal += task.amount || 0;

      if (task.id) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
    }

    // El subtotal sí puede tocarlo el autor de la sección; el total general
    // lo recalcula el backend (utils/totals) tras cada mutación.
    await updateSection(sectionId, { subtotal });
  }

  return invoiceId;
}
