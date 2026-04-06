'use client';
import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, X, Users, Brush, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { normalizeText } from '@/lib/validation';

const quickRoles = ['Labour', 'Karigar', 'Supervisor', 'Contractor'];

const quickTradeNames = ['Color', 'Furniture', 'Marble', 'Plumbing', 'Steel', 'Electrical', 'POP'];

function quickRoleLabel(r, t) {
  if (r === 'Labour') return t('labour');
  if (r === 'Karigar') return t('karigar');
  if (r === 'Supervisor') return t('supervisor');
  if (r === 'Contractor') return t('contractor');
  return r;
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [saving, setSaving] = useState(false);
  const [tradeSaving, setTradeSaving] = useState(false);
  const [customTradeName, setCustomTradeName] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const loadRoles = () =>
    api.get('/roles').then((r) => setRoles(r.data)).catch(() => {});

  const loadTrades = () =>
    api.get('/contract-trades').then((r) => setTrades(r.data || [])).catch(() => setTrades([]));

  const load = () => {
    setLoading(true);
    Promise.all([loadRoles(), loadTrades()]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addRole = async (name) => {
    const cleanName = normalizeText(name);
    if (!cleanName) return;
    if (cleanName.length < 2) {
      setError('Role name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/roles', { name: cleanName });
      setRoleName('');
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add role');
    } finally {
      setSaving(false);
    }
  };

  const addTrade = async (tradeName) => {
    const cleanName = normalizeText(tradeName);
    if (!cleanName || cleanName.length < 2) return;
    setTradeSaving(true);
    try {
      await api.post('/contract-trades', { name: cleanName });
      loadTrades();
    } catch {
      /* ignore */
    } finally {
      setTradeSaving(false);
    }
  };

  const addCustomTrade = async () => {
    const cleanName = normalizeText(customTradeName);
    if (!cleanName || cleanName.length < 2) return;
    setTradeSaving(true);
    try {
      await api.post('/contract-trades', { name: cleanName });
      setCustomTradeName('');
      loadTrades();
    } catch {
      /* ignore */
    } finally {
      setTradeSaving(false);
    }
  };

  const removeTrade = async (tradeId) => {
    if (!confirm(t('confirm_delete_trade'))) return;
    try {
      await api.delete(`/contract-trades/${tradeId}`);
      loadTrades();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete');
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="page-title">{t('roles')}</h2>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4">
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
            <div className="flex flex-wrap gap-2 justify-center">
              {quickRoles.map((r) => (
                <button key={r} type="button" onClick={() => addRole(r)} className="btn-outline py-2 px-4">
                  {quickRoleLabel(r, t)}
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

        <div className="card space-y-3 border border-amber-100 bg-amber-50/40">
          <div className="flex items-start gap-2">
            <Brush size={22} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-800">{t('roles_theka_section_title')}</h3>
              <p className="text-xs text-gray-600 mt-0.5">{t('roles_theka_section_hint')}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500">{t('quick_add_trades')}</p>
          <div className="flex flex-wrap gap-2">
            {quickTradeNames.map((q) => (
              <button
                key={q}
                type="button"
                disabled={tradeSaving}
                onClick={() => addTrade(q)}
                className="py-2 px-3 rounded-xl text-sm font-semibold bg-white border border-amber-200 text-amber-900 active:bg-amber-100 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="input-field flex-1"
              maxLength={100}
              value={customTradeName}
              placeholder={t('roles_custom_trade_placeholder')}
              onChange={(e) => setCustomTradeName(e.target.value)}
            />
            <button
              type="button"
              disabled={tradeSaving}
              onClick={addCustomTrade}
              className="btn-outline py-2.5 px-4 font-semibold text-sm whitespace-nowrap disabled:opacity-50"
            >
              {t('roles_custom_trade_button')}
            </button>
          </div>
          {trades.length === 0 ? (
            <p className="text-sm text-gray-500">{t('roles_theka_empty')}</p>
          ) : (
            <ul className="space-y-1.5">
              {trades.map((tr) => (
                <li key={tr.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="font-medium text-gray-800">{tr.name}</span>
                  {(tr._count?.workers === 0 && tr._count?.expenses === 0) ? (
                    <button type="button" onClick={() => removeTrade(tr.id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      {tr._count?.workers ?? 0} · {tr._count?.expenses ?? 0}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('add_role')}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1"><X size={24} /></button>
            </div>
            {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}

            <p className="text-gray-500 text-sm">Quick add / जल्दी जोड़ें:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => addRole(r)}
                  className="py-3 rounded-xl font-semibold bg-primary-50 text-primary-700 active:bg-primary-100"
                >
                  {quickRoleLabel(r, t)}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="label">{t('role_name')}</label>
              <input type="text" className="input-field" maxLength={100} value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            </div>

            <button type="button" onClick={() => addRole(roleName)} disabled={!roleName || saving} className="btn-primary w-full">
              {saving ? t('loading') : t('save')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
