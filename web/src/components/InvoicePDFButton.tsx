// src/components/InvoicePDFButton.tsx
'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Invoice } from '@/types';

function Loading() {
  const t = useTranslations('pdfButton');
  return <span className="text-ink-500 text-sm px-4 py-2.5">{t('loading')}</span>;
}

const Inner = dynamic(() => import('./InvoicePDFButtonInner'), {
  ssr: false,
  loading: () => <Loading />,
});

interface Props {
  invoice: Invoice;
  showHours: boolean;
  onExported?: () => void;
}

export default function InvoicePDFButton(props: Props) {
  return <Inner {...props} />;
}
