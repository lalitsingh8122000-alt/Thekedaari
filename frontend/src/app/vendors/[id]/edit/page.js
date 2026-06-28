'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function EditVendorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '', status: 'Active' });

  useEffect(() => {
    api.get(`/vendors/${id}`)
      .then((r) => {
        const v = r.data;
        setForm({ name: v.name, phone: v.phone || '', address: v.address || '', notes: v.notes || '', status: v.status });
      })
      .catch(() => router.push('/vendors'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    if (form.name.trim().length < 2) return setError('Vendor name must be at least 2 characters');
    setSaving(true);
    try {
      await api.put(`/vendors/${id}`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        status: form.status,
      });
      router.push('/vendors');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vendor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppShell><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="page-title">{t('edit_vendor')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div>
            <label className="label">{t('vendor_name')}</label>
            <input type="text" className="input-field" maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="label">{t('vendor_phone')}</label>
            <input type="tel" className="input-field" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <label className="label">{t('vendor_address')}</label>
            <input type="text" className="input-field" maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div>
            <label className="label">{t('vendor_notes')}</label>
            <textarea className="input-field" rows={3} maxLength={2000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div>
            <label className="label">{t('status')}</label>
            <div className="grid grid-cols-2 gap-2">
              {['Active', 'Inactive'].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                  className={`py-3 rounded-xl font-semibold text-lg ${form.status === s ? s === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {s === 'Active' ? t('active') : t('inactive')}
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
