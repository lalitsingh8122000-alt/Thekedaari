'use client';
import { useEffect, useState, useMemo } from 'react';
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
  projectId: '',
  date: new Date().toISOString().slice(0, 10),
});

export default function WorkerLedgerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  /** 'addBalance' | 'payWorker' */
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

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

  useEffect(() => {
    api
      .get('/projects')
      .then((r) => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProjects([]));
  }, []);

  const defaultProjectId = useMemo(() => {
    const running = projects.find((p) => p.status === 'Running');
    return running?.id ?? projects[0]?.id ?? '';
  }, [projects]);

  const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

  const openAddBalance = () => {
    setError('');
    setForm({ ...defaultForm(), type: 'Credit', category: 'Bonus' });
    setShowModal('addBalance');
  };

  const openPayWorker = () => {
    setError('');
    setForm({
      ...defaultForm(),
      type: 'Debit',
      category: 'Payment',
      projectId: defaultProjectId ? String(defaultProjectId) : '',
      date: new Date().toISOString().slice(0, 10),
    });
    setShowModal('payWorker');
  };

  const handleAdd = async () => {
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

    if (showModal === 'payWorker' && form.category === 'Payment') {
      const pid = parseInt(form.projectId, 10);
      if (!pid) return setError(t('ledger_project_required'));
      payload.projectId = pid;
      payload.date = form.date;
    }

    try {
      await api.post('/ledger', payload);
      setShowModal(null);
      setForm(defaultForm());
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save ledger entry');
    }
  };

  const balanceHint = (balance) => {
    if (balance > 0) return t('ledger_you_owe');
    if (balance < 0) return t('ledger_advance_paid');
    return t('ledger_settled');
  };

  const balanceTone = (balance) => {
    if (balance > 0) return { border: 'border-l-amber-500', text: 'text-amber-700' };
    if (balance < 0) return { border: 'border-l-sky-600', text: 'text-sky-700' };
    return { border: 'border-l-slate-400', text: 'text-slate-700' };
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
              <p className="text-xs text-gray-500 mt-1.5 leading-snug max-w-xs mx-auto">{balanceHint(data.currentBalance)}</p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={openAddBalance}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 active:scale-[0.98] transition-transform"
              >
                <TrendingUp size={18} className="text-amber-600 shrink-0" />
                {t('ledger_add_earning')}
              </button>
              <button
                type="button"
                onClick={openPayWorker}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 active:scale-[0.98] transition-transform"
              >
                <Banknote size={18} className="text-emerald-600 shrink-0" />
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
                              isOwed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
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
                                  : t('other')}
                          </span>
                        </div>
                        {entry.remarks && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{entry.remarks}</p>}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm sm:text-base tabular-nums ${isOwed ? 'text-amber-700' : 'text-emerald-700'}`}>
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
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold pr-2">
                  {showModal === 'addBalance' ? t('ledger_modal_add_title') : t('ledger_modal_pay_title')}
                </h3>
                <button type="button" onClick={() => setShowModal(null)} className="p-1 shrink-0">
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
                <>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('select_project')}</label>
                    <select
                      className="input-field !py-2.5 text-sm"
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    >
                      <option value="">{t('ledger_pick_project')}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name} {p.status === 'Running' ? '' : `(${p.status})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">{t('ledger_project_help')}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('date')}</label>
                    <input
                      type="date"
                      className="input-field !py-2 text-sm"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </>
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
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.99] ${
                  showModal === 'addBalance' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Plus size={18} /> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
