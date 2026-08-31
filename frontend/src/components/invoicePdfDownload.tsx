// src/components/invoicePdfDownload.tsx
//
// Generación y descarga del PDF. Está en su propio módulo para que tanto el
// botón del editor como la acción del listado usen el mismo camino.
//
// IMPORTANTE: este módulo carga @react-pdf/renderer, que no funciona en SSR y
// pesa. Impórtalo solo desde un componente con `ssr: false`, o con un
// `await import(...)` dentro del propio manejador del clic. Nunca de forma
// estática desde una pantalla de edición: el PDF se genera bajo demanda.

import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Invoice } from '@/types';

export async function downloadInvoicePDF(invoice: Invoice, showHours: boolean) {
  const blob = await pdf(<InvoicePDF invoice={invoice} showHours={showHours} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Factura_${invoice.number || 'borrador'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
