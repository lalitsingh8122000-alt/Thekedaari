import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../theme/colors';
import { LoadingSpinner, Card, EmptyState } from '../../components';

const pad = (n) => String(n).padStart(2, '0');
const currentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

function getMonthRange(ym) {
  const [y, m] = ym.split('-').map(Number);
  return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}` };
}

const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(String(iso).includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};
const fmtNum = (n) => '₹' + (n || 0).toLocaleString('en-IN');

export default function WorkerReportScreen({ route, navigation }) {
  const { workerId, name } = route.params;
  const { t } = useLanguage();
  
  const [worker, setWorker] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [month, setMonth] = useState(currentMonthStr());
  
  const range = useMemo(() => getMonthRange(month), [month]);

  const rangeLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, [month]);

  useEffect(() => {
    client.get(`/workers/${workerId}`)
      .then(res => setWorker(res.data))
      .catch(() => navigation.goBack())
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    if (!range.start || !range.end) return;
    setFetching(true);
    client.get('/attendance', { params: { workerId, startDate: range.start, endDate: range.end } })
      .then(res => setRecords(res.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [workerId, range.start, range.end]);

  const sorted = useMemo(() => [...records].sort((a, b) => (a.date || '').localeCompare(b.date || '')), [records]);

  const presentCount = sorted.filter((r) => r.type !== 'Absent').length;
  const absentCount  = sorted.filter((r) => r.type === 'Absent').length;
  const fullDayCount = sorted.filter((r) => r.type === 'FullDay').length;
  const halfDayCount = sorted.filter((r) => r.type === 'HalfDay').length;
  const totalSalary  = sorted.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid    = sorted.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT      = sorted.reduce((s, r) => s + (r.overtime || 0), 0);
  const balance      = totalSalary + totalOT - totalPaid;

  const handleShare = async () => {
    if (!worker) return;
    const text =
      `📋 Attendance Report — ${worker.name}\n` +
      `📅 Period: ${rangeLabel}\n` +
      `✅ Present: ${presentCount}  ❌ Absent: ${absentCount}\n` +
      `💰 Salary: ${fmtNum(totalSalary)}  Paid: ${fmtNum(totalPaid)}\n` +
      (totalOT > 0 ? `⏱ Overtime: ${fmtNum(totalOT)}\n` : '') +
      `💼 Balance Due: ${fmtNum(balance)}\n` +
      `— Generated via Thekedaari App`;
    
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const handlePrintPDF = async () => {
    if (!worker) return;
    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Thekedaari - Worker Salary Report</h1>
          <h3>${worker.name} - ${rangeLabel}</h3>
          <p>Present: ${presentCount} | Absent: ${absentCount}</p>
          <p>Salary: ₹${totalSalary} | Paid: ₹${totalPaid} | OT: ₹${totalOT}</p>
          <p><strong>Balance: ₹${balance}</strong></p>
          <table>
            <tr><th>Date</th><th>Project</th><th>Attendance</th><th>Salary</th><th>OT</th><th>Paid</th></tr>
            ${sorted.map(r => `
              <tr>
                <td>${fmtDate(r.date)}</td>
                <td>${r.project?.name || '-'}</td>
                <td>${r.type}</td>
                <td>₹${r.salary || 0}</td>
                <td>₹${r.overtime || 0}</td>
                <td>₹${r.payment || 0}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      const cleanName = (worker.name || 'Worker').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanMonth = rangeLabel.replace(/[^a-zA-Z0-9]/g, '_');
      const pdfFileName = `Thekedaari_Salary_Report_${cleanName}_${cleanMonth}.pdf`;
      const newUri = FileSystem.cacheDirectory + pdfFileName;
      await FileSystem.copyAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${worker.name} - Salary Report`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{worker?.name}</Text>
          <Text style={styles.headerSub}>{worker?.role?.name} · Salary Report</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.workerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{worker?.name?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.wname}>{worker?.name}</Text>
            <Text style={styles.wmeta}>{worker?.role?.name} · ₹{worker?.costPerDay}/day</Text>
          </View>
        </Card>

        {/* Change month controls */}
        <View style={styles.monthControls}>
          <TouchableOpacity 
            style={styles.monthBtn}
            onPress={() => {
              const [y, m] = month.split('-').map(Number);
              const d = new Date(y, m - 2, 1);
              setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
            }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthLabel}>{rangeLabel}</Text>
          
          <TouchableOpacity 
            style={styles.monthBtn}
            onPress={() => {
              const [y, m] = month.split('-').map(Number);
              const d = new Date(y, m, 1);
              if (d > new Date()) return; // Don't go to future
              setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {fetching ? (
          <View style={{ padding: 40 }}><LoadingSpinner /></View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: Colors.greenBg, borderColor: Colors.greenLight }]}>
                <Text style={[styles.statVal, { color: Colors.green }]}>{presentCount}</Text>
                <Text style={[styles.statLbl, { color: Colors.green }]}>Present</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: Colors.redBg, borderColor: Colors.redLight }]}>
                <Text style={[styles.statVal, { color: Colors.red }]}>{absentCount}</Text>
                <Text style={[styles.statLbl, { color: Colors.red }]}>Absent</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#f5f3ff', borderColor: '#ede9fe' }]}>
                <Text style={[styles.statVal, { color: '#7c3aed' }]}>{fmtNum(totalSalary)}</Text>
                <Text style={[styles.statLbl, { color: '#7c3aed' }]}>Salary</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                <Text style={[styles.statVal, { color: '#ea580c' }]}>{fmtNum(totalPaid)}</Text>
                <Text style={[styles.statLbl, { color: '#ea580c' }]}>Paid</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#faf5ff', borderColor: '#f3e8ff' }]}>
                <Text style={[styles.statVal, { color: '#a21caf' }]}>{fmtNum(totalOT)}</Text>
                <Text style={[styles.statLbl, { color: '#a21caf' }]}>OT Earned</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: balance > 0 ? '#eff6ff' : Colors.greenBg, borderColor: balance > 0 ? '#dbeafe' : Colors.greenLight }]}>
                <Text style={[styles.statVal, { color: balance > 0 ? '#1d4ed8' : Colors.green }]}>{fmtNum(balance)}</Text>
                <Text style={[styles.statLbl, { color: balance > 0 ? '#1d4ed8' : Colors.green }]}>Balance</Text>
              </View>
            </View>

            {sorted.length > 0 && (
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.pdfBtn]} onPress={handlePrintPDF}>
                  <Ionicons name="document-text" size={18} color={Colors.white} />
                  <Text style={styles.btnTextWhite}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.shareBtn]} onPress={handleShare}>
                  <Ionicons name="share-social" size={18} color={Colors.primary} />
                  <Text style={styles.btnTextPrimary}>Share Report</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>Day-by-Day</Text>
            {sorted.length > 0 ? (
              sorted.map((r, i) => (
                <Card key={r.id || i} style={[styles.rowItem, r.type === 'Absent' ? { backgroundColor: Colors.redBg } : { backgroundColor: Colors.greenBg }]}>
                  <View style={[styles.rowAvatar, { backgroundColor: r.type === 'Absent' ? Colors.red : Colors.green }]}>
                    <Text style={{ color: Colors.white, fontWeight: '800' }}>{r.type === 'Absent' ? 'A' : 'P'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowDate}>{fmtDate(r.date)}</Text>
                    <Text style={styles.rowProj}>{r.project?.name || '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rowType}>{r.type}</Text>
                    {r.type !== 'Absent' && <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed' }}>{fmtNum(r.salary)}</Text>}
                    {r.overtime > 0 && <Text style={{ fontSize: 11, color: '#a21caf', fontWeight: '600' }}>OT: {fmtNum(r.overtime)}</Text>}
                    {r.payment > 0 && <Text style={{ fontSize: 11, color: '#ea580c', fontWeight: '600' }}>Paid: {fmtNum(r.payment)}</Text>}
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState text="No attendance records" icon="📅" />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200,
  },
  backBtn: { padding: 6, marginRight: 8, marginLeft: -6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray800 },
  headerSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  scroll: { padding: 14, paddingBottom: 40, gap: 14 },
  
  workerCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  wname: { fontSize: 16, fontWeight: '800', color: Colors.gray800 },
  wmeta: { fontSize: 13, color: Colors.gray500, marginTop: 2 },

  monthControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  monthBtn: { padding: 10, backgroundColor: Colors.primaryLight, borderRadius: 8 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: {
    width: '31.5%', paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLbl: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  pdfBtn: { backgroundColor: Colors.primary },
  btnTextWhite: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  shareBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  btnTextPrimary: { color: Colors.primary, fontWeight: '700', fontSize: 14 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', marginTop: 10 },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginBottom: 8 },
  rowAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowDate: { fontSize: 13, fontWeight: '700', color: Colors.gray800 },
  rowProj: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  rowType: { fontSize: 11, fontWeight: '700', color: Colors.gray500, marginBottom: 2 },
});
