'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, TrendingUp, Banknote, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount } from '@/lib/validation';

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
  const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN') : '');

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

  /** Signed balance: >0 = worker is owed (burden on thekedaar) → red; <0 = advance / thekedaar paid ahead → green */
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
          <div>
            <h2 className="page-title">{t('ledger')}</h2>
            {data?.worker && <p className="text-xs sm:text-sm text-gray-500">{data.worker.name}</p>}
          </div>
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
