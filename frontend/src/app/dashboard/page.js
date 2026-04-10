'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, IndianRupee, Users, FolderKanban,
  CalendarCheck, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <AppShell>
      <div className="space-y-4">
        <h2 className="page-title">{t('dashboard')}</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card border-l-4 border-green-500" onClick={() => router.push('/projects')}>
                <ArrowUpCircle size={28} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">{t('total_income')}</p>
                <p className="text-lg font-bold text-green-600">{fmt(data.totalIncome)}</p>
              </div>
              <div className="stat-card border-l-4 border-red-500" onClick={() => router.push('/projects')}>
                <ArrowDownCircle size={28} className="text-red-500 mb-1" />
                <p className="text-xs text-gray-500">{t('total_expense')}</p>
                <p className="text-lg font-bold text-red-600">{fmt(data.totalExpense)}</p>
              </div>
              <div
                className={`stat-card col-span-2 border-l-4 ${data.profitLoss >= 0 ? 'border-green-500' : 'border-red-500'}`}
              >
                {data.profitLoss >= 0 ? (
                  <TrendingUp size={32} className="text-green-500 mb-1" />
                ) : (
                  <TrendingDown size={32} className="text-red-500 mb-1" />
                )}
                <p className="text-sm text-gray-500">{t('profit_loss')}</p>
                <p className={`text-2xl font-bold ${data.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {fmt(Math.abs(data.profitLoss))}
                  <span className="text-base ml-2">
                    {data.profitLoss >= 0 ? t('profit') : t('loss')}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card cursor-pointer" onClick={() => router.push('/workers')}>
                <CalendarCheck size={28} className="text-blue-500 mb-1" />
                <p className="text-xs text-gray-500">{t('today_attendance')}</p>
                <div className="flex items-end justify-between gap-2 mt-1 w-full">
                  <div className="flex flex-col items-center flex-1">
                    <p className="text-2xl font-bold text-emerald-600 tabular-nums leading-none">
                      {data.todayPresent ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t('present')}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 self-center" />
                  <div className="flex flex-col items-center flex-1">
                    <p className="text-2xl font-bold text-rose-500 tabular-nums leading-none">
                      {data.todayAbsent ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t('absent')}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <IndianRupee size={28} className="text-orange-500 mb-1" />
                <p className="text-xs text-gray-500">{t('today_expense')}</p>
                <p className="text-lg font-bold text-gray-800">{fmt(data.todayExpense)}</p>
              </div>
              <div className="stat-card cursor-pointer" onClick={() => router.push('/projects')}>
                <FolderKanban size={28} className="text-purple-500 mb-1" />
                <p className="text-xs text-gray-500">{t('active_projects')}</p>
                <p className="text-2xl font-bold text-gray-800">{data.activeProjects}</p>
              </div>
              <div className="stat-card cursor-pointer" onClick={() => router.push('/workers')}>
                <Users size={28} className="text-cyan-500 mb-1" />
                <p className="text-xs text-gray-500">{t('active_workers')}</p>
                <p className="text-2xl font-bold text-gray-800">{data.activeWorkers}</p>
              </div>
            </div>

            {data.topProjects?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-700 mb-3">{t('top_projects')}</h3>
                <div className="space-y-2">
                  {data.topProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer active:bg-gray-100"
                      onClick={() => router.push(`/projects/${p.id}/finance`)}
                    >
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <div className="text-right">
                        <span className="text-green-600 text-sm">{fmt(p.totalIncome)}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-500 text-sm">{fmt(p.totalExpense)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.recentTransactions?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-700 mb-3">{t('recent_transactions')}</h3>
                <div className="space-y-2">
                  {data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-700">{tx.name}</p>
                        <p className="text-xs text-gray-400">{tx.label}</p>
                      </div>
                      <span className={`font-bold ${tx.type === 'Debit' ? 'text-red-500' : 'text-green-600'}`}>
                        {tx.type === 'Debit' ? '-' : '+'}{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12 text-gray-400">{t('no_data')}</div>
        )}
      </div>
    </AppShell>
  );
}
