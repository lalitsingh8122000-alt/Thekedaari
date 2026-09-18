import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components';

const GUIDE_SECTIONS = [
  {
    titleKey: 'guide_s01_title',
    titleDefault: 'लॉगिन — ऐप खोलें',
    introDefault: 'हर बार ऐप खोलने पर यहाँ से शुरू करें। अपना मोबाइल नंबर और पासवर्ड डालें।',
    steps: [
      'Thekedaari ऐप खोलें।',
      '10 अंकों का अपना मोबाइल नंबर डालें।',
      'पासवर्ड डालें।',
      'Login बटन दबाएं।',
    ],
    color: Colors.primary,
  },
  {
    titleKey: 'guide_s02_title',
    titleDefault: 'रजिस्टर — पहली बार खाता बनाएं',
    introDefault: 'यह सिर्फ एक बार करें जब आप ऐप में नए हों। रजिस्टर होते ही डैशबोर्ड खुल जाएगा।',
    steps: [
      'लॉगिन पेज पर Register दबाएं।',
      'अपना पूरा नाम डालें।',
      '10 अंकों का अपना मोबाइल नंबर डालें।',
      'पासवर्ड बनाएं — दोनों बार एक जैसा डालें।',
      'Register दबाएं।',
    ],
    color: '#6366f1',
  },
  {
    titleKey: 'guide_s03_title',
    titleDefault: 'डैशबोर्ड — रोज़ की जानकारी',
    introDefault: 'यहाँ आज का पैसा, चालू प्रोजेक्ट और मज़दूरों की संख्या एक नज़र में दिखती है।',
    steps: [
      'लॉगिन होते ही डैशबोर्ड पर आ जाते हैं।',
      'ऊपर कुल आमदनी, कुल ख़र्च और मुनाफ़ा/नुकसान दिखता है।',
      'नीचे चालू प्रोजेक्ट और एक्टिव मज़दूरों की संख्या दिखती है।',
      'हाल की लेन-देन और आज की हाज़िरी का सारांश नीचे दिखता है।',
    ],
    color: '#8b5cf6',
  },
  {
    titleKey: 'guide_s04_title',
    titleDefault: '☰ मेनू — किसी भी पेज पर जाएं',
    introDefault: 'ऊपर बाईं ओर ☰ (तीन लाइनें) दबाने से मेनू खुलता है। सारे पेज यहाँ से मिलते हैं।',
    steps: [
      'किसी भी स्क्रीन पर ऊपर ☰ दबाएं।',
      'साइड मेनू खुलेगा — जो पेज चाहिए उस पर टैप करें।',
      'नीचे की बार से भी मुख्य पेज पर जल्दी जा सकते हैं।',
    ],
    color: '#06b6d4',
  },
  {
    titleKey: 'guide_s05_title',
    titleDefault: 'रोल्स — मज़दूर के प्रकार और ठेका काम सेट करें',
    introDefault: 'मज़दूर जोड़ने से पहले उनके काम के प्रकार बनाएं जैसे मज़दूर, कारीगर, ठेकेदार।',
    steps: [
      'मेनू → रोल्स खोलें।',
      'ऊपर के बटन से रोल जोड़ें — Labour, Karigar, Supervisor, आदि।',
      'नीचे ठेका काम के प्रकार जोड़ें — Plumbing, Painting आदि।',
    ],
    color: '#14b8a6',
  },
  {
    titleKey: 'guide_s06_title',
    titleDefault: 'प्रोजेक्ट — आपकी सारी साइटें',
    introDefault: 'हर प्रोजेक्ट एक निर्माण साइट या काम को दर्शाता है।',
    steps: [
      'मेनू → प्रोजेक्ट खोलें।',
      'सारी साइटें कार्ड के रूप में दिखेंगी।',
      'किसी प्रोजेक्ट पर टैप करें: हाज़िरी, फ़ाइनेंस या एडिट खोलने के लिए।',
      '+ बटन दबाकर नया प्रोजेक्ट जोड़ें।',
    ],
    color: '#10b981',
  },
  {
    titleKey: 'guide_s07_title',
    titleDefault: 'नया प्रोजेक्ट जोड़ें',
    introDefault: 'जब भी कोई नई साइट या काम मिले, यहाँ उसकी एंट्री करें।',
    steps: [
      'प्रोजेक्ट पेज पर + दबाएं।',
      'प्रोजेक्ट का नाम लिखें (जैसे शर्मा जी का मकान)।',
      'शुरुआत की तारीख़ और साइज़ (छोटा/मध्यम/बड़ा) चुनें।',
      'Save दबाएं।',
    ],
    color: '#16a34a',
  },
  {
    titleKey: 'guide_s09_title',
    titleDefault: 'फ़ाइनेंस — एक साइट का पैसों का हिसाब',
    introDefault: 'किसी भी प्रोजेक्ट का Finance खोलकर आमदनी, सामान की ख़रीद और ठेका ख़र्च दर्ज करें।',
    steps: [
      'प्रोजेक्ट कार्ड पर Finance दबाएं।',
      'आमदनी: + दबाएं — राशि, तारीख़ और नकद/ऑनलाइन भरें।',
      'ख़र्च → सामग्री: सीमेंट, रेत, ईंट दर्ज करें।',
      'ख़र्च → ठेका: ठेकेदार का बिल दर्ज करें।',
    ],
    color: '#f59e0b',
  },
  {
    titleKey: 'guide_s10_title',
    titleDefault: 'मज़दूर — अपनी टीम मैनेज करें',
    introDefault: 'मज़दूर, कारीगर, सुपरवाइज़र व ठेकेदार सब यहाँ दिखते हैं।',
    steps: [
      'मेनू → मज़दूर खोलें।',
      'हर कार्ड पर: हाज़िरी, लेजर और एडिट का ऑप्शन है।',
      '+ Add Worker दबाकर नया मज़दूर जोड़ें।',
    ],
    color: '#ea580c',
  },
  {
    titleKey: 'guide_s11_title',
    titleDefault: 'नया मज़दूर जोड़ें',
    introDefault: 'जिसे भी पैसा देते हों उसे यहाँ जोड़ें।',
    steps: [
      'मज़दूर पेज पर + Add Worker दबाएं।',
      'नाम, फ़ोन नंबर, भूमिका और रोज़ की दर ₹ भरें।',
      'Save दबाएं।',
    ],
    color: '#ef4444',
  },
  {
    titleKey: 'guide_s14_title',
    titleDefault: 'साइट हाज़िरी — सारे मज़दूरों की हाज़िरी लगाएं',
    introDefault: 'एक साइट के सारे मज़दूरों की हाज़िरी एक जगह लगाएं।',
    steps: [
      'प्रोजेक्ट → Attendance खोलें।',
      'तारीख़ चुनें।',
      'हर मज़दूर के लिए P (हाज़िर), HD (आधा दिन) या A (ग़ैरहाज़िर) चुनें।',
      'Save Attendance दबाएं।',
    ],
    color: '#ec4899',
  },
  {
    titleKey: 'guide_s15_title',
    titleDefault: 'मज़दूर लेजर — पगार और भुगतान का पूरा हिसाब',
    introDefault: 'लेजर में एक मज़दूर की सारी पगार और भुगतान का हिसाब रहता है।',
    steps: [
      'मज़दूर कार्ड → Ledger दबाएं।',
      'Current Balance बकाया पगार बताता है।',
      'भुगतान दर्ज करने के लिए Record Payment दबाएं।',
      'बोनस जोड़ने के लिए Add Earning दबाएं।',
    ],
    color: '#8b5cf6',
  },
];

export default function HowToUseScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('howToUse') || 'कैसे चलाएं'}</Text>
          <Text style={styles.headerSub}>{t('guidePageTitle') || 'Thekedaari उपयोग निर्देश'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Text style={{ fontSize: 26 }}>📖</Text>
          </View>
          <Text style={styles.bannerTitle}>{t('guidePageTitle') || 'Thekedaari कैसे चलाएं'}</Text>
          <Text style={styles.bannerSub}>
            {t('guidePageSubtitle') || 'अपने मज़दूर, साइट और पैसों का हिसाब आसानी से रखें।'}
          </Text>
        </View>

        {/* Tips row */}
        <View style={styles.tipCard}>
          <Text style={styles.tipHeader}>💡 {t('guideBoxHowToReadTitle') || 'गाइड कैसे पढ़ें'}</Text>
          <Text style={styles.tipBody}>
            {t('guideBoxHowToReadBody') || 'हर सेक्शन में आसान कदम दिए गए हैं। एक कदम करें, फिर अगला।'}
          </Text>
        </View>

        {/* Sections */}
        {GUIDE_SECTIONS.map((sec, idx) => (
          <Card key={idx} style={styles.secCard}>
            <View style={[styles.secHeader, { backgroundColor: sec.color }]}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>{idx + 1}</Text>
              </View>
              <Text style={styles.secTitle}>{t(sec.titleKey) || sec.titleDefault}</Text>
            </View>
            <View style={styles.secBody}>
              <Text style={styles.secIntro}>{sec.introDefault}</Text>
              <View style={styles.stepsWrap}>
                <Text style={styles.stepsHead}>📌 {t('guideStepsHeading') || 'यह कदम उठाएं'}:</Text>
                {sec.steps.map((st, sidx) => (
                  <View key={sidx} style={styles.stepRow}>
                    <View style={[styles.dot, { backgroundColor: sec.color }]}>
                      <Text style={styles.dotText}>{sidx + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{st}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            ℹ️ {t('guideFooterNote') || 'लाल रंग का संदेश दिखे तो ध्यान से पढ़ें — वो बताता है क्या ठीक करना है।'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray800 },
  headerSub: { fontSize: 12, color: Colors.gray500 },
  scroll: { padding: 14, paddingBottom: 60, gap: 12 },

  banner: {
    backgroundColor: Colors.primary, borderRadius: 16, padding: 16,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  bannerIconWrap: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4, lineHeight: 18 },

  tipCard: {
    backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fef08a',
    borderRadius: 12, padding: 12,
  },
  tipHeader: { fontSize: 13, fontWeight: '800', color: '#92400e' },
  tipBody: { fontSize: 12, color: '#a16207', marginTop: 3, lineHeight: 17 },

  secCard: { padding: 0, overflow: 'hidden' },
  secHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  numBadge: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  numText: { fontSize: 13, fontWeight: '900', color: Colors.white },
  secTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: Colors.white },

  secBody: { padding: 14, gap: 10 },
  secIntro: { fontSize: 13, color: Colors.gray700, lineHeight: 19 },
  stepsWrap: { backgroundColor: Colors.gray50, borderRadius: 10, padding: 10, gap: 6 },
  stepsHead: { fontSize: 12, fontWeight: '800', color: Colors.gray700, marginBottom: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  dotText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  stepText: { flex: 1, fontSize: 12, color: Colors.gray800, lineHeight: 17 },

  footerNote: {
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 12, marginTop: 4,
  },
  footerNoteText: { fontSize: 12, color: Colors.primaryDark, textAlign: 'center', lineHeight: 17 },
});
