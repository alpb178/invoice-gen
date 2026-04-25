// src/utils/totals.ts
// Recalcula el total de una factura a partir de sus secciones.
// Se llama desde los controladores de section/task después de cualquier
// mutación, de forma que el total siempre refleje la realidad aunque
// distintos miembros editen secciones distintas.

const INVOICE = 'api::invoice.invoice' as const;
const SECTION = 'api::section.section' as const;

export async function recomputeInvoiceTotal(invoiceId: number): Promise<void> {
  if (!invoiceId) return;
  const sections = await strapi.db.query(SECTION).findMany({
    where: { invoice: invoiceId },
    select: ['id', 'subtotal'],
  });
  const total = sections.reduce((a: number, s: any) => a + (Number(s.subtotal) || 0), 0);
  await strapi.db.query(INVOICE).update({
    where: { id: invoiceId },
    data: { totalAmount: total },
  });
}
