'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Store, BookOpen, Pencil, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  const load = () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    api.get('/vendors', { params })
      .then((r) => setVendors(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      const name = (v.name || '').toLowerCase();
      const phone = (v.phone || '');
      if (name.includes(q)) return true;
      if (q.length >= 2 && phone.includes(q)) return true;
      return false;
    });
  }, [vendors, search]);

  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="page-title">{t('vendors')}</h2>
          <button onClick={() => router.push('/vendors/add')} className="btn-primary flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 text-sm sm:text-base">
            <Plus size={18} /> {t('add_vendor')}
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('vendor_name')}
            className="w-full input-field pl-10 py-2.5 text-base"
            autoComplete="off"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="card text-center py-12">
            <Store size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_vendors')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">{t('no_search_matches')}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filtered.map((v) => (
              <div key={v.id} className="card">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg sm:text-xl flex-shrink-0">
                    {v.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{v.name}</h3>
                    {v.phone && <p className="text-xs sm:text-sm text-gray-500">{v.phone}</p>}
                    {v.address && <p className="text-xs text-gray-400 truncate">{v.address}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {v.status === 'Active' ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    onClick={() => router.push(`/vendors/${v.id}/ledger`)}
                    className="flex flex-col items-center gap-0.5 py-2 sm:py-3 bg-purple-50 rounded-xl text-purple-700 font-semibold active:bg-purple-100"
                  >
                    <BookOpen size={18} />
                    <span className="text-[10px] sm:text-xs">{t('vendor_ledger')}</span>
                  </button>
                  <button
                    onClick={() => router.push(`/vendors/${v.id}/edit`)}
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
    </AppShell>
  );
}
