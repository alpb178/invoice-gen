// src/services/api.js
// Change this to your Strapi URL (local network IP for device testing)
const BASE_URL = 'http://192.168.1.100:1337/api';

async function fetchAPI(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Error: ${res.status}`);
  }
  return res.json();
}

export async function getInvoices() {
  const res = await fetchAPI('/invoices?populate[sections][populate]=tasks&sort=createdAt:desc');
  return res.data || [];
}

export async function getInvoice(id) {
  const res = await fetchAPI(`/invoices/${id}?populate[sections][populate]=tasks`);
  return res.data;
}

export async function createInvoice(data) {
  const res = await fetchAPI('/invoices', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateInvoice(id, data) {
  const res = await fetchAPI(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function deleteInvoice(id) {
  return fetchAPI(`/invoices/${id}`, { method: 'DELETE' });
}

export async function createSection(data) {
  const res = await fetchAPI('/sections', { method: 'POST', body: JSON.stringify({ data }) });
  return res.data;
}

export async function createTask(data) {
  const res = await fetchAPI('/tasks', { method: 'POST', body: JSON.stringify({ data }) });
  return res.data;
}

export async function updateSection(id, data) {
  const res = await fetchAPI(`/sections/${id}`, { method: 'PUT', body: JSON.stringify({ data }) });
  return res.data;
}

export async function updateTask(id, data) {
  const res = await fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ data }) });
  return res.data;
}
