'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

export default function EditWorkerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const fileRef = useRef();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', costPerDay: '', roleId: '', status: '' });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([api.get(`/workers/${id}`), api.get('/roles')]).then(([w, r]) => {
      setRoles(r.data);
      const worker = w.data;
      setForm({ name: worker.name, phone: worker.phone, costPerDay: worker.costPerDay, roleId: worker.roleId, status: worker.status });
      if (worker.photo) setPreview(`${API_BASE}${worker.photo}`);
    }).catch(() => router.push('/workers')).finally(() => setLoading(false));
  }, [id]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('phone', form.phone);
      data.append('costPerDay', form.costPerDay);
      data.append('roleId', form.roleId);
      data.append('status', form.status);
      if (photoFile) data.append('photo', photoFile);
      await api.put(`/workers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/workers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <AppShell><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200"><ArrowLeft size={22} /></button>
          <h2 className="page-title">{t('edit_worker')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div className="flex justify-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={32} className="text-gray-400" />}
            </button>
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div>
            <label className="label">{t('worker_name')}</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('phone')}</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('cost_per_day')} (₹)</label>
            <input type="number" className="input-field" value={form.costPerDay} onChange={(e) => setForm({ ...form, costPerDay: e.target.value })} required />
          </div>

          <div>
            <label className="label">{t('select_role')}</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button key={r.id} type="button" onClick={() => setForm({ ...form, roleId: r.id })}
                  className={`py-3 rounded-xl font-semibold ${form.roleId === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {r.name}
                </button>
              ))}
            </div>
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
