'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Save,
  ArrowUpCircle, ArrowDownCircle, X, Pencil, Trash2, Store, Download,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount, isValidDateInput, roleNameIsContractor } from '@/lib/validation';

function toDateInput(value) {
  if (value == null) return new Date().toISOString().split('T')[0];
  const d = typeof value === 'string' ? value : new Date(value).toISOString();
  return d.slice(0, 10);
}

export default function ProjectFinancePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [contractTrades, setContractTrades] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    remarks: '',
    customRemarks: '',
    notes: '',
    vendorId: '',
  });
  const [contractForm, setContractForm] = useState({
    contractorId: '',
    contractTradeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('All');

  const load = async () => {
    try {
      const [s, i, e, w, tr, vn] = await Promise.all([
        api.get(`/finance/projects/${id}/summary`),
        api.get(`/finance/projects/${id}/income`),
        api.get(`/finance/projects/${id}/expenses`),
        api.get('/workers', { params: { status: 'Active' } }),
        api.get('/contract-trades'),
        api.get('/vendors', { params: { status: 'Active' } }),
      ]);
      setSummary(s.data);
      setIncomes(i.data);
      setExpenses(e.data);
      setWorkers(Array.isArray(w.data) ? w.data : []);
      setContractTrades(Array.isArray(tr.data) ? tr.data : []);
      setVendors(Array.isArray(vn.data) ? vn.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  const resetForm = () => {
    setForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', remarks: '', customRemarks: '', notes: '', vendorId: '' });
    setContractForm({
      contractorId: '',
      contractTradeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError('');
    setEditingIncomeId(null);
    setEditingExpenseId(null);
  };

  const contractors = workers.filter(
    (w) => w.workerType === 'Contractor' || roleNameIsContractor(w.role?.name),
  );

  /** Match selected sub-type; also include contractors with no sub-type yet (legacy / pre-migration). */
  const contractorsForTrade = useMemo(() => {
    const tid = contractForm.contractTradeId;
    if (!tid) return [];
    const forThisTrade = contractors.filter((c) => String(c.contractTradeId ?? '') === String(tid));
    const untagged = contractors.filter((c) => c.contractTradeId == null || c.contractTradeId === '');
    const ids = new Set(forThisTrade.map((c) => c.id));
    const extraUntagged = untagged.filter((c) => !ids.has(c.id));
    return [...forThisTrade, ...extraUntagged];
  }, [contractors, contractForm.contractTradeId]);

  const handleSaveModal = async () => {
    if (saving) return;
    setError('');
    if (showModal === 'expenseContract') {
      const amount = parsePositiveAmount(contractForm.amount);
      if (!amount) return setError('Please enter a valid amount');
      if (!isValidDateInput(contractForm.date)) return setError('Please select a valid date');
      if (!contractForm.contractTradeId) return setError(t('contract_expense_select_work_type'));
      if (!contractForm.contractorId) return setError(t('select_contractor'));
      if (contractForm.notes.trim().length > 2000) return setError('Notes cannot exceed 2000 characters');
      setSaving(true);
      try {
        const body = {
          amount,
          date: contractForm.date,
          remarks: 'Contract',
          notes: contractForm.notes.trim(),
          workerId: parseInt(contractForm.contractorId, 10),
          contractTradeId: parseInt(contractForm.contractTradeId, 10),
        };
        if (editingExpenseId != null) {
          await api.patch(`/finance/expenses/${editingExpenseId}`, body);
        } else {
          await api.post(`/finance/projects/${id}/expenses`, body);
        }
        setShowModal(null);
        resetForm();
        setLoading(true);
        load();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to save record');
      } finally {
        setSaving(false);
      }
      return;
    }
    const amount = parsePositiveAmount(form.amount);
    if (!amount) return setError('Please enter a valid amount');
    if (!isValidDateInput(form.date)) return setError('Please select a valid date');
    if (showModal === 'expense' && !form.remarks) return setError('Please select an expense category');
    if (showModal === 'expense' && form.remarks === 'Others' && !form.customRemarks.trim()) return setError('Please specify the item name (e.g. Color, Paint, Tiles)');
    if (showModal === 'income' && form.remarks.trim().length > 500) return setError('Remarks cannot exceed 500 characters');
    if (showModal === 'expense' && form.notes.trim().length > 2000) return setError('Notes cannot exceed 2000 characters');
    setSaving(true);
    try {
      if (showModal === 'income') {
        const payload = { amount, date: form.date, paymentMode: form.paymentMode, remarks: form.remarks.trim() };
        if (editingIncomeId != null) {
          await api.patch(`/finance/income/${editingIncomeId}`, payload);
        } else {
          await api.post(`/finance/projects/${id}/income`, payload);
        }
      } else {
        const finalRemarks = form.remarks === 'Others' ? form.customRemarks.trim() : form.remarks;
        const body = {
          amount,
          date: form.date,
          remarks: finalRemarks,
          notes: form.notes.trim(),
        };
        if (form.vendorId) body.vendorId = parseInt(form.vendorId, 10);
        if (editingExpenseId != null) {
          await api.patch(`/finance/expenses/${editingExpenseId}`, body);
        } else {
          await api.post(`/finance/projects/${id}/expenses`, body);
        }
      }
      setShowModal(null);
      resetForm();
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleteSaving) return;
    setDeleteSaving(true);
    try {
      if (pendingDelete.kind === 'income') {
        await api.delete(`/finance/income/${pendingDelete.id}`);
      } else {
        await api.delete(`/finance/expenses/${pendingDelete.id}`);
      }
      setPendingDelete(null);
      setLoading(true);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete';
      if (typeof window !== 'undefined') window.alert(msg);
      setPendingDelete(null);
    } finally {
      setDeleteSaving(false);
    }
  };

  const expenseRemarks = ['Cement', 'Sand', 'Brick', 'Steel', 'Aggregate', 'Others'];
  const fixedExpenseRemarks = new Set(['Cement', 'Sand', 'Brick', 'Steel', 'Aggregate']);
  const expenseFilterOptions = ['All', ...expenseRemarks, 'Contract'];
  const filteredExpenses = expenseFilter === 'All'
    ? expenses
    : expenseFilter === 'Others'
      ? expenses.filter((e) => !fixedExpenseRemarks.has(e.remarks) && e.remarks !== 'Contract')
      : expenses.filter((e) => e.remarks === expenseFilter);

  const expenseLabel = (remarks) => {
    const map = {
      Cement: t('cement'),
      Sand: t('sand'),
      Brick: t('expense_brick'),
      Steel: t('expense_steel'),
      Aggregate: t('expense_aggregate'),
      Others: t('other'),
      Contract: t('contract_theka'),
    };
    return map[remarks] || remarks;
  };

  function writePDFToWindow(html) {
    const w = window.open('', '_blank', 'width=1200,height=800');
    if (w && !w.closed) {
      w.document.write(html);
      w.document.close();
    } else {
      const prev = document.getElementById('__finance_print_wrapper__');
      if (prev) prev.remove();
      const wrapper = document.createElement('div');
      wrapper.id = '__finance_print_wrapper__';
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

  const handleDownloadReport = () => {
    if (!summary) return;
    const logoUrl = window.location.origin + '/thekedaari-logo.png';
    const now = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtRs = (n) => '₹' + (n || 0).toLocaleString('en-IN');
    const profitColor = summary.profitLoss >= 0 ? '#16a34a' : '#dc2626';
    const profitLabel = summary.profitLoss >= 0 ? t('profit') : t('loss');
    const hasContract = summary.totalContractExpense > 0;

    const incomeRowsHtml = incomes.map((i) => `
      <tr>
        <td>${fmtDate(i.date)}</td>
        <td style="color:#16a34a;font-weight:700">${fmtRs(i.amount)}</td>
        <td>${i.paymentMode === 'Cash' ? t('cash') : t('online')}</td>
        <td style="color:#64748b;font-size:9px">${i.remarks || '—'}</td>
      </tr>`).join('');

    const expenseRowsHtml = expenses.map((e) => `
      <tr>
        <td>${fmtDate(e.date)}</td>
        <td>${expenseLabel(e.remarks)}</td>
        <td style="color:#dc2626;font-weight:700">${fmtRs(e.amount)}</td>
        <td style="color:#64748b">${e.vendor?.name || e.worker?.name || '—'}</td>
        <td style="color:#64748b;font-size:9px">${e.notes || '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Expense Report — ${summary.project.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
.page{padding:14px;max-width:100%;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.brand{display:flex;align-items:center;gap:10px}
.brand-name{font-size:18px;font-weight:900;color:#2563eb;letter-spacing:-.5px}
.brand-tag{font-size:10px;color:#64748b;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.rr{text-align:right}.rt{font-size:14px;font-weight:800;color:#1e293b}.rg{font-size:10px;color:#94a3b8;margin-top:3px}
.proj-row{background:#f1f5f9;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:13px}
.proj-name{font-weight:900;font-size:15px;color:#1e293b}.proj-meta{font-size:10px;color:#64748b;margin-top:2px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}
.sc{border-radius:8px;padding:8px 4px;text-align:center}
.sc-income{background:#dcfce7}.sc-material{background:#fee2e2}.sc-labour{background:#ffedd5}
.sc-contract{background:#fef9c3}.sc-total{background:#fecaca}.sc-pl{background:#dbeafe}
.sc-loss{background:#fecaca}
.sc-num{font-weight:900;font-size:12px;line-height:1}
.sc-income .sc-num{color:#16a34a}.sc-material .sc-num{color:#dc2626}.sc-labour .sc-num{color:#ea580c}
.sc-contract .sc-num{color:#a16207}.sc-total .sc-num{color:#b91c1c}
.sc-pl .sc-num{color:#2563eb}.sc-loss .sc-num{color:#dc2626}
.sc-label{font-size:9px;text-transform:uppercase;letter-spacing:.3px;color:#64748b;font-weight:700;margin-top:3px}
.section-title{font-size:11px;font-weight:800;color:#1e293b;margin:12px 0 5px;padding-left:8px;border-left:3px solid #2563eb;text-transform:uppercase;letter-spacing:.4px}
.section-title.green{border-color:#16a34a}.section-title.red{border-color:#ef4444}
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:10px}
table{width:100%;border-collapse:collapse;font-size:11px;min-width:480px}
thead{background:#1e293b;color:#fff}
thead th{padding:8px 7px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}tbody tr:nth-child(odd){background:#fff}
tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.footer{margin-top:14px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;color:#94a3b8;font-size:10px}
.no-print{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.back-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;flex:1;text-decoration:none}
.back-btn:hover{background:#2563eb}
@media(min-width:640px){.page{padding:20px 24px;max-width:297mm}.summary{grid-template-columns:repeat(${hasContract ? 6 : 5},1fr)}.back-btn{flex:none}}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:8mm;size:A4 landscape}.no-print{display:none!important}.table-wrap{overflow:visible;border:none}table{min-width:unset}}
</style></head><body>
<div class="page">
  <div class="no-print">
    <button class="back-btn" onclick="window.parent!==window?window.parent.document.getElementById('__finance_print_wrapper__').remove():window.close()">← Back</button>
    <button class="back-btn" style="background:#16a34a" onclick="window.print()">⬇ Download PDF</button>
  </div>
  <div class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="Thekedaari" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <div><div class="brand-name">Thekedaari</div><div class="brand-tag">Construction Management</div></div>
    </div>
    <div class="rr"><div class="rt">Expense Report</div><div class="rg">Generated: ${now}</div></div>
  </div>
  <div class="proj-row">
    <div class="proj-name">${summary.project.name}</div>
    <div class="proj-meta">${t('total_income')}: ${fmtRs(summary.totalIncome)} &nbsp;&middot;&nbsp; ${t('total_expense')}: ${fmtRs(summary.totalExpense)} &nbsp;&middot;&nbsp; ${profitLabel}: ${fmtRs(Math.abs(summary.profitLoss))}</div>
  </div>
  <div class="summary">
    <div class="sc sc-income"><div class="sc-num">${fmtRs(summary.totalIncome)}</div><div class="sc-label">${t('total_income')}</div></div>
    <div class="sc sc-material"><div class="sc-num">${fmtRs(summary.totalMaterialExpense)}</div><div class="sc-label">${t('material_expense')}</div></div>
    <div class="sc sc-labour"><div class="sc-num">${fmtRs(summary.totalLabourCost)}</div><div class="sc-label">${t('labour_cost')}</div></div>
    ${hasContract ? `<div class="sc sc-contract"><div class="sc-num">${fmtRs(summary.totalContractExpense)}</div><div class="sc-label">${t('contract_theka')}</div></div>` : ''}
    <div class="sc sc-total"><div class="sc-num">${fmtRs(summary.totalExpense)}</div><div class="sc-label">${t('total_expense')}</div></div>
    <div class="sc ${summary.profitLoss >= 0 ? 'sc-pl' : 'sc-loss'}"><div class="sc-num" style="color:${profitColor}">${fmtRs(Math.abs(summary.profitLoss))}</div><div class="sc-label">${profitLabel}</div></div>
  </div>
  ${incomes.length > 0 ? `
  <div class="section-title green">${t('income')} (${incomes.length})</div>
  <div class="table-wrap"><table>
    <thead><tr><th>${t('date')}</th><th>${t('amount')}</th><th>${t('payment_mode')}</th><th>${t('remarks')}</th></tr></thead>
    <tbody>${incomeRowsHtml}</tbody>
  </table></div>` : ''}
  ${expenses.length > 0 ? `
  <div class="section-title red">${t('expense')} (${expenses.length})</div>
  <div class="table-wrap"><table>
    <thead><tr><th>${t('date')}</th><th>${t('remarks')}</th><th>${t('amount')}</th><th>${t('vendor')} / ${t('contractor')}</th><th>${t('notes')}</th></tr></thead>
    <tbody>${expenseRowsHtml}</tbody>
  </table></div>` : ''}
  <div class="footer">
    <span>Thekedaari — Construction Management App</span>
    <span>${summary.project.name} · Expense Report</span>
  </div>
</div>
</body></html>`;

    writePDFToWindow(html);
  };

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="page-title">{t('finance')}</h2>
            {summary && <p className="text-xs sm:text-sm text-gray-500">{summary.project?.name}</p>}
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {['summary', 'income', 'expense'].map((tb) => (
            <button
              key={tb} onClick={() => setTab(tb)}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors ${
                tab === tb ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {tb === 'summary' ? t('profit_loss') : tb === 'income' ? t('income') : t('expense')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {tab === 'summary' && summary && (
              <div className="space-y-2 sm:space-y-3">
                <div className="stat-card border-l-4 border-green-500">
                  <ArrowUpCircle size={24} className="text-green-500 mb-1" />
                  <p className="text-xs sm:text-sm text-gray-500">{t('total_income')}</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{fmt(summary.totalIncome)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="stat-card border-l-4 border-red-400">
                    <p className="text-xs text-gray-500">{t('material_expense')}</p>
                    <p className="text-base sm:text-lg font-bold text-red-500">{fmt(summary.totalMaterialExpense)}</p>
                  </div>
                  <div className="stat-card border-l-4 border-orange-400">
                    <p className="text-xs text-gray-500">{t('labour_cost')}</p>
                    <p className="text-base sm:text-lg font-bold text-orange-500">{fmt(summary.totalLabourCost)}</p>
                  </div>
                </div>
                {summary.totalContractExpense != null && summary.totalContractExpense > 0 && (
                  <div className="stat-card border-l-4 border-amber-500">
                    <p className="text-xs text-gray-500">{t('contract_theka')}</p>
                    <p className="text-base sm:text-lg font-bold text-amber-700">{fmt(summary.totalContractExpense)}</p>
                  </div>
                )}
                <div className="stat-card border-l-4 border-red-500">
                  <ArrowDownCircle size={24} className="text-red-500 mb-1" />
                  <p className="text-xs sm:text-sm text-gray-500">{t('total_expense')}</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">{fmt(summary.totalExpense)}</p>
                </div>
                <div className={`stat-card border-l-4 ${summary.profitLoss >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                  {summary.profitLoss >= 0 ? <TrendingUp size={28} className="text-green-500 mb-1" /> : <TrendingDown size={28} className="text-red-500 mb-1" />}
                  <p className="text-xs sm:text-sm text-gray-500">{t('profit_loss')}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(Math.abs(summary.profitLoss))} <span className="text-sm sm:text-base">{summary.profitLoss >= 0 ? t('profit') : t('loss')}</span>
                  </p>
                </div>

              </div>
            )}

            {tab === 'income' && (
              <div className="space-y-2 sm:space-y-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowModal('income'); }}
                  className="btn-success w-full flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> {t('add_income')}
                </button>
                {incomes.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
                ) : incomes.map((i) => (
                  <div key={i.id} className="card flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-green-600">{fmt(i.amount)}</p>
                      <p className="text-xs text-gray-400">{new Date(i.date).toLocaleDateString('en-IN')} · {i.paymentMode === 'Cash' ? t('cash') : t('online')}</p>
                      {i.remarks && <p className="text-xs text-gray-500 mt-0.5">{i.remarks}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setEditingIncomeId(i.id);
                          setEditingExpenseId(null);
                          setForm({
                            amount: String(i.amount),
                            date: toDateInput(i.date),
                            paymentMode: i.paymentMode,
                            remarks: i.remarks || '',
                            notes: '',
                          });
                          setShowModal('income');
                        }}
                        className="p-2 rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
                        aria-label={t('edit')}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: 'income', id: i.id })}
                        className="p-2 rounded-xl bg-red-50 text-red-600 active:bg-red-100"
                        aria-label={t('delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'expense' && (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs text-gray-500 px-0.5">{t('finance_expense_hint_updated')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { resetForm(); setShowModal('expense'); }} className="btn-danger flex items-center justify-center gap-1.5 text-sm py-2.5">
                    <Plus size={16} /> {t('add_material_expense')}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setShowModal('expenseContract'); }} className="flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-semibold bg-amber-500 text-white active:bg-amber-600">
                    <Plus size={16} /> {t('add_contract_expense')}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-primary-600 text-white active:bg-primary-700 transition-colors"
                >
                  <Download size={18} />
                  {t('download_report')}
                </button>
                <div className="relative">
                  <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[#f0f4f8] to-transparent z-10" />
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {expenseFilterOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setExpenseFilter(opt)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        expenseFilter === opt
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt === 'All' ? t('all') : expenseLabel(opt)}
                    </button>
                  ))}
                </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
                ) : filteredExpenses.map((e) => (
                  <div key={e.id} className="card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-red-600">{fmt(e.amount)}</p>
                        <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-IN')}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          {expenseLabel(e.remarks)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setError('');
                            setEditingIncomeId(null);
                            setEditingExpenseId(e.id);
                            if (e.remarks === 'Contract') {
                              setContractForm({
                                contractorId: e.workerId != null ? String(e.workerId) : '',
                                contractTradeId: e.contractTradeId != null ? String(e.contractTradeId) : '',
                                amount: String(e.amount),
                                date: toDateInput(e.date),
                                notes: e.notes || '',
                              });
                              setShowModal('expenseContract');
                            } else {
                              const isCustom = !fixedExpenseRemarks.has(e.remarks) && e.remarks !== 'Contract' && e.remarks !== 'Others';
                              setForm({
                                amount: String(e.amount),
                                date: toDateInput(e.date),
                                paymentMode: 'Cash',
                                remarks: isCustom ? 'Others' : e.remarks,
                                customRemarks: isCustom ? e.remarks : '',
                                notes: e.notes || '',
                                vendorId: e.vendorId != null ? String(e.vendorId) : '',
                              });
                              setShowModal('expense');
                            }
                          }}
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
                          aria-label={t('edit')}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ kind: 'expense', id: e.id })}
                          className="p-2 rounded-xl bg-red-50 text-red-600 active:bg-red-100"
                          aria-label={t('delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {e.worker && (
                      <p className="text-xs text-amber-800 mt-1 font-medium">
                        {e.remarks === 'Contract' ? t('contractor') : t('paid_to')}: {e.worker.name}
                        {e.contractTrade?.name ? ` · ${e.contractTrade.name}` : ''}
                      </p>
                    )}
                    {e.vendor && (
                      <p className="text-xs text-purple-700 mt-1 font-medium flex items-center gap-1">
                        <Store size={12} /> {t('vendor_from')}: {e.vendor.name}
                      </p>
                    )}
                    {e.notes && <p className="text-xs text-gray-500 mt-1">{e.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">
                  {showModal === 'income'
                    ? (editingIncomeId != null ? t('edit_income') : t('add_income'))
                    : showModal === 'expenseContract'
                      ? (editingExpenseId != null ? t('edit_contract_expense_short') : t('add_contract_expense'))
                      : (editingExpenseId != null ? t('edit_expense') : t('add_expense'))}
                </h3>
                <button type="button" onClick={() => { setShowModal(null); resetForm(); }} className="p-1"><X size={20} /></button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              {showModal === 'expense' && (
                <div className="space-y-2">
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {expenseRemarks.map((r) => (
                      <button
                        key={r} type="button"
                        onClick={() => setForm({ ...form, remarks: r, customRemarks: r !== 'Others' ? '' : form.customRemarks })}
                        className={`py-2 rounded-xl font-semibold text-xs transition-colors ${
                          form.remarks === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {expenseLabel(r)}
                      </button>
                    ))}
                  </div>
                  {form.remarks === 'Others' && (
                    <div>
                      <label className="block text-gray-600 font-medium mb-1 text-xs">{t('expense_other_label')}</label>
                      <input
                        type="text"
                        maxLength={100}
                        autoFocus
                        className="input-field !py-2 text-sm"
                        placeholder={t('expense_other_placeholder')}
                        value={form.customRemarks}
                        onChange={(e) => setForm({ ...form, customRemarks: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {showModal === 'expenseContract' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">{t('contract_expense_modal_hint')}</p>
                  {contractors.length === 0 ? (
                    <p className="text-sm text-amber-700">{t('no_contractors')}</p>
                  ) : contractTrades.length === 0 ? (
                    <p className="text-sm text-amber-700">{t('no_trades_in_roles_yet')}</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-600 font-medium mb-1 text-xs">{t('theka_subcategory')}</label>
                        <select
                          className="input-field !py-2 text-sm"
                          value={contractForm.contractTradeId}
                          onChange={(e) => {
                            const tid = e.target.value;
                            setContractForm((f) => ({
                              ...f,
                              contractTradeId: tid,
                              contractorId: '',
                            }));
                          }}
                        >
                          <option value="">{t('select_trade')}</option>
                          {contractTrades.map((ctr) => (
                            <option key={ctr.id} value={ctr.id}>{ctr.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-medium mb-1 text-xs">{t('select_contractor')}</label>
                        <select
                          className="input-field !py-2 text-sm disabled:opacity-60"
                          value={contractForm.contractorId}
                          disabled={!contractForm.contractTradeId}
                          onChange={(e) => setContractForm({ ...contractForm, contractorId: e.target.value })}
                        >
                          <option value="">
                            {!contractForm.contractTradeId ? t('finance_pick_trade_before_contractor') : t('select_person')}
                          </option>
                          {contractorsForTrade.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                              {c.contractTradeId == null || c.contractTradeId === ''
                                ? ` ${t('contractor_no_subtype_suffix')}`
                                : ''}
                            </option>
                          ))}
                        </select>
                        {contractForm.contractTradeId && contractorsForTrade.length === 0 && (
                          <p className="text-[10px] text-amber-700 mt-1">{t('no_contractors_for_trade')}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="input-field !py-2 text-base font-bold text-center"
                  placeholder="₹"
                  value={showModal === 'expenseContract' ? contractForm.amount : form.amount}
                  onChange={(e) => (showModal === 'expenseContract'
                    ? setContractForm({ ...contractForm, amount: e.target.value })
                    : setForm({ ...form, amount: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('date')}</label>
                <input
                  type="date"
                  className="input-field !py-2 text-sm"
                  value={showModal === 'expenseContract' ? contractForm.date : form.date}
                  onChange={(e) => (showModal === 'expenseContract'
                    ? setContractForm({ ...contractForm, date: e.target.value })
                    : setForm({ ...form, date: e.target.value }))}
                />
              </div>

              {showModal === 'income' && (
                <>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('payment_mode')}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Cash', 'Online'].map((m) => (
                        <button
                          key={m} type="button" onClick={() => setForm({ ...form, paymentMode: m })}
                          className={`py-2 rounded-xl font-semibold text-xs ${form.paymentMode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {m === 'Cash' ? t('cash') : t('online')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                    <input
                      type="text"
                      maxLength={500}
                      className="input-field !py-2 text-xs"
                      placeholder="…"
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    />
                  </div>
                </>
              )}

              {(showModal === 'expense' || showModal === 'expenseContract') && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('notes')}</label>
                  <input
                    type="text"
                    maxLength={2000}
                    className="input-field !py-2 text-xs"
                    placeholder={t('notes')}
                    value={showModal === 'expenseContract' ? contractForm.notes : form.notes}
                    onChange={(e) => (showModal === 'expenseContract'
                      ? setContractForm({ ...contractForm, notes: e.target.value })
                      : setForm({ ...form, notes: e.target.value }))}
                  />
                </div>
              )}

              {showModal === 'expense' && vendors.length > 0 && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('vendor_select')}</label>
                  <select
                    className="input-field !py-2 text-sm"
                    value={form.vendorId}
                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                  >
                    <option value="">— {t('vendor_select')} —</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${
                  showModal === 'income' ? 'bg-green-500 active:bg-green-600' : showModal === 'expenseContract' ? 'bg-amber-500 active:bg-amber-600' : 'bg-red-500 active:bg-red-600'
                } disabled:opacity-60 disabled:pointer-events-none`}
              >
                <Save size={18} /> {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-overlay z-[80] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl mx-4 sm:mx-0 p-5 space-y-4">
            <p className="font-bold text-gray-900">{t('finance_delete_title')}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{t('finance_delete_body')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-700 active:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteSaving}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-red-600 text-white active:bg-red-700 disabled:opacity-60 disabled:pointer-events-none"
              >
                {deleteSaving ? t('loading') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
