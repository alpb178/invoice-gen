// src/components/InvoiceRowExportButton.tsx
'use client';

import { useState } from 'react';
import { getInvoice, markInvoiceExported } from '@/lib/api';
import { normalizeInvoice } from '@/lib/invoice';
import { useToast } from './Toast';

interface Props {
  invoiceId: number;
  /** Called after exporting, to refresh the row's "exported" stamp. */
  onExported?: () => void;
}

// Export the PDF from the list, without opening the invoice.
//
// The list row is not guaranteed to carry the full tree, so the invoice is
// fetched from the backend at click time and normalized exactly as in the
// editor: that way the PDF comes out identical from both screens.
//
// @react-pdf/renderer is loaded with a dynamic import inside the handler, not
// at the top: it does not work in SSR, it is heavy, and this way it stays out
// of the list bundle and there is no PDF work until someone asks for it.
export default function InvoiceRowExportButton({ invoiceId, onExported }: Props) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const raw = await getInvoice(invoiceId);
      const invoice = normalizeInvoice(raw);
      const { downloadInvoicePDF } = await import('./invoicePdfDownload');
      await downloadInvoicePDF(invoice, false);
      try {
        await markInvoiceExported(invoiceId);
      } catch (e) {
        // The PDF was already downloaded; only recording the export failed.
        toast.error(e);
      }
      onExported?.();
    } catch (e) {
      toast.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      title="Descargar el PDF de esta factura"
      className="px-3 py-1.5 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors disabled:opacity-60"
    >
      {busy ? 'Generando...' : 'PDF'}
    </button>
  );
}
