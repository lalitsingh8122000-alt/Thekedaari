'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import {
  normalizeText,
  normalizePhone,
  sanitizePhoneInput,
  isValidPhone,
  parsePositiveAmount,
  parseNonNegativeAmount,
  PHONE_LENGTH,
  roleNameIsContractor,
  CONTRACTOR_ROLE_NAME,
} from '@/lib/validation';

const ADD_NEW_TRADE = '__add_new__';

export default function EditWorkerPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const fileRef = useRef();
  const [roles, setRoles] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', costPerDay: '', roleId: '', status: '', contractTradeId: '',
  });
  const [newTradeName, setNewTradeName] = useState('');
  const [addingTrade, setAddingTrade] = useState(false);
  const [tradeSaving, setTradeSaving] = useState(false);
  const [roleBootstrapping, setRoleBootstrapping] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  const isContractor = useMemo(() => {
    const role = roles.find((x) => String(x.id) === String(form.roleId));
    return roleNameIsContractor(role?.name);
  }, [roles, form.roleId]);

  const hasContractorRole = useMemo(
    () => roles.some((r) => roleNameIsContractor(r.name)),
    [roles],
  );

  const ensureContractorRoleAndSelect = async () => {
    setError('');
    setRoleBootstrapping(true);
    try {
      let list = roles;
      if (!list.some((r) => roleNameIsContractor(r.name))) {
        try {
          await api.post('/roles', { name: CONTRACTOR_ROLE_NAME });
        } catch {
          /* ignore */
        }
        const rr = await api.get('/roles');
        list = rr.data || [];
        setRoles(list);
      }
      const cr = list.find((r) => roleNameIsContractor(r.name));
      if (!cr) {
        setError(t('contractor_role_create_failed'));
        return;
      }
      setAddingTrade(false);
      setNewTradeName('');
      setForm((f) => ({
        ...f,
        roleId: String(cr.id),
        contractTradeId: '',
      }));
    } finally {
      setRoleBootstrapping(false);
    }
  };

  const addTradeInline = async () => {
    const name = normalizeText(newTradeName);
    if (name.length < 2) {
      setError(t('trade_name_min'));
      return;
    }
    setError('');
    setTradeSaving(true);
    try {
      const { data: created } = await api.post('/contract-trades', { name });
      const tr = await api.get('/contract-trades');
      setTrades(tr.data || []);
      setAddingTrade(false);
      setForm((f) => ({ ...f, contractTradeId: String(created.id) }));
      setNewTradeName('');
    } catch (err) {
      setError(err.response?.data?.error || t('trade_add_failed'));
    } finally {
      setTradeSaving(false);
    }
  };

  useEffect(() => {
    Promise.all([api.get(`/workers/${id}`), api.get('/roles'), api.get('/contract-trades')])
      .then(([w, r, tr]) => {
        setRoles(r.data);
        setTrades(tr.data || []);
        const worker = w.data;
        setForm({
          name: worker.name,
          phone: worker.phone,
          costPerDay: worker.costPerDay,
          roleId: worker.roleId,
          status: worker.status,
          contractTradeId: worker.contractTradeId != null ? String(worker.contractTradeId) : '',
        });
        if (worker.photo) setPreview(`${API_BASE}${worker.photo}`);
      })
      .catch(() => router.push('/workers'))
      .finally(() => setLoading(false));
  }, [id]);

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
    const costPerDay = isContractor
      ? parseNonNegativeAmount(form.costPerDay)
      : parsePositiveAmount(form.costPerDay);
    if (form.name.trim().length < 2) return setError('Worker name must be at least 2 characters');
    if (!isValidPhone(cleanedPhone)) return setError('Phone number must be exactly 10 digits');
    if (costPerDay === null) {
      return setError(isContractor ? t('cost_contractor_hint') : 'Enter a valid cost per day amount');
    }
    if (!form.roleId) return setError('Please select a role');
    if (isContractor && !form.contractTradeId) return setError(t('contract_trade_required'));
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('phone', cleanedPhone);
      data.append('costPerDay', String(costPerDay));
      data.append('roleId', form.roleId);
      data.append('status', form.status);
      data.append('contractTradeId', isContractor ? String(form.contractTradeId) : '');
      if (photoFile) data.append('photo', photoFile);
      await api.put(`/workers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push('/workers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
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
          <button type="button" onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200"><ArrowLeft size={22} /></button>
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
            <input type="text" className="input-field" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t('phone')}</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })} inputMode="numeric" pattern="\d{10}" maxLength={PHONE_LENGTH} required />
          </div>

          <div>
            <label className="label">{t('select_role')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (!roleNameIsContractor(r.name)) {
                      setAddingTrade(false);
                      setNewTradeName('');
                    }
                    setForm((f) => ({
                      ...f,
                      roleId: String(r.id),
                      contractTradeId: roleNameIsContractor(r.name) ? f.contractTradeId : '',
                    }));
                  }}
                  className={`py-3 rounded-xl font-semibold text-sm ${
                    String(form.roleId) === String(r.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {r.name}
                </button>
              ))}
              {!hasContractorRole && (
                <button
                  type="button"
                  disabled={roleBootstrapping}
                  onClick={ensureContractorRoleAndSelect}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900 disabled:opacity-60"
                >
                  {roleBootstrapping ? t('loading') : `+ ${t('contractor')}`}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('contractor_role_hint')}</p>
          </div>

          {isContractor && (
            <div className="space-y-2">
              <label className="label">{t('theka_subcategory')}</label>
              <select
                className="input-field"
                value={addingTrade ? ADD_NEW_TRADE : (form.contractTradeId || '')}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === ADD_NEW_TRADE) {
                    setAddingTrade(true);
                    setNewTradeName('');
                    setForm((f) => ({ ...f, contractTradeId: '' }));
                    return;
                  }
                  setAddingTrade(false);
                  setNewTradeName('');
                  setForm((f) => ({ ...f, contractTradeId: v }));
                }}
              >
                <option value="">{t('select_trade')}</option>
                {trades.map((tr) => (
                  <option key={tr.id} value={tr.id}>{tr.name}</option>
                ))}
                <option value={ADD_NEW_TRADE}>{t('theka_add_new_option')}</option>
              </select>
              {addingTrade && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 bg-white"
                    maxLength={100}
                    value={newTradeName}
                    placeholder={t('theka_new_type_placeholder')}
                    onChange={(e) => setNewTradeName(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    disabled={tradeSaving}
                    onClick={addTradeInline}
                    className="btn-primary py-2.5 px-4 font-semibold text-sm whitespace-nowrap disabled:opacity-50 sm:shrink-0"
                  >
                    {tradeSaving ? t('loading') : t('theka_add_use')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">{t('cost_per_day')} (₹)</label>
            <input
              type="number"
              min={isContractor ? '0' : '1'}
              step="0.01"
              className="input-field"
              value={form.costPerDay}
              onChange={(e) => setForm({ ...form, costPerDay: e.target.value })}
              required
            />
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
