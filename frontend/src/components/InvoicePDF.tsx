// src/components/InvoicePDF.tsx
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { Invoice, Section } from '@/types';

// Paleta editorial (papel blanco + tinta + sello)
const PAPER = '#ffffff';
const INK = '#1c1c1f';
const MUTED = '#8a8782';
const RULE = '#1c1c1f';
const HAIR = '#d9d5cb';
const STAMP = '#b0543f';

const CUR_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BOB: 'Bs' };
const STATUS_LABEL: Record<string, string> = {
  draft: 'BORRADOR',
  sent: 'ENVIADA',
  paid: 'PAGADA',
  cancelled: 'CANCELADA',
};

const money = (n: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (iso?: string) => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d} · ${m} · ${y}`;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 96,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: INK,
    backgroundColor: PAPER,
  },

  // — etiquetas pequeñas tipográficas —
  label: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: MUTED,
    letterSpacing: 1.6,
  },

  // — cabecera —
  invoiceTitle: { fontFamily: 'Times-Bold', fontSize: 22, color: INK, marginBottom: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1, paddingRight: 24 },
  invoiceNo: { fontFamily: 'Times-Bold', fontSize: 30, color: INK, marginTop: 4 },
  headerRight: { alignItems: 'flex-end', maxWidth: 240 },
  metaGroup: { marginTop: 14, alignItems: 'flex-end' },
  metaValueR: { fontFamily: 'Times-Bold', fontSize: 12, color: INK, textAlign: 'right', marginTop: 3 },
  metaSubR: { fontSize: 9, color: MUTED, textAlign: 'right', marginTop: 2 },
  emisorName: { fontFamily: 'Times-Bold', fontSize: 13, color: INK, textAlign: 'right' },
  emisorMeta: { fontFamily: 'Courier', fontSize: 9, color: MUTED, textAlign: 'right', marginTop: 1 },
  emisorAddr: { fontSize: 8, color: MUTED, textAlign: 'right', marginTop: 1, lineHeight: 1.4 },

  stamp: {
    borderWidth: 0.8,
    borderColor: STAMP,
    borderStyle: 'solid',
    borderRadius: 2,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  stampText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: STAMP, letterSpacing: 1.2 },

  ruleStrong: { borderTopWidth: 1, borderTopColor: RULE, borderStyle: 'solid', marginTop: 16 },
  ruleHair: { borderTopWidth: 0.6, borderTopColor: HAIR, borderStyle: 'solid' },

  // — bloques de información (emisor / receptor), estilo factura —
  infoBlock: { marginTop: 18 },
  infoCompany: { fontFamily: 'Times-Bold', fontSize: 11, color: INK },
  infoHeader: { fontFamily: 'Times-Bold', fontSize: 10.5, color: INK },
  infoName: { fontFamily: 'Times-Bold', fontSize: 10.5, color: INK, marginTop: 1 },
  infoLine: { fontFamily: 'Times-Roman', fontSize: 9.5, color: INK, marginTop: 1, lineHeight: 1.45 },
  infoBold: { fontFamily: 'Times-Bold' },

  // — items —
  itemsHead: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 30, paddingBottom: 6 },
  itemsHeadConcept: { flex: 1 },
  colQty: { width: 48, textAlign: 'right' },
  colAmount: { width: 92, textAlign: 'right' },

  sectionHead: { marginTop: 16, marginBottom: 2 },
  sectionTitle: { fontFamily: 'Times-Bold', fontSize: 11, color: INK },
  sectionSub: { fontSize: 8.5, color: MUTED, marginTop: 1 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 7 },
  itemDesc: { fontSize: 10.5, color: INK, lineHeight: 1.35 },
  itemCode: { fontFamily: 'Courier', fontSize: 8, color: MUTED, marginTop: 2 },
  itemQty: { width: 48, textAlign: 'right', fontFamily: 'Courier', fontSize: 10, color: INK },
  itemAmount: { width: 92, textAlign: 'right', fontFamily: 'Courier', fontSize: 10, color: INK },

  // — totales —
  totalsBlock: { marginTop: 26, alignItems: 'flex-end' },
  totalsInner: { width: 260 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  subtotalLabel: { fontSize: 9.5, color: MUTED, flex: 1, paddingRight: 12 },
  subtotalVal: { fontFamily: 'Courier', fontSize: 9.5, color: INK, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  totalLabel: { fontSize: 8, fontFamily: 'Helvetica', color: MUTED, letterSpacing: 2 },
  totalValue: { fontFamily: 'Times-Bold', fontSize: 24, color: INK },

  // — notas —
  notes: { marginTop: 22 },
  notesText: { fontSize: 9, color: '#555', lineHeight: 1.5 },

  // — firma (al final del contenido, alineada a la derecha) —
  signatureBlock: { marginTop: 48, marginBottom: 8, width: 240, alignSelf: 'flex-end' },
  signatureLine: { borderTopWidth: 0.6, borderTopColor: '#777', borderStyle: 'solid', marginBottom: 6 },
  signatureLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: MUTED,
    textAlign: 'right',
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  signatureUrl: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: INK,
    textAlign: 'right',
    textDecoration: 'none',
  },
  signaturePromo: {
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: MUTED,
    textAlign: 'right',
    textDecoration: 'none',
    marginTop: 2,
  },

  // — pie (todas las páginas) —
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: MUTED, letterSpacing: 1.2 },
});

const calcSubtotal = (sec: Section) => sec.tasks.reduce((a, t) => a + (t.amount || 0), 0);

function ItemRow({ task, showHours }: { task: any; showHours: boolean }) {
  return (
    <View style={styles.itemRow} wrap={false}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.itemDesc}>{task.description || '—'}</Text>
        {task.code ? <Text style={styles.itemCode}>{task.code}</Text> : null}
      </View>
      {showHours && <Text style={styles.itemQty}>{task.hours ? task.hours.toFixed(1) : '—'}</Text>}
      <Text style={styles.itemAmount}>{money(task.amount || 0)}</Text>
    </View>
  );
}

interface Props {
  invoice: Invoice;
  showHours: boolean;
}

const InvoicePDF = ({ invoice, showHours }: Props) => {
  const total = invoice.sections.reduce((a, s) => a + calcSubtotal(s), 0);
  const cur = invoice.currency || 'USD';
  const sym = CUR_SYMBOL[cur] || '';
  const multiSection = invoice.sections.length > 1;
  const status = invoice.status || 'draft';
  const statusLabel = STATUS_LABEL[status] || status.toUpperCase();
  const hasBank = !!(invoice.clientIBAN || invoice.clientSwift || invoice.clientBank);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ——— Cabecera: izquierda emisor/cliente · derecha sello + fecha + moneda ——— */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceTitle}>FACTURA - No. {invoice.number || '—'}</Text>

            {/* — Emisor — */}
            <View style={styles.infoBlock}>
              {invoice.companyName ? <Text style={styles.infoCompany}>{invoice.companyName}</Text> : null}
              {invoice.companyCIF ? (
                <Text style={styles.infoLine}>
                  <Text style={styles.infoBold}>CIF: </Text>
                  {invoice.companyCIF}
                </Text>
              ) : null}
              {invoice.companyAddress
                ? invoice.companyAddress.split('\n').map((l, i) => (
                    <Text key={i} style={styles.infoLine}>
                      {l}
                    </Text>
                  ))
                : null}
            </View>

            {/* — Receptor — */}
            {invoice.clientName || invoice.clientIBAN || invoice.clientSwift || invoice.clientBank ? (
              <View style={styles.infoBlock}>
                <Text style={styles.infoHeader}>Emitido a favor de:</Text>
                {invoice.clientName ? <Text style={styles.infoName}>{invoice.clientName}</Text> : null}
                {invoice.clientIBAN ? (
                  <Text style={styles.infoLine}>
                    IBAN: <Text style={styles.infoBold}>{invoice.clientIBAN}</Text>
                  </Text>
                ) : null}
                {invoice.clientSwift ? (
                  <Text style={styles.infoLine}>
                    Swift/BIC: <Text style={styles.infoBold}>{invoice.clientSwift}</Text>
                  </Text>
                ) : null}
                {invoice.clientBank ? (
                  <Text style={styles.infoLine}>
                    Nombre y dirección del Banco: <Text style={styles.infoBold}>{invoice.clientBank}</Text>
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* — Sello + fecha + moneda (derecha) — */}
          <View style={styles.headerRight}>
            <View style={styles.stamp}>
              <Text style={styles.stampText}>{statusLabel}</Text>
            </View>
            <View style={styles.metaGroup}>
              <Text style={styles.label}>FECHA</Text>
              <Text style={styles.metaValueR}>{fmtDate(invoice.date) || '—'}</Text>
            </View>
            <View style={styles.metaGroup}>
              <Text style={styles.label}>MONEDA</Text>
              <Text style={styles.metaValueR}>
                {cur}
                {sym ? ` ${sym}` : ''}
              </Text>
              {hasBank ? <Text style={styles.metaSubR}>Transferencia</Text> : null}
            </View>
          </View>
        </View>

        {/* ——— Items ——— */}
        <View style={styles.itemsHead}>
          <Text style={[styles.label, styles.itemsHeadConcept]}>CONCEPTO</Text>
          {showHours && <Text style={[styles.label, styles.colQty]}>HORAS</Text>}
          <Text style={[styles.label, styles.colAmount]}>IMPORTE{sym ? ` (${sym})` : ''}</Text>
        </View>
        <View style={styles.ruleHair} />

        {invoice.sections.map((sec, sIdx) => (
          <View key={sIdx} minPresenceAhead={90}>
            {sec.title || sec.subtitle ? (
              <View style={styles.sectionHead} wrap={false}>
                {sec.title ? <Text style={styles.sectionTitle}>{sec.title}</Text> : null}
                {sec.subtitle ? <Text style={styles.sectionSub}>{sec.subtitle}</Text> : null}
              </View>
            ) : null}
            {sec.tasks.map((task, tIdx) => (
              <ItemRow key={tIdx} task={task} showHours={showHours} />
            ))}
          </View>
        ))}

        <View style={styles.ruleHair} />

        {/* ——— Totales ——— */}
        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsInner}>
            {multiSection &&
              invoice.sections.map((sec, i) => (
                <View key={i} style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal · {sec.title || `Sección ${i + 1}`}</Text>
                  <Text style={styles.subtotalVal}>{money(calcSubtotal(sec))}</Text>
                </View>
              ))}
            {multiSection && <View style={[styles.ruleHair, { marginTop: 6 }]} />}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>
                {sym ? `${sym} ` : ''}
                {money(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* ——— Notas ——— */}
        {invoice.notes ? (
          <View style={styles.notes} wrap={false}>
            <Text style={styles.label}>NOTAS</Text>
            {invoice.notes.split('\n').map((l, i) => (
              <Text key={i} style={[styles.notesText, { marginTop: i === 0 ? 5 : 0 }]}>
                {l}
              </Text>
            ))}
          </View>
        ) : null}

        {/* ——— Firma: última página, abajo a la derecha ———
            Bloque absoluto NO fixed: al ser el último hijo del flujo se ancla
            a la última página, sin depender de `totalPages` (que con `fixed`
            fallaba y hacía desaparecer el "EMITIDO POR" en facturas largas). */}
        <View style={styles.signatureBlock} wrap={false}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>EMITIDO POR</Text>
          <Link src="https://invoices.corpsc.com/" style={styles.signatureUrl}>
            https://invoices.corpsc.com/
          </Link>
          <Link src="https://www.corpsc.com/es" style={styles.signaturePromo}>
            corpsc.com
          </Link>
        </View>

        {/* ——— Pie: todas las páginas ——— */}
        <View
          style={styles.footer}
          fixed
          render={(props) => {
            const { pageNumber, totalPages } = props as unknown as {
              pageNumber: number;
              totalPages: number;
            };
            return (
              <>
                <Text style={styles.footerText}>GENERADO · INVOICE GENERATOR</Text>
                <Text style={styles.footerText}>
                  PÁG. {pageNumber} / {totalPages}
                </Text>
              </>
            );
          }}
        />
      </Page>
    </Document>
  );
};

export default InvoicePDF;
