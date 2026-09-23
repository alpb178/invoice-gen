// src/components/invoicePdfDownload.tsx
//
// PDF generation and download. It lives in its own module so both the editor
// button and the list action take the same path.
//
// IMPORTANT: this module loads @react-pdf/renderer, which does not work in SSR
// and is heavy. Import it only from a component with `ssr: false`, or with an
// `await import(...)` inside the click handler itself. Never statically from an
// edit screen: the PDF is generated on demand.

import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Invoice } from '@/types';

export async function downloadInvoicePDF(invoice: Invoice, showHours: boolean) {
  const blob = await pdf(<InvoicePDF invoice={invoice} showHours={showHours} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Factura_${invoice.number || 'borrador'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
