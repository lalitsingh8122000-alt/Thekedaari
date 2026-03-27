'use client';
import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, X, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const load = () => {
    api.get('/roles').then((r) => setRoles(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const quickRoles = ['Labour', 'Karigar', 'Supervisor'];

  const addRole = async (name) => {
    if (!name) return;
    setSaving(true);
    try {
      await api.post('/roles', { name });
      setRoleName('');
      setShowModal(false);
      setLoading(true);
      load();
    } catch {} finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="page-title">{t('roles')}</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4">
            <Plus size={20} /> {t('add_role')}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : roles.length === 0 ? (
          <div className="card text-center py-12">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg mb-4">{t('no_data')}</p>
            <p className="text-gray-500 mb-4">Quick add / जल्दी जोड़ें:</p>
            <div className="flex gap-2 justify-center">
              {quickRoles.map((r) => (
                <button key={r} onClick={() => addRole(r)} className="btn-outline py-2 px-4">
                  {r === 'Labour' ? t('labour') : r === 'Karigar' ? t('karigar') : t('supervisor')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((r) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{r.name}</h3>
                    <p className="text-xs text-gray-400">
                      {t('created_date')}: {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={16} />
                  <span className="text-sm font-medium">{r._count?.workers || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('add_role')}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X size={24} /></button>
            </div>

            <p className="text-gray-500 text-sm">Quick add / जल्दी जोड़ें:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickRoles.map((r) => (
                <button key={r} onClick={() => addRole(r)}
                  className="py-3 rounded-xl font-semibold bg-primary-50 text-primary-700 active:bg-primary-100"
                >
                  {r === 'Labour' ? t('labour') : r === 'Karigar' ? t('karigar') : t('supervisor')}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="label">{t('role_name')}</label>
              <input type="text" className="input-field" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            </div>

            <button onClick={() => addRole(roleName)} disabled={!roleName || saving} className="btn-primary w-full">
              {saving ? t('loading') : t('save')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
