import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, ScrollView, Alert,
  ActivityIndicator, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import client from '../api/client';
import { Colors } from '../theme/colors';
import { Card, AttendanceSkeleton, DatePickerField } from '../components';
import { useLanguage } from '../context/LanguageContext';
import { LOGO_BASE64 } from '../assets/logoBase64';

const pad = (n) => String(n).padStart(2, '0');
const fmtDateDisp = (iso) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function getMonthRange(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const start = `${y}-${pad(m)}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${pad(m)}-${pad(lastDay)}`;
  return { start, end };
}

function buildPDFHtml(records, rangeLabel, projectName) {
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const presentCount = records.filter((r) => r.type !== 'Absent').length;
  const absentCount = records.filter((r) => r.type === 'Absent').length;
  const totalSalary = records.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid = records.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT = records.reduce((s, r) => s + (r.overtime || 0), 0);
  const uniqueWorkers = new Set(records.map((r) => r.worker?.id).filter(Boolean)).size;
  const fmtRs = (n) => '&#8377;' + (n || 0).toLocaleString('en-IN');

  const typeLabel = (r) => {
    if (r.type === 'FullDay') return `<span class="badge badge-fullday">Full Day${r.isSplitHalfDay ? ' (2 sites)' : ''}</span>`;
    if (r.type === 'HalfDay') return '<span class="badge badge-halfday">Half Day</span>';
    return '<span class="badge badge-absent">Absent</span>';
  };

  const rowsHtml = records.map((r) => `
    <tr>
      <td>${r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
      <td><strong>${r.worker?.name || '—'}</strong></td>
      <td>${r.worker?.role?.name || '—'}</td>
      <td>${r.project?.name || '—'}</td>
      <td>${typeLabel(r)}</td>
      <td>${r.type !== 'Absent' ? fmtRs(r.salary) : '—'}</td>
      <td>${r.payment > 0 ? fmtRs(r.payment) : '—'}</td>
      <td>${(r.overtime || 0) > 0 ? fmtRs(r.overtime) : '—'}</td>
      <td style="color:#64748b;font-size:9px">${r.paymentNote || '—'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Attendance Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#1e293b;background:#fff;font-size:11px}
.page{padding:20px 24px}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:14px}
.brand-name{font-size:22px;font-weight:900;color:#2563eb;letter-spacing:-0.5px}
.brand-tag{font-size:9px;color:#64748b;margin-top:3px;font-weight:600;text-transform:uppercase;letter-spacing:.6px}
.report-right{text-align:right}
.report-title{font-size:16px;font-weight:800;color:#1e293b}
.report-gen{font-size:9px;color:#94a3b8;margin-top:4px}
.info-row{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.ib{background:#f1f5f9;border-radius:8px;padding:8px 12px;flex:1;min-width:110px}
.ib-label{font-size:8.5px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700}
.ib-value{font-size:13px;font-weight:800;color:#1e293b;margin-top:2px}
.summary{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}
.sc{border-radius:9px;padding:9px 6px;text-align:center}
.sc-workers{background:#dbeafe}.sc-present{background:#dcfce7}.sc-absent{background:#fee2e2}
.sc-salary{background:#ede9fe}.sc-paid{background:#ffedd5}.sc-ot{background:#fae8ff}
.sc-num{font-weight:900;line-height:1}
.sc-workers .sc-num{color:#2563eb;font-size:14px}
.sc-present .sc-num{color:#16a34a;font-size:18px}
.sc-absent .sc-num{color:#dc2626;font-size:18px}
.sc-salary .sc-num{color:#7c3aed;font-size:12px}
.sc-paid .sc-num{color:#ea580c;font-size:12px}
.sc-ot .sc-num{color:#a21caf;font-size:12px}
.sc-label{font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:#64748b;font-weight:700;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{background:#1e293b;color:#fff}
thead th{padding:8px 7px;text-align:left;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}
tbody tr:nth-child(odd){background:#fff}
tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:8.5px;font-weight:700;white-space:nowrap}
.badge-fullday{background:#dcfce7;color:#15803d}
.badge-halfday{background:#fef9c3;color:#a16207}
.badge-absent{background:#fee2e2;color:#dc2626}
.footer{margin-top:18px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:11px">
      <img src="${LOGO_BASE64}" alt="Thekedaari" style="width:46px;height:46px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <div>
        <div class="brand-name">Thekedaari</div>
        <div class="brand-tag">Construction Management</div>
      </div>
    </div>
    <div class="report-right">
      <div class="report-title">Attendance Report</div>
      <div class="report-gen">Generated: ${now}</div>
    </div>
  </div>
  <div class="info-row">
    <div class="ib"><div class="ib-label">Project</div><div class="ib-value">${projectName}</div></div>
    <div class="ib"><div class="ib-label">Date Range</div><div class="ib-value">${rangeLabel}</div></div>
    <div class="ib"><div class="ib-label">Total Records</div><div class="ib-value">${records.length}</div></div>
  </div>
  <div class="summary">
    <div class="sc sc-workers"><div class="sc-num">${uniqueWorkers}</div><div class="sc-label">Workers</div></div>
    <div class="sc sc-present"><div class="sc-num">${presentCount}</div><div class="sc-label">Present</div></div>
    <div class="sc sc-absent"><div class="sc-num">${absentCount}</div><div class="sc-label">Absent</div></div>
    <div class="sc sc-salary"><div class="sc-num">${fmtRs(totalSalary)}</div><div class="sc-label">Salary</div></div>
    <div class="sc sc-paid"><div class="sc-num">${fmtRs(totalPaid)}</div><div class="sc-label">Paid</div></div>
    <div class="sc sc-ot"><div class="sc-num">${fmtRs(totalOT)}</div><div class="sc-label">OT</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Worker</th><th>Role</th><th>Project</th>
        <th>Type</th><th>Salary</th><th>Paid</th><th>Overtime</th><th>Note</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="footer">
    <span>Thekedaari — Construction Management App</span>
    <span>${projectName} · ${rangeLabel}</span>
  </div>
</div>
</body></html>`;
}

export default function AttendanceScreen({ navigation }) {
  const { t } = useLanguage();
  const typeLabel = (type) => ({ FullDay: t('fullDay'), HalfDay: t('halfDay'), Absent: t('absent'), Other: t('other') }[type] || type);

  const [tab, setTab] = useState('view'); // 'view' | 'download'

  // --- View tab ---
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [projectId, setProjectId] = useState('');

  // --- Download tab ---
  const [dlProject, setDlProject] = useState('');
  const [dlMode, setDlMode] = useState('month'); // 'month' | 'custom'
  const [dlMonth, setDlMonth] = useState(currentMonthStr());
  const [dlStart, setDlStart] = useState(todayStr());
  const [dlEnd, setDlEnd] = useState(todayStr());
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');
  const [dlRecordCount, setDlRecordCount] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = { startDate, endDate };
      if (projectId) params.projectId = projectId;
      const [att, proj] = await Promise.all([
        client.get('/attendance', { params }),
        projects.length ? Promise.resolve({ data: projects }) : client.get('/projects'),
      ]);
      setRecords(Array.isArray(att.data) ? att.data : []);
      if (!projects.length) setProjects(proj.data);
    } catch { setRecords([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [startDate, endDate, projectId]));

  const present = records.filter((r) => r.type !== 'Absent');
  const absent = records.filter((r) => r.type === 'Absent');
  const totalSalary = records.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid = records.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT = records.reduce((s, r) => s + (r.overtime || 0), 0);

  const dlRange = useMemo(() => {
    if (dlMode === 'month') return getMonthRange(dlMonth || currentMonthStr());
    return { start: dlStart, end: dlEnd };
  }, [dlMode, dlMonth, dlStart, dlEnd]);

  const dlRangeLabel = useMemo(() => {
    if (!dlRange.start || !dlRange.end) return '';
    return `${fmtDateDisp(dlRange.start)} – ${fmtDateDisp(dlRange.end)}`;
  }, [dlRange]);

  const dlProjectName = useMemo(
    () => (dlProject ? projects.find((p) => String(p.id) === String(dlProject))?.name || 'All Projects' : 'All Projects'),
    [dlProject, projects],
  );

  const handleDownload = async () => {
    setDlError('');
    const { start, end } = dlRange;
    if (!start || !end) { setDlError('Please select a valid date range'); return; }
    if (start > end) { setDlError('Start date must be before end date'); return; }
    const diffDays = Math.ceil((new Date(end) - new Date(start)) / 86400000);
    if (diffDays > 366) { setDlError('Date range cannot exceed 366 days'); return; }

    setDownloading(true);
    setDlRecordCount(null);
    try {
      const res = await client.get('/attendance', {
        params: { startDate: start, endDate: end, ...(dlProject ? { projectId: dlProject } : {}) },
      });
      const rows = res.data || [];
      setDlRecordCount(rows.length);
      if (rows.length === 0) {
        setDlError('No attendance records found for selected range.');
        return;
      }
      rows.sort((a, b) => {
        const da = (a.date || '').localeCompare(b.date || '');
        if (da !== 0) return da;
        const dp = (a.project?.name || '').localeCompare(b.project?.name || '');
        if (dp !== 0) return dp;
        return (a.worker?.name || '').localeCompare(b.worker?.name || '');
      });
      const html = buildPDFHtml(rows, dlRangeLabel, dlProjectName);
      const toFileDate = (iso) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s/g, '') : '';
      const toSafe = (str) => str.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '');
      const pdfFileName = `Thekedaari_Attendance_Report_${toSafe(dlProjectName)}_${toFileDate(dlRange.start)}_to_${toFileDate(dlRange.end)}`;
      const { uri } = await Print.printToFileAsync({ html, base64: false, filename: pdfFileName });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Attendance Report — ${dlProjectName}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Saved', `PDF saved to:\n${uri}`);
      }
    } catch {
      setDlError('Could not generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.topRow}>
        <Text style={styles.pageTitle}>{t('attendanceReport')}</Text>
        <TouchableOpacity
          style={styles.markCta}
          onPress={() => navigation.navigate('WorkersTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.markCtaText}>📅 {t('markAttendance')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'view' && styles.tabActive]} onPress={() => setTab('view')}>
          <Text style={[styles.tabText, tab === 'view' && styles.tabTextActive]}>📋 View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'download' && styles.tabActive]} onPress={() => setTab('download')}>
          <Text style={[styles.tabText, tab === 'download' && styles.tabTextActive]}>⬇️ Download PDF</Text>
        </TouchableOpacity>
      </View>

      {/* ── VIEW TAB ── */}
      {tab === 'view' && (
        <>
          <View style={styles.filters}>
            <DatePickerField value={startDate} onChange={setStartDate} label={t('from')} style={{ flex: 1 }} />
            <DatePickerField value={endDate} onChange={setEndDate} label={t('to')} style={{ flex: 1 }} />
          </View>

          <View style={{ paddingHorizontal: 14, marginBottom: 8 }}>
            <Text style={styles.filterLabel}>{t('project')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.projChip, projectId === '' && styles.projChipActive]}
                onPress={() => setProjectId('')}
              >
                <Text style={[styles.projChipText, projectId === '' && { color: Colors.white }]}>{t('all')}</Text>
              </TouchableOpacity>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.projChip, String(p.id) === String(projectId) && styles.projChipActive]}
                  onPress={() => setProjectId(String(p.id))}
                >
                  <Text style={[styles.projChipText, String(p.id) === String(projectId) && { color: Colors.white }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? <AttendanceSkeleton /> : (
            <FlatList
              data={records}
              keyExtractor={(r) => String(r.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 8 }}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              removeClippedSubviews={true}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
              ListHeaderComponent={
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.green }]}>{present.length}</Text>
                    <Text style={styles.statLbl}>{t('present')}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.red }]}>{absent.length}</Text>
                    <Text style={styles.statLbl}>{t('absent')}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.primary }]}>₹{totalSalary.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLbl}>{t('totalSalary')}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#ea580c' }]}>₹{totalPaid.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLbl}>{t('totalPaid')}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#a21caf' }]}>₹{totalOT.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLbl}>OT</Text>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
                  <Text style={{ color: Colors.gray400 }}>{t('noAttendanceOnDate')}</Text>
                </Card>
              }
              renderItem={({ item: r }) => (
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.workerAvatar}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primaryDark }}>
                      {(r.worker?.name || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.gray800 }}>{r.worker?.name}</Text>
                    <Text style={{ fontSize: 11, color: Colors.gray500 }}>
                      {r.project?.name}{r.isSplitHalfDay ? ` · ${t('twoSites')}` : ''}
                    </Text>
                    {r.payment > 0 && (
                      <Text style={{ fontSize: 11, color: '#ea580c', marginTop: 2 }}>
                        💸 {t('paid')}: ₹{(r.payment || 0).toLocaleString('en-IN')}
                        {r.paymentNote ? ` · ${r.paymentNote}` : ''}
                      </Text>
                    )}
                    {(r.overtime || 0) > 0 && (
                      <Text style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>
                        ⏱️ OT: ₹{(r.overtime || 0).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={[styles.typeBadge, r.type === 'Absent' ? styles.typeBadgeAbsent : styles.typeBadgePresent]}>
                      <Text style={[{ fontSize: 11, fontWeight: '700' }, r.type === 'Absent' ? { color: Colors.red } : { color: Colors.green }]}>
                        {typeLabel(r.type)}
                      </Text>
                    </View>
                    {r.type !== 'Absent' && (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>
                        ₹{(r.salary || 0).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>
                </Card>
              )}
            />
          )}
        </>
      )}

      {/* ── DOWNLOAD TAB ── */}
      {tab === 'download' && (
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 12 }} showsVerticalScrollIndicator={false}>

          <View style={styles.dlBanner}>
            <Text style={styles.dlBannerTitle}>📄 Attendance Report PDF</Text>
            <Text style={styles.dlBannerDesc}>
              Project aur date range chunke professional PDF export karein — summary cards, salary totals, aur full attendance table ke saath.
            </Text>
          </View>

          {/* Project picker */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Project</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowProjectModal(true)} activeOpacity={0.8}>
              <Text style={styles.selectorText} numberOfLines={1}>{dlProjectName}</Text>
              <Text style={{ color: Colors.gray400, fontSize: 14 }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Date mode */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Date Range</Text>
            <View style={styles.modeRow}>
              {[{ key: 'month', label: 'By Month' }, { key: 'custom', label: 'Custom Range' }].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.modeBtn, dlMode === key && styles.modeBtnActive]}
                  onPress={() => { setDlMode(key); setDlError(''); setDlRecordCount(null); }}
                >
                  <Text style={[styles.modeBtnText, dlMode === key && { color: Colors.white }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {dlMode === 'month' && (
              <View style={{ marginTop: 12 }}>
                <View style={styles.monthRow}>
                  <TouchableOpacity
                    style={styles.monthArrow}
                    onPress={() => {
                      const [y, m] = dlMonth.split('-').map(Number);
                      const d = new Date(y, m - 2, 1);
                      setDlMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
                      setDlError(''); setDlRecordCount(null);
                    }}
                  >
                    <Text style={styles.monthArrowText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthLabel}>
                    {new Date(dlMonth + '-01T12:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity
                    style={styles.monthArrow}
                    onPress={() => {
                      const [y, m] = dlMonth.split('-').map(Number);
                      const next = `${y}-${pad(m + 1)}`;
                      if (next <= currentMonthStr()) { setDlMonth(next); setDlError(''); setDlRecordCount(null); }
                    }}
                  >
                    <Text style={[styles.monthArrowText, dlMonth >= currentMonthStr() && { color: Colors.gray300 }]}>›</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.rangeHint}>
                  {fmtDateDisp(getMonthRange(dlMonth).start)} – {fmtDateDisp(getMonthRange(dlMonth).end)}
                </Text>
              </View>
            )}

            {dlMode === 'custom' && (
              <View style={{ marginTop: 10, gap: 8 }}>
                <DatePickerField value={dlStart} onChange={(v) => { setDlStart(v); setDlError(''); setDlRecordCount(null); }} label="From" />
                <DatePickerField value={dlEnd} onChange={(v) => { setDlEnd(v); setDlError(''); setDlRecordCount(null); }} label="To" />
              </View>
            )}
          </View>

          {/* Range summary */}
          {dlRangeLabel ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>📅  <Text style={{ fontWeight: '700' }}>{dlRangeLabel}</Text></Text>
              <Text style={styles.summaryRow}>🏗️  <Text style={{ fontWeight: '700' }}>{dlProjectName}</Text></Text>
              {dlRecordCount !== null && (
                <Text style={[styles.summaryRow, { color: Colors.green }]}>✓  {dlRecordCount} records found</Text>
              )}
            </View>
          ) : null}

          {dlError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️  {dlError}</Text>
            </View>
          ) : null}

          {/* PDF includes */}
          <View style={styles.includesCard}>
            <Text style={styles.cardLabel}>PDF mein kya hoga</Text>
            <View style={styles.tagsRow}>
              {['Summary Cards', 'Date', 'Worker', 'Role', 'Project', 'Type', 'Salary', 'Paid', 'Overtime', 'Note'].map((col) => (
                <View key={col} style={styles.tag}>
                  <Text style={styles.tagText}>{col}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.dlBtn, (downloading || !dlRangeLabel) && styles.dlBtnDisabled]}
            onPress={handleDownload}
            disabled={downloading || !dlRangeLabel}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.dlBtnText}>⬇️  Download PDF Report</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Project Selector Modal */}
      <Modal visible={showProjectModal} transparent animationType="slide" onRequestClose={() => setShowProjectModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowProjectModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Project chunein</Text>
          <ScrollView>
            <TouchableOpacity
              style={[styles.modalItem, dlProject === '' && styles.modalItemActive]}
              onPress={() => { setDlProject(''); setDlError(''); setDlRecordCount(null); setShowProjectModal(false); }}
            >
              <Text style={[styles.modalItemText, dlProject === '' && { color: Colors.primary, fontWeight: '700' }]}>All Projects</Text>
              {dlProject === '' && <Text style={{ color: Colors.primary }}>✓</Text>}
            </TouchableOpacity>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.modalItem, String(p.id) === String(dlProject) && styles.modalItemActive]}
                onPress={() => { setDlProject(String(p.id)); setDlError(''); setDlRecordCount(null); setShowProjectModal(false); }}
              >
                <Text style={[styles.modalItemText, String(p.id) === String(dlProject) && { color: Colors.primary, fontWeight: '700' }]}>
                  {p.name}
                </Text>
                {String(p.id) === String(dlProject) && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  markCta: { backgroundColor: Colors.green, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  markCtaText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 14, marginBottom: 10,
    backgroundColor: Colors.gray100, borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.gray500 },
  tabTextActive: { color: Colors.primary },
  filters: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 8 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray600, marginBottom: 4 },
  projChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, marginRight: 6,
  },
  projChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  projChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray100,
  },
  statNum: { fontSize: 14, fontWeight: '800' },
  statLbl: { fontSize: 10, color: Colors.gray500, marginTop: 2 },
  workerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  typeBadgePresent: { backgroundColor: Colors.greenLight },
  typeBadgeAbsent: { backgroundColor: Colors.redLight },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.gray100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  selectorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.gray50, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  selectorText: { fontSize: 15, fontWeight: '600', color: Colors.gray800, flex: 1 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.gray100, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  monthArrow: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  monthArrowText: { fontSize: 22, color: Colors.gray700, lineHeight: 28 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: Colors.gray800, flex: 1, textAlign: 'center' },
  rangeHint: { fontSize: 12, color: Colors.gray500, marginTop: 6, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.blueBg, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.blueLight, gap: 4,
  },
  summaryRow: { fontSize: 13, color: Colors.gray700 },
  errorCard: { backgroundColor: Colors.redBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.redLight },
  errorText: { fontSize: 13, color: Colors.red, fontWeight: '600' },
  includesCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: Colors.gray100 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: Colors.gray600, fontWeight: '500' },
  dlBanner: { backgroundColor: Colors.blueBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.blueLight },
  dlBannerTitle: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark, marginBottom: 4 },
  dlBannerDesc: { fontSize: 12, color: Colors.gray600, lineHeight: 18 },
  dlBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  dlBtnDisabled: { backgroundColor: Colors.gray300, shadowOpacity: 0 },
  dlBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '70%' },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray800, marginBottom: 10 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  modalItemActive: { backgroundColor: Colors.blueBg, paddingHorizontal: 8, borderRadius: 8, borderBottomWidth: 0, marginBottom: 1 },
  modalItemText: { fontSize: 14, color: Colors.gray700, flex: 1 },
});
