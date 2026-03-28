'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Phone, Calendar, Download, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { isLikelyIOS, isLikelyAndroid } from '@/lib/pwaPlatform';

export default function Navbar({ onMenuClick }) {
  const { lang, switchLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [installHintOpen, setInstallHintOpen] = useState(false);
  const { canInstall, isInstalled, installing, promptInstall } = usePwaInstall();
  const profileRef = useRef(null);
  const hi = lang === 'hi';

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

  useEffect(() => {
    if (!profileOpen) setInstallHintOpen(false);
  }, [profileOpen]);

  const handleProfileInstall = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    setInstallHintOpen((v) => !v);
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header
      className="bg-primary-600 text-white sticky top-0 z-50 shadow-md"
      style={{
        paddingTop: 'calc(var(--safe-top) + 0.6rem)',
        paddingLeft: 'calc(var(--safe-left) + 1rem)',
        paddingRight: 'calc(var(--safe-right) + 1rem)',
        paddingBottom: '0.75rem',
      }}
    >
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-1 rounded-lg active:bg-primary-700">
          <Menu size={26} />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Thekedaari</h1>
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
                    {!isInstalled && (
                      <div className="mt-1 space-y-2">
                        <button
                          type="button"
                          onClick={handleProfileInstall}
                          disabled={installing}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-60 ${
                            canInstall
                              ? 'text-white bg-green-600 hover:bg-green-700 active:bg-green-800'
                              : 'text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 active:bg-green-100/80'
                          }`}
                        >
                          <Download size={18} />
                          {installing ? (hi ? 'इंस्टॉल हो रहा है...' : 'Installing...') : t('install_app')}
                        </button>
                        {installHintOpen && !canInstall && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 space-y-2">
                            {isLikelyIOS() && (
                              <p>
                                {hi
                                  ? 'Safari → शेयर (□↑) →「होम स्क्रीन में जोड़ें」'
                                  : 'Safari: Share → Add to Home Screen.'}
                              </p>
                            )}
                            {isLikelyAndroid() && (
                              <p>
                                {hi
                                  ? 'Chrome: ⋮ मेनू →「ऐप इंस्टॉल करें」या「होम स्क्रीन में जोड़ें」'
                                  : 'Chrome: ⋮ menu → Install app or Add to Home screen.'}
                              </p>
                            )}
                            {!isLikelyIOS() && !isLikelyAndroid() && (
                              <p>{t('install_desktop_hint')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {isInstalled && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        {lang === 'hi' ? 'ऐप इंस्टॉल है' : 'App Installed'}
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
      </div>
    </header>
  );
}
