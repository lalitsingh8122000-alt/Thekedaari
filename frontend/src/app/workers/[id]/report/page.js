'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, Calendar } from 'lucide-react';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => new Date().toISOString().split('T')[0];
const currentMonthStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };

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
const fmtNum = (n) => '\u20B9' + (n || 0).toLocaleString('en-IN');

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// ── PDF generator ──────────────────────────────────────────────────────────
function generateWorkerPDF(worker, records, rangeLabel) {
  const logoUrl = window.location.origin + '/thekedaari-logo.png';
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const presentCount = records.filter((r) => r.type !== 'Absent').length;
  const absentCount  = records.filter((r) => r.type === 'Absent').length;
  const fullDayCount = records.filter((r) => r.type === 'FullDay').length;
  const halfDayCount = records.filter((r) => r.type === 'HalfDay').length;
  const totalSalary  = records.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid    = records.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT      = records.reduce((s, r) => s + (r.overtime || 0), 0);
  const balance      = totalSalary + totalOT - totalPaid;

  const photoSrc = worker.photo ? `${API_BASE}/uploads/${worker.photo}` : null;
  const initial  = (worker.name || 'W').charAt(0).toUpperCase();

  const typeBadge = (r) => {
    if (r.type === 'FullDay')
      return `<span class="badge badge-fullday">Full Day${r.isSplitHalfDay ? ' (2 sites)' : ''}</span>`;
    if (r.type === 'HalfDay') return '<span class="badge badge-halfday">Half Day</span>';
    return '<span class="badge badge-absent">Absent</span>';
  };

  const rowsHtml = records.map((r) => `
    <tr>
      <td>${r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014'}</td>
      <td>${r.project?.name || '\u2014'}</td>
      <td>${typeBadge(r)}</td>
      <td>${r.type !== 'Absent' ? '\u20B9' + (r.salary || 0).toLocaleString('en-IN') : '\u2014'}</td>
      <td>${(r.overtime || 0) > 0 ? '\u20B9' + r.overtime.toLocaleString('en-IN') : '\u2014'}</td>
      <td>${r.payment > 0 ? '\u20B9' + r.payment.toLocaleString('en-IN') : '\u2014'}</td>
      <td style="color:#64748b;font-size:9px">${r.paymentNote || '\u2014'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Worker Report \u2014 ${worker.name} \u2014 ${rangeLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:11px}
.page{padding:20px 24px;max-width:297mm;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:14px}
.brand{display:flex;align-items:center;gap:10px}
.brand-name{font-size:20px;font-weight:900;color:#2563eb;letter-spacing:-.5px}
.brand-tag{font-size:9px;color:#64748b;margin-top:3px;font-weight:600;text-transform:uppercase;letter-spacing:.6px}
.rr{text-align:right}.rt{font-size:15px;font-weight:800;color:#1e293b}.rg{font-size:9px;color:#94a3b8;margin-top:3px}
.wcard{display:flex;align-items:center;gap:14px;background:#f8fafc;border-radius:12px;padding:12px 16px;margin-bottom:12px;border:1px solid #e2e8f0}
.wphoto{width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0}
.wphoto-ph{width:52px;height:52px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;font-weight:900;color:#fff}
.wname{font-size:17px;font-weight:900;color:#1e293b}.wmeta{font-size:10px;color:#64748b;margin-top:2px}
.period{background:#dbeafe;color:#2563eb;border-radius:7px;padding:4px 10px;font-size:10px;font-weight:700;margin-left:auto}
.summary{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:14px}
.sc{border-radius:8px;padding:8px 5px;text-align:center}
.sc-p{background:#dcfce7}.sc-a{background:#fee2e2}.sc-fd{background:#dbeafe}.sc-hd{background:#fef9c3}
.sc-sal{background:#ede9fe}.sc-paid{background:#ffedd5}.sc-bal{background:#f0fdf4}
.sc-num{font-weight:900;line-height:1}
.sc-p .sc-num{color:#16a34a;font-size:16px}.sc-a .sc-num{color:#dc2626;font-size:16px}
.sc-fd .sc-num{color:#2563eb;font-size:16px}.sc-hd .sc-num{color:#a16207;font-size:16px}
.sc-sal .sc-num{color:#7c3aed;font-size:11px}.sc-paid .sc-num{color:#ea580c;font-size:11px}
.sc-bal .sc-num{color:#15803d;font-size:11px}
.sc-label{font-size:7.5px;text-transform:uppercase;letter-spacing:.4px;color:#64748b;font-weight:700;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{background:#1e293b;color:#fff}
thead th{padding:7px 7px;text-align:left;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}tbody tr:nth-child(odd){background:#fff}
tbody td{padding:6px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.badge{display:inline-block;padding:2px 7px;border-radius:20px;font-size:8.5px;font-weight:700;white-space:nowrap}
.badge-fullday{background:#dcfce7;color:#15803d}.badge-halfday{background:#fef9c3;color:#a16207}.badge-absent{background:#fee2e2;color:#dc2626}
.footer{margin-top:16px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;color:#94a3b8;font-size:8.5px}
.back-btn{display:inline-flex;align-items:center;gap:6px;background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;text-decoration:none}
.back-btn:hover{background:#2563eb}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:8mm;size:A4 landscape}.no-print{display:none!important}}
</style></head><body>
<div class="page">
  <div class="no-print" style="display:flex;gap:10px;margin-bottom:12px;">
    <button class="back-btn" style="margin-bottom:0" onclick="window.close()">← Back to Thekedaari</button>
    <button class="back-btn" style="margin-bottom:0;background:#16a34a;" onclick="window.print()">⬇ Download PDF</button>
  </div>
  <div class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="Thekedaari" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <div><div class="brand-name">Thekedaari</div><div class="brand-tag">Construction Management</div></div>
    </div>
    <div class="rr"><div class="rt">Worker Salary Report</div><div class="rg">Generated: ${now}</div></div>
  </div>
  <div class="wcard">
    ${photoSrc
      ? `<img src="${photoSrc}" class="wphoto" alt="${worker.name}">`
      : `<div class="wphoto-ph">${initial}</div>`}
    <div>
      <div class="wname">${worker.name}</div>
      <div class="wmeta">${worker.role?.name || '\u2014'} \u00B7 \u20B9${(worker.costPerDay || 0).toLocaleString('en-IN')}/day \u00B7 ${worker.status || 'Active'}</div>
    </div>
    <div class="period">\uD83D\uDCC5 ${rangeLabel}</div>
  </div>
  <div class="summary">
    <div class="sc sc-p"><div class="sc-num">${presentCount}</div><div class="sc-label">Present</div></div>
    <div class="sc sc-a"><div class="sc-num">${absentCount}</div><div class="sc-label">Absent</div></div>
    <div class="sc sc-fd"><div class="sc-num">${fullDayCount}</div><div class="sc-label">Full Day</div></div>
    <div class="sc sc-hd"><div class="sc-num">${halfDayCount}</div><div class="sc-label">Half Day</div></div>
    <div class="sc sc-sal"><div class="sc-num">\u20B9${totalSalary.toLocaleString('en-IN')}</div><div class="sc-label">Salary</div></div>
    <div class="sc sc-paid"><div class="sc-num">\u20B9${totalPaid.toLocaleString('en-IN')}</div><div class="sc-label">Paid</div></div>
    <div class="sc sc-bal"><div class="sc-num">\u20B9${balance.toLocaleString('en-IN')}</div><div class="sc-label">Balance</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Project</th><th>Attendance</th><th>Salary</th><th>Overtime</th><th>Paid</th><th>Note</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="footer">
    <span>Thekedaari \u2014 Construction Management App</span>
    <span>${worker.name} \u00B7 ${rangeLabel}</span>
  </div>
</div>
</body></html>`;

  writePDFToWindow(html);
}

function writePDFToWindow(html) {
  const w = window.open('', '_blank', 'width=1200,height=800');
  if (w && !w.closed) {
    w.document.write(html);
    w.document.close();
  } else {
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

// ── Component ───────────────────────────────────────────────────────────────
export default function WorkerReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [mode, setMode] = useState('month');
  const [month, setMonth] = useState(currentMonthStr());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [error, setError] = useState('');

  const range = useMemo(() => {
    if (mode === 'month') return getMonthRange(month || currentMonthStr());
    return { start: customStart, end: customEnd };
  }, [mode, month, customStart, customEnd]);

  const rangeLabel = useMemo(() => {
    if (!range.start || !range.end) return '';
    if (mode === 'month') {
      const [y, m] = (month || currentMonthStr()).split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    return `${fmtDate(range.start)} \u2013 ${fmtDate(range.end)}`;
  }, [mode, month, range]);

  useEffect(() => {
    api.get(`/workers/${id}`)
      .then((r) => setWorker(r.data))
      .catch(() => router.push('/workers'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!range.start || !range.end) { setRecords([]); return; }
    setFetching(true);
    setError('');
    api.get('/attendance', { params: { workerId: id, startDate: range.start, endDate: range.end } })
      .then((r) => setRecords(r.data || []))
      .catch(() => setError('Failed to load attendance data'))
      .finally(() => setFetching(false));
  }, [id, range.start, range.end]);

  const sorted = useMemo(() => [...records].sort((a, b) => (a.date || '').localeCompare(b.date || '')), [records]);

  const presentCount = sorted.filter((r) => r.type !== 'Absent').length;
  const absentCount  = sorted.filter((r) => r.type === 'Absent').length;
  const totalSalary  = sorted.reduce((s, r) => s + (r.salary || 0), 0);
  const totalPaid    = sorted.reduce((s, r) => s + (r.payment || 0), 0);
  const totalOT      = sorted.reduce((s, r) => s + (r.overtime || 0), 0);
  const balance      = totalSalary + totalOT - totalPaid;

  const handleShare = async () => {
    if (!worker) return;
    const text =
      `\uD83D\uDCCB Attendance Report \u2014 ${worker.name}\n` +
      `\uD83D\uDCC5 Period: ${rangeLabel}\n` +
      `\u2705 Present: ${presentCount}  \u274C Absent: ${absentCount}\n` +
      `\uD83D\uDCB0 Salary: ${fmtNum(totalSalary)}  Paid: ${fmtNum(totalPaid)}\n` +
      (totalOT > 0 ? `\u23F1 Overtime: ${fmtNum(totalOT)}\n` : '') +
      `\uD83D\uDCBC Balance Due: ${fmtNum(balance)}\n` +
      `\u2014 Generated via Thekedaari App`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${worker.name} \u2014 Attendance Report`, text });
      } catch (e) {
        if (e.name !== 'AbortError') {
          navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!'));
        }
      }
    } else {
      navigator.clipboard?.writeText(text).then(() => alert('Report summary copied to clipboard!'));
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-3 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="page-title truncate">{worker?.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{worker?.role?.name} · Salary Report</p>
          </div>
        </div>

        {/* Worker card */}
        {worker && (
          <div className="card flex items-center gap-3">
            {worker.photo ? (
              <img
                src={`${API_BASE}/uploads/${worker.photo}`}
                alt={worker.name}
                className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-primary-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-700 font-black text-xl">{worker.name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 truncate">{worker.name}</p>
              <p className="text-xs text-gray-500">{worker.role?.name} · ₹{(worker.costPerDay || 0).toLocaleString('en-IN')}/day</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                worker.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>{worker.status}</span>
            </div>
          </div>
        )}

        {/* Date range selector */}
        <div className="card space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Report Period</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ key: 'month', label: 'By Month' }, { key: 'custom', label: 'Custom Range' }].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === key ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === 'month' ? (
            <div>
              <label className="label text-xs">Select Month</label>
              <input
                type="month"
                className="input-field"
                value={month}
                max={currentMonthStr()}
                onChange={(e) => setMonth(e.target.value)}
              />
              {month && (
                <p className="text-xs text-gray-500 mt-1">
                  {fmtDate(getMonthRange(month).start)} – {fmtDate(getMonthRange(month).end)}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">From</label>
                <input type="date" className="input-field text-sm" value={customStart}
                  max={todayStr()} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div>
                <label className="label text-xs">To</label>
                <input type="date" className="input-field text-sm" value={customEnd}
                  max={todayStr()} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="card text-center py-6 text-red-500 text-sm">{error}</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-3xl font-black text-green-600">{presentCount}</p>
                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-0.5">Present Days</p>
              </div>
              <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-center">
                <p className="text-3xl font-black text-red-600">{absentCount}</p>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5">Absent Days</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-purple-50 border border-purple-100 p-2.5 text-center">
                <p className="text-sm font-black text-purple-600">{fmtNum(totalSalary)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Salary</p>
              </div>
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-2.5 text-center">
                <p className="text-sm font-black text-orange-600">{fmtNum(totalPaid)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Paid</p>
              </div>
              <div className={`rounded-2xl border p-2.5 text-center ${totalOT > 0 ? 'bg-violet-50 border-violet-100' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-sm font-black ${totalOT > 0 ? 'text-violet-600' : 'text-gray-400'}`}>{fmtNum(totalOT)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">OT Earned</p>
              </div>
              <div className={`rounded-2xl border p-2.5 text-center ${balance > 0 ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                <p className={`text-sm font-black ${balance > 0 ? 'text-blue-700' : 'text-green-700'}`}>{fmtNum(balance)}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Balance</p>
              </div>
            </div>

            {/* Action buttons — shown only when there are records */}
            {sorted.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => worker && generateWorkerPDF(worker, sorted, rangeLabel)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all"
                >
                  <Share2 size={18} />
                  Share Report
                </button>
              </div>
            )}

            {/* Attendance rows */}
            {sorted.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Day-by-Day</p>
                {sorted.map((r) => {
                  const isAbsent = r.type === 'Absent';
                  return (
                    <div
                      key={r.id}
                      className={`card py-2.5 ${isAbsent ? 'bg-red-50/80 border-red-200' : 'bg-green-50/80 border-green-200'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isAbsent ? 'bg-red-500' : 'bg-green-500'}`}>
                          <span className="text-white font-black text-sm">{isAbsent ? 'A' : 'P'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700">{fmtDate(r.date)}</p>
                          <p className="text-[11px] text-primary-600 font-semibold truncate">{r.project?.name || '\u2014'}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          {!isAbsent ? (
                            <>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.type === 'FullDay' ? 'bg-green-100 text-green-700'
                                  : r.type === 'HalfDay' ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {r.type === 'FullDay' ? 'Full Day' : r.type === 'HalfDay' ? 'Half Day' : r.type}
                                {r.isSplitHalfDay ? ' \u00B7 2 sites' : ''}
                              </span>
                              <p className="text-xs font-bold text-purple-600">{fmtNum(r.salary)}</p>
                            </>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Absent</span>
                          )}
                          {(r.overtime || 0) > 0 && (
                            <p className="text-[10px] font-semibold text-purple-600">⏱ {fmtNum(r.overtime)}</p>
                          )}
                          {r.payment > 0 && (
                            <p className="text-[10px] font-semibold text-orange-600">Paid: {fmtNum(r.payment)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card text-center py-10 text-gray-400">
                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No attendance records</p>
                <p className="text-xs mt-1 text-gray-400">{rangeLabel}</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
