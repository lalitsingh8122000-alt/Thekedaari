import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Image,
  StyleSheet, Modal, ScrollView, Pressable, Animated, Dimensions, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_H = Dimensions.get('window').height;
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const StatCard = ({ children, borderColor, style }) => (
  <View style={[styles.statCard, borderColor && { borderLeftColor: borderColor, borderLeftWidth: 4 }, style]}>
    {children}
  </View>
);

export const LoadingSpinner = ({ color = Colors.primary }) => (
  <View style={styles.loadingScreen}>
    <Image source={require('../../assets/logo.png')} style={styles.loadingLogo} resizeMode="contain" />
    <ActivityIndicator size="large" color={color} />
  </View>
);

export const EmptyState = ({ icon, text }) => (
  <View style={[styles.card, styles.center, { paddingVertical: 40 }]}>
    {icon && <Text style={{ fontSize: 40, marginBottom: 8 }}>{icon}</Text>}
    <Text style={{ color: Colors.gray400, fontSize: 16 }}>{text || ''}</Text>
  </View>
);

export const PrimaryButton = ({ title, onPress, disabled, color, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    style={[
      styles.primaryBtn,
      { backgroundColor: color || Colors.primary },
      disabled && { opacity: 0.5 },
      style,
    ]}
  >
    <Text style={styles.primaryBtnText}>{title}</Text>
  </TouchableOpacity>
);

export const ChipButton = ({ title, active, onPress, activeColor, style }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.chip,
      active && { backgroundColor: activeColor || Colors.primary, borderColor: activeColor || Colors.primary },
      style,
    ]}
  >
    <Text style={[styles.chipText, active && { color: Colors.white }]}>{title}</Text>
  </TouchableOpacity>
);

export const OptionButton = ({ title, active, onPress, activeColor, inactiveColor, style }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.optionBtn,
      active
        ? { backgroundColor: activeColor || Colors.primary }
        : { backgroundColor: Colors.gray100 },
      style,
    ]}
  >
    <Text style={[styles.optionBtnText, active ? { color: Colors.white } : { color: Colors.gray600 }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const InputField = ({ label, style, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={[styles.inputField, style]} {...props} />
  </View>
);

export const ErrorBox = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

export const InfoBox = ({ message, color = Colors.amber }) => {
  if (!message) return null;
  return (
    <View style={[styles.infoBox, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[styles.infoText, { color }]}>{message}</Text>
    </View>
  );
};

export const BottomModal = ({ visible, onClose, title, children, snapHeight }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.modalSheet, snapHeight && { maxHeight: snapHeight }]}
        onPress={(e) => e.stopPropagation()}
      >
        <View style={styles.modalHandle} />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ fontSize: 18, color: Colors.gray500 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ maxHeight: SCREEN_H * 0.72 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

export const ConfirmModal = ({ visible, title, body, onConfirm, onCancel, confirmText = 'हटाएं', cancelText = 'रद्द करें', confirmColor = Colors.red }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={styles.overlay} onPress={onCancel}>
      <Pressable style={styles.confirmBox} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.confirmTitle}>{title}</Text>
        {body && <Text style={styles.confirmBody}>{body}</Text>}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity onPress={onCancel} style={[styles.confirmBtn, { backgroundColor: Colors.gray100, flex: 1 }]}>
            <Text style={{ color: Colors.gray700, fontWeight: '600', textAlign: 'center' }}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtn, { backgroundColor: confirmColor, flex: 1 }]}>
            <Text style={{ color: Colors.white, fontWeight: '600', textAlign: 'center' }}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export const Toggle = ({ value, onToggle, activeColor = Colors.orange }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.8}
    style={[
      styles.toggleTrack,
      { backgroundColor: value ? activeColor : Colors.gray300, justifyContent: value ? 'flex-end' : 'flex-start' },
    ]}
  >
    <View style={styles.toggleThumb} />
  </TouchableOpacity>
);

// ─── Skeleton System ──────────────────────────────────────────────────────────

function SkeletonWrap({ children, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const shimmerOffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 220],
  });

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX: shimmerOffset }],
          opacity: 0.35,
        }}
      >
        <View style={{ width: '35%', height: '100%', backgroundColor: Colors.white, borderRadius: 999 }} />
      </Animated.View>
      <Animated.View style={{ flex: 1, opacity: 0.98 }}>{children}</Animated.View>
    </View>
  );
}

const SB = ({ style }) => (
  <View style={[{ backgroundColor: Colors.gray200, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray100 }, style]} />
);

const SC = ({ children, style }) => (
  <View style={[styles.card, { shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }, style]}>{children}</View>
);

const SStatCard = ({ style }) => (
  <View style={[styles.statCard, { gap: 6 }, style]}>
    <SB style={{ width: 28, height: 28, borderRadius: 14, alignSelf: 'center' }} />
    <SB style={{ width: 72, height: 12, borderRadius: 6, alignSelf: 'center' }} />
    <SB style={{ width: 90, height: 20, borderRadius: 6, alignSelf: 'center' }} />
  </View>
);

export const DashboardSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <SkeletonWrap>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <SB style={{ width: 120, height: 26, borderRadius: 8, marginBottom: 4 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SStatCard style={{ flex: 1 }} />
          <SStatCard style={{ flex: 1 }} />
        </View>
        <SStatCard style={{ alignItems: 'center' }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SStatCard style={{ flex: 1 }} />
          <SStatCard style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SStatCard style={{ flex: 1 }} />
          <SStatCard style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SStatCard style={{ flex: 1 }} />
          <SStatCard style={{ flex: 1 }} />
        </View>
        <SC style={{ gap: 8 }}>
          <SB style={{ width: 100, height: 16, borderRadius: 8 }} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.gray100, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
              <SB style={{ width: '50%', height: 14, borderRadius: 6 }} />
              <SB style={{ width: '28%', height: 14, borderRadius: 6 }} />
            </View>
          ))}
        </SC>
        <SC style={{ gap: 8 }}>
          <SB style={{ width: 120, height: 16, borderRadius: 8 }} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.gray100, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
              <View style={{ gap: 4 }}>
                <SB style={{ width: 110, height: 13, borderRadius: 6 }} />
                <SB style={{ width: 80, height: 11, borderRadius: 6 }} />
              </View>
              <SB style={{ width: 70, height: 16, borderRadius: 6, alignSelf: 'center' }} />
            </View>
          ))}
        </SC>
      </ScrollView>
    </SkeletonWrap>
  </SafeAreaView>
);

const SWorkerCard = () => (
  <SC>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <SB style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SB style={{ width: '60%', height: 15, borderRadius: 6 }} />
        <SB style={{ width: '45%', height: 12, borderRadius: 6 }} />
      </View>
      <SB style={{ width: 40, height: 22, borderRadius: 20 }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
    </View>
  </SC>
);

export const WorkerListSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 }}>
      <SB style={{ width: 140, height: 24, borderRadius: 8 }} />
      <SB style={{ width: 70, height: 34, borderRadius: 10 }} />
    </View>
    <SkeletonWrap>
      <View style={{ paddingHorizontal: 14, gap: 10, marginTop: 4 }}>
        {[0, 1, 2, 3].map((i) => <SWorkerCard key={i} />)}
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

const SProjectCard = () => (
  <SC>
    <View style={{ marginBottom: 10 }}>
      <SB style={{ width: '72%', height: 16, borderRadius: 8, marginBottom: 8 }} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <SB style={{ width: 50, height: 22, borderRadius: 20 }} />
        <SB style={{ width: 44, height: 22, borderRadius: 20 }} />
      </View>
    </View>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 42, borderRadius: 10 }} />
    </View>
  </SC>
);

export const ProjectListSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 }}>
      <SB style={{ width: 90, height: 24, borderRadius: 8 }} />
      <SB style={{ width: 70, height: 34, borderRadius: 10 }} />
    </View>
    <SkeletonWrap>
      <View style={{ paddingHorizontal: 14, gap: 10, marginTop: 4 }}>
        {[0, 1, 2, 3].map((i) => <SProjectCard key={i} />)}
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

export const LedgerSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
      <SB style={{ width: 36, height: 36, borderRadius: 10 }} />
      <View style={{ gap: 6 }}>
        <SB style={{ width: 90, height: 20, borderRadius: 8 }} />
        <SB style={{ width: 120, height: 13, borderRadius: 6 }} />
      </View>
    </View>
    <SkeletonWrap>
      <View style={{ padding: 14, gap: 10 }}>
        <View style={[styles.statCard, { gap: 6, alignItems: 'center' }]}>
          <SB style={{ width: 80, height: 13, borderRadius: 6 }} />
          <SB style={{ width: 120, height: 30, borderRadius: 8 }} />
          <SB style={{ width: 150, height: 12, borderRadius: 6 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SB style={{ flex: 1, height: 52, borderRadius: 12 }} />
          <SB style={{ flex: 1, height: 52, borderRadius: 12 }} />
        </View>
        {[0, 1, 2, 3].map((i) => (
          <SC key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ gap: 6, flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <SB style={{ width: 36, height: 18, borderRadius: 6 }} />
                <SB style={{ width: 60, height: 18, borderRadius: 6 }} />
              </View>
              <SB style={{ width: '70%', height: 12, borderRadius: 6 }} />
              <SB style={{ width: '50%', height: 11, borderRadius: 6 }} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <SB style={{ width: 70, height: 15, borderRadius: 6 }} />
              <SB style={{ width: 60, height: 11, borderRadius: 6 }} />
            </View>
          </SC>
        ))}
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

export const WorkerFormSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
      <SB style={{ width: 36, height: 36, borderRadius: 10 }} />
      <SB style={{ width: 130, height: 22, borderRadius: 8 }} />
    </View>
    <SkeletonWrap>
      <View style={{ padding: 16, gap: 14 }}>
        {[100, 80, 90, 110].map((w, i) => (
          <View key={i} style={{ gap: 6 }}>
            <SB style={{ width: w, height: 13, borderRadius: 6 }} />
            <SB style={{ height: 48, borderRadius: 12 }} />
          </View>
        ))}
        <SB style={{ height: 50, borderRadius: 12, marginTop: 8 }} />
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

export const FinanceSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
      <SB style={{ width: 36, height: 36, borderRadius: 10 }} />
      <View style={{ gap: 6 }}>
        <SB style={{ width: 130, height: 22, borderRadius: 8 }} />
        <SB style={{ width: 160, height: 13, borderRadius: 6 }} />
      </View>
    </View>
    <View style={{ flexDirection: 'row', paddingHorizontal: 14, gap: 6, marginBottom: 4 }}>
      <SB style={{ flex: 1, height: 38, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 38, borderRadius: 10 }} />
      <SB style={{ flex: 1, height: 38, borderRadius: 10 }} />
    </View>
    <SkeletonWrap>
      <View style={{ padding: 14, gap: 10 }}>
        <SStatCard />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SStatCard style={{ flex: 1 }} />
          <SStatCard style={{ flex: 1 }} />
        </View>
        <SStatCard />
        <SStatCard />
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

const SAttRow = () => (
  <SC style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <SB style={{ width: 36, height: 36, borderRadius: 18 }} />
    <View style={{ flex: 1, gap: 5 }}>
      <SB style={{ width: '55%', height: 14, borderRadius: 6 }} />
      <SB style={{ width: '35%', height: 11, borderRadius: 6 }} />
    </View>
    <View style={{ alignItems: 'flex-end', gap: 5 }}>
      <SB style={{ width: 60, height: 22, borderRadius: 20 }} />
      <SB style={{ width: 50, height: 13, borderRadius: 6 }} />
    </View>
  </SC>
);

export const AttendanceSkeleton = () => (
  <SkeletonWrap>
    <View style={{ padding: 14, gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.gray100 }}>
            <SB style={{ width: 40, height: 18, borderRadius: 6 }} />
            <SB style={{ width: 50, height: 11, borderRadius: 6 }} />
          </View>
        ))}
      </View>
      {[0, 1, 2, 3, 4].map((i) => <SAttRow key={i} />)}
    </View>
  </SkeletonWrap>
);

export const TransactionSkeleton = () => (
  <SkeletonWrap>
    <View style={{ padding: 14, gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, borderLeftWidth: 4, borderLeftColor: Colors.gray300, elevation: 2 }}>
            <SB style={{ width: '60%', height: 12, borderRadius: 6, marginBottom: 8 }} />
            <SB style={{ width: '80%', height: 20, borderRadius: 6 }} />
          </View>
        ))}
      </View>
      {[0, 1, 2, 3, 4].map((i) => (
        <SC key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SB style={{ width: 38, height: 38, borderRadius: 19 }} />
          <View style={{ flex: 1, gap: 5 }}>
            <SB style={{ width: '65%', height: 14, borderRadius: 6 }} />
            <SB style={{ width: '45%', height: 12, borderRadius: 6 }} />
            <SB style={{ width: '30%', height: 11, borderRadius: 6 }} />
          </View>
          <SB style={{ width: 70, height: 15, borderRadius: 6 }} />
        </SC>
      ))}
    </View>
  </SkeletonWrap>
);

export const RolesSkeleton = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
    <SkeletonWrap>
      <View style={{ padding: 14, gap: 12 }}>
        <SB style={{ width: 210, height: 22, borderRadius: 8 }} />
        <SC style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SB style={{ width: 110, height: 16, borderRadius: 6 }} />
            <SB style={{ width: 62, height: 30, borderRadius: 8 }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[60, 72, 55, 80, 66].map((w, i) => (
              <SB key={i} style={{ width: w, height: 30, borderRadius: 20 }} />
            ))}
          </View>
        </SC>
        <SC style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SB style={{ width: 130, height: 16, borderRadius: 6 }} />
            <SB style={{ width: 62, height: 30, borderRadius: 8 }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[72, 60, 84, 56, 70].map((w, i) => (
              <SB key={i} style={{ width: w, height: 30, borderRadius: 20 }} />
            ))}
          </View>
        </SC>
      </View>
    </SkeletonWrap>
  </SafeAreaView>
);

// ─── Date Picker ─────────────────────────────────────────────────────────────

const CAL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CalendarSheet({ value, onChange, onClose, allowEmpty, lang }) {
  const initial = value ? new Date(value + 'T12:00:00') : new Date();
  const [viewY, setViewY] = useState(initial.getFullYear());
  const [viewM, setViewM] = useState(initial.getMonth());

  useEffect(() => {
    const d = value ? new Date(value + 'T12:00:00') : new Date();
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  }, [value]);

  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const selD = (() => {
    if (!value) return null;
    const sd = new Date(value + 'T12:00:00');
    return sd.getFullYear() === viewY && sd.getMonth() === viewM ? sd.getDate() : null;
  })();

  const todayObj = new Date();
  const todayD = todayObj.getFullYear() === viewY && todayObj.getMonth() === viewM ? todayObj.getDate() : null;

  const pick = (day) => {
    if (!day) return;
    onChange(`${viewY}-${String(viewM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    onClose();
  };

  const prevM = () => {
    if (viewM === 0) { setViewY((y) => y - 1); setViewM(11); }
    else setViewM((m) => m - 1);
  };
  const nextM = () => {
    if (viewM === 11) { setViewY((y) => y + 1); setViewM(0); }
    else setViewM((m) => m + 1);
  };

  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const enLang = lang === 'en';
  const DOW = enLang ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];

  return (
    <View>
      <View style={calS.navRow}>
        <TouchableOpacity onPress={prevM} style={calS.navBtn}>
          <Text style={calS.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={calS.monthLabel}>{CAL_MONTHS[viewM]} {viewY}</Text>
        <TouchableOpacity onPress={nextM} style={calS.navBtn}>
          <Text style={calS.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {DOW.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={calS.dayHead}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => pick(day)}
            disabled={!day}
            activeOpacity={day ? 0.7 : 1}
            style={{ width: '14.285%', paddingVertical: 3, alignItems: 'center' }}
          >
            {day ? (
              <View style={[
                calS.dayCell,
                selD === day && calS.dayCellSel,
                todayD === day && selD !== day && calS.dayCellToday,
              ]}>
                <Text style={[
                  calS.dayText,
                  selD === day && { color: Colors.white, fontWeight: '700' },
                  todayD === day && selD !== day && { color: Colors.primary, fontWeight: '600' },
                ]}>
                  {day}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <TouchableOpacity style={calS.shortcut} onPress={() => { onChange(todayObj.toISOString().split('T')[0]); onClose(); }}>
          <Text style={calS.shortcutText}>{enLang ? '📅 Today' : '📅 आज'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={calS.shortcut} onPress={() => { onChange(yd.toISOString().split('T')[0]); onClose(); }}>
          <Text style={calS.shortcutText}>{enLang ? '◀ Yesterday' : '◀ कल'}</Text>
        </TouchableOpacity>
        {allowEmpty && (
          <TouchableOpacity style={[calS.shortcut, { backgroundColor: Colors.redLight }]} onPress={() => { onChange(''); onClose(); }}>
            <Text style={[calS.shortcutText, { color: Colors.red }]}>{enLang ? '✕ Clear' : '✕ हटाएं'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const calS = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { padding: 8, backgroundColor: Colors.gray100, borderRadius: 8 },
  navArrow: { fontSize: 20, color: Colors.gray700, lineHeight: 24 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.gray800 },
  dayHead: { fontSize: 11, fontWeight: '700', color: Colors.gray400 },
  dayCell: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayCellSel: { backgroundColor: Colors.primary },
  dayCellToday: { backgroundColor: Colors.primaryLight },
  dayText: { fontSize: 14, color: Colors.gray700 },
  shortcut: { flex: 1, backgroundColor: Colors.gray100, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  shortcutText: { fontSize: 13, fontWeight: '600', color: Colors.gray700 },
});

export const DatePickerField = ({ value, onChange, label, style, allowEmpty = false }) => {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  const fmtDisplay = (iso) => {
    if (!iso) return lang === 'en' ? 'Select date' : 'तारीख़ चुनें';
    const d = new Date(iso + 'T12:00:00');
    return `${d.getDate()} ${CAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <View style={style}>
      {label ? <Text style={dpS.label}>{label}</Text> : null}
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.75} style={dpS.btn}>
        <Text style={{ fontSize: 15 }}>📅</Text>
        <Text style={[dpS.btnText, !value && { color: Colors.gray400, fontWeight: '400' }]}>
          {fmtDisplay(value)}
        </Text>
      </TouchableOpacity>
      <BottomModal
        visible={open}
        onClose={() => setOpen(false)}
        title={label || (lang === 'en' ? 'Select Date' : 'तारीख़ चुनें')}
        snapHeight={520}
      >
        <CalendarSheet
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
          allowEmpty={allowEmpty}
          lang={lang}
        />
      </BottomModal>
    </View>
  );
};

const dpS = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: Colors.gray600, marginBottom: 5 },
  btn: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  btnText: { fontSize: 14, fontWeight: '600', color: Colors.gray800, flex: 1 },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eef2ff',
    padding: 14,
    marginBottom: 2,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eef2ff',
    padding: 14,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingLogo: {
    width: 170,
    height: 110,
    marginBottom: 24,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  optionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnText: { fontSize: 13, fontWeight: '600' },
  inputField: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: Colors.white,
    color: Colors.gray800,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.gray600, marginBottom: 5 },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
  infoBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  infoText: { fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray800 },
  closeBtn: { padding: 4 },
  confirmBox: {
    backgroundColor: Colors.white,
    margin: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  confirmBody: { fontSize: 14, color: Colors.gray600, lineHeight: 20 },
  confirmBtn: { borderRadius: 12, paddingVertical: 11 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
