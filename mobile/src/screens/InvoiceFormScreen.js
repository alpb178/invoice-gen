// src/screens/InvoiceFormScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../utils/theme';
import { createInvoice, createSection, createTask, updateSection, updateInvoice } from '../services/api';

const today = () => new Date().toISOString().split('T')[0];

export default function InvoiceFormScreen({ navigation }) {
  const [form, setForm] = useState({
    number: '',
    date: today(),
    currency: 'USD',
    companyName: '',
    companyCIF: '',
    companyAddress: '',
    clientName: '',
    clientIBAN: '',
    clientSwift: '',
    clientBank: '',
  });

  const [sections, setSections] = useState([
    { title: '', subtitle: '', tasks: [{ code: '', description: '', amount: '', hours: '' }] },
  ]);

  const [saving, setSaving] = useState(false);

  const updateForm = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const updateSec = (sIdx, key, val) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[sIdx] = { ...copy[sIdx], [key]: val };
      return copy;
    });
  };

  const updateTask = (sIdx, tIdx, key, val) => {
    setSections((prev) => {
      const copy = [...prev];
      const tasks = [...copy[sIdx].tasks];
      tasks[tIdx] = { ...tasks[tIdx], [key]: val };
      copy[sIdx] = { ...copy[sIdx], tasks };
      return copy;
    });
  };

  const addSection = () => setSections((p) => [...p, { title: '', subtitle: '', tasks: [{ code: '', description: '', amount: '', hours: '' }] }]);
  const addTask = (sIdx) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[sIdx] = { ...copy[sIdx], tasks: [...copy[sIdx].tasks, { code: '', description: '', amount: '', hours: '' }] };
      return copy;
    });
  };

  const removeTask = (sIdx, tIdx) => {
    setSections((prev) => {
      const copy = [...prev];
      if (copy[sIdx].tasks.length <= 1) return prev;
      copy[sIdx] = { ...copy[sIdx], tasks: copy[sIdx].tasks.filter((_, i) => i !== tIdx) };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!form.number || !form.companyName || !form.clientName) {
      Alert.alert('Campos requeridos', 'Completa nº factura, empresa y cliente.');
      return;
    }
    setSaving(true);
    try {
      // 1. Create invoice
      const inv = await createInvoice({ ...form, status: 'draft', totalAmount: 0 });
      const invoiceId = inv.id;

      let totalAmount = 0;

      // 2. Create sections and tasks
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const secRecord = await createSection({ title: sec.title, subtitle: sec.subtitle, sortOrder: i, invoice: invoiceId });
        const sectionId = secRecord.id;

        let subtotal = 0;
        for (let j = 0; j < sec.tasks.length; j++) {
          const t = sec.tasks[j];
          const amt = parseFloat(t.amount) || 0;
          subtotal += amt;
          await createTask({
            number: j + 1,
            code: t.code,
            description: t.description,
            amount: amt,
            hours: parseFloat(t.hours) || null,
            sortOrder: j,
            section: sectionId,
          });
        }

        await updateSection(sectionId, { subtotal });
        totalAmount += subtotal;
      }

      // 3. Update total
      await updateInvoice(invoiceId, { totalAmount });

      Alert.alert('✅ Guardada', 'Factura creada exitosamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const inputStyle = [styles.input];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={styles.title}>Nueva Factura</Text>

      {/* Invoice info */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>DATOS FACTURA</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Nº Factura</Text>
            <TextInput style={inputStyle} placeholder="25/2026" placeholderTextColor={COLORS.textFaint} value={form.number} onChangeText={(v) => updateForm('number', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Fecha</Text>
            <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textFaint} value={form.date} onChangeText={(v) => updateForm('date', v)} />
          </View>
        </View>
      </View>

      {/* Company */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>EMISOR</Text>
        <Text style={styles.label}>Empresa</Text>
        <TextInput style={inputStyle} placeholder="Emx Comunicaciones S.L.U." placeholderTextColor={COLORS.textFaint} value={form.companyName} onChangeText={(v) => updateForm('companyName', v)} />
        <Text style={styles.label}>CIF</Text>
        <TextInput style={inputStyle} placeholder="B85173963" placeholderTextColor={COLORS.textFaint} value={form.companyCIF} onChangeText={(v) => updateForm('companyCIF', v)} />
      </View>

      {/* Client */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CLIENTE</Text>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={inputStyle} placeholder="Alejandro Pérez" placeholderTextColor={COLORS.textFaint} value={form.clientName} onChangeText={(v) => updateForm('clientName', v)} />
        <Text style={styles.label}>IBAN</Text>
        <TextInput style={inputStyle} placeholder="BE95905522553858" placeholderTextColor={COLORS.textFaint} value={form.clientIBAN} onChangeText={(v) => updateForm('clientIBAN', v)} />
        <Text style={styles.label}>Swift</Text>
        <TextInput style={inputStyle} placeholder="TRWIBEB1XXX" placeholderTextColor={COLORS.textFaint} value={form.clientSwift} onChangeText={(v) => updateForm('clientSwift', v)} />
      </View>

      {/* Sections */}
      {sections.map((sec, sIdx) => (
        <View key={sIdx} style={styles.card}>
          <Text style={styles.cardLabel}>SECCIÓN {sIdx + 1}</Text>
          <Text style={styles.label}>Título</Text>
          <TextInput style={inputStyle} placeholder="Tareas de Desarrollo (Front-Febrero)" placeholderTextColor={COLORS.textFaint} value={sec.title} onChangeText={(v) => updateSec(sIdx, 'title', v)} />
          <Text style={styles.label}>Desarrollador</Text>
          <TextInput style={inputStyle} placeholder="Richard, Jhoan..." placeholderTextColor={COLORS.textFaint} value={sec.subtitle} onChangeText={(v) => updateSec(sIdx, 'subtitle', v)} />

          {sec.tasks.map((task, tIdx) => (
            <View key={tIdx} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskNum}>Tarea {tIdx + 1}</Text>
                {sec.tasks.length > 1 && (
                  <TouchableOpacity onPress={() => removeTask(sIdx, tIdx)}>
                    <Text style={{ color: COLORS.red, fontSize: 14 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.row}>
                <View style={{ width: 80, marginRight: 8 }}>
                  <TextInput style={inputStyle} placeholder="TF-230" placeholderTextColor={COLORS.textFaint} value={task.code} onChangeText={(v) => updateTask(sIdx, tIdx, 'code', v)} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput style={inputStyle} placeholder="Descripción..." placeholderTextColor={COLORS.textFaint} value={task.description} onChangeText={(v) => updateTask(sIdx, tIdx, 'description', v)} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Monto ($)</Text>
                  <TextInput style={inputStyle} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={COLORS.textFaint} value={task.amount} onChangeText={(v) => updateTask(sIdx, tIdx, 'amount', v)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Horas (opc.)</Text>
                  <TextInput style={inputStyle} placeholder="0" keyboardType="decimal-pad" placeholderTextColor={COLORS.textFaint} value={task.hours} onChangeText={(v) => updateTask(sIdx, tIdx, 'hours', v)} />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={() => addTask(sIdx)} style={styles.addTaskBtn}>
            <Text style={styles.addTaskText}>+ Agregar tarea</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addSection} style={styles.addSectionBtn}>
        <Text style={styles.addSectionText}>+ Agregar Sección</Text>
      </TouchableOpacity>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : '💾 Guardar Factura'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16 },

  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardLabel: { fontSize: 10, color: COLORS.textFaint, letterSpacing: 1.2, fontWeight: '500', marginBottom: 10 },
  label: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text, fontSize: 13 },
  row: { flexDirection: 'row', marginTop: 4 },

  taskCard: { backgroundColor: COLORS.inputBg, borderRadius: 10, padding: 10, marginTop: 10, borderWidth: 1, borderColor: COLORS.border },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskNum: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

  addTaskBtn: { marginTop: 8, padding: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: 8, alignItems: 'center' },
  addTaskText: { fontSize: 12, color: COLORS.textFaint },
  addSectionBtn: { padding: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  addSectionText: { fontSize: 13, color: COLORS.textFaint },

  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
