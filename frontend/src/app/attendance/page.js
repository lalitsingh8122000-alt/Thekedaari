'use client';
import { useEffect, useState } from 'react';
import {
  CalendarCheck, X, Users, Search, Pencil,
  IndianRupee, Banknote, UserCheck, UserX, Clock,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function AttendancePage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [attForm, setAttForm] = useState({
    status: 'Present',
    type: 'FullDay',
    salary: 0,
    wantToPay: false,
    payment: '',
    paymentNote: '',
    secondSite: false,
    secondProjectId: '',
  });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/projects', { params: { status: 'Running' } }),
      api.get('/workers', { params: { status: 'Active' } }),
    ]).then(([p, w]) => {
      setProjects(p.data);
      setWorkers(w.data);
      if (p.data.length > 0) setSelectedProject(p.data[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      api.get('/attendance', { params: { startDate: selectedDate, endDate: selectedDate } })
        .then((r) => setTodayRecords(r.data))
        .catch(() => {});
    }
  }, [selectedDate, refreshKey]);

  const getRecord = (workerId) => {
    return todayRecords.find(
      (r) => r.workerId === workerId &&
        (selectedProject ? r.projectId === parseInt(selectedProject) : true)
    );
  };

  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.phone.includes(q);
  });

  const markedWorkers = workers.filter((w) => getRecord(w.id));
  const projectRecords = todayRecords.filter((r) => selectedProject ? r.projectId === parseInt(selectedProject) : true);
  const totalSalary = projectRecords.reduce((sum, r) => sum + r.salary, 0);
  const totalPaid = projectRecords.reduce((sum, r) => sum + (r.payment || 0), 0);
  const absentCount = projectRecords.filter((r) => r.type === 'Absent').length;
  const presentCount = projectRecords.filter((r) => r.type !== 'Absent').length;

  const openModal = (worker) => {
    const record = getRecord(worker.id);
    if (record) {
      setEditRecord(record);
      const isAbsent = record.type === 'Absent';
      const split = record.isSplitHalfDay && record.splitPartner;
      const totalSplitSalary = split ? record.salary + record.splitPartner.salary : record.salary;
      setAttForm({
        status: isAbsent ? 'Absent' : 'Present',
        type: isAbsent ? 'FullDay' : record.type,
        salary: split ? totalSplitSalary : record.salary,
        wantToPay: (record.payment || 0) > 0,
        payment: record.payment || '',
        paymentNote: record.paymentNote || '',
        secondSite: !!split,
        secondProjectId: split ? String(record.splitPartner.projectId) : '',
      });
    } else {
      setEditRecord(null);
      setAttForm({
        status: 'Present',
        type: 'FullDay',
        salary: worker.costPerDay,
        wantToPay: false,
        payment: '',
        paymentNote: '',
        secondSite: false,
        secondProjectId: '',
      });
    }
    setShowModal(worker);
  };

  /** Half day on one site = half rate; half day on two sites same day = full day total, split 50/50 in backend. */
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
        ...f,
        status: 'Present',
        salary: calcSalary(f.type, showModal.costPerDay, f.type === 'HalfDay' && f.secondSite),
      }));
    }
  };

  const handleTypeChange = (type) => {
    setAttForm((f) => ({
      ...f,
      type,
      salary: calcSalary(type, showModal.costPerDay, type === 'HalfDay' && f.secondSite),
      ...(type !== 'HalfDay' ? { secondSite: false, secondProjectId: '' } : {}),
    }));
  };

  const otherProjects = projects.filter((p) => String(p.id) !== String(selectedProject));
  const selectedProjectName =
    projects.find((p) => String(p.id) === String(selectedProject))?.name ?? '';

  const handleSave = async () => {
    if (!selectedProject) return;
    const finalType = attForm.status === 'Absent' ? 'Absent' : attForm.type;
    if (finalType === 'HalfDay' && attForm.secondSite) {
      if (!attForm.secondProjectId || String(attForm.secondProjectId) === String(selectedProject)) {
        alert(t('second_project_required'));
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        type: finalType,
        salary: attForm.status === 'Absent' ? 0 : parseFloat(attForm.salary),
        payment: attForm.wantToPay && attForm.payment ? parseFloat(attForm.payment) : 0,
        paymentNote: attForm.wantToPay ? attForm.paymentNote : '',
      };

      const removeSplit =
        !!editRecord?.isSplitHalfDay && finalType === 'HalfDay' && !attForm.secondSite;

      if (editRecord) {
        const putBody = { ...payload };
        if (removeSplit) {
          putBody.removeSplit = true;
          putBody.secondProjectId = null;
        } else if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          putBody.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        await api.put(`/attendance/${editRecord.id}`, putBody);
      } else {
        const postBody = {
          workerId: showModal.id,
          projectId: parseInt(selectedProject, 10),
          date: selectedDate,
          ...payload,
        };
        if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          postBody.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        await api.post('/attendance', postBody);
      }
      setShowModal(null);
      setEditRecord(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  const StatusBadge = ({ record }) => {
    if (!record) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-400 font-bold text-sm">?</span>
        </div>
      );
    }
    if (record.type === 'Absent') {
      return (
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-lg">A</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
        <span className="text-white font-black text-lg">P</span>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <h2 className="page-title flex items-center gap-2">
          <CalendarCheck size={24} className="text-primary-600" />
          {t('daily_attendance')}
        </h2>

        {/* Project & Date */}
        <div className="card space-y-2 sm:space-y-3">
          <div>
            <label className="label">{t('select_project')}</label>
            <select className="input-field" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              <option value="">{t('select_project')}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('attendance_date')}</label>
            <input type="date" className="input-field" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-green-600 font-black text-xs">P</span>
            </div>
            <p className="text-lg font-black text-green-600">{presentCount}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('present')}</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-red-600 font-black text-xs">A</span>
            </div>
            <p className="text-lg font-black text-red-600">{absentCount}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('total_absent')}</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1">
              <IndianRupee size={13} className="text-blue-600" />
            </div>
            <p className="text-sm font-black text-blue-600">{fmt(totalSalary)}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('salary')}</p>
          </div>
          <div className="bg-white rounded-xl p-2 text-center shadow-sm border">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-1">
              <Banknote size={13} className="text-orange-600" />
            </div>
            <p className="text-sm font-black text-orange-600">{fmt(totalPaid)}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('paid')}</p>
          </div>
        </div>

        {/* Search */}
        {selectedProject && !loading && workers.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="input-field pl-10"
              placeholder={`${t('search')} (${t('name')} / ${t('phone')})...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Worker List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : !selectedProject ? (
          <div className="card text-center py-12 text-gray-400">{t('select_project')}</div>
        ) : workers.length === 0 ? (
          <div className="card text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_data')}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">{t('no_data')}</div>
        ) : (
          <div className="space-y-1.5">
            {filteredWorkers.map((w) => {
              const record = getRecord(w.id);
              const isAbsent = record?.type === 'Absent';
              const isPresent = record && !isAbsent;
              return (
                <button
                  key={w.id}
                  onClick={() => openModal(w)}
                  className={`w-full text-left card transition-all active:scale-[0.98] ${
                    isPresent ? 'bg-green-50 border-green-200' :
                    isAbsent ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <StatusBadge record={record} />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{w.name}</h4>
                      <p className="text-[11px] text-gray-400">{w.role?.name} · ₹{w.costPerDay}/{t('full_day')}</p>
                    </div>

                    {record ? (
                      <div className="text-right flex-shrink-0">
                        {isPresent && (
                          <>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              record.type === 'FullDay' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {record.type === 'FullDay' ? t('full_day') : t('half_day')}
                              {record.isSplitHalfDay ? ` · ${t('two_sites')}` : ''}
                            </span>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">{fmt(record.salary)}</p>
                          </>
                        )}
                        {isAbsent && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            {t('absent')}
                          </span>
                        )}
                        {record.payment > 0 && (
                          <div className="mt-0.5">
                            <p className="text-[10px] font-semibold text-orange-600">{t('paid')}: {fmt(record.payment)}</p>
                            {record.paymentNote && (
                              <p className="text-[9px] text-orange-400 truncate max-w-[120px]">{record.paymentNote}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-300">
                        <span className="text-[10px]">{t('tap_to_mark')}</span>
                        <Pencil size={12} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">
                  {editRecord ? t('edit_attendance') : t('mark_attendance')}
                </h3>
                <button onClick={() => { setShowModal(null); setEditRecord(null); }} className="p-1"><X size={20} /></button>
              </div>

              {/* Worker Info */}
              <div className="bg-primary-50 px-3 py-2 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {showModal.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{showModal.name}</p>
                  <p className="text-[11px] text-gray-500">{showModal.role?.name}</p>
                  {selectedProjectName ? (
                    <p className="text-[11px] mt-1 font-semibold text-primary-800 truncate">
                      {t('marking_attendance_on')}:{' '}
                      <span className="text-primary-950">{selectedProjectName}</span>
                    </p>
                  ) : null}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{t('cost_per_day')}</p>
                  <p className="font-bold text-primary-700 text-base">₹{showModal.costPerDay}</p>
                </div>
              </div>

              {/* P / A Selection — compact horizontal */}
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

              {/* Present: Full / Half Day + Salary */}
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
                              salary: calcSalary('HalfDay', showModal.costPerDay, on),
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
                      className="w-24 border-2 border-blue-200 rounded-lg px-2 py-1 text-right text-base font-bold text-blue-700 focus:border-blue-400 focus:outline-none bg-white"
                      value={attForm.salary}
                      onChange={(e) => setAttForm({ ...attForm, salary: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Payment Section */}
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
                        className="w-full border-2 border-orange-200 rounded-lg px-3 py-1.5 text-xs text-orange-700 focus:border-orange-400 focus:outline-none bg-white"
                        placeholder={t('payment_note_placeholder')}
                        value={attForm.paymentNote}
                        onChange={(e) => setAttForm({ ...attForm, paymentNote: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{t('status')}</span>
                  {attForm.status === 'Present' ? (
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] font-black">P</span>
                      {attForm.type === 'FullDay' ? t('full_day') : attForm.type === 'HalfDay' ? t('half_day') : t('other')}
                    </span>
                  ) : (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black">A</span>
                      {t('absent')}
                    </span>
                  )}
                </div>
                {attForm.status === 'Present' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('day_salary')}</span>
                    <span className="font-bold text-blue-600">{fmt(attForm.salary)}</span>
                  </div>
                )}
                {attForm.wantToPay && attForm.payment > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{t('payment')}</span>
                      <span className="font-bold text-orange-600">{fmt(attForm.payment)}</span>
                    </div>
                    {attForm.paymentNote && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{t('payment_note')}</span>
                        <span className="font-medium text-orange-500 text-[11px] truncate max-w-[160px]">{attForm.paymentNote}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Save — sticky at bottom */}
            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={handleSave}
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
