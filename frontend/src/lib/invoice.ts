// src/lib/invoice.ts
//
// Normalización de la factura que llega de Strapi. Vive aquí (y no en la
// pantalla de edición) porque la exportación a PDF desde el listado necesita
// exactamente la misma forma que el editor: si las dos pantallas normalizaran
// por su cuenta, el PDF de una y de la otra podrían no coincidir.

import { Invoice, Section, Task } from '@/types';

export function normalizeInvoice(raw: any): Invoice {
  const attrs = raw.attributes || raw;
  const sectionsRaw = attrs.sections?.data || attrs.sections || [];

  const sections: Section[] = sectionsRaw.map((s: any) => {
    const sa = s.attributes || s;
    const tasksRaw = sa.tasks?.data || sa.tasks || [];
    const tasks: Task[] = tasksRaw.map((t: any) => {
      const ta = t.attributes || t;
      return { id: t.id, number: ta.number, code: ta.code, description: ta.description, amount: ta.amount, hours: ta.hours, sortOrder: ta.sortOrder };
    });
    const secAuthorRaw = sa.author?.data || sa.author;
    const secAuthor = secAuthorRaw
      ? {
          id: secAuthorRaw.id,
          username: secAuthorRaw.attributes?.username || secAuthorRaw.username,
          email: secAuthorRaw.attributes?.email || secAuthorRaw.email,
        }
      : null;
    return { id: s.id, title: sa.title, subtitle: sa.subtitle, sortOrder: sa.sortOrder, author: secAuthor, tasks };
  });

  const authorRaw = attrs.author?.data || attrs.author;
  const author = authorRaw
    ? {
        id: authorRaw.id,
        username: authorRaw.attributes?.username || authorRaw.username,
        email: authorRaw.attributes?.email || authorRaw.email,
      }
    : null;

  const teamRaw = attrs.team?.data || attrs.team;
  const team = teamRaw ? { id: teamRaw.id } : null;

  return {
    id: raw.id,
    number: attrs.number,
    date: attrs.date,
    status: attrs.status,
    currency: attrs.currency,
    companyName: attrs.companyName,
    companyCIF: attrs.companyCIF,
    companyAddress: attrs.companyAddress,
    clientName: attrs.clientName,
    clientIBAN: attrs.clientIBAN,
    clientSwift: attrs.clientSwift,
    clientBank: attrs.clientBank,
    notes: attrs.notes,
    totalAmount: attrs.totalAmount,
    exportedAt: attrs.exportedAt,
    team,
    author,
    sections,
  };
}
