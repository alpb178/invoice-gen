// src/components/InvoicePDFButtonInner.tsx
'use client';

import { useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Invoice } from '@/types';

interface Props {
  invoice: Invoice;
  showHours: boolean;
  onExported?: () => void;
}

export default function InvoicePDFButtonInner({ invoice, showHours, onExported }: Props) {
  const Link = PDFDownloadLink as any;
  // El elemento del documento debe ser referencialmente estable: PDFDownloadLink
  // regenera el PDF cada vez que cambia la prop `document`. Si creáramos un nuevo
  // <InvoicePDF/> en cada render, los re-renders internos del propio link (al
  // actualizar loading/url) volverían a generarlo, entrando en un bucle infinito
  // que congela la página. Memoizamos para regenerar solo cuando cambian los datos.
  const document = useMemo(
    () => <InvoicePDF invoice={invoice} showHours={showHours} />,
    [invoice, showHours],
  );
  return (
    <Link
      document={document}
      fileName={`Factura_${invoice.number || 'borrador'}.pdf`}
    >
      {({ loading, url, error }: any) => (
        <button
          type="button"
          onClick={() => url && onExported?.()}
          className="px-4 py-2.5 bg-paper hover:bg-ink-100 border border-ink-200 text-ink-900 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          disabled={loading || !!error}
        >
          {error ? 'Error PDF' : loading ? 'Generando...' : 'Descargar PDF'}
        </button>
      )}
    </Link>
  );
}
