'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck, Users, IndianRupee, Banknote, UserCheck, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function AttendancePage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    api
      .get('/projects')
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    api
      .get('/attendance', {
        params: {
          startDate: selectedDate,
          endDate: selectedDate,
          ...(selectedProject ? { projectId: selectedProject } : {}),
        },
      })
      .then((r) => setRecords(r.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [selectedDate, selectedProject]);

  const selectedProjectName =
    projects.find((p) => String(p.id) === String(selectedProject))?.name ?? '';

  const totalSalary = records.reduce((sum, r) => sum + (r.salary || 0), 0);
  const totalPaid = records.reduce((sum, r) => sum + (r.payment || 0), 0);
  const absentCount = records.filter((r) => r.type === 'Absent').length;
  const presentCount = records.filter((r) => r.type !== 'Absent').length;

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  const StatusBadge = ({ record }) => {
    if (record.type === 'Absent') {
      return (
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-sm shrink-0">
          <span className="text-white font-black text-lg">A</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-sm shrink-0">
        <span className="text-white font-black text-lg">P</span>
      </div>
    );
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!selectedProject) {
      const byProj = (a.project?.name || '').localeCompare(b.project?.name || '');
      if (byProj !== 0) return byProj;
    }
    const an = (a.worker?.name || '').localeCompare(b.worker?.name || '');
    if (an !== 0) return an;
    return (a.id || 0) - (b.id || 0);
  });

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="min-w-0">
          <h2 className="page-title flex items-center gap-2">
            <CalendarCheck size={24} className="text-primary-600" />
            {t('nav_attendance_report')}
          </h2>
          <p className="text-sm text-gray-600 mt-1.5 max-w-xl leading-snug">{t('attendance_page_subtitle')}</p>
        </div>

        <div className="card space-y-2 sm:space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('attendance_filter_section')}</p>
          <div>
            <label className="label">{t('select_project')}</label>
            <select
              className="input-field"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loadingProjects}
            >
              {loadingProjects ? (
                <option value="">{t('loading')}</option>
              ) : (
                <>
                  <option value="">{t('all')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status === 'Running' ? t('running') : t('completed')})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div>
            <label className="label">{t('attendance_date')}</label>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-primary-200 bg-primary-50/60 px-3 py-3 sm:px-4 sm:py-3.5">
          <Link
            href="/workers"
            className="btn-primary inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold w-full"
          >
            <UserCheck size={18} className="shrink-0" aria-hidden />
            {t('attendance_mark_cta')}
            <ChevronRight size={18} className="shrink-0 opacity-90" aria-hidden />
          </Link>
          <p className="text-xs text-gray-600 text-center mt-2.5 leading-snug">{t('attendance_mark_helper')}</p>
        </div>

        {loadingProjects ? null : (
          <>
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

            {loadingRecords ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
              </div>
            ) : sortedRecords.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <Users size={40} className="mx-auto text-gray-300 mb-2" />
                <p>
                  {selectedProject
                    ? t('attendance_no_records_project')
                    : t('attendance_no_records_date')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(selectedProject ? selectedProjectName : t('all')) +
                    ' · ' +
                    new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN')}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedRecords.map((r) => {
                  const isAbsent = r.type === 'Absent';
                  const isPresent = !isAbsent;
                  const w = r.worker;
                  return (
                    <div
                      key={r.id}
                      className={`card ${
                        isPresent ? 'bg-green-50/80 border-green-200' : 'bg-red-50/80 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <StatusBadge record={r} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 truncate">{w?.name || '—'}</h4>
                          {!selectedProject && r.project?.name ? (
                            <p className="text-[10px] text-gray-500 font-medium truncate">{r.project.name}</p>
                          ) : null}
                          <p className="text-[11px] text-gray-400">
                            {w?.role?.name || '—'} · ₹{w?.costPerDay ?? '—'}/{t('full_day')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {isPresent && (
                            <>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.type === 'FullDay' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {r.type === 'FullDay' ? t('full_day') : r.type === 'HalfDay' ? t('half_day') : t('other')}
                                {r.isSplitHalfDay ? ` · ${t('two_sites')}` : ''}
                              </span>
                              <p className="text-xs font-bold text-blue-600 mt-0.5">{fmt(r.salary)}</p>
                            </>
                          )}
                          {isAbsent && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              {t('absent')}
                            </span>
                          )}
                          {r.payment > 0 && (
                            <div className="mt-0.5">
                              <p className="text-[10px] font-semibold text-orange-600">
                                {t('paid')}: {fmt(r.payment)}
                              </p>
                              {r.paymentNote ? (
                                <p className="text-[9px] text-orange-400 truncate max-w-[120px]">{r.paymentNote}</p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
