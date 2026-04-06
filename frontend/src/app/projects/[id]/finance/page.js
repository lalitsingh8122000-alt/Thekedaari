'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Save,
  ArrowUpCircle, ArrowDownCircle, X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount, isValidDateInput, roleNameIsContractor } from '@/lib/validation';

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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    remarks: '',
    notes: '',
  });
  const [contractForm, setContractForm] = useState({
    contractorId: '',
    contractTradeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const load = async () => {
    try {
      const [s, i, e, w, tr] = await Promise.all([
        api.get(`/finance/projects/${id}/summary`),
        api.get(`/finance/projects/${id}/income`),
        api.get(`/finance/projects/${id}/expenses`),
        api.get('/workers', { params: { status: 'Active' } }),
        api.get('/contract-trades'),
      ]);
      setSummary(s.data);
      setIncomes(i.data);
      setExpenses(e.data);
      setWorkers(Array.isArray(w.data) ? w.data : []);
      setContractTrades(Array.isArray(tr.data) ? tr.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  const resetForm = () => {
    setForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', remarks: '', notes: '' });
    setContractForm({
      contractorId: '',
      contractTradeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError('');
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

  const handleAdd = async () => {
    setError('');
    if (showModal === 'expenseContract') {
      const amount = parsePositiveAmount(contractForm.amount);
      if (!amount) return setError('Please enter a valid amount');
      if (!isValidDateInput(contractForm.date)) return setError('Please select a valid date');
      if (!contractForm.contractTradeId) return setError(t('contract_expense_select_work_type'));
      if (!contractForm.contractorId) return setError(t('select_contractor'));
      if (contractForm.notes.trim().length > 2000) return setError('Notes cannot exceed 2000 characters');
      try {
        const body = {
          amount,
          date: contractForm.date,
          remarks: 'Contract',
          notes: contractForm.notes.trim(),
          workerId: parseInt(contractForm.contractorId, 10),
          contractTradeId: parseInt(contractForm.contractTradeId, 10),
        };
        await api.post(`/finance/projects/${id}/expenses`, body);
        setShowModal(null);
        resetForm();
        setLoading(true);
        load();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to save record');
      }
      return;
    }
    const amount = parsePositiveAmount(form.amount);
    if (!amount) return setError('Please enter a valid amount');
    if (!isValidDateInput(form.date)) return setError('Please select a valid date');
    if (showModal === 'expense' && !form.remarks) return setError('Please select an expense category');
    if (showModal === 'income' && form.remarks.trim().length > 500) return setError('Remarks cannot exceed 500 characters');
    if (showModal === 'expense' && form.notes.trim().length > 2000) return setError('Notes cannot exceed 2000 characters');
    try {
      if (showModal === 'income') {
        await api.post(`/finance/projects/${id}/income`, { ...form, amount, remarks: form.remarks.trim() });
      } else {
        await api.post(`/finance/projects/${id}/expenses`, { ...form, amount, notes: form.notes.trim() });
      }
      setShowModal(null);
      resetForm();
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    }
  };

  const expenseRemarks = ['Cement', 'Sand', 'Brick', 'Steel', 'Aggregate', 'Others'];

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
                <button onClick={() => { resetForm(); setShowModal('income'); }} className="btn-success w-full flex items-center justify-center gap-2">
                  <Plus size={18} /> {t('add_income')}
                </button>
                {incomes.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
                ) : incomes.map((i) => (
                  <div key={i.id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-bold text-green-600">{fmt(i.amount)}</p>
                      <p className="text-xs text-gray-400">{new Date(i.date).toLocaleDateString('en-IN')} · {i.paymentMode === 'Cash' ? t('cash') : t('online')}</p>
                      {i.remarks && <p className="text-xs text-gray-500 mt-0.5">{i.remarks}</p>}
                    </div>
                    <ArrowUpCircle size={22} className="text-green-400 flex-shrink-0" />
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
                {expenses.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
                ) : expenses.map((e) => (
                  <div key={e.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-red-600">{fmt(e.amount)}</p>
                        <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-IN')}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          {expenseLabel(e.remarks)}
                        </span>
                      </div>
                      <ArrowDownCircle size={22} className="text-red-400 flex-shrink-0" />
                    </div>
                    {e.worker && (
                      <p className="text-xs text-amber-800 mt-1 font-medium">
                        {e.remarks === 'Contract' ? t('contractor') : t('paid_to')}: {e.worker.name}
                        {e.contractTrade?.name ? ` · ${e.contractTrade.name}` : ''}
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
                    ? t('add_income')
                    : showModal === 'expenseContract'
                      ? t('add_contract_expense')
                      : t('add_expense')}
                </h3>
                <button onClick={() => { setShowModal(null); resetForm(); }} className="p-1"><X size={20} /></button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              {showModal === 'expense' && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {expenseRemarks.map((r) => (
                      <button
                        key={r} type="button"
                        onClick={() => setForm({ ...form, remarks: r })}
                        className={`py-2 rounded-xl font-semibold text-xs transition-colors ${
                          form.remarks === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {expenseLabel(r)}
                      </button>
                    ))}
                  </div>
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
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={handleAdd}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${
                  showModal === 'income' ? 'bg-green-500 active:bg-green-600' : showModal === 'expenseContract' ? 'bg-amber-500 active:bg-amber-600' : 'bg-red-500 active:bg-red-600'
                }`}
              >
                <Save size={18} /> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
