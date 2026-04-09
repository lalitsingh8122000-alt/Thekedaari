'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Users, CalendarCheck, X,
  IndianRupee, Banknote, UserCheck, UserX, Search,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount, isValidDateInput } from '@/lib/validation';

export default function ProjectAttendancePage() {
  const params = useParams();
  const id = params?.id;
  const projectIdNum = parseInt(String(id), 10);

  const [project, setProject] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(null);
  const [attForm, setAttForm] = useState({
    projectId: '', date: new Date().toISOString().split('T')[0],
    status: 'Present', type: 'FullDay', salary: '',
    wantToPay: false, payment: '', paymentNote: '',
    secondSite: false,
    secondProjectId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  const loadData = () => {
    if (!Number.isFinite(projectIdNum) || projectIdNum < 1) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${projectIdNum}`),
      api.get('/workers', { params: { status: 'Active' } }),
      api.get('/projects'),
    ])
      .then(([projRes, wRes, pRes]) => {
        setProject(projRes.data);
        setWorkers(wRes.data);
        setProjects(pRes.data);
      })
      .catch(() => router.replace('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!Number.isFinite(projectIdNum) || projectIdNum < 1) {
      router.replace('/projects');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const otherProjects = useMemo(
    () => projects.filter((p) => String(p.id) !== String(attForm.projectId)),
    [projects, attForm.projectId]
  );

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workers;
    const qDigits = q.replace(/\D/g, '');
    return workers.filter((w) => {
      const name = (w.name || '').toLowerCase();
      const phone = String(w.phone || '').replace(/\D/g, '');
      const role = (w.role?.name || '').toLowerCase();
      if (name.includes(q) || role.includes(q)) return true;
      if (qDigits.length >= 2 && phone.includes(qDigits)) return true;
      return false;
    });
  }, [workers, search]);

  const openAttendance = (worker) => {
    setShowAttendance(worker);
    setExistingAttendance(null);
    setError('');
    setAttForm({
      projectId: String(projectIdNum),
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      type: 'FullDay',
      salary: worker.costPerDay,
      wantToPay: false,
      payment: '',
      paymentNote: '',
      secondSite: false,
      secondProjectId: '',
    });
  };

  const loadExistingAttendance = async (workerId, selectedDate) => {
    if (!workerId || !selectedDate) {
      setExistingAttendance(null);
      return;
    }
    setCheckingAttendance(true);
    try {
      const res = await api.get('/attendance', {
        params: { workerId, startDate: selectedDate, endDate: selectedDate },
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const primaryRows = rows.filter(
        (r) => String(r.projectId) === String(projectIdNum)
      );
      let record = null;
      if (primaryRows.length === 1) {
        record = primaryRows[0];
      } else if (primaryRows.length >= 2) {
        record =
          primaryRows.find((r) => r.splitSecondaries?.length > 0) ||
          primaryRows.find((r) => !r.primarySplitId) ||
          primaryRows[0];
      }
      setExistingAttendance(record);
      if (record) {
        const isAbsent = record.type === 'Absent';
        const split = record.isSplitHalfDay && record.splitPartner;
        const totalSplitSalary = split ? record.salary + record.splitPartner.salary : record.salary;
        const totalPaid =
          record.paymentTotal != null && record.paymentTotal > 0
            ? record.paymentTotal
            : Number(record.payment) || 0;
        setAttForm((f) => ({
          ...f,
          projectId: String(projectIdNum),
          status: isAbsent ? 'Absent' : 'Present',
          type: isAbsent ? f.type : (record.type || 'FullDay'),
          salary: split ? totalSplitSalary : (record.salary ?? f.salary),
          wantToPay: totalPaid > 0,
          payment: totalPaid > 0 ? String(totalPaid) : '',
          paymentNote: record.paymentNote || '',
          secondSite: !!split,
          secondProjectId: split ? String(record.splitPartner.projectId) : '',
        }));
      } else {
        setAttForm((f) => ({
          ...f,
          projectId: String(projectIdNum),
          secondSite: false,
          secondProjectId: '',
        }));
      }
    } catch {
      setExistingAttendance(null);
    } finally {
      setCheckingAttendance(false);
    }
  };

  useEffect(() => {
    if (!showAttendance) return;
    loadExistingAttendance(showAttendance.id, attForm.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAttendance?.id, attForm.date]);

  const calcSalary = (type, costPerDay, twoSiteHalfDay = false) => {
    if (type === 'FullDay') return costPerDay;
    if (type === 'HalfDay') return twoSiteHalfDay ? costPerDay : costPerDay / 2;
    return 0;
  };

  const handleStatusChange = (status) => {
    if (status === 'Absent') {
      setAttForm((f) => ({
        ...f, status: 'Absent', salary: 0, secondSite: false, secondProjectId: '',
      }));
    } else {
      setAttForm((f) => ({
        ...f, status: 'Present',
        salary: String(calcSalary(f.type, showAttendance.costPerDay, f.type === 'HalfDay' && f.secondSite)),
      }));
    }
  };

  const handleTypeChange = (type) => {
    setAttForm((f) => ({
      ...f,
      type,
      salary: String(calcSalary(type, showAttendance.costPerDay, type === 'HalfDay' && f.secondSite)),
      ...(type !== 'HalfDay' ? { secondSite: false, secondProjectId: '' } : {}),
    }));
  };

  const markAttendance = async () => {
    if (saving) return;
    setError('');
    if (!attForm.projectId) return setError(t('attendance_project_required'));
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
    const finalType = attForm.status === 'Absent' ? 'Absent' : attForm.type;
    if (finalType === 'HalfDay' && attForm.secondSite) {
      if (!attForm.secondProjectId || String(attForm.secondProjectId) === String(attForm.projectId)) {
        return setError(t('second_project_required'));
      }
    }
    setSaving(true);
    try {
      const payload = {
        workerId: showAttendance.id,
        projectId: parseInt(attForm.projectId, 10),
        date: attForm.date,
        type: finalType,
        salary: attForm.status === 'Absent' ? 0 : salaryAmount,
        payment: paymentAmount,
        paymentNote: attForm.wantToPay ? attForm.paymentNote.trim() : '',
      };
      const removeSplit =
        !!existingAttendance?.isSplitHalfDay && finalType === 'HalfDay' && !attForm.secondSite;
      if (existingAttendance?.id) {
        if (removeSplit) {
          payload.removeSplit = true;
          payload.secondProjectId = null;
        } else if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          payload.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        const putTargetId =
          existingAttendance.isSplitHalfDay && existingAttendance.splitPartner
            ? existingAttendance.primarySplitId || existingAttendance.id
            : existingAttendance.id;
        await api.put(`/attendance/${putTargetId}`, payload);
      } else {
        if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          payload.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        await api.post('/attendance', payload);
      }
      setShowAttendance(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="p-2 rounded-xl bg-gray-100 active:bg-gray-200 shrink-0"
            aria-label={t('projects')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="page-title leading-tight">{t('project_attendance_title')}</h2>
            {project?.name && (
              <p className="text-sm font-semibold text-primary-700 mt-0.5 truncate">{project.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{t('project_attendance_subtitle')}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_workers_placeholder')}
            className="w-full input-field pl-10 py-2.5 text-base"
            autoComplete="off"
            aria-label={t('search')}
          />
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
        ) : filteredWorkers.length === 0 ? (
          <div className="card text-center py-10">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">{t('no_search_matches')}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredWorkers.map((w) => (
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
                <button
                  type="button"
                  onClick={() => openAttendance(w)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl text-green-700 font-semibold active:bg-green-100 border border-green-100"
                >
                  <CalendarCheck size={20} />
                  <span>{t('mark_attendance')}</span>
                </button>
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
              {checkingAttendance && <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs">Checking existing attendance...</div>}
              {existingAttendance && !checkingAttendance && (
                <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-xs font-medium">
                  Attendance already marked for this date. You are editing it now.
                </div>
              )}
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
                  <div className="input-field text-xs !py-2 bg-gray-50 text-gray-800 font-medium border-gray-200">
                    {projects.find((x) => String(x.id) === String(attForm.projectId))?.name || project?.name || '—'}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-snug">{t('project_attendance_site_locked')}</p>
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

                  {attForm.type === 'HalfDay' && attForm.status === 'Present' && otherProjects.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attForm.secondSite}
                          onChange={(e) => {
                            const on = e.target.checked;
                            setAttForm((f) => ({
                              ...f,
                              secondSite: on,
                              secondProjectId:
                                on && !f.secondProjectId && otherProjects[0]
                                  ? String(otherProjects[0].id)
                                  : on
                                    ? f.secondProjectId
                                    : '',
                              salary: String(calcSalary('HalfDay', showAttendance.costPerDay, on)),
                            }));
                          }}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold text-amber-900">{t('add_second_site')}</span>
                      </label>
                      {attForm.secondSite && (
                        <>
                          <div>
                            <label className="block text-[11px] font-medium text-amber-900 mb-1">
                              {t('second_site_project')}
                            </label>
                            <select
                              className="input-field w-full text-sm"
                              value={attForm.secondProjectId}
                              onChange={(e) => setAttForm((f) => ({ ...f, secondProjectId: e.target.value }))}
                            >
                              <option value="">{t('select_project')}</option>
                              {otherProjects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-[10px] text-amber-800/90 leading-snug">{t('half_day_split_hint')}</p>
                        </>
                      )}
                    </div>
                  )}

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
                {saving ? t('loading') : existingAttendance ? 'Update Attendance' : t('save_attendance')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
