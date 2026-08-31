// src/app/invoices/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getInvoice } from '@/lib/api';
import { normalizeInvoice } from '@/lib/invoice';
import { Invoice } from '@/types';
import InvoiceEditor from '@/components/InvoiceEditor';
import { SkeletonInvoiceEditor } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await getInvoice(Number(params.id));
        setInvoice(normalizeInvoice(data));
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return <SkeletonInvoiceEditor />;
  if (!invoice) return <div className="text-center py-20 text-red-600">Factura no encontrada</div>;

  return <InvoiceEditor initial={invoice} />;
}
