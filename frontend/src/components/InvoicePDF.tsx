// src/components/InvoicePDF.tsx
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { Invoice, Section } from '@/types';
import { intlTag, type Locale } from '@/i18n/config';

// Editorial palette (white paper + ink + stamp)
const PAPER = '#ffffff';
const INK = '#1c1c1f';
const MUTED = '#8a8782';
const RULE = '#1c1c1f';
const HAIR = '#d9d5cb';
const STAMP = '#b0543f';

const CUR_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', BOB: 'Bs' };
// The PDF is rendered by react-pdf outside the React tree of the page (no
// next-intl provider there), so its labels live here, keyed by UI locale.
const LABELS = {
  es: {
    status: { draft: 'BORRADOR', sent: 'ENVIADA', paid: 'PAGADA', cancelled: 'CANCELADA' } as Record<string, string>,
    title: 'FACTURA - No.',
    taxId: 'CIF: ',
    billedTo: 'Emitido a favor de:',
    bank: 'Nombre y dirección del Banco: ',
    date: 'FECHA',
    currency: 'MONEDA',
    transfer: 'Transferencia',
    concept: 'CONCEPTO',
    hours: 'HORAS',
    amount: 'IMPORTE',
    section: (n: number) => `Sección ${n}`,
    notes: 'NOTAS',
    issuedBy: 'EMITIDO POR',
    generated: 'GENERADO · INVOICE GENERATOR',
    page: (n: number, total: number) => `PÁG. ${n} / ${total}`,
    fileName: 'Factura',
    draftFileName: 'borrador',
  },
  en: {
    status: { draft: 'DRAFT', sent: 'SENT', paid: 'PAID', cancelled: 'CANCELLED' } as Record<string, string>,
    title: 'INVOICE - No.',
    taxId: 'Tax ID: ',
    billedTo: 'Billed to:',
    bank: 'Bank name and address: ',
    date: 'DATE',
    currency: 'CURRENCY',
    transfer: 'Bank transfer',
    concept: 'DESCRIPTION',
    hours: 'HOURS',
    amount: 'AMOUNT',
    section: (n: number) => `Section ${n}`,
    notes: 'NOTES',
    issuedBy: 'ISSUED BY',
    generated: 'GENERATED · INVOICE GENERATOR',
    page: (n: number, total: number) => `PAGE ${n} / ${total}`,
    fileName: 'Invoice',
    draftFileName: 'draft',
  },
} satisfies Record<Locale, unknown>;

export const pdfLabels = (locale: Locale) => LABELS[locale] ?? LABELS.es;

const moneyFormatter = (locale: Locale) => {
  const fmt = new Intl.NumberFormat(intlTag[locale] ?? intlTag.es, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (n: number) => fmt.format(n || 0);
};

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

  // — small typographic labels —
  label: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: MUTED,
    letterSpacing: 1.6,
  },

  // — header —
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

  // — information blocks (issuer / recipient), invoice style —
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

  // — totals —
  totalsBlock: { marginTop: 26, alignItems: 'flex-end' },
  totalsInner: { width: 260 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  subtotalLabel: { fontSize: 9.5, color: MUTED, flex: 1, paddingRight: 12 },
  subtotalVal: { fontFamily: 'Courier', fontSize: 9.5, color: INK, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  totalLabel: { fontSize: 8, fontFamily: 'Helvetica', color: MUTED, letterSpacing: 2 },
  totalValue: { fontFamily: 'Times-Bold', fontSize: 24, color: INK },

  // — notes —
  notes: { marginTop: 22 },
  notesText: { fontSize: 9, color: '#555', lineHeight: 1.5 },

  // — signature (at the end of the content, right-aligned) —
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

  // — footer (every page) —
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

// — Can a row break across pages? —
//
// Normally not: a row cut in half looks bad. But with `wrap={false}` react-pdf
// cannot paginate a row taller than the page and CLIPS it (it warns in the
// console "can't wrap between pages and it's bigger than available page
// height"), silently losing description text. So we estimate the row height
// and, if it gets close to the usable page height, let it break: uglier, but
// no information is lost.
//
// A4 = 595.28 × 841.89pt. Usable description width:
//   595.28 − 96 (horizontal padding) − 92 (amount) − 48 (hours) − 12 (gutter) ≈ 347
// Usable page height: 841.89 − 48 (top) − 96 (bottom) ≈ 698
const DESC_WIDTH = 347;
const DESC_FONT_SIZE = 10.5;
const DESC_LINE_HEIGHT = DESC_FONT_SIZE * 1.35;
// We overestimate the average character width (0.6em; Helvetica is around
// 0.5em) so the line count errs on the high side and never falls short.
const CHARS_PER_LINE = Math.max(1, Math.floor(DESC_WIDTH / (DESC_FONT_SIZE * 0.6)));
const PAGE_CONTENT_HEIGHT = 698;
// Generous threshold (60% of the page): the estimate is rough and we would
// rather allow the break than risk react-pdf clipping the row.
const MAX_UNBREAKABLE_HEIGHT = PAGE_CONTENT_HEIGHT * 0.6;

export const estimateRowHeight = (description?: string) => {
  const len = (description || '').length;
  const lines = Math.max(1, Math.ceil(len / CHARS_PER_LINE));
  return lines * DESC_LINE_HEIGHT;
};

/** Is this row allowed to break across pages? (see tests/invoice-pdf.test.ts) */
export const isRowBreakable = (description?: string) =>
  estimateRowHeight(description) > MAX_UNBREAKABLE_HEIGHT;

function ItemRow({
  task,
  showHours,
  money,
}: {
  task: any;
  showHours: boolean;
  money: (n: number) => string;
}) {
  const breakable = isRowBreakable(task.description);
  return (
    <View style={styles.itemRow} wrap={breakable}>
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
  /** UI locale the labels (not the invoice data) are printed in. */
  locale?: Locale;
}

const InvoicePDF = ({ invoice, showHours, locale = 'es' }: Props) => {
  const L = pdfLabels(locale);
  const money = moneyFormatter(locale);
  const total = invoice.sections.reduce((a, s) => a + calcSubtotal(s), 0);
  const cur = invoice.currency || 'USD';
  const sym = CUR_SYMBOL[cur] || '';
  const multiSection = invoice.sections.length > 1;
  const status = invoice.status || 'draft';
  const statusLabel = L.status[status] || status.toUpperCase();
  const hasBank = !!(invoice.clientIBAN || invoice.clientSwift || invoice.clientBank);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ——— Header: issuer/client on the left · stamp + date + currency on the right ——— */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceTitle}>{L.title} {invoice.number || '—'}</Text>

            {/* — Issuer — */}
            <View style={styles.infoBlock}>
              {invoice.companyName ? <Text style={styles.infoCompany}>{invoice.companyName}</Text> : null}
              {invoice.companyCIF ? (
                <Text style={styles.infoLine}>
                  <Text style={styles.infoBold}>{L.taxId}</Text>
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

            {/* — Recipient — */}
            {invoice.clientName || invoice.clientIBAN || invoice.clientSwift || invoice.clientBank ? (
              <View style={styles.infoBlock}>
                <Text style={styles.infoHeader}>{L.billedTo}</Text>
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
                    {L.bank}<Text style={styles.infoBold}>{invoice.clientBank}</Text>
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* — Stamp + date + currency (right) — */}
          <View style={styles.headerRight}>
            <View style={styles.stamp}>
              <Text style={styles.stampText}>{statusLabel}</Text>
            </View>
            <View style={styles.metaGroup}>
              <Text style={styles.label}>{L.date}</Text>
              <Text style={styles.metaValueR}>{fmtDate(invoice.date) || '—'}</Text>
            </View>
            <View style={styles.metaGroup}>
              <Text style={styles.label}>{L.currency}</Text>
              <Text style={styles.metaValueR}>
                {cur}
                {sym ? ` ${sym}` : ''}
              </Text>
              {hasBank ? <Text style={styles.metaSubR}>{L.transfer}</Text> : null}
            </View>
          </View>
        </View>

        {/* ——— Items ——— */}
        <View style={styles.itemsHead}>
          <Text style={[styles.label, styles.itemsHeadConcept]}>{L.concept}</Text>
          {showHours && <Text style={[styles.label, styles.colQty]}>{L.hours}</Text>}
          <Text style={[styles.label, styles.colAmount]}>{L.amount}{sym ? ` (${sym})` : ''}</Text>
        </View>
        <View style={styles.ruleHair} />

        {/* CAREFUL: NEVER put `minPresenceAhead` on the View that wraps a whole section.
            That wrapper can be taller than a page; react-pdf enters an infinite
            pagination loop (`paginate()` has no iteration cap) and, being synchronous,
            freezes the tab until the browser aborts on timeout. The anti-orphan hint
            goes on the section header, which does fit on a page. */}
        {invoice.sections.map((sec, sIdx) => (
          <View key={sIdx}>
            {sec.title || sec.subtitle ? (
              <View style={styles.sectionHead} wrap={false} minPresenceAhead={72}>
                {sec.title ? <Text style={styles.sectionTitle}>{sec.title}</Text> : null}
                {sec.subtitle ? <Text style={styles.sectionSub}>{sec.subtitle}</Text> : null}
              </View>
            ) : null}
            {sec.tasks.map((task, tIdx) => (
              <ItemRow key={tIdx} task={task} showHours={showHours} money={money} />
            ))}
          </View>
        ))}

        <View style={styles.ruleHair} />

        {/* ——— Totals ——— */}
        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsInner}>
            {multiSection &&
              invoice.sections.map((sec, i) => (
                <View key={i} style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal · {sec.title || L.section(i + 1)}</Text>
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

        {/* ——— Notes ——— */}
        {invoice.notes ? (
          <View style={styles.notes} wrap={false}>
            <Text style={styles.label}>{L.notes}</Text>
            {invoice.notes.split('\n').map((l, i) => (
              <Text key={i} style={[styles.notesText, { marginTop: i === 0 ? 5 : 0 }]}>
                {l}
              </Text>
            ))}
          </View>
        ) : null}

        {/* ——— Signature: last page, bottom right ———
            A NON-fixed block: being the last child in the flow it anchors to
            the last page, without depending on `totalPages` (which failed with
            `fixed` and made "EMITIDO POR" disappear on long invoices). */}
        <View style={styles.signatureBlock} wrap={false}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>{L.issuedBy}</Text>
          <Link src="https://invoices.corpsc.com/" style={styles.signatureUrl}>
            https://invoices.corpsc.com/
          </Link>
          <Link src={`https://www.corpsc.com/${locale}`} style={styles.signaturePromo}>
            corpsc.com
          </Link>
        </View>

        {/* ——— Footer: every page ——— */}
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
                <Text style={styles.footerText}>{L.generated}</Text>
                <Text style={styles.footerText}>{L.page(pageNumber, totalPages)}</Text>
              </>
            );
          }}
        />
      </Page>
    </Document>
  );
};

export default InvoicePDF;
