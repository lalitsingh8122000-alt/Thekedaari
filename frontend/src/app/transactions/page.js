'use client';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => new Date().toISOString().split('T')[0];

function currentMonthRange() {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth() + 1;
  const last = new Date(y, m, 0).getDate();
  return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(last)}` };
}

const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(String(iso).includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};
const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

const PRESETS = [
  { label: 'Today',      getRange: () => { const t = todayStr(); return { start: t, end: t }; } },
  { label: 'This Week',  getRange: () => {
    const d = new Date(); const dow = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    return { start: mon.toISOString().split('T')[0], end: todayStr() };
  }},
  { label: 'This Month', getRange: currentMonthRange },
  { label: 'Custom',     getRange: null },
];

const TYPE_CONFIG = {
  worker_payment: { label: 'Worker Pay', bg: 'bg-orange-100', text: 'text-orange-600', badgeBg: 'bg-orange-100 text-orange-700', letter: 'W', border: 'border-l-orange-400' },
  manual_ledger:  { label: 'Ledger',     bg: 'bg-amber-100',  text: 'text-amber-700',  badgeBg: 'bg-amber-100 text-amber-700',   letter: 'L', border: 'border-l-amber-400'  },
  expense:        { label: 'Expense',    bg: 'bg-red-100',    text: 'text-red-600',    badgeBg: 'bg-red-100 text-red-700',       letter: 'E', border: 'border-l-red-400'    },
  income:         { label: 'Income',     bg: 'bg-green-100',  text: 'text-green-600',  badgeBg: 'bg-green-100 text-green-700',   letter: 'I', border: 'border-l-green-400'  },
  vendor:         { label: 'Vendor',     bg: 'bg-purple-100', text: 'text-purple-600', badgeBg: 'bg-purple-100 text-purple-700', letter: 'V', border: 'border-l-purple-400' },
};

const FILTERS = [
  { key: 'all',            label: 'All'       },
  { key: 'out',            label: 'Paid Out'  },
  { key: 'in',             label: 'Received'  },
  { key: 'worker_payment', label: 'Workers'   },
  { key: 'expense',        label: 'Expenses'  },
  { key: 'income',         label: 'Income'    },
  { key: 'vendor',         label: 'Vendors'   },
  { key: 'manual_ledger',  label: 'Ledger'    },
];

function EntryIcon({ type }) {
  const c = TYPE_CONFIG[type] || TYPE_CONFIG.expense;
  return (
    <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center shrink-0`}>
      <span className={`font-black text-sm ${c.text}`}>{c.letter}</span>
    </div>
  );
}

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [preset, setPreset] = useState(2); // default This Month
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const range = useMemo(() => {
    if (preset === 3) return { start: customStart, end: customEnd };
    return PRESETS[preset].getRange();
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    if (!range.start || !range.end) return;
    setLoading(true);
    setFilterType('all');
    api.get('/transactions', { params: { startDate: range.start, endDate: range.end } })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range.start, range.end]);

  const filtered = useMemo(() => {
    if (!data?.entries) return [];
    if (filterType === 'all') return data.entries;
    if (filterType === 'out') return data.entries.filter((e) => e.direction === 'out');
    if (filterType === 'in')  return data.entries.filter((e) => e.direction === 'in');
    return data.entries.filter((e) => e.type === filterType);
  }, [data, filterType]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const d = fmtDate(e.date);
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(e);
    });
    return [...map.entries()];
  }, [filtered]);

  const net = (data?.totalIn || 0) - (data?.totalOut || 0);

  return (
    <AppShell>
      <div className="space-y-3 pb-4">

        {/* ── Header ── */}
        <h2 className="page-title flex items-center gap-2">
          <ArrowLeftRight size={22} className="text-primary-600" />
          {t('transactions')}
        </h2>

        {/* ── Date segmented control ── */}
        <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-2xl p-1">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(i)}
              className={`py-2 rounded-xl text-xs font-bold transition-all leading-tight px-1 ${
                preset === i
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Custom range ── */}
        {preset === 3 && (
          <div className="card grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">From</label>
              <input type="date" className="input-field text-sm" value={customStart}
                max={todayStr()} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">To</label>
              <input type="date" className="input-field text-sm" value={customEnd}
                max={todayStr()} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Summary totals ── */}
        {data && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-red-50 border border-red-100 px-3 py-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <ArrowUpCircle size={18} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Paid Out</p>
                  <p className="text-base font-black text-red-600 truncate">{fmt(data.totalOut)}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-green-50 border border-green-100 px-3 py-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <ArrowDownCircle size={18} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Received</p>
                  <p className="text-base font-black text-green-600 truncate">{fmt(data.totalIn)}</p>
                </div>
              </div>
            </div>
            {(data.totalOut > 0 || data.totalIn > 0) && (
              <div className={`rounded-xl px-4 py-2.5 flex items-center justify-between ${
                net >= 0 ? 'bg-blue-50 border border-blue-100' : 'bg-orange-50 border border-orange-100'
              }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className={net >= 0 ? 'text-blue-500' : 'text-orange-500'} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${net >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                    Net Balance
                  </span>
                </div>
                <span className={`text-base font-black ${net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {net >= 0 ? '+' : '-'}{fmt(Math.abs(net))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Filter chips (wrap on mobile) ── */}
        {data?.entries?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(({ key, label }) => {
              const count = key === 'all' ? data.entries.length
                : key === 'out' ? data.entries.filter((e) => e.direction === 'out').length
                : key === 'in'  ? data.entries.filter((e) => e.direction === 'in').length
                : data.entries.filter((e) => e.type === key).length;
              if (count === 0 && key !== 'all') return null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterType(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === key
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`ml-1 text-[10px] ${filterType === key ? 'opacity-80' : 'opacity-60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Transaction list ── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : !filtered.length ? (
          <div className="card text-center py-12 text-gray-400">
            <ArrowLeftRight size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold">No transactions found</p>
            <p className="text-xs mt-1 text-gray-400">Try a different date range or filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, items]) => {
              const dayOut = items.filter((e) => e.direction === 'out').reduce((s, e) => s + e.amount, 0);
              const dayIn  = items.filter((e) => e.direction === 'in').reduce((s, e) => s + e.amount, 0);
              return (
                <div key={date}>
                  {/* Date row */}
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-3 bg-gray-300" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{date}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      {dayOut > 0 && (
                        <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-lg">-{fmt(dayOut)}</span>
                      )}
                      {dayIn > 0 && (
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-lg">+{fmt(dayIn)}</span>
                      )}
                    </div>
                  </div>

                  {/* Entry cards */}
                  <div className="space-y-2">
                    {items.map((item) => {
                      const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.expense;
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 px-3 py-3 border-l-4 ${cfg.border}`}
                        >
                          <EntryIcon type={item.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <p className="font-bold text-sm text-gray-800 truncate">{item.label}</p>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded-lg text-[9px] font-bold ${cfg.badgeBg}`}>
                                {cfg.label}
                              </span>
                            </div>
                            {item.sublabel ? (
                              <p className="text-[11px] text-gray-400 truncate">{item.sublabel}</p>
                            ) : null}
                            {item.note ? (
                              <p className="text-[10px] text-gray-400 italic truncate mt-0.5">{item.note}</p>
                            ) : null}
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-black text-base ${item.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                              {item.direction === 'in' ? '+' : '-'}{fmt(item.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
