import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, Platform, KeyboardAvoidingView, TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { ErrorBox, Toggle } from '../../components';

// preselectedProjectId — when provided, project is locked (used from ProjectAttendanceScreen)
export default function AttendanceModal({ worker, onClose, onSaved, preselectedProjectId }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    projectId: preselectedProjectId ? String(preselectedProjectId) : '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    type: 'FullDay',
    salary: String(worker?.costPerDay || ''),
    overtime: '',
    wantToPay: false,
    payment: '',
    paymentNote: '',
    secondSite: false,
    secondProjectId: '',
  });
  const [existing, setExisting] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    client.get('/projects', { params: { status: 'Running' } })
      .then((r) => setProjects(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!worker || !form.date) return;
    setChecking(true);
    client.get('/attendance', { params: { workerId: worker.id, startDate: form.date, endDate: form.date } })
      .then((r) => {
        const rows = Array.isArray(r.data) ? r.data : [];
        let record = null;
        if (rows.length === 1) {
          record = rows[0];
        } else if (rows.length >= 2) {
          record = rows.find((rx) => rx.splitSecondaries?.length > 0) || rows.find((rx) => !rx.primarySplitId) || rows[0];
        }
        // If preselectedProjectId, filter to only records matching that project
        if (preselectedProjectId && record && String(record.projectId) !== String(preselectedProjectId)) {
          const matchingRows = rows.filter((rx) => String(rx.projectId) === String(preselectedProjectId));
          record = matchingRows.length > 0 ? matchingRows[0] : null;
        }
        setExisting(record);
        if (record) {
          const isAbsent = record.type === 'Absent';
          const split = record.isSplitHalfDay && record.splitPartner;
          const totalSplitSalary = split ? record.salary + record.splitPartner.salary : record.salary;
          const totalPaid = record.paymentTotal > 0 ? record.paymentTotal : Number(record.payment) || 0;
          setForm((f) => ({
            ...f,
            projectId: preselectedProjectId ? String(preselectedProjectId) : (record.projectId != null ? String(record.projectId) : f.projectId),
            status: isAbsent ? 'Absent' : 'Present',
            type: isAbsent ? f.type : (record.type || 'FullDay'),
            salary: split ? String(totalSplitSalary) : String(record.salary ?? f.salary),
            overtime: record.overtime != null ? String(record.overtime) : f.overtime,
            wantToPay: totalPaid > 0,
            payment: totalPaid > 0 ? String(totalPaid) : '',
            paymentNote: record.paymentNote || '',
            secondSite: !!split,
            secondProjectId: split ? String(record.splitPartner.projectId) : '',
          }));
        }
      })
      .catch(() => setExisting(null))
      .finally(() => setChecking(false));
  }, [worker?.id, form.date]);

  const calcSalary = (type, cost, twoSite = false) => {
    if (type === 'FullDay') return cost;
    if (type === 'HalfDay') return twoSite ? cost : cost / 2;
    return 0;
  };

  const handleStatus = (s) => {
    if (s === 'Absent') {
      setForm((f) => ({ ...f, status: 'Absent', salary: '0', overtime: '', secondSite: false, secondProjectId: '' }));
    } else {
      setForm((f) => ({
        ...f, status: 'Present',
        salary: String(calcSalary(f.type, worker.costPerDay, f.type === 'HalfDay' && f.secondSite)),
      }));
    }
  };

  const handleType = (type) => {
    setForm((f) => ({
      ...f, type,
      salary: String(calcSalary(type, worker.costPerDay, type === 'HalfDay' && f.secondSite)),
      ...(type !== 'HalfDay' ? { secondSite: false, secondProjectId: '' } : {}),
    }));
  };

  const otherProjects = projects.filter((p) => String(p.id) !== String(form.projectId));
  const lockedProjectName = preselectedProjectId
    ? projects.find((p) => String(p.id) === String(preselectedProjectId))?.name
    : null;

  const save = async () => {
    if (saving) return;
    setError('');
    if (!form.projectId) { setError(t('selectProjectError')); return; }
    const salaryAmt = form.status === 'Absent' ? 0 : parseFloat(form.salary) || 0;
    const payAmt = form.wantToPay && form.payment ? parseFloat(form.payment) || 0 : 0;
    const finalType = form.status === 'Absent' ? 'Absent' : form.type;
    if (finalType === 'HalfDay' && form.secondSite && (!form.secondProjectId || form.secondProjectId === form.projectId)) {
      setError(t('selectSecondProject')); return;
    }
    setSaving(true);
    try {
      const overtimeAmt = form.status === 'Absent' ? 0 : parseFloat(form.overtime) || 0;
      const payload = {
        workerId: worker.id,
        projectId: parseInt(form.projectId, 10),
        date: form.date,
        type: finalType,
        salary: salaryAmt,
        overtime: overtimeAmt,
        payment: payAmt,
        paymentNote: form.wantToPay ? (form.paymentNote || '') : '',
      };
      const removeSplit = !!existing?.isSplitHalfDay && finalType === 'HalfDay' && !form.secondSite;
      if (existing?.id) {
        if (removeSplit) { payload.removeSplit = true; payload.secondProjectId = null; }
        else if (finalType === 'HalfDay' && form.secondSite && form.secondProjectId) {
          payload.secondProjectId = parseInt(form.secondProjectId, 10);
        }
        const target = existing.isSplitHalfDay && existing.splitPartner
          ? (existing.primarySplitId || existing.id) : existing.id;
        await client.put(`/attendance/${target}`, payload);
      } else {
        if (finalType === 'HalfDay' && form.secondSite && form.secondProjectId) {
          payload.secondProjectId = parseInt(form.secondProjectId, 10);
        }
        await client.post('/attendance', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || t('attendanceSaveError'));
    } finally { setSaving(false); }
  };

  const typeLabel = (tp) => ({ FullDay: t('fullDay'), HalfDay: t('halfDay'), Other: t('other') }[tp] || tp);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { maxHeight: Platform.OS === 'ios' ? '95%' : '92%', paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.handle} />

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              nestedScrollEnabled
              bounces
              decelerationRate="fast"
              showsVerticalScrollIndicator={true}
            >
            {/* Header */}
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{t('markAttendance')}</Text>
              <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 18, color: Colors.gray400 }}>✕</Text></TouchableOpacity>
            </View>

            {checking && <Text style={styles.infoText}>{t('checkingOldAttendance')}</Text>}
            {existing && !checking && (
              <View style={styles.warnBox}>
                <Text style={styles.warnText}>{t('attendanceExists')}</Text>
              </View>
            )}

            <ErrorBox message={error} />

            {/* Worker Info */}
            <View style={styles.workerInfo}>
              <View style={styles.avatarSm}>
                <Text style={{ color: Colors.primaryDark, fontWeight: '700', fontSize: 16 }}>{worker.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14 }}>{worker.name}</Text>
                <Text style={{ fontSize: 12, color: Colors.gray500 }}>{worker.role?.name}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: Colors.gray400 }}>{t('dailyRate')}</Text>
                <Text style={{ fontWeight: '800', color: Colors.primary, fontSize: 16 }}>₹{worker.costPerDay}</Text>
              </View>
            </View>

            {/* Project selection — locked if preselectedProjectId */}
            {preselectedProjectId ? (
              <View style={styles.field}>
                <Text style={styles.label}>{t('selectProject')}</Text>
                <View style={[styles.lockedProject]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primaryDark }}>
                    {lockedProjectName || `Project #${preselectedProjectId}`}
                  </Text>
                  <View style={styles.lockedBadge}>
                    <Text style={{ fontSize: 10, color: Colors.primary, fontWeight: '700' }}>🔒 {t('locked')}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('selectProject')}</Text>
                  <View style={styles.pickerWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {projects.map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.projectChip, String(p.id) === String(form.projectId) && styles.projectChipActive]}
                          onPress={() => setForm((f) => ({ ...f, projectId: String(p.id), secondProjectId: f.secondProjectId === String(p.id) ? '' : f.secondProjectId }))}
                        >
                          <Text style={[styles.projectChipText, String(p.id) === String(form.projectId) && { color: Colors.white }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>{t('date')}</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateBtn]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateBtnText}>📅  {form.date}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(form.date + 'T12:00:00')}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const d = selectedDate;
                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        setForm((f) => ({ ...f, date: ds }));
                      }
                    } else if (selectedDate) {
                      const d = selectedDate;
                      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      setForm((f) => ({ ...f, date: ds }));
                    }
                  }}
                />
              )}
              {showDatePicker && Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.iosDoneBtn}
                >
                  <Text style={styles.iosDoneBtnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status P/A */}
            <View style={styles.row2}>
              <TouchableOpacity
                style={[styles.statusBtn, form.status === 'Present' ? styles.statusPresent : styles.statusOff]}
                onPress={() => handleStatus('Present')}
              >
                <Text style={[styles.statusBtnText, form.status === 'Present' && { color: Colors.white }]}>✓ {t('present')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusBtn, form.status === 'Absent' ? styles.statusAbsent : styles.statusOff]}
                onPress={() => handleStatus('Absent')}
              >
                <Text style={[styles.statusBtnText, form.status === 'Absent' && { color: Colors.white }]}>✕ {t('absent')}</Text>
              </TouchableOpacity>
            </View>

            {form.status === 'Present' && (
              <>
                {/* Type */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('attendanceType')}</Text>
                  <View style={styles.row3}>
                    {['FullDay', 'HalfDay', 'Other'].map((tp) => (
                      <TouchableOpacity
                        key={tp}
                        style={[
                          styles.typeBtn,
                          form.type === tp && (tp === 'FullDay' ? styles.typeFull : tp === 'HalfDay' ? styles.typeHalf : styles.typeOther),
                        ]}
                        onPress={() => handleType(tp)}
                      >
                        <Text style={[styles.typeBtnText, form.type === tp && { color: Colors.white }]}>
                          {typeLabel(tp)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Second site for half day */}
                {form.type === 'HalfDay' && otherProjects.length > 0 && (
                  <View style={styles.secondSiteBox}>
                    <View style={styles.rowBetween}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#78350f' }}>{t('addSecondSite')}</Text>
                      <Toggle
                        value={form.secondSite}
                        onToggle={() => {
                          const on = !form.secondSite;
                          setForm((f) => ({
                            ...f, secondSite: on,
                            secondProjectId: on && !f.secondProjectId && otherProjects[0] ? String(otherProjects[0].id) : on ? f.secondProjectId : '',
                            salary: String(calcSalary('HalfDay', worker.costPerDay, on)),
                          }));
                        }}
                        activeColor="#d97706"
                      />
                    </View>
                    {form.secondSite && (
                      <>
                        <Text style={[styles.label, { marginTop: 8 }]}>{t('secondProject')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {otherProjects.map((p) => (
                            <TouchableOpacity
                              key={p.id}
                              style={[styles.projectChip, String(p.id) === String(form.secondProjectId) && styles.projectChipActive]}
                              onPress={() => setForm((f) => ({ ...f, secondProjectId: String(p.id) }))}
                            >
                              <Text style={[styles.projectChipText, String(p.id) === String(form.secondProjectId) && { color: Colors.white }]} numberOfLines={1}>
                                {p.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <Text style={{ fontSize: 11, color: '#92400e', marginTop: 6 }}>{t('splitNote')}</Text>
                      </>
                    )}
                  </View>
                )}

                {/* Salary */}
                <View style={styles.salaryRow}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>{t('daySalary')}</Text>
                  <TextInput
                    style={styles.salaryInput}
                    value={String(form.salary)}
                    onChangeText={(v) => setForm((f) => ({ ...f, salary: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.salaryRow}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#7c3aed' }}>{t('overtime')}</Text>
                  <TextInput
                    style={styles.salaryInput}
                    value={String(form.overtime)}
                    onChangeText={(v) => setForm((f) => ({ ...f, overtime: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </>
            )}

            {/* Pay now toggle */}
            <View style={[styles.payBox, form.wantToPay && styles.payBoxActive]}>
              <TouchableOpacity
                style={styles.rowBetween}
                onPress={() => setForm((f) => ({ ...f, wantToPay: !f.wantToPay, payment: '', paymentNote: '' }))}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: form.wantToPay ? '#ea580c' : Colors.gray500 }}>
                  {t('payNow')}
                </Text>
                <Toggle value={form.wantToPay} onToggle={() => setForm((f) => ({ ...f, wantToPay: !f.wantToPay }))} activeColor="#ea580c" />
              </TouchableOpacity>
              {form.wantToPay && (
                <View style={{ marginTop: 10, gap: 8 }}>
                  <Text style={[styles.label, { color: '#ea580c' }]}>{t('howMuch')}</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#fed7aa', textAlign: 'center', fontWeight: '700', fontSize: 18 }]}
                    value={form.payment}
                    onChangeText={(v) => setForm((f) => ({ ...f, payment: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.gray400}
                  />
                  <Text style={[styles.label, { color: '#ea580c' }]}>{t('purposeOfPayment')}</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#fed7aa' }]}
                    value={form.paymentNote}
                    onChangeText={(v) => setForm((f) => ({ ...f, paymentNote: v }))}
                    placeholder={t('paymentExamples')}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              )}
            </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}> 
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: form.status === 'Present' ? Colors.green : Colors.red },
                  saving && { opacity: 0.6 },
                ]}
                onPress={save}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? t('saving') : existing ? t('updateAttendance') : t('saveAttendance')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayBackdrop: { flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  sheetWrap: { width: '100%', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '92%',
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.gray200, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  scrollView: { flexGrow: 0, maxHeight: '100%' },
  body: { padding: 16, gap: 12, paddingBottom: 24, flexGrow: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.gray800 },
  infoText: { fontSize: 12, color: Colors.gray500, backgroundColor: Colors.gray100, padding: 8, borderRadius: 8 },
  warnBox: { backgroundColor: '#fef9c3', borderRadius: 8, padding: 8 },
  warnText: { fontSize: 12, color: '#854d0e' },
  workerInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.blueBg, borderRadius: 12, padding: 10,
  },
  avatarSm: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  lockedProject: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.blueBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  lockedBadge: {
    backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  row2: { flexDirection: 'row', gap: 8 },
  row3: { flexDirection: 'row', gap: 6 },
  pickerWrap: { marginTop: 4 },
  projectChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, marginRight: 6,
  },
  projectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  projectChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  field: { gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
  input: {
    borderWidth: 2, borderColor: Colors.gray200, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.gray800,
  },
  dateBtn: { justifyContent: 'center' },
  dateBtnText: { fontSize: 14, color: Colors.gray800, fontWeight: '600' },
  iosDoneBtn: { alignItems: 'flex-end', paddingVertical: 6 },
  iosDoneBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  statusBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.gray200,
  },
  statusPresent: { backgroundColor: Colors.green, borderColor: Colors.green },
  statusAbsent: { backgroundColor: Colors.red, borderColor: Colors.red },
  statusOff: { backgroundColor: Colors.gray100 },
  statusBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gray500 },
  typeBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  typeFull: { backgroundColor: Colors.green },
  typeHalf: { backgroundColor: '#f59e0b' },
  typeOther: { backgroundColor: Colors.gray600 },
  typeBtnText: { fontSize: 12, fontWeight: '700', color: Colors.gray500 },
  secondSiteBox: {
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  salaryRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.blueBg, borderRadius: 12, padding: 12,
  },
  salaryInput: {
    borderWidth: 2, borderColor: Colors.blueLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, width: 90, textAlign: 'right',
    fontSize: 18, fontWeight: '700', color: Colors.primary,
  },
  payBox: {
    borderRadius: 12, borderWidth: 2, borderColor: Colors.gray200,
    backgroundColor: Colors.gray50, padding: 12,
  },
  payBoxActive: { borderColor: '#fed7aa', backgroundColor: '#fff7ed' },
  footer: { padding: 14, paddingBottom: 24, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
