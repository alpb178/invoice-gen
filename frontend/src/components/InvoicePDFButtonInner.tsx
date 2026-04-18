// src/components/InvoicePDFButtonInner.tsx
'use client';

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
  return (
    <Link
      document={<InvoicePDF invoice={invoice} showHours={showHours} />}
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
