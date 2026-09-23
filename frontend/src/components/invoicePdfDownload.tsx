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
import InvoicePDF, { pdfLabels } from './InvoicePDF';
import { Invoice } from '@/types';
import type { Locale } from '@/i18n/config';

export async function downloadInvoicePDF(invoice: Invoice, showHours: boolean, locale: Locale) {
  const blob = await pdf(<InvoicePDF invoice={invoice} showHours={showHours} locale={locale} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const labels = pdfLabels(locale);
  a.download = `${labels.fileName}_${invoice.number || labels.draftFileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
