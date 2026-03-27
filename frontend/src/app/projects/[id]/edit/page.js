'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function EditProjectPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', startDate: '', expectedEndDate: '', type: '', status: '' });

  useEffect(() => {
    api.get(`/projects/${id}`).then((r) => {
      const p = r.data;
      setForm({
        name: p.name,
        startDate: p.startDate?.split('T')[0],
        expectedEndDate: p.expectedEndDate?.split('T')[0],
        type: p.type,
        status: p.status,
      });
    }).catch(() => router.push('/projects')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/projects/${id}`, form);
      router.push('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="page-title">{t('edit_project')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div>
            <label className="label">{t('project_name')}</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('start_date')}</label>
              <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('end_date')}</label>
              <input type="date" className="input-field" value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="label">{t('project_type')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Small', 'Medium', 'Big'].map((type) => (
                <button
                  key={type} type="button" onClick={() => setForm({ ...form, type })}
                  className={`py-3 rounded-xl font-semibold text-lg transition-colors ${form.type === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {type === 'Small' ? t('small') : type === 'Medium' ? t('medium') : t('big')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('project_status')}</label>
            <div className="grid grid-cols-2 gap-2">
              {['Running', 'Completed'].map((s) => (
                <button
                  key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                  className={`py-3 rounded-xl font-semibold text-lg transition-colors ${
                    form.status === s
                      ? s === 'Running' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s === 'Running' ? t('running') : t('completed')}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={20} /> {saving ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
