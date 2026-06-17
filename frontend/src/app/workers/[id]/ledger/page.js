'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, TrendingUp, Banknote, X, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount } from '@/lib/validation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN') : '');
const fmtAmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

function categoryLabel(cat) {
  const map = { Salary: 'Salary', Overtime: 'Overtime', Bonus: 'Bonus', Payment: 'Payment', Contract: 'Contract (Theka)', Other: 'Other' };
  return map[cat] || cat;
}

function writePDFToWindow(html) {
  const w = window.open('', '_blank', 'width=1200,height=800');
  if (w && !w.closed) {
    w.document.write(html);
    w.document.close();
  } else {
    const prev = document.getElementById('__ledger_print_wrapper__');
    if (prev) prev.remove();
    const wrapper = document.createElement('div');
    wrapper.id = '__ledger_print_wrapper__';
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

function generateLedgerPDF(worker, ledger, currentBalance) {
  const logoUrl = window.location.origin + '/thekedaari-logo.png';
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const photoSrc = worker.photo ? `${API_BASE}/uploads/${worker.photo}` : null;
  const initial = (worker.name || 'W').charAt(0).toUpperCase();
  const totalCredit = ledger.filter((e) => e.type === 'Credit').reduce((s, e) => s + (e.amount || 0), 0);
  const totalDebit  = ledger.filter((e) => e.type === 'Debit').reduce((s, e) => s + (e.amount || 0), 0);

  const rowsHtml = ledger.map((e) => {
    const isCredit = e.type === 'Credit';
    const workDate = e.attendance?.date ? fmtDay(e.attendance.date) : (e.expense?.date ? fmtDay(e.expense.date) : '—');
    const note = [e.remarks, e.comment].filter(Boolean).join(' · ') || '—';
    return `
    <tr>
      <td>${fmtDay(e.createdAt)}</td>
      <td><span class="badge ${isCredit ? 'badge-credit' : 'badge-debit'}">${isCredit ? 'Earned' : 'Paid'}</span></td>
      <td>${categoryLabel(e.category)}</td>
      <td style="color:${isCredit ? '#15803d' : '#dc2626'};font-weight:700">${isCredit ? '+' : '−'}${fmtAmt(e.amount)}</td>
      <td>${workDate}</td>
      <td style="color:#64748b;font-size:9px;max-width:160px">${note}</td>
      <td style="font-weight:600">${fmtAmt(e.runningBalance)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Ledger — ${worker.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
.page{padding:14px;max-width:100%;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.brand{display:flex;align-items:center;gap:10px}
.brand-name{font-size:18px;font-weight:900;color:#2563eb;letter-spacing:-.5px}
.brand-tag{font-size:10px;color:#64748b;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.rr{text-align:right}.rt{font-size:14px;font-weight:800;color:#1e293b}.rg{font-size:10px;color:#94a3b8;margin-top:3px}
.wcard{display:flex;align-items:center;gap:12px;background:#f8fafc;border-radius:12px;padding:10px 12px;margin-bottom:10px;border:1px solid #e2e8f0;flex-wrap:wrap}
.wphoto{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0}
.wphoto-ph{width:48px;height:48px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:900;color:#fff}
.wname{font-size:15px;font-weight:900;color:#1e293b}.wmeta{font-size:11px;color:#64748b;margin-top:2px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.sc{border-radius:8px;padding:9px 6px;text-align:center}
.sc-earn{background:#dcfce7}.sc-paid{background:#fee2e2}.sc-bal{background:#dbeafe}
.sc-num{font-weight:900;font-size:12px;line-height:1}
.sc-earn .sc-num{color:#15803d}.sc-paid .sc-num{color:#dc2626}.sc-bal .sc-num{color:#2563eb}
.sc-label{font-size:9px;text-transform:uppercase;letter-spacing:.3px;color:#64748b;font-weight:700;margin-top:3px}
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:8px;border:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse;font-size:11px;min-width:520px}
thead{background:#1e293b;color:#fff}
thead th{padding:8px 7px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}tbody tr:nth-child(odd){background:#fff}
tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.badge{display:inline-block;padding:3px 7px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
.badge-credit{background:#dcfce7;color:#15803d}.badge-debit{background:#fee2e2;color:#dc2626}
.footer{margin-top:14px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;color:#94a3b8;font-size:10px}
.no-print{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.back-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;flex:1;text-decoration:none}
.back-btn:hover{background:#2563eb}
@media(min-width:640px){.page{padding:20px 24px;max-width:297mm}.back-btn{flex:none}}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:8mm;size:A4 landscape}.no-print{display:none!important}.table-wrap{overflow:visible;border:none}table{min-width:unset}}
</style></head><body>
<div class="page">
  <div class="no-print">
    <button class="back-btn" onclick="window.close()">← Back</button>
    <button class="back-btn" style="background:#16a34a" onclick="window.print()">⬇ Download PDF</button>
  </div>
  <div class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="Thekedaari" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <div><div class="brand-name">Thekedaari</div><div class="brand-tag">Construction Management</div></div>
    </div>
    <div class="rr"><div class="rt">Worker Ledger Report</div><div class="rg">Generated: ${now}</div></div>
  </div>
  <div class="wcard">
    ${photoSrc
      ? `<img src="${photoSrc}" class="wphoto" alt="${worker.name}">`
      : `<div class="wphoto-ph">${initial}</div>`}
    <div>
      <div class="wname">${worker.name}</div>
      <div class="wmeta">${worker.role?.name || '—'} · ₹${(worker.costPerDay || 0).toLocaleString('en-IN')}/day · ${worker.status || 'Active'}</div>
    </div>
  </div>
  <div class="summary">
    <div class="sc sc-earn"><div class="sc-num">₹${totalCredit.toLocaleString('en-IN')}</div><div class="sc-label">Total Earned</div></div>
    <div class="sc sc-paid"><div class="sc-num">₹${totalDebit.toLocaleString('en-IN')}</div><div class="sc-label">Total Paid</div></div>
    <div class="sc sc-bal"><div class="sc-num">₹${Math.abs(currentBalance).toLocaleString('en-IN')}${currentBalance < 0 ? ' (Advance)' : ''}</div><div class="sc-label">Balance</div></div>
  </div>
  <div class="table-wrap">
  <table>
    <thead><tr><th>Recorded On</th><th>Type</th><th>Category</th><th>Amount</th><th>Work Date</th><th>Note</th><th>Running Balance</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  </div>
  <div class="footer">
    <span>Thekedaari — Construction Management App</span>
    <span>${worker.name} · Ledger Report</span>
  </div>
</div>
</body></html>`;

  writePDFToWindow(html);
}

const defaultForm = () => ({
  amount: '',
  type: 'Debit',
  category: 'Payment',
  remarks: '',
  comment: '',
});

export default function WorkerLedgerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  /** 'addBalance' | 'payWorker' */
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get(`/ledger/${id}`)
      .then((r) => setData(r.data))
      .catch(() => router.push('/workers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

  const closeModal = () => {
    setShowModal(null);
    setSaving(false);
    setError('');
  };

  const openAddBalance = () => {
    setError('');
    setSaving(false);
    setForm({ ...defaultForm(), type: 'Credit', category: 'Bonus' });
    setShowModal('addBalance');
  };

  const openPayWorker = () => {
    setError('');
    setSaving(false);
    setForm({
      ...defaultForm(),
      type: 'Debit',
      category: 'Payment',
    });
    setShowModal('payWorker');
  };

  const handleAdd = async () => {
    if (saving) return;
    setError('');
    const amount = parsePositiveAmount(form.amount);
    if (!amount) return setError('Please enter a valid amount');
    if (form.comment.trim().length > 2000) return setError('Comment cannot exceed 2000 characters');

    const payload = {
      workerId: parseInt(id, 10),
      amount,
      type: showModal === 'addBalance' ? 'Credit' : 'Debit',
      category: form.category,
      remarks: form.remarks.trim(),
      comment: form.comment.trim(),
    };

    setSaving(true);
    try {
      await api.post('/ledger', payload);
      setShowModal(null);
      setForm(defaultForm());
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save ledger entry');
    } finally {
      setSaving(false);
    }
  };

  const balanceHint = (balance) => {
    if (balance > 0) return t('ledger_you_owe');
    if (balance < 0) return t('ledger_advance_paid');
    return t('ledger_settled');
  };

  /** Signed balance: >0 = worker is owed (burden on thekedaari) → red; <0 = advance / thekedaari paid ahead → green */
  const balanceTone = (balance) => {
    if (balance > 0) {
      return {
        border: 'border-l-red-500',
        text: 'text-red-600',
        hint: 'text-red-600/85',
      };
    }
    if (balance < 0) {
      return {
        border: 'border-l-emerald-500',
        text: 'text-emerald-600',
        hint: 'text-emerald-700/90',
      };
    }
    return { border: 'border-l-slate-400', text: 'text-slate-700', hint: 'text-gray-500' };
  };

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="page-title">{t('ledger')}</h2>
            {data?.worker && <p className="text-xs sm:text-sm text-gray-500">{data.worker.name}</p>}
          </div>
          <button
            type="button"
            onClick={() => data && generateLedgerPDF(data.worker, data.ledger || [], data.currentBalance)}
            disabled={!data || (data.ledger?.length === 0)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shrink-0 active:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download size={15} />
            Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : data ? (
          <>
            <div className={`stat-card border-l-4 ${balanceTone(data.currentBalance).border}`}>
              <p className="text-xs sm:text-sm text-gray-500">{t('current_balance')}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${balanceTone(data.currentBalance).text}`}>
                {fmt(data.currentBalance)}
              </p>
              <p
                className={`text-xs mt-1.5 leading-snug max-w-xs mx-auto ${balanceTone(data.currentBalance).hint || 'text-gray-500'}`}
              >
                {balanceHint(data.currentBalance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={openAddBalance}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 active:scale-[0.98] transition-transform"
              >
                <TrendingUp size={18} className="text-emerald-600 shrink-0" />
                {t('ledger_add_earning')}
              </button>
              <button
                type="button"
                onClick={openPayWorker}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-red-50 text-red-900 border border-red-200/80 active:scale-[0.98] transition-transform"
              >
                <Banknote size={18} className="text-red-600 shrink-0" />
                {t('ledger_record_payment')}
              </button>
            </div>

            {data.ledger?.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.ledger.map((entry) => {
                  const isOwed = entry.type === 'Credit';
                  return (
                    <div key={entry.id} className="card flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                              isOwed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isOwed ? t('ledger_tag_owed') : t('ledger_tag_paid')}
                          </span>
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">
                            {entry.category === 'Salary'
                              ? t('salary')
                              : entry.category === 'Overtime'
                                ? t('overtime')
                                : entry.category === 'Bonus'
                                ? t('bonus')
                                : entry.category === 'Payment'
                                  ? t('payment')
                                  : entry.category === 'Contract'
                                    ? t('contract_theka')
                                    : t('other')}
                          </span>
                        </div>
                        {(entry.remarks || entry.comment) && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-3 whitespace-pre-wrap break-words">
                            {[entry.remarks, entry.comment].filter(Boolean).join(entry.remarks && entry.comment ? ' · ' : '')}
                          </p>
                        )}
                        <div className="text-[11px] text-gray-400 mt-0.5 space-y-0.5">
                          {entry.attendance?.date && (
                            <p className="text-gray-600 font-medium">
                              {t('ledger_work_date')}: {fmtDay(entry.attendance.date)}
                            </p>
                          )}
                          {!entry.attendance && entry.expense?.date && (
                            <p className="text-gray-600 font-medium">
                              {t('ledger_expense_date')}: {fmtDay(entry.expense.date)}
                            </p>
                          )}
                          <p>
                            {t('ledger_recorded_on')}: {fmtDay(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm sm:text-base tabular-nums ${isOwed ? 'text-emerald-700' : 'text-red-600'}`}>
                          {isOwed ? '+' : '−'}
                          {fmt(entry.amount)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {t('ledger_running_total')}: {fmt(entry.runningBalance)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>

      {showModal && (
        <div className="modal-overlay z-[70]" onClick={closeModal} role="presentation">
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold pr-2">
                  {showModal === 'addBalance' ? t('ledger_modal_add_title') : t('ledger_modal_pay_title')}
                </h3>
                <button type="button" onClick={closeModal} className="p-1 shrink-0">
                  <X size={20} />
                </button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="input-field !py-2 text-base font-bold text-center"
                  placeholder="₹"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              {showModal === 'payWorker' && form.category === 'Payment' && (
                <p className="text-[11px] text-gray-500 leading-snug bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  {t('ledger_payment_no_project_hint')}
                </p>
              )}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(showModal === 'addBalance' ? ['Salary', 'Bonus', 'Other'] : ['Payment', 'Other']).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`py-2 rounded-xl font-semibold text-xs ${
                        form.category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c === 'Salary' ? t('salary') : c === 'Bonus' ? t('bonus') : c === 'Payment' ? t('payment') : t('other')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('comment')}</label>
                <input
                  type="text"
                  maxLength={2000}
                  className="input-field !py-2 text-sm"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${
                  showModal === 'addBalance' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Plus size={18} /> {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
