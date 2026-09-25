import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate, planName } from '../../theme/subscription';

export default function PaymentResultModal({ open, plan, expiresAt, onClose }) {
  const { t, lang } = useLanguage();

  if (!open) return null;

  const pName = planName(plan, lang) || '';

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={44} color="#fff" />
            </View>
            <Text style={styles.title}>{t('sub_success_title')}</Text>
            <Text style={styles.subtitle}>
              {pName
                ? t('sub_success_plan_active').replace('{plan}', pName)
                : t('sub_success_generic')}
            </Text>
          </View>

          <View style={styles.body}>
            {expiresAt ? (
              <View style={styles.dateBox}>
                <Ionicons name="calendar" size={18} color="#2563eb" />
                <View>
                  <Text style={styles.dateLabel}>{t('sub_valid_until')}</Text>
                  <Text style={styles.dateVal}>{formatDate(expiresAt, lang)}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.note}>{t('sub_success_receipt_note')}</Text>

            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.btnText}>{t('sub_success_cta')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    backgroundColor: '#059669',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1fae5',
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    padding: 20,
    gap: 14,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  dateVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },
  note: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 13,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
