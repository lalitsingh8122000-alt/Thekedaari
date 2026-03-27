'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { normalizePhone, sanitizePhoneInput, isValidPhone, parsePositiveAmount, PHONE_LENGTH } from '@/lib/validation';

export default function AddWorkerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileRef = useRef();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', costPerDay: '', roleId: '', status: 'Active' });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    api.get('/roles').then((r) => setRoles(r.data)).catch(() => {});
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedPhone = normalizePhone(form.phone);
    const costPerDay = parsePositiveAmount(form.costPerDay);
    if (form.name.trim().length < 2) return setError('Worker name must be at least 2 characters');
    if (!isValidPhone(cleanedPhone)) return setError('Phone number must be exactly 10 digits');
    if (!costPerDay) return setError('Enter a valid cost per day amount');
    if (!form.roleId) return setError('Please select a role');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('phone', cleanedPhone);
      data.append('costPerDay', String(costPerDay));
      data.append('roleId', form.roleId);
      data.append('status', form.status);
      if (photoFile) data.append('photo', photoFile);

      await api.post('/workers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/workers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add worker');
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
          <h2 className="page-title">{t('add_worker')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400" />
              )}
            </button>
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div>
            <label className="label">{t('worker_name')}</label>
            <input type="text" className="input-field" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="label">{t('phone')}</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })} inputMode="numeric" pattern="\d{10}" maxLength={PHONE_LENGTH} required />
          </div>

          <div>
            <label className="label">{t('cost_per_day')} (₹)</label>
            <input type="number" min="1" step="0.01" className="input-field" value={form.costPerDay} onChange={(e) => setForm({ ...form, costPerDay: e.target.value })} required />
          </div>

          <div>
            <label className="label">{t('select_role')}</label>
            {roles.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id} type="button" onClick={() => setForm({ ...form, roleId: r.id })}
                    className={`py-3 rounded-xl font-semibold transition-colors ${
                      form.roleId === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t('no_data')} - <button type="button" onClick={() => router.push('/roles')} className="text-primary-600 underline">{t('add_role')}</button></p>
            )}
          </div>

          <div>
            <label className="label">{t('status')}</label>
            <div className="grid grid-cols-2 gap-2">
              {['Active', 'Inactive'].map((s) => (
                <button
                  key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                  className={`py-3 rounded-xl font-semibold text-lg ${
                    form.status === s ? s === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s === 'Active' ? t('active') : t('inactive')}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={20} /> {loading ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
