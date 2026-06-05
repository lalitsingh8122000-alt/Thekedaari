'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, TrendingUp, Banknote, X, Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount } from '@/lib/validation';

const defaultForm = () => ({ amount: '', category: 'Payment', remarks: '', comment: '' });

export default function VendorLedgerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // Edit state
  const [editEntry, setEditEntry] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', remarks: '', comment: '' });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = () => {
    api.get(`/vendor-ledger/${id}`)
      .then((r) => setData(r.data))
      .catch(() => router.push('/vendors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
  const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN') : '');

  const closeModal = () => { setShowModal(null); setSaving(false); setError(''); };

  const openAddBill = () => {
    setError(''); setSaving(false);
    setForm({ ...defaultForm(), category: 'Material' });
    setShowModal('addBill');
  };

  const openPayVendor = () => {
    setError(''); setSaving(false);
    setForm({ ...defaultForm(), category: 'Payment' });
    setShowModal('payVendor');
  };

  const handleAdd = async () => {
    if (saving) return;
    setError('');
    const amount = parsePositiveAmount(form.amount);
    if (!amount) return setError('Please enter a valid amount');
    if (form.comment.trim().length > 2000) return setError('Comment cannot exceed 2000 characters');

    const payload = {
      vendorId: parseInt(id, 10),
      amount,
      type: showModal === 'addBill' ? 'Credit' : 'Debit',
      category: form.category,
      remarks: form.remarks.trim(),
      comment: form.comment.trim(),
    };

    setSaving(true);
    try {
      await api.post('/vendor-ledger', payload);
      setShowModal(null);
      setForm(defaultForm());
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const balanceHint = (balance) => {
    if (balance > 0) return t('vendor_balance_you_owe');
    if (balance < 0) return t('vendor_balance_advance');
    return t('vendor_balance_settled');
  };

  const balanceTone = (balance) => {
    if (balance > 0) return { border: 'border-l-red-500', text: 'text-red-600', hint: 'text-red-600/85' };
    if (balance < 0) return { border: 'border-l-emerald-500', text: 'text-emerald-600', hint: 'text-emerald-700/90' };
    return { border: 'border-l-slate-400', text: 'text-slate-700', hint: 'text-gray-500' };
  };

  const openEdit = (entry) => {
    setEditEntry(entry);
    setEditForm({
      amount: String(entry.amount),
      remarks: entry.remarks || '',
      comment: entry.comment || '',
    });
    setEditError('');
    setEditSaving(false);
  };

  const handleEditSave = async () => {
    if (editSaving) return;
    setEditError('');
    const amount = parsePositiveAmount(editForm.amount);
    if (!amount) return setEditError('Please enter a valid amount');
    if (editForm.comment.trim().length > 2000) return setEditError('Comment cannot exceed 2000 characters');
    if (editForm.remarks.trim().length > 500) return setEditError('Remarks cannot exceed 500 characters');
    setEditSaving(true);
    try {
      await api.put(`/vendor-ledger/${editEntry.id}`, {
        amount,
        remarks: editForm.remarks.trim(),
        comment: editForm.comment.trim(),
      });
      setEditEntry(null);
      setLoading(true);
      load();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update entry');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="page-title">{t('vendor_ledger')}</h2>
            {data?.vendor && <p className="text-xs sm:text-sm text-gray-500">{data.vendor.name}</p>}
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
              <p className={`text-xs mt-1.5 leading-snug max-w-xs mx-auto ${balanceTone(data.currentBalance).hint || 'text-gray-500'}`}>
                {balanceHint(data.currentBalance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button type="button" onClick={openAddBill}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-red-50 text-red-900 border border-red-200/80 active:scale-[0.98] transition-transform">
                <TrendingUp size={18} className="text-red-600 shrink-0" />
                {t('vendor_add_bill')}
              </button>
              <button type="button" onClick={openPayVendor}
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold py-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 active:scale-[0.98] transition-transform">
                <Banknote size={18} className="text-emerald-600 shrink-0" />
                {t('vendor_record_payment')}
              </button>
            </div>

            {data.ledger?.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.ledger.map((entry) => {
                  const isBilled = entry.type === 'Credit';
                  return (
                    <div key={entry.id} className="card flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                            isBilled ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isBilled ? t('vendor_tag_billed') : t('vendor_tag_paid')}
                          </span>
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">
                            {entry.category === 'Material' ? t('vendor_material') : entry.category === 'Payment' ? t('payment') : t('other')}
                          </span>
                        </div>
                        {(entry.remarks || entry.comment) && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-3 whitespace-pre-wrap break-words">
                            {[entry.remarks, entry.comment].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <div className="text-[11px] text-gray-400 mt-0.5 space-y-0.5">
                          {entry.expense?.project && (
                            <p className="text-gray-600 font-medium">{entry.expense.project.name} · {entry.expense.remarks}</p>
                          )}
                          <p>{t('ledger_recorded_on')}: {fmtDay(entry.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className={`font-bold text-sm sm:text-base tabular-nums ${isBilled ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isBilled ? '+' : '−'}{fmt(entry.amount)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {t('ledger_running_total')}: {fmt(entry.runningBalance)}
                          </p>
                        </div>
                        {!entry.expense && (
                          <button
                            type="button"
                            onClick={() => openEdit(entry)}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                            aria-label="Edit entry"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>

      {showModal && (        <div className="modal-overlay z-[70]" onClick={closeModal} role="presentation">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold pr-2">
                  {showModal === 'addBill' ? t('vendor_modal_bill_title') : t('vendor_modal_pay_title')}
                </h3>
                <button type="button" onClick={closeModal} className="p-1 shrink-0"><X size={20} /></button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input type="number" min="0.01" step="0.01" className="input-field !py-2 text-base font-bold text-center" placeholder="₹"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(showModal === 'addBill' ? ['Material', 'Other'] : ['Payment', 'Other']).map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                      className={`py-2 rounded-xl font-semibold text-xs ${form.category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {c === 'Material' ? t('vendor_material') : c === 'Payment' ? t('payment') : t('other')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('comment')}</label>
                <input type="text" maxLength={2000} className="input-field !py-2 text-sm"
                  value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button type="button" onClick={handleAdd} disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${
                  showModal === 'addBill' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                <Plus size={18} /> {saving ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit ledger entry modal */}
      {editEntry && (
        <div className="modal-overlay z-[70]" onClick={() => setEditEntry(null)} role="presentation">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold pr-2">Edit Entry</h3>
                <button type="button" onClick={() => setEditEntry(null)} className="p-1 shrink-0"><X size={20} /></button>
              </div>

              {/* Entry type badge (read-only) */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                  editEntry.type === 'Credit' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {editEntry.type === 'Credit' ? t('vendor_tag_billed') : t('vendor_tag_paid')}
                </span>
                <span className="text-sm text-gray-500">
                  {editEntry.category === 'Material' ? t('vendor_material') : editEntry.category === 'Payment' ? t('payment') : t('other')}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{fmtDay(editEntry.createdAt)}</span>
              </div>

              {editError && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{editError}</div>}

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('amount')} (₹)</label>
                <input
                  type="number" min="0.01" step="0.01"
                  className="input-field !py-2 text-base font-bold text-center"
                  placeholder="₹"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('remarks')}</label>
                <input
                  type="text" maxLength={500}
                  className="input-field !py-2 text-sm"
                  placeholder="Optional remarks"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-xs">{t('comment')}</label>
                <input
                  type="text" maxLength={2000}
                  className="input-field !py-2 text-sm"
                  placeholder="Optional comment"
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                />
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm bg-primary-600 hover:bg-primary-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                <Pencil size={16} /> {editSaving ? t('loading') : 'Update Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
