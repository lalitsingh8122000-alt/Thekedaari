'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount } from '@/lib/validation';

export default function WorkerLedgerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState({ amount: '', type: 'Debit', category: 'Payment', remarks: '', comment: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get(`/ledger/${id}`).then((r) => setData(r.data)).catch(() => router.push('/workers')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

  const handleAdd = async () => {
    setError('');
    const amount = parsePositiveAmount(form.amount);
    if (!amount) return setError('Please enter a valid amount');
    if (form.comment.trim().length > 2000) return setError('Comment cannot exceed 2000 characters');
    try {
      await api.post('/ledger', { workerId: parseInt(id), ...form, amount, comment: form.comment.trim() });
      setShowModal(null);
      setForm({ amount: '', type: 'Debit', category: 'Payment', remarks: '', comment: '' });
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save ledger entry');
    }
  };

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
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
            <div className={`stat-card border-l-4 ${data.currentBalance > 0 ? 'border-red-500' : 'border-green-500'}`}>
              <p className="text-xs sm:text-sm text-gray-500">{t('current_balance')}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${data.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {fmt(data.currentBalance)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.currentBalance > 0 ? `${t('credit')}` : `${t('debit')}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                onClick={() => { setForm({ ...form, type: 'Credit', category: 'Bonus' }); setShowModal('credit'); }}
                className="btn-danger flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                <ArrowUpCircle size={18} /> {t('credit')}
              </button>
              <button
                onClick={() => { setForm({ ...form, type: 'Debit', category: 'Payment' }); setShowModal('debit'); }}
                className="btn-success flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                <ArrowDownCircle size={18} /> {t('debit')}
              </button>
            </div>

            {data.ledger?.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.ledger.map((entry) => (
                  <div key={entry.id} className="card flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {entry.type === 'Credit' ? (
                          <ArrowUpCircle size={16} className="text-red-500" />
                        ) : (
                          <ArrowDownCircle size={16} className="text-green-500" />
                        )}
                        <span className="font-semibold text-xs sm:text-sm">
                          {entry.category === 'Salary' ? t('salary') : entry.category === 'Bonus' ? t('bonus') : entry.category === 'Payment' ? t('payment') : t('other')}
                        </span>
                      </div>
                      {entry.remarks && <p className="text-xs text-gray-400 mt-0.5 ml-5">{entry.remarks}</p>}
                      <p className="text-xs text-gray-300 mt-0.5 ml-5">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm sm:text-base ${entry.type === 'Credit' ? 'text-red-600' : 'text-green-600'}`}>
                        {entry.type === 'Credit' ? '+' : '-'}{fmt(entry.amount)}
                      </p>
                      <p className="text-xs text-gray-400">{t('balance')}: {fmt(entry.runningBalance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {showModal && (
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{t('add_entry')}</h3>
                <button onClick={() => setShowModal(null)} className="p-1"><X size={20} /></button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input type="number" min="0.01" step="0.01" className="input-field !py-2 text-base font-bold text-center" placeholder="₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(showModal === 'credit' ? ['Salary', 'Bonus', 'Other'] : ['Payment', 'Other']).map((c) => (
                    <button
                      key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                      className={`py-2 rounded-xl font-semibold text-xs ${form.category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {c === 'Salary' ? t('salary') : c === 'Bonus' ? t('bonus') : c === 'Payment' ? t('payment') : t('other')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('comment')}</label>
                <input type="text" maxLength={2000} className="input-field !py-2 text-sm" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={handleAdd}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${showModal === 'credit' ? 'bg-red-500 active:bg-red-600' : 'bg-green-500 active:bg-green-600'}`}
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
