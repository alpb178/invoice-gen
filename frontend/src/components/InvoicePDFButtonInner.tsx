// src/components/InvoicePDFButtonInner.tsx
'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Invoice } from '@/types';

interface Props {
  invoice: Invoice;
  showHours: boolean;
  onExported?: () => void;
}

// Generamos el PDF SOLO al hacer clic. Antes usábamos <PDFDownloadLink>, que
// renderiza el documento de forma anticipada y lo vuelve a generar cada vez que
// cambian sus props. Como `invoice` cambia en cada tecla y en cada "agregar
// tarea/sección", con facturas grandes (decenas de tareas) eso disparaba un
// render de PDF en el hilo principal en cada edición y dejaba la página sin
// responder (Chrome y Firefox). Con generación bajo demanda no hay trabajo de
// PDF en segundo plano mientras se edita.
export default function InvoicePDFButtonInner({ invoice, showHours, onExported }: Props) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} showHours={showHours} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${invoice.number || 'borrador'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onExported?.();
    } catch (e) {
      console.error(e);
      alert('No se pudo generar el PDF. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
    >
      {generating ? 'Generando...' : 'Descargar PDF'}
    </button>
  );
}
