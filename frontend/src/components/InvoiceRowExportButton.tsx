// src/components/InvoiceRowExportButton.tsx
'use client';

import { useState } from 'react';
import { getInvoice, markInvoiceExported } from '@/lib/api';
import { normalizeInvoice } from '@/lib/invoice';
import { useToast } from './Toast';

interface Props {
  invoiceId: number;
  /** Se llama tras exportar, para refrescar el sello "exportada" de la fila. */
  onExported?: () => void;
}

// Exportar el PDF desde el listado, sin abrir la factura.
//
// La fila del listado no trae el árbol completo garantizado, así que se pide la
// factura al backend en el momento del clic y se normaliza igual que en el
// editor: así el PDF sale idéntico desde las dos pantallas.
//
// @react-pdf/renderer se carga con un import dinámico dentro del manejador, no
// arriba: no funciona en SSR, pesa, y así ni entra en el bundle del listado ni
// hay trabajo de PDF hasta que alguien lo pide.
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
        // El PDF ya se descargó; solo falló el registro de la exportación.
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
