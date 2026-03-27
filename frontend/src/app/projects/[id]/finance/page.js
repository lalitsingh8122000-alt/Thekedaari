'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Save,
  ArrowUpCircle, ArrowDownCircle, X, Search, User,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function ProjectFinancePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [workerSearch, setWorkerSearch] = useState('');
  const [form, setForm] = useState({
    amount: '', date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash', remarks: '', notes: '', workerId: null,
  });

  const load = async () => {
    try {
      const [s, i, e, w] = await Promise.all([
        api.get(`/finance/projects/${id}/summary`),
        api.get(`/finance/projects/${id}/income`),
        api.get(`/finance/projects/${id}/expenses`),
        api.get('/workers', { params: { status: 'Active' } }),
      ]);
      setSummary(s.data);
      setIncomes(i.data);
      setExpenses(e.data);
      setWorkers(w.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  const resetForm = () => {
    setForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', remarks: '', notes: '', workerId: null });
    setWorkerSearch('');
  };

  const handleAdd = async () => {
    try {
      if (showModal === 'income') {
        await api.post(`/finance/projects/${id}/income`, form);
      } else {
        await api.post(`/finance/projects/${id}/expenses`, form);
      }
      setShowModal(null);
      resetForm();
      setLoading(true);
      load();
    } catch {}
  };

  const expenseRemarks = ['Cement', 'Sand', 'Labour', 'Others'];

  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.phone.includes(workerSearch)
  );

  const selectedWorker = workers.find((w) => w.id === form.workerId);

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
                <button onClick={() => { resetForm(); setShowModal('expense'); }} className="btn-danger w-full flex items-center justify-center gap-2">
                  <Plus size={18} /> {t('add_expense')}
                </button>
                {expenses.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
                ) : expenses.map((e) => (
                  <div key={e.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-red-600">{fmt(e.amount)}</p>
                        <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-IN')}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          {e.remarks === 'Cement' ? t('cement') : e.remarks === 'Sand' ? t('sand') : e.remarks === 'Labour' ? t('labour') : t('other')}
                        </span>
                      </div>
                      <ArrowDownCircle size={22} className="text-red-400 flex-shrink-0" />
                    </div>
                    {e.worker && (
                      <div className="mt-2 flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                        <User size={14} className="text-blue-500" />
                        <span className="text-xs sm:text-sm font-medium text-blue-700">{t('paid_to')}: {e.worker.name}</span>
                        {e.worker.role && <span className="text-xs text-blue-400">({e.worker.role.name})</span>}
                      </div>
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
        <div className="modal-overlay">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{showModal === 'income' ? t('add_income') : t('add_expense')}</h3>
                <button onClick={() => { setShowModal(null); resetForm(); }} className="p-1"><X size={20} /></button>
              </div>

              {showModal === 'expense' && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {expenseRemarks.map((r) => (
                      <button
                        key={r} type="button"
                        onClick={() => setForm({ ...form, remarks: r, workerId: r !== 'Labour' ? null : form.workerId })}
                        className={`py-2 rounded-xl font-semibold text-xs transition-colors ${
                          form.remarks === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r === 'Cement' ? t('cement') : r === 'Sand' ? t('sand') : r === 'Labour' ? t('labour') : t('other')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showModal === 'expense' && form.remarks === 'Labour' && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('select_person')} *</label>
                  {selectedWorker ? (
                    <div className="flex items-center justify-between bg-primary-50 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs">
                          {selectedWorker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-primary-800">{selectedWorker.name}</p>
                          <p className="text-[11px] text-primary-500">{selectedWorker.role?.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setForm({ ...form, workerId: null })} className="text-primary-400 active:text-primary-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          className="input-field !py-1.5 pl-8 text-xs"
                          placeholder={`${t('search')}...`}
                          value={workerSearch}
                          onChange={(e) => setWorkerSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-0.5 border rounded-xl p-1">
                        {filteredWorkers.length === 0 ? (
                          <p className="text-center text-gray-400 py-2 text-xs">{t('no_data')}</p>
                        ) : filteredWorkers.map((w) => (
                          <button
                            key={w.id}
                            onClick={() => { setForm({ ...form, workerId: w.id }); setWorkerSearch(''); }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg active:bg-gray-100 text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-[10px] flex-shrink-0">
                              {w.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-xs truncate">{w.name}</p>
                              <p className="text-[11px] text-gray-400">{w.role?.name}</p>
                            </div>
                            <span className="text-[11px] font-medium text-gray-500 flex-shrink-0">₹{w.costPerDay}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input type="number" className="input-field !py-2 text-base font-bold text-center" placeholder="₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('date')}</label>
                <input type="date" className="input-field !py-2 text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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

              {showModal === 'expense' && (
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('notes')}</label>
                  <input type="text" className="input-field !py-2 text-xs" placeholder={t('notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              )}
            </div>

            <div className="flex-shrink-0 px-3 pb-4 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl">
              <button
                onClick={handleAdd}
                disabled={showModal === 'expense' && form.remarks === 'Labour' && !form.workerId}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 ${
                  showModal === 'income' ? 'bg-green-500 active:bg-green-600' : 'bg-red-500 active:bg-red-600'
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
