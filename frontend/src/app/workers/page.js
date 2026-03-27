'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Users, CalendarCheck, BookOpen, Pencil, X,
  IndianRupee, Banknote, UserCheck, UserX,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount, isValidDateInput } from '@/lib/validation';

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [showAttendance, setShowAttendance] = useState(null);
  const [attForm, setAttForm] = useState({
    projectId: '', date: new Date().toISOString().split('T')[0],
    status: 'Present', type: 'FullDay', salary: '',
    wantToPay: false, payment: '', paymentNote: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  const load = () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    Promise.all([
      api.get('/workers', { params }),
      api.get('/projects', { params: { status: 'Running' } }),
    ]).then(([w, p]) => { setWorkers(w.data); setProjects(p.data); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openAttendance = (worker) => {
    setShowAttendance(worker);
    setAttForm({
      projectId: projects[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      type: 'FullDay',
      salary: worker.costPerDay,
      wantToPay: false,
      payment: '',
      paymentNote: '',
    });
  };

  const calcSalary = (type, costPerDay) => {
    if (type === 'FullDay') return costPerDay;
    if (type === 'HalfDay') return costPerDay / 2;
    return 0;
  };

  const handleStatusChange = (status) => {
    if (status === 'Absent') {
      setAttForm((f) => ({ ...f, status: 'Absent', salary: 0 }));
    } else {
      setAttForm((f) => ({
        ...f, status: 'Present',
        salary: calcSalary(f.type, showAttendance.costPerDay),
      }));
    }
  };

  const handleTypeChange = (type) => {
    setAttForm((f) => ({ ...f, type, salary: calcSalary(type, showAttendance.costPerDay) }));
  };

  const markAttendance = async () => {
    setError('');
    if (!attForm.projectId) return setError('Please select a project');
    if (!isValidDateInput(attForm.date)) return setError('Please select a valid date');
    const salaryAmount = attForm.status === 'Absent' ? 0 : parsePositiveAmount(attForm.salary);
    if (attForm.status === 'Present' && salaryAmount === null) {
      return setError('Please enter a valid salary');
    }
    const paymentAmount = attForm.wantToPay && attForm.payment ? parsePositiveAmount(attForm.payment) : 0;
    if (attForm.wantToPay && attForm.payment && paymentAmount === null) {
      return setError('Please enter a valid payment amount');
    }
    if (attForm.paymentNote && attForm.paymentNote.trim().length > 500) {
      return setError('Payment note cannot exceed 500 characters');
    }
    setSaving(true);
    try {
      const finalType = attForm.status === 'Absent' ? 'Absent' : attForm.type;
      await api.post('/attendance', {
        workerId: showAttendance.id,
        projectId: parseInt(attForm.projectId),
        date: attForm.date,
        type: finalType,
        salary: attForm.status === 'Absent' ? 0 : salaryAmount,
        payment: paymentAmount,
        paymentNote: attForm.wantToPay ? attForm.paymentNote.trim() : '',
      });
      setShowAttendance(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="page-title">{t('workers')}</h2>
          <button onClick={() => router.push('/workers/add')} className="btn-primary flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 text-sm sm:text-base">
            <Plus size={18} /> {t('add_worker')}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['', 'Active', 'Inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {s === '' ? t('all') : s === 'Active' ? t('active') : t('inactive')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : workers.length === 0 ? (
          <div className="card text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_data')}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {workers.map((w) => (
              <div key={w.id} className="card">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                  {w.photo ? (
                    <img src={`${API_BASE}${w.photo}`} alt={w.name} className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg sm:text-xl flex-shrink-0">
                      {w.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{w.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{w.role?.name} · ₹{w.costPerDay}/{t('full_day')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${w.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {w.status === 'Active' ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    onClick={() => openAttendance(w)}
                    className="flex flex-col items-center gap-0.5 py-2 sm:py-3 bg-green-50 rounded-xl text-green-700 font-semibold active:bg-green-100"
                  >
                    <CalendarCheck size={18} />
                    <span className="text-[10px] sm:text-xs">{t('attendance')}</span>
                  </button>
                  <button
                    onClick={() => router.push(`/workers/${w.id}/ledger`)}
                    className="flex flex-col items-center gap-0.5 py-2 sm:py-3 bg-blue-50 rounded-xl text-blue-700 font-semibold active:bg-blue-100"
                  >
                    <BookOpen size={18} />
                    <span className="text-[10px] sm:text-xs">{t('ledger')}</span>
                  </button>
                  <button
                    onClick={() => router.push(`/workers/${w.id}/edit`)}
                    className="flex flex-col items-center gap-0.5 py-2 sm:py-3 bg-gray-50 rounded-xl text-gray-700 font-semibold active:bg-gray-100"
                  >
                    <Pencil size={18} />
                    <span className="text-[10px] sm:text-xs">{t('edit')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAttendance && (
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{t('mark_attendance')}</h3>
                <button onClick={() => setShowAttendance(null)} className="p-1"><X size={20} /></button>
              </div>
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              <div className="bg-primary-50 px-3 py-2 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {showAttendance.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{showAttendance.name}</p>
                  <p className="text-[11px] text-gray-500">{showAttendance.role?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{t('cost_per_day')}</p>
                  <p className="font-bold text-primary-700 text-base">₹{showAttendance.costPerDay}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('select_project')}</label>
                  <select className="input-field text-xs !py-2" value={attForm.projectId} onChange={(e) => setAttForm({ ...attForm, projectId: e.target.value })}>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('attendance_date')}</label>
                  <input type="date" className="input-field text-xs !py-2" value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('Present')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    attForm.status === 'Present'
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <UserCheck size={18} />
                  <span className="font-black">P</span>
                  <span className="text-xs font-medium">{t('present')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Absent')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    attForm.status === 'Absent'
                      ? 'bg-red-500 text-white shadow-md shadow-red-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <UserX size={18} />
                  <span className="font-black">A</span>
                  <span className="text-xs font-medium">{t('absent')}</span>
                </button>
              </div>

              {attForm.status === 'Present' && (
                <>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('attendance_type')}</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['FullDay', 'HalfDay', 'Other'].map((type) => (
                        <button
                          key={type} type="button" onClick={() => handleTypeChange(type)}
                          className={`py-2 rounded-xl font-semibold text-xs transition-all ${
                            attForm.type === type
                              ? type === 'FullDay' ? 'bg-green-500 text-white shadow-sm'
                              : type === 'HalfDay' ? 'bg-yellow-500 text-white shadow-sm'
                              : 'bg-gray-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {type === 'FullDay' ? t('full_day') : type === 'HalfDay' ? t('half_day') : t('other')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee size={15} className="text-blue-500" />
                      <span className="font-medium text-xs text-blue-700">{t('day_salary')}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-24 border-2 border-blue-200 rounded-lg px-2 py-1 text-right text-base font-bold text-blue-700 focus:border-blue-400 focus:outline-none bg-white"
                      value={attForm.salary}
                      onChange={(e) => setAttForm({ ...attForm, salary: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className={`rounded-xl border-2 transition-colors ${attForm.wantToPay ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                <button
                  type="button"
                  onClick={() => setAttForm((f) => ({ ...f, wantToPay: !f.wantToPay, payment: f.wantToPay ? '' : f.payment, paymentNote: f.wantToPay ? '' : f.paymentNote }))}
                  className="w-full flex items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Banknote size={17} className={attForm.wantToPay ? 'text-orange-500' : 'text-gray-400'} />
                    <span className={`font-semibold text-xs ${attForm.wantToPay ? 'text-orange-700' : 'text-gray-500'}`}>
                      {t('pay_now')}
                    </span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors flex items-center ${attForm.wantToPay ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow mx-0.5" />
                  </div>
                </button>
                {attForm.wantToPay && (
                  <div className="px-3 pb-2.5 space-y-1.5">
                    <div>
                      <label className="block text-orange-600 font-medium mb-0.5 text-xs">{t('pay_amount')} (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border-2 border-orange-200 rounded-lg px-3 py-1.5 text-center text-base font-bold text-orange-700 focus:border-orange-400 focus:outline-none bg-white"
                        placeholder="0"
                        value={attForm.payment}
                        onChange={(e) => setAttForm({ ...attForm, payment: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-orange-600 font-medium mb-0.5 text-xs">{t('payment_note')}</label>
                      <input
                        type="text"
                        maxLength={500}
                        className="w-full border-2 border-orange-200 rounded-lg px-3 py-1.5 text-xs text-orange-700 focus:border-orange-400 focus:outline-none bg-white"
                        placeholder={t('payment_note_placeholder')}
                        value={attForm.paymentNote}
                        onChange={(e) => setAttForm({ ...attForm, paymentNote: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={markAttendance}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${
                  attForm.status === 'Present'
                    ? 'bg-green-500 active:bg-green-600'
                    : 'bg-red-500 active:bg-red-600'
                } ${saving ? 'opacity-60' : ''}`}
              >
                <CalendarCheck size={18} />
                {saving ? t('loading') : t('save_attendance')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
