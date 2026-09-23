// src/components/InvoicePDFButtonInner.tsx
'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { downloadInvoicePDF } from './invoicePdfDownload';
import { Invoice } from '@/types';
import { useToast } from './Toast';

interface Props {
  invoice: Invoice;
  showHours: boolean;
  onExported?: () => void;
}

// The PDF is generated ONLY on click. We used to use <PDFDownloadLink>, which
// renders the document eagerly and regenerates it every time its props change.
// Since `invoice` changes on every keystroke and every "add task/section", on
// large invoices (dozens of tasks) that fired a PDF render on the main thread
// on every edit and left the page unresponsive (Chrome and Firefox). With
// on-demand generation there is no background PDF work while editing.
export default function InvoicePDFButtonInner({ invoice, showHours, onExported }: Props) {
  const [generating, setGenerating] = useState(false);
  const toast = useToast();
  const locale = useLocale();
  const t = useTranslations('pdfButton');

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await downloadInvoicePDF(invoice, showHours, locale);
      onExported?.();
    } catch (e) {
      console.error(e);
      toast.error(t('failed'));
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
      {generating ? t('generating') : t('download')}
    </button>
  );
}
