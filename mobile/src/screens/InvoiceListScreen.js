// src/screens/InvoiceListScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, STATUS_COLORS, STATUS_LABELS } from '../utils/theme';
import { getInvoices, deleteInvoice } from '../services/api';

export default function InvoiceListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (id) => {
    Alert.alert('Eliminar', '¿Eliminar esta factura?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteInvoice(id); load(); } },
    ]);
  };

  const fmt = (n) => `$${(n || 0).toFixed(2)}`;

  const renderItem = ({ item }) => {
    const attrs = item.attributes || item;
    const status = attrs.status || 'draft';
    const sc = STATUS_COLORS[status] || STATUS_COLORS.draft;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InvoiceDetail', { id: item.id })}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardIcon}>🧾</Text>
          <View>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>#{attrs.number}</Text>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.badgeText, { color: sc.text }]}>{STATUS_LABELS[status]}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{attrs.clientName} · {attrs.date}</Text>
          </View>
        </View>
        <Text style={styles.cardAmount}>{fmt(attrs.totalAmount)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🧾 Facturas</Text>
          <Text style={styles.headerSub}>Generador de facturas</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('InvoiceForm')}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📄</Text>
            <Text style={styles.emptyText}>No hay facturas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textFaint, marginTop: 2 },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#000', fontWeight: '600', fontSize: 13 },

  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardIcon: { fontSize: 28 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  cardMeta: { fontSize: 11, color: COLORS.textFaint, marginTop: 2 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: COLORS.accent },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.textFaint, fontSize: 14 },
});
