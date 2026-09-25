import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

const PHONE_1 = '6377518112';
const PHONE_2 = '7378255250';
const EMAIL = 'LALITSINGH8122000@gmail.com';

export default function ContactUsScreen({ navigation }) {
  const { lang } = useLanguage();
  const hi = lang === 'hi';

  const makeCall = (num) => {
    Linking.openURL(`tel:${num}`);
  };

  const openWhatsApp = (num) => {
    Linking.openURL(`https://wa.me/91${num}?text=Hello%20Thekedaari%20Support`);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${EMAIL}?subject=Thekedaari%20Support%20Request`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {hi ? 'संपर्क करें' : 'Contact Us'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="headset" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>
            {hi ? 'ठेकेदारी सपोर्ट टीम' : 'Thekedaari Support'}
          </Text>
          <Text style={styles.heroSub}>
            {hi
              ? 'कोई भी सवाल, सुझाव या भुगतान में मदद के लिए हमसे संपर्क करें। हम तुरंत सहायता करेंगे।'
              : 'Reach out for any questions, suggestions, or payment help. We respond quickly.'}
          </Text>
        </View>

        {/* Contact Numbers */}
        <Text style={styles.sectionLabel}>
          {hi ? 'फ़ोन नंबर' : 'Phone Numbers'}
        </Text>

        {[
          { number: PHONE_1, label: hi ? 'प्राथमिक नंबर (Primary)' : 'Primary Support' },
          { number: PHONE_2, label: hi ? 'वैकल्पिक नंबर (Alternate)' : 'Alternate Support' },
        ].map(({ number, label }) => (
          <View key={number} style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <View style={styles.phoneIcon}>
                <Ionicons name="call" size={20} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardNumber}>+91 {number}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.callActionBtn}
                activeOpacity={0.8}
                onPress={() => makeCall(number)}
              >
                <Ionicons name="call" size={16} color="#2563eb" />
                <Text style={styles.callActionText}>{hi ? 'कॉल करें' : 'Call'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.waActionBtn}
                activeOpacity={0.8}
                onPress={() => openWhatsApp(number)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16a34a" />
                <Text style={styles.waActionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Email Support */}
        <Text style={styles.sectionLabel}>
          {hi ? 'ईमेल सपोर्ट' : 'Email Support'}
        </Text>
        <TouchableOpacity
          style={styles.emailCard}
          activeOpacity={0.8}
          onPress={openEmail}
        >
          <View style={styles.emailIcon}>
            <Ionicons name="mail" size={20} color="#ea580c" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{hi ? 'ईमेल भेजें' : 'Send Email'}</Text>
            <Text style={styles.emailText}>{EMAIL}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Working Hours Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                {hi ? 'कार्य समय (Working Hours)' : 'Working Hours'}
              </Text>
              <Text style={styles.infoDesc}>
                {hi ? 'सोमवार - शनिवार, सुबह 9:00 से शाम 7:00 बजे तक' : 'Monday – Saturday, 9:00 AM – 7:00 PM'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  heroCard: {
    backgroundColor: '#1e40af',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 4,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#bfdbfe',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  phoneIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  callActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  callActionText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
  waActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  waActionText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '700',
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emailIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
});
