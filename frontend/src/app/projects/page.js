'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, IndianRupee, FolderKanban, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  const load = () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    api.get('/projects', { params }).then((r) => setProjects(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterType]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const typ = (p.type || '').toLowerCase();
      const st = (p.status || '').toLowerCase();
      return name.includes(q) || typ.includes(q) || st.includes(q);
    });
  }, [projects, search]);

  const statusColor = (s) => (s === 'Running' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600');
  const typeLabel = (type) => ({ Small: t('small'), Medium: t('medium'), Big: t('big') }[type] || type);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="page-title">{t('projects')}</h2>
          <button onClick={() => router.push('/projects/add')} className="btn-primary flex items-center gap-2 py-2 px-4">
            <Plus size={20} /> {t('add_project')}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['', 'Running', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {s === '' ? t('all') : s === 'Running' ? t('running') : t('completed')}
            </button>
          ))}
          <div className="border-l mx-1" />
          {['', 'Small', 'Medium', 'Big'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filterType === type ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {type === '' ? t('all') : typeLabel(type)}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_projects_placeholder')}
            className="w-full input-field pl-10 py-2.5 text-base"
            autoComplete="off"
            aria-label={t('search')}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card text-center py-12">
            <FolderKanban size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_data')}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card text-center py-10">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">{t('no_search_matches')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((p) => (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(p.status)}`}>
                        {p.status === 'Running' ? t('running') : t('completed')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {typeLabel(p.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/projects/${p.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-700 font-semibold active:bg-gray-200"
                  >
                    <Pencil size={18} /> {t('edit')}
                  </button>
                  <button
                    onClick={() => router.push(`/projects/${p.id}/finance`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl text-green-700 font-semibold active:bg-green-100"
                  >
                    <IndianRupee size={18} /> {t('finance')}
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
