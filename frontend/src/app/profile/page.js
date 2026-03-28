'use client';

import { Phone, Calendar, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import InstallAppSection from '@/components/InstallAppSection';

export default function ProfilePage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <User className="text-primary-600" size={28} />
        {t('profile')}
      </h1>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white text-primary-700 font-bold text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            {initial}
          </div>
          <h2 className="text-white font-bold text-xl">{user.name}</h2>
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
    </div>
  );
}
