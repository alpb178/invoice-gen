// src/screens/InvoiceDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS, STATUS_COLORS, STATUS_LABELS } from '../utils/theme';
import { getInvoice } from '../services/api';
import { generateAndSharePDF } from '../utils/pdfGenerator';

export default function InvoiceDetailScreen({ route }) {
  const { id } = route.params;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await getInvoice(id);
        const attrs = raw.attributes || raw;
        const sections = (attrs.sections?.data || attrs.sections || []).map((s) => {
          const sa = s.attributes || s;
          const tasks = (sa.tasks?.data || sa.tasks || []).map((t) => {
            const ta = t.attributes || t;
            return { id: t.id, number: ta.number, code: ta.code, description: ta.description, amount: ta.amount, hours: ta.hours };
          });
          return { id: s.id, title: sa.title, subtitle: sa.subtitle, tasks };
        });
        setInvoice({ id: raw.id, ...attrs, sections });
      } catch (e) {
        Alert.alert('Error', e.message);
      }
      setLoading(false);
    })();
  }, [id]);

  const handlePDF = async () => {
    setGenerating(true);
    try {
      await generateAndSharePDF(invoice);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setGenerating(false);
  };

  const fmt = (n) => `$${(n || 0).toFixed(2)}`;
  const calcSub = (sec) => (sec.tasks || []).reduce((a, t) => a + (t.amount || 0), 0);

  if (loading) return <View style={styles.container}><Text style={styles.loadingText}>Cargando...</Text></View>;
  if (!invoice) return <View style={styles.container}><Text style={styles.loadingText}>No encontrada</Text></View>;

  const status = invoice.status || 'draft';
  const sc = STATUS_COLORS[status];
  const total = (invoice.sections || []).reduce((a, s) => a + calcSub(s), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.invoiceNumber}>Factura #{invoice.number}</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>{STATUS_LABELS[status]}</Text>
          </View>
        </View>
        <Text style={styles.date}>{invoice.date}</Text>
        <Text style={styles.totalAmount}>{fmt(total)} {invoice.currency}</Text>
      </View>

      {/* Company & Client */}
      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { flex: 1, marginRight: 6 }]}>
          <Text style={styles.infoLabel}>EMISOR</Text>
          <Text style={styles.infoName}>{invoice.companyName}</Text>
          {invoice.companyCIF && <Text style={styles.infoDetail}>CIF: {invoice.companyCIF}</Text>}
        </View>
        <View style={[styles.infoCard, { flex: 1, marginLeft: 6 }]}>
          <Text style={styles.infoLabel}>CLIENTE</Text>
          <Text style={styles.infoName}>{invoice.clientName}</Text>
          {invoice.clientIBAN && <Text style={styles.infoDetail}>IBAN: {invoice.clientIBAN}</Text>}
        </View>
      </View>

      {/* Sections */}
      {(invoice.sections || []).map((sec, sIdx) => (
        <View key={sIdx} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          {sec.subtitle && <Text style={styles.sectionSub}>{sec.subtitle}</Text>}

          {(sec.tasks || []).map((task, tIdx) => (
            <View key={tIdx} style={styles.taskRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskDesc}>
                  {task.code ? <Text style={styles.taskCode}>{task.code} </Text> : null}
                  {task.description}
                </Text>
              </View>
              <Text style={styles.taskAmount}>{fmt(task.amount)}</Text>
            </View>
          ))}

          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal Sección {sIdx + 1}:</Text>
            <Text style={styles.subtotalValue}>{fmt(calcSub(sec))}</Text>
          </View>
        </View>
      ))}

      {/* Total */}
      <View style={styles.totalCard}>
        <Text style={styles.totalTitle}>💰 Total General</Text>
        {(invoice.sections || []).map((sec, i) => (
          <View key={i} style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Sección {i + 1}:</Text>
            <Text style={styles.totalRowValue}>{fmt(calcSub(sec))}</Text>
          </View>
        ))}
        <View style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.grandLabel}>TOTAL A PAGAR:</Text>
          <Text style={styles.grandValue}>{fmt(total)} {invoice.currency}</Text>
        </View>
      </View>

      {/* PDF Button */}
      <TouchableOpacity style={styles.pdfBtn} onPress={handlePDF} disabled={generating}>
        <Text style={styles.pdfBtnText}>{generating ? '⏳ Generando...' : '📥 Descargar / Compartir PDF'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textFaint, textAlign: 'center', marginTop: 40 },

  headerCard: { backgroundColor: '#131320', borderWidth: 1, borderColor: '#1e2e24', borderRadius: 20, padding: 20, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceNumber: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  date: { fontSize: 12, color: COLORS.textFaint, marginTop: 4 },
  totalAmount: { fontSize: 30, fontWeight: '700', color: COLORS.accent, marginTop: 12 },

  infoRow: { flexDirection: 'row', marginBottom: 12 },
  infoCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14 },
  infoLabel: { fontSize: 10, color: COLORS.textFaint, letterSpacing: 1, marginBottom: 4 },
  infoName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  infoDetail: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  sectionSub: { fontSize: 11, color: COLORS.textMuted, marginBottom: 10 },

  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  taskCode: { color: COLORS.accent, fontSize: 12 },
  taskDesc: { fontSize: 12, color: COLORS.textDim, lineHeight: 18, paddingRight: 12 },
  taskAmount: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  subtotalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  subtotalLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  subtotalValue: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  totalCard: { backgroundColor: '#131320', borderWidth: 1, borderColor: '#1e2e24', borderRadius: 16, padding: 16, marginTop: 8 },
  totalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalRowLabel: { fontSize: 12, color: COLORS.textMuted },
  totalRowValue: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  totalDivider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginVertical: 8 },
  grandLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  grandValue: { fontSize: 14, fontWeight: '700', color: COLORS.accent },

  pdfBtn: { backgroundColor: COLORS.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  pdfBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
});
