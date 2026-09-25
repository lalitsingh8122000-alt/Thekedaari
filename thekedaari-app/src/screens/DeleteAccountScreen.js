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
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SUPPORT_EMAIL = 'lalitsingh8122000@gmail.com';
const SUPPORT_PHONE = '6377518112';

export default function DeleteAccountScreen({ navigation }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const hi = lang === 'hi';

  const handleEmailRequest = () => {
    const subject = encodeURIComponent(`Account Deletion Request - ${user?.phone || ''}`);
    const body = encodeURIComponent(
      `Hello Thekedaari Support,\n\nI want to permanently delete my account and all associated data.\n\nRegistered Name: ${user?.name || ''}\nRegistered Phone: ${user?.phone || ''}\n\nThank you.`
    );
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
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
          {hi ? 'अकाउंट हटाएं' : 'Delete Account'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="warning" size={30} color="#dc2626" />
          </View>
          <Text style={styles.heroTitle}>
            {hi ? 'अकाउंट और डेटा हटाने का अनुरोध' : 'Request Account Deletion'}
          </Text>
          <Text style={styles.heroSub}>
            {hi
              ? 'यदि आप अपना Thekedaari अकाउंट और उससे जुड़ा सारा डेटा हटाना चाहते हैं, तो कृपया नीचे दिए गए चरणों का पालन करें।'
              : 'If you want to permanently delete your Thekedaari account and all associated data, please follow the steps below.'}
          </Text>
        </View>

        {/* Section 1: How to Request */}
        <View style={styles.card}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>01</Text>
          </View>
          <Text style={styles.cardTitle}>
            {hi ? 'अकाउंट हटाने का तरीक़ा' : 'How to Request Deletion'}
          </Text>
          <Text style={styles.cardDesc}>
            {hi
              ? 'आप नीचे दिए गए बटन पर क्लिक करके सीधे ईमेल या कॉल के ज़रिये अकाउंट हटाने का अनुरोध भेज सकते हैं:'
              : 'You can submit an account deletion request directly via email or phone:'}
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="mail-outline" size={16} color="#2563eb" />
              <Text style={styles.bulletText}>
                {hi ? 'ईमेल भेजें:' : 'Email:'} {SUPPORT_EMAIL}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="call-outline" size={16} color="#2563eb" />
              <Text style={styles.bulletText}>
                {hi ? 'फ़ोन नंबर:' : 'Phone:'} +91 {SUPPORT_PHONE}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="time-outline" size={16} color="#16a34a" />
              <Text style={styles.bulletText}>
                {hi
                  ? 'आपका अनुरोध 3–5 कार्य दिवसों में प्रोसेस कर दिया जाएगा।'
                  : 'Processed within 3–5 business days.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.8}
            onPress={handleEmailRequest}
          >
            <Ionicons name="mail" size={18} color="#fff" />
            <Text style={styles.primaryActionText}>
              {hi ? 'ईमेल से अनुरोध भेजें' : 'Send Deletion Email'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Data Deleted */}
        <View style={styles.card}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>02</Text>
          </View>
          <Text style={styles.cardTitle}>
            {hi ? 'हटाया जाने वाला डेटा' : 'Data That Will Be Deleted'}
          </Text>
          <Text style={styles.cardDesc}>
            {hi
              ? 'अनुरोध पूरा होने पर आपका निम्नलिखित डेटा हमेशा के लिए हटा दिया जाएगा:'
              : 'Once processed, the following data will be permanently removed:'}
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletText}>
              • <Text style={{ fontWeight: '700' }}>{hi ? 'प्रोफ़ाइल जानकारी:' : 'Profile info:'}</Text>{' '}
              {hi ? 'नाम, फ़ोन नंबर और अकाउंट विवरण' : 'Name, phone number and account details'}
            </Text>
            <Text style={styles.bulletText}>
              • <Text style={{ fontWeight: '700' }}>{hi ? 'मज़दूर और हाज़िरी:' : 'Labour records:'}</Text>{' '}
              {hi ? 'सारे मज़दूर, दैनिक हाज़िरी और वेतन लेजर' : 'Worker records, attendance, and salary history'}
            </Text>
            <Text style={styles.bulletText}>
              • <Text style={{ fontWeight: '700' }}>{hi ? 'प्रोजेक्ट और ख़र्चे:' : 'Finance data:'}</Text>{' '}
              {hi ? 'प्रोजेक्ट लेन-देन, आमदनी, वेंडर बिल और भुगतान' : 'Project transactions, income, expense, and vendor ledger'}
            </Text>
          </View>
        </View>

        {/* Section 3: Caution */}
        <View style={styles.cautionBox}>
          <Ionicons name="alert-circle" size={20} color="#b45309" />
          <Text style={styles.cautionText}>
            {hi
              ? 'ध्यान दें: एक बार अकाउंट डिलीट होने के बाद आपका डेटा वापस नहीं लाया जा सकता।'
              : 'Please note: Once deleted, your account and data cannot be recovered.'}
          </Text>
        </View>

        {/* Call Support Button */}
        <TouchableOpacity
          style={styles.callSupportBtn}
          activeOpacity={0.8}
          onPress={handleCallSupport}
        >
          <Ionicons name="call" size={18} color="#2563eb" />
          <Text style={styles.callSupportText}>
            {hi ? 'सपोर्ट से बात करें (+91 6377518112)' : 'Talk to Support (+91 6377518112)'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
    marginBottom: 14,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  cautionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 12,
  },
  cautionText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 16,
  },
  callSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  callSupportText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '800',
  },
});
