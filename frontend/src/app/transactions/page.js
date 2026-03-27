'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function TransactionsPage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const params = {};
    if (dateFilter) {
      params.startDate = dateFilter;
      params.endDate = dateFilter;
    }
    api.get('/attendance', { params })
      .then((r) => setAttendance(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateFilter]);

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');
  const totalSalary = attendance.reduce((sum, a) => sum + a.salary, 0);

  const typeLabel = (type) => {
    if (type === 'FullDay') return t('full_day');
    if (type === 'HalfDay') return t('half_day');
    return t('other');
  };

  const typeColor = (type) => {
    if (type === 'FullDay') return 'bg-green-100 text-green-700';
    if (type === 'HalfDay') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <h2 className="page-title">{t('transactions')}</h2>

        <div className="card flex items-center gap-3">
          <CalendarCheck size={20} className="text-primary-600" />
          <input
            type="date"
            className="input-field flex-1"
            value={dateFilter}
            onChange={(e) => { setLoading(true); setDateFilter(e.target.value); }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card border-l-4 border-blue-500">
            <p className="text-xs text-gray-500">{t('today_attendance')}</p>
            <p className="text-2xl font-bold text-blue-600">{attendance.length}</p>
          </div>
          <div className="stat-card border-l-4 border-red-500">
            <p className="text-xs text-gray-500">{t('labour_cost')}</p>
            <p className="text-lg font-bold text-red-600">{fmt(totalSalary)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="card text-center py-12">
            <ArrowLeftRight size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_data')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map((a) => (
              <div key={a.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {a.worker?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{a.worker?.name}</p>
                    <p className="text-xs text-gray-400">{a.project?.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(a.type)}`}>
                      {typeLabel(a.type)}
                    </span>
                  </div>
                </div>
                <p className="font-bold text-lg text-red-600">{fmt(a.salary)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
