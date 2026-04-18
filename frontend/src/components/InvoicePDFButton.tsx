// src/components/InvoicePDFButton.tsx
'use client';

import dynamic from 'next/dynamic';
import { Invoice } from '@/types';

const Inner = dynamic(() => import('./InvoicePDFButtonInner'), {
  ssr: false,
  loading: () => (
    <span className="text-ink-500 text-sm px-4 py-2.5">Cargando PDF...</span>
  ),
});

interface Props {
  invoice: Invoice;
  showHours: boolean;
  onExported?: () => void;
}

export default function InvoicePDFButton(props: Props) {
  return <Inner {...props} />;
}
