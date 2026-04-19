// src/app/invoices/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getInvoice } from '@/lib/api';
import InvoiceEditor from '@/components/InvoiceEditor';
import { Invoice, Section, Task } from '@/types';

function normalize(raw: any): Invoice {
  const attrs = raw.attributes || raw;
  const sectionsRaw = attrs.sections?.data || attrs.sections || [];

  const sections: Section[] = sectionsRaw.map((s: any) => {
    const sa = s.attributes || s;
    const tasksRaw = sa.tasks?.data || sa.tasks || [];
    const tasks: Task[] = tasksRaw.map((t: any) => {
      const ta = t.attributes || t;
      return { id: t.id, number: ta.number, code: ta.code, description: ta.description, amount: ta.amount, hours: ta.hours, sortOrder: ta.sortOrder };
    });
    return { id: s.id, title: sa.title, subtitle: sa.subtitle, sortOrder: sa.sortOrder, tasks };
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

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getInvoice(Number(params.id));
        setInvoice(normalize(data));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-ink-500">Cargando factura...</div>;
  if (!invoice) return <div className="text-center py-20 text-red-600">Factura no encontrada</div>;

  return <InvoiceEditor initial={invoice} />;
}
