'use client';

import { useRouter } from 'next/navigation';
import { Phone, Calendar, User, LogOut, X, Crown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDate } from '@/lib/subscription';
import InstallAppSection from '@/components/InstallAppSection';

export default function ProfileModal({ open, onClose }) {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();
  const { status, locked } = useSubscription();
  const router = useRouter();

  if (!open || !user) return null;

  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  const handleLogout = () => {
    onClose();
    logout();
  };

  const openSubscription = () => {
    onClose();
    router.push('/subscription');
  };

  const planState = status?.status || 'none';
  const planLabel =
    status?.currentSubscription?.planName ||
    (planState === 'legacy'
      ? t('sub_status_founder')
      : planState === 'trial'
        ? t('sub_status_trial')
        : locked
          ? t('sub_status_no_plan')
          : t('sub_status_active'));

  return (
    <div className="modal-overlay z-[60] items-center sm:items-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-auth-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="text-primary-600" size={22} />
            {t('profile')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            aria-label={t('cancel')}
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-white text-primary-700 font-bold text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                {initial}
              </div>
              <h3 className="text-white font-bold text-xl">{user.name}</h3>
            </div>
            <div className="p-5 space-y-4">
              {user.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} className="text-primary-500 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={20} className="text-primary-500 flex-shrink-0" />
                  <span>
                    {t('member_since')}{' '}
                    {new Date(user.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={openSubscription}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              locked
                ? 'border-red-200 bg-red-50 hover:bg-red-100'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                locked ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              <Crown size={20} strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">{t('subscription')}</p>
              <p className="truncate font-bold text-gray-900">{planLabel}</p>
              {status?.expiresAt && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {status.isActive ? t('sub_valid_until') : t('sub_ended_on')}{' '}
                  {formatDate(status.expiresAt, lang)}
                </p>
              )}
            </div>
            <ChevronRight size={20} className="shrink-0 text-gray-400" aria-hidden />
          </button>

          <InstallAppSection lang={lang} t={t} />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl font-semibold border border-red-100 transition-colors"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
