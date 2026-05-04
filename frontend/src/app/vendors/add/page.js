'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function AddVendorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (form.name.trim().length < 2) return setError('Vendor name must be at least 2 characters');
    setLoading(true);
    try {
      await api.post('/vendors', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
      router.push('/vendors');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="page-title">{t('add_vendor')}</h2>
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

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={20} /> {loading ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
