'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { isValidDateInput } from '@/lib/validation';

export default function AddProjectPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    type: 'Medium',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanName = form.name.trim();
    if (cleanName.length < 2) return setError('Project name must be at least 2 characters');
    if (!isValidDateInput(form.startDate)) {
      return setError('Please enter a valid start date');
    }
    setLoading(true);
    try {
      await api.post('/projects', { name: cleanName, startDate: form.startDate, type: form.type });
      router.push('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="page-title">{t('add_project')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div>
            <label className="label">{t('project_name')}</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              maxLength={200}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">{t('start_date')}</label>
            <input
              type="date"
              className="input-field"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">{t('project_type')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Small', 'Medium', 'Big'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`py-3 rounded-xl font-semibold text-lg transition-colors ${
                    form.type === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  }`}
                >
                  {type === 'Small' ? t('small') : type === 'Medium' ? t('medium') : t('big')}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
