'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck, Users, IndianRupee, Banknote, UserCheck, ChevronRight,
  Download, FileText, Calendar, AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

// --- helpers ---
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtNum = (n) => '₹' + (n || 0).toLocaleString('en-IN');

function getMonthRange(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const start = `${y}-${pad(m)}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${pad(m)}-${pad(lastDay)}`;
  return { start, end };
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function buildAttendancePDFHtml(records, rangeLabel, projectName) {
  const logoUrl = window.location.origin + '/thekedaari-logo.png';
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const presentCount = records.filter((r) => r.type !== 'Absent').length;
  const absentCount = records.filter((r) => r.type === 'Absent').length;
  const totalSalary = records.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid = records.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT = records.reduce((s, r) => s + (r.overtime || 0), 0);
  const uniqueWorkers = new Set(records.map((r) => r.worker?.id).filter(Boolean)).size;
  const fmtRs = (n) => '\u20B9' + (n || 0).toLocaleString('en-IN');

  const typeLabel = (r) => {
    if (r.type === 'FullDay')
      return `<span class="badge badge-fullday">Full Day${r.isSplitHalfDay ? ' (2 sites)' : ''}</span>`;
    if (r.type === 'HalfDay') return '<span class="badge badge-halfday">Half Day</span>';
    return '<span class="badge badge-absent">Absent</span>';
  };

  const rowsHtml = records.map((r) => `
    <tr>
      <td>${r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014'}</td>
      <td><strong>${r.worker?.name || '\u2014'}</strong></td>
      <td>${r.worker?.role?.name || '\u2014'}</td>
      <td>${r.project?.name || '\u2014'}</td>
      <td>${typeLabel(r)}</td>
      <td>${r.type !== 'Absent' ? fmtRs(r.salary) : '\u2014'}</td>
      <td>${r.payment > 0 ? fmtRs(r.payment) : '\u2014'}</td>
      <td>${(r.overtime || 0) > 0 ? fmtRs(r.overtime) : '\u2014'}</td>
      <td style="color:#64748b;font-size:9px">${r.paymentNote || '\u2014'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Attendance Report \u2014 ${projectName} \u2014 ${rangeLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:11px}
.page{padding:20px 24px;max-width:297mm;margin:0 auto}
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
.back-btn{display:inline-flex;align-items:center;gap:6px;background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;text-decoration:none}
.back-btn:hover{background:#2563eb}
@media print{
body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{margin:8mm;size:A4 landscape}
.no-print{display:none!important}
}
</style>
</head>
<body>
<div class="page">
  <div class="no-print" style="display:flex;gap:10px;margin-bottom:12px;">
    <button class="back-btn" style="margin-bottom:0" onclick="window.close()">← Back to Thekedaari</button>
    <button class="back-btn" style="margin-bottom:0;background:#16a34a;" onclick="window.print()">⬇ Download PDF</button>
  </div>
  <div class="header">
    <div style="display:flex;align-items:center;gap:11px">
      <img src="${logoUrl}" alt="Thekedaari" style="width:46px;height:46px;border-radius:10px;object-fit:cover;flex-shrink:0">
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
    <div class="sc sc-salary"><div class="sc-num">${fmtRs(totalSalary)}</div><div class="sc-label">Total Salary</div></div>
    <div class="sc sc-paid"><div class="sc-num">${fmtRs(totalPaid)}</div><div class="sc-label">Total Paid</div></div>
    <div class="sc sc-ot"><div class="sc-num">${fmtRs(totalOT)}</div><div class="sc-label">Overtime</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Worker</th><th>Role</th><th>Project</th>
        <th>Type</th><th>Salary</th><th>Paid</th><th>Overtime</th><th>Payment Note</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="footer">
    <span>Thekedaari \u2014 Construction Management App</span>
    <span>${projectName} \u00B7 ${rangeLabel}</span>
  </div>
</div>
</body></html>`;

  return html;
}

function writePDFToWindow(html) {
  const w = window.open('', '_blank', 'width=1200,height=800');
  if (w && !w.closed) {
    w.document.write(html);
    w.document.close();
  } else {
    // WebView fallback: window.open is blocked, show in iframe overlay
    const prev = document.getElementById('__att_print_wrapper__');
    if (prev) prev.remove();
    const wrapper = document.createElement('div');
    wrapper.id = '__att_print_wrapper__';
    wrapper.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'flex:1;border:none;width:100%;';
    iframe.srcdoc = html;
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
    iframe.addEventListener('load', () => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { /* unsupported */ }
      const cleanup = () => { wrapper.remove(); window.removeEventListener('focus', cleanup); };
      setTimeout(() => window.addEventListener('focus', cleanup), 1500);
    });
  }
}

// --- component ---
export default function AttendancePage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('view'); // 'view' | 'download'

  // --- View tab ---
  const [projects, setProjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // --- Download tab ---
  const [dlProject, setDlProject] = useState('');
  const [dlMode, setDlMode] = useState('month'); // 'month' | 'custom'
  const [dlMonth, setDlMonth] = useState(currentMonthStr());
  const [dlStart, setDlStart] = useState('');
  const [dlEnd, setDlEnd] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');
  const [dlPreviewCount, setDlPreviewCount] = useState(null);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (tab !== 'view' || !selectedDate) { setRecords([]); return; }
    setLoadingRecords(true);
    api.get('/attendance', {
      params: {
        startDate: selectedDate,
        endDate: selectedDate,
        ...(selectedProject ? { projectId: selectedProject } : {}),
      },
    })
      .then((r) => setRecords(r.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [selectedDate, selectedProject, tab]);

  const selectedProjectName = useMemo(
    () => projects.find((p) => String(p.id) === String(selectedProject))?.name ?? '',
    [projects, selectedProject],
  );

  const totalSalary = records.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid = records.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT = records.reduce((s, r) => s + (r.overtime || 0), 0);
  const absentCount = records.filter((r) => r.type === 'Absent').length;
  const presentCount = records.filter((r) => r.type !== 'Absent').length;

  const sortedRecords = useMemo(() => [...records].sort((a, b) => {
    if (!selectedProject) {
      const byProj = (a.project?.name || '').localeCompare(b.project?.name || '');
      if (byProj !== 0) return byProj;
    }
    const an = (a.worker?.name || '').localeCompare(b.worker?.name || '');
    if (an !== 0) return an;
    return (a.id || 0) - (b.id || 0);
  }), [records, selectedProject]);

  // Derive date range for download
  const dlRange = useMemo(() => {
    if (dlMode === 'month') return getMonthRange(dlMonth || currentMonthStr());
    return { start: dlStart, end: dlEnd };
  }, [dlMode, dlMonth, dlStart, dlEnd]);

  const dlRangeLabel = useMemo(() => {
    if (!dlRange.start || !dlRange.end) return '';
    return `${fmtDate(dlRange.start)} – ${fmtDate(dlRange.end)}`;
  }, [dlRange]);

  const handleDownload = async () => {
    setDlError('');
    const { start, end } = dlRange;
    if (!start || !end) return setDlError('Please select a valid date range');
    if (start > end) return setDlError('Start date must be before end date');
    const diffDays = Math.ceil((new Date(end) - new Date(start)) / 86400000);
    if (diffDays > 366) return setDlError('Date range cannot exceed 366 days');

    setDownloading(true);
    setDlPreviewCount(null);
    try {
      const res = await api.get('/attendance', {
        params: {
          startDate: start,
          endDate: end,
          ...(dlProject ? { projectId: dlProject } : {}),
        },
      });
      const rows = res.data || [];
      setDlPreviewCount(rows.length);
      if (rows.length === 0) {
        setDlError('No attendance records found for the selected range.');
        return;
      }
      rows.sort((a, b) => {
        const da = (a.date || '').localeCompare(b.date || '');
        if (da !== 0) return da;
        const dp = (a.project?.name || '').localeCompare(b.project?.name || '');
        if (dp !== 0) return dp;
        return (a.worker?.name || '').localeCompare(b.worker?.name || '');
      });
      const projectName = dlProject
        ? (projects.find((p) => String(p.id) === String(dlProject))?.name || 'All Projects')
        : 'All Projects';
      const html = buildAttendancePDFHtml(rows, dlRangeLabel, projectName);
      writePDFToWindow(html);
    } catch {
      setDlError('Failed to fetch attendance data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const StatusBadge = ({ record }) => (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
      record.type === 'Absent' ? 'bg-red-500' : 'bg-green-500'
    }`}>
      <span className="text-white font-black text-lg">{record.type === 'Absent' ? 'A' : 'P'}</span>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="min-w-0">
          <h2 className="page-title flex items-center gap-2">
            <CalendarCheck size={24} className="text-primary-600" />
            {t('nav_attendance_report')}
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xl leading-snug">{t('attendance_page_subtitle')}</p>
        </div>

        {/* Mark attendance CTA */}
        <div className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-blue-50 px-3 py-3">
          <Link
            href="/workers"
            className="btn-primary inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold w-full"
          >
            <UserCheck size={18} className="shrink-0" />
            {t('attendance_mark_cta')}
            <ChevronRight size={18} className="shrink-0 opacity-90" />
          </Link>
          <p className="text-xs text-gray-500 text-center mt-2 leading-snug">{t('attendance_mark_helper')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'view', label: 'View Report', icon: <Calendar size={15} /> },
            { key: 'download', label: 'Download Report', icon: <Download size={15} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── VIEW REPORT TAB ── */}
        {tab === 'view' && (
          <>
            <div className="card space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('attendance_filter_section')}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="label text-xs">{t('select_project')}</label>
                  <select
                    className="input-field text-sm"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={loadingProjects}
                  >
                    <option value="">{loadingProjects ? t('loading') : t('all')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:w-44">
                  <label className="label text-xs">{t('attendance_date')}</label>
                  <input
                    type="date"
                    className="input-field text-sm w-full"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {!loadingProjects && (
              <div className="grid grid-cols-5 gap-1.5">
                <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                    <span className="text-green-600 font-black text-xs">P</span>
                  </div>
                  <p className="text-lg font-black text-green-600">{presentCount}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('present')}</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-1">
                    <span className="text-red-600 font-black text-xs">A</span>
                  </div>
                  <p className="text-lg font-black text-red-600">{absentCount}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('total_absent')}</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1">
                    <IndianRupee size={13} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-black text-blue-600">{fmtNum(totalSalary)}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('salary')}</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-1">
                    <Banknote size={13} className="text-orange-600" />
                  </div>
                  <p className="text-sm font-black text-orange-600">{fmtNum(totalPaid)}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('paid')}</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-1">
                    <span className="text-purple-600 font-black text-[10px]">OT</span>
                  </div>
                  <p className="text-sm font-black text-purple-600">{fmtNum(totalOT)}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">OT</p>
                </div>
              </div>
            )}

            {loadingRecords ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
              </div>
            ) : sortedRecords.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <Users size={40} className="mx-auto text-gray-300 mb-2" />
                <p>{selectedProject ? t('attendance_no_records_project') : t('attendance_no_records_date')}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(selectedProject ? selectedProjectName : t('all'))} · {fmtDate(selectedDate)}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedRecords.map((r) => {
                  const isAbsent = r.type === 'Absent';
                  const w = r.worker;
                  return (
                    <div
                      key={r.id}
                      className={`card ${isAbsent ? 'bg-red-50/80 border-red-200' : 'bg-green-50/80 border-green-200'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <StatusBadge record={r} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 truncate">{w?.name || '—'}</h4>
                          {!selectedProject && r.project?.name ? (
                            <p className="text-[10px] text-primary-600 font-semibold truncate">{r.project.name}</p>
                          ) : null}
                          <p className="text-[11px] text-gray-400">
                            {w?.role?.name || '—'} · ₹{w?.costPerDay ?? '—'}/{t('full_day')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-0.5">
                          {!isAbsent && (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.type === 'FullDay' ? 'bg-green-100 text-green-700'
                                : r.type === 'HalfDay' ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                                {r.type === 'FullDay' ? t('full_day') : r.type === 'HalfDay' ? t('half_day') : t('other')}
                                {r.isSplitHalfDay ? ` · ${t('two_sites')}` : ''}
                              </span>
                              <p className="text-xs font-bold text-blue-600">{fmtNum(r.salary)}</p>
                            </>
                          )}
                          {isAbsent && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              {t('absent')}
                            </span>
                          )}
                          {(r.overtime || 0) > 0 && (
                            <p className="text-[10px] font-semibold text-purple-600">OT: {fmtNum(r.overtime)}</p>
                          )}
                          {r.payment > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-orange-600">{t('paid')}: {fmtNum(r.payment)}</p>
                              {r.paymentNote ? (
                                <p className="text-[9px] text-orange-400 truncate max-w-[110px]">{r.paymentNote}</p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── DOWNLOAD REPORT TAB ── */}
        {tab === 'download' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 px-4 py-3 flex items-start gap-3">
              <FileText size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-blue-800">Download Attendance Report</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-snug">
                  Export as a professional PDF report with summary cards, attendance table, and salary totals. Downloads directly to your device.
                </p>
              </div>
            </div>

            <div className="card space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">{t('select_project')}</label>
              <select
                className="input-field"
                value={dlProject}
                onChange={(e) => { setDlProject(e.target.value); setDlError(''); setDlPreviewCount(null); }}
                disabled={loadingProjects}
              >
                <option value="">{loadingProjects ? t('loading') : 'All Projects'}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status === 'Running' ? t('running') : t('completed')})
                  </option>
                ))}
              </select>
            </div>

            <div className="card space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'month', label: 'By Month' },
                  { key: 'custom', label: 'Custom Range' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setDlMode(key); setDlError(''); setDlPreviewCount(null); }}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      dlMode === key ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {dlMode === 'month' && (
                <div>
                  <label className="label text-xs">Select Month</label>
                  <input
                    type="month"
                    className="input-field"
                    value={dlMonth}
                    max={currentMonthStr()}
                    onChange={(e) => { setDlMonth(e.target.value); setDlError(''); setDlPreviewCount(null); }}
                  />
                  {dlMonth && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fmtDate(getMonthRange(dlMonth).start)} – {fmtDate(getMonthRange(dlMonth).end)}
                    </p>
                  )}
                </div>
              )}

              {dlMode === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">From</label>
                    <input
                      type="date"
                      className="input-field text-sm"
                      value={dlStart}
                      max={todayStr()}
                      onChange={(e) => { setDlStart(e.target.value); setDlError(''); setDlPreviewCount(null); }}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">To</label>
                    <input
                      type="date"
                      className="input-field text-sm"
                      value={dlEnd}
                      max={todayStr()}
                      onChange={(e) => { setDlEnd(e.target.value); setDlError(''); setDlPreviewCount(null); }}
                    />
                  </div>
                </div>
              )}
            </div>

            {dlRangeLabel && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Report Summary</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-700">📅 <span className="font-semibold">{dlRangeLabel}</span></span>
                  <span className="text-gray-700">
                    🏗️ <span className="font-semibold">
                      {dlProject
                        ? projects.find((p) => String(p.id) === String(dlProject))?.name || 'Selected Project'
                        : 'All Projects'}
                    </span>
                  </span>
                  {dlPreviewCount !== null && (
                    <span className="text-green-700 font-semibold">✓ {dlPreviewCount} records</span>
                  )}
                </div>
              </div>
            )}

            {dlError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{dlError}</p>
              </div>
            )}

            <div className="rounded-xl border border-dashed border-gray-200 px-3 py-2.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">PDF Includes</p>
              <div className="flex flex-wrap gap-1.5">
                {['Summary Cards', 'Date', 'Worker', 'Role', 'Project', 'Type', 'Salary', 'Paid', 'Overtime', 'Payment Note'].map((col) => (
                  <span key={col} className="px-2 py-0.5 bg-gray-100 rounded-lg text-[11px] text-gray-600 font-medium">{col}</span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || (!dlRange.start || !dlRange.end)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-lg shadow-primary-200 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download size={20} />
              {downloading ? 'Generating PDF…' : 'Download PDF Report'}
            </button>

            <p className="text-center text-xs text-gray-400">PDF downloads directly to your device</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
