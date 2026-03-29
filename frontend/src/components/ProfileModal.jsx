'use client';

import { Phone, Calendar, User, LogOut, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import InstallAppSection from '@/components/InstallAppSection';

export default function ProfileModal({ open, onClose }) {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();

  if (!open || !user) return null;

  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  const handleLogout = () => {
    onClose();
    logout();
  };

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
