// src/components/InvoicePDF.tsx
'use client';

import React from 'react';
import { Document, Font, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, Section } from '@/types';

if (typeof window !== 'undefined') {
  try {
    Font.registerEmojiSource({
      format: 'png',
      url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/',
    });
  } catch (e) {
    // fuente emoji opcional
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  receiptIcon: { fontSize: 18, marginRight: 8 },
  invoiceTitle: { fontSize: 26, fontFamily: 'Times-Bold', color: '#000000' },

  // Company block
  companyBlock: { marginBottom: 14, lineHeight: 1.35 },
  companyName: { fontFamily: 'Times-Bold', fontSize: 11, marginBottom: 1 },
  line: { fontSize: 11, marginBottom: 1 },
  bold: { fontFamily: 'Times-Bold' },

  // Client
  clientBlock: { marginBottom: 20, lineHeight: 1.35 },

  // Section title
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Times-Bold',
    marginTop: 14,
    marginBottom: 10,
    color: '#000000',
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: '#9a9a9a',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#9a9a9a',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#bdbdbd',
    minHeight: 22,
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 22,
  },
  cellNum: {
    width: '7%',
    borderRightWidth: 0.5,
    borderRightColor: '#bdbdbd',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 10,
    justifyContent: 'center',
  },
  cellTask: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: '#bdbdbd',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 10,
    justifyContent: 'center',
  },
  cellHours: {
    width: '12%',
    borderRightWidth: 0.5,
    borderRightColor: '#bdbdbd',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 10,
    textAlign: 'right',
    justifyContent: 'center',
  },
  cellAmount: {
    width: '18%',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 10,
    justifyContent: 'center',
  },
  headerCellText: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    textAlign: 'center',
  },

  // Subtotal line
  subtotalLine: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginTop: 8,
    marginBottom: 18,
  },

  // Total block
  totalTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 10 },
  totalIcon: { fontSize: 16, marginRight: 6 },
  totalTitle: { fontSize: 20, fontFamily: 'Times-Bold' },
  totalBullet: { flexDirection: 'row', marginLeft: 14, marginBottom: 4 },
  bulletDot: { fontSize: 11, marginRight: 6 },
  bulletText: { fontSize: 11 },
  grandTotalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  grandTotalIcon: { fontSize: 14, marginRight: 6 },
  grandTotal: { fontSize: 13, fontFamily: 'Times-Bold' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

const fmt = (n: number) => n.toFixed(2);

const calcSubtotal = (sec: Section) => sec.tasks.reduce((a, t) => a + (t.amount || 0), 0);

interface Props {
  invoice: Invoice;
  showHours: boolean;
}

const InvoicePDF = ({ invoice, showHours }: Props) => {
  const total = invoice.sections.reduce((a, s) => a + calcSubtotal(s), 0);
  const cur = invoice.currency || 'USD';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.receiptIcon}>🧾</Text>
          <Text style={styles.invoiceTitle}>FACTURA - No. {invoice.number}</Text>
        </View>

        {/* Company */}
        <View style={styles.companyBlock}>
          <Text style={styles.companyName}>{invoice.companyName}</Text>
          {invoice.companyCIF ? (
            <Text style={styles.line}>
              <Text style={styles.bold}>CIF: </Text>
              {invoice.companyCIF}
            </Text>
          ) : null}
          {invoice.companyAddress
            ? invoice.companyAddress.split('\n').map((l, i) => (
                <Text key={i} style={styles.line}>
                  {l}
                </Text>
              ))
            : null}
        </View>

        {/* Client */}
        <View style={styles.clientBlock}>
          <Text style={[styles.line, styles.bold]}>Emitido a favor de:</Text>
          <Text style={[styles.line, styles.bold]}>{invoice.clientName}</Text>
          {invoice.clientIBAN ? (
            <Text style={styles.line}>
              IBAN: <Text style={styles.bold}>{invoice.clientIBAN}</Text>
            </Text>
          ) : null}
          {invoice.clientSwift ? (
            <Text style={styles.line}>
              Swift/BIC: <Text style={styles.bold}>{invoice.clientSwift}</Text>
            </Text>
          ) : null}
          {invoice.clientBank ? (
            <Text style={styles.line}>
              Nombre y dirección del Banco: <Text style={styles.bold}>{invoice.clientBank}</Text>
            </Text>
          ) : null}
        </View>

        {/* Sections */}
        {invoice.sections.map((sec, sIdx) => {
          const subtotal = calcSubtotal(sec);
          return (
            <View key={sIdx}>
              <Text style={styles.sectionTitle}>
                {sec.title}
                {sec.subtitle ? ` ${sec.subtitle}` : ''}
              </Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={styles.cellNum}>
                    <Text style={styles.headerCellText}>Nº</Text>
                  </View>
                  <View style={styles.cellTask}>
                    <Text style={styles.headerCellText}>Tarea</Text>
                  </View>
                  {showHours && (
                    <View style={styles.cellHours}>
                      <Text style={styles.headerCellText}>Horas</Text>
                    </View>
                  )}
                  <View style={styles.cellAmount}>
                    <Text style={styles.headerCellText}>Estimación ({cur})</Text>
                  </View>
                </View>

                {sec.tasks.map((task, tIdx) => {
                  const isLast = tIdx === sec.tasks.length - 1;
                  return (
                    <View key={tIdx} style={isLast ? styles.tableRowLast : styles.tableRow} wrap={false}>
                      <View style={styles.cellNum}>
                        <Text>{task.number || tIdx + 1}</Text>
                      </View>
                      <View style={styles.cellTask}>
                        <Text>
                          {task.code ? `${task.code} ` : ''}
                          {task.description}
                        </Text>
                      </View>
                      {showHours && (
                        <View style={styles.cellHours}>
                          <Text>{task.hours ? task.hours.toFixed(1) : '-'}</Text>
                        </View>
                      )}
                      <View style={styles.cellAmount}>
                        <Text>{fmt(task.amount || 0)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.subtotalLine}>
                Subtotal Sección {sIdx + 1}: {fmt(subtotal)} {cur}
              </Text>
            </View>
          );
        })}

        {/* Total */}
        <View style={styles.totalTitleRow}>
          <Text style={styles.totalIcon}>🧾</Text>
          <Text style={styles.totalTitle}>TOTAL GENERAL</Text>
        </View>
        {invoice.sections.map((sec, i) => (
          <View key={i} style={styles.totalBullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Subtotal Sección {i + 1}: <Text style={styles.bold}>{fmt(calcSubtotal(sec))} {cur}</Text>
            </Text>
          </View>
        ))}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalIcon}>💰</Text>
          <Text style={styles.grandTotal}>
            TOTAL GENERAL A PAGAR: {fmt(total)} {cur}
          </Text>
        </View>

        {invoice.notes ? (
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontSize: 10, color: '#555' }}>Notas: {invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {invoice.date}
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
