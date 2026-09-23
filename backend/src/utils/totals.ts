// src/utils/totals.ts
// Recomputes an invoice's total from its sections.
// Called from the section/task controllers after any mutation, so the total
// always reflects reality even when different members edit different
// sections.

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
