'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Phone, Calendar, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { lang, switchLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileOpen]);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-1 rounded-lg active:bg-primary-700">
          <Menu size={26} />
        </button>
        <h1 className="text-xl font-bold">{t('app_name')}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
          className="bg-white/20 text-white font-semibold px-3 py-1.5 rounded-full text-sm active:bg-white/30 transition-colors"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>

        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-white text-primary-700 font-bold text-lg flex items-center justify-center ring-2 ring-white/40 hover:ring-white/70 transition-all"
            >
              {initial}
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-white text-primary-700 font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {initial}
                    </div>
                    <h3 className="text-white font-bold text-lg">{user.name}</h3>
                  </div>

                  <div className="p-4 space-y-3">
                    {user.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={18} className="text-primary-500 flex-shrink-0" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    {user.createdAt && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar size={18} className="text-primary-500 flex-shrink-0" />
                        <span className="text-sm">
                          {t('member_since')}: {new Date(user.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl font-semibold transition-colors"
                    >
                      <LogOut size={18} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
