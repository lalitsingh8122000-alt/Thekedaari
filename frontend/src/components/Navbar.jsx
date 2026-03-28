'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Phone, Calendar, Download, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

let savedPrompt = null;

export default function Navbar({ onMenuClick }) {
  const { lang, switchLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    if (savedPrompt) setDeferredPrompt(savedPrompt);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      savedPrompt = e;
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      savedPrompt = null;
      setInstalling(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || savedPrompt;
    if (prompt) {
      setInstalling(true);
      try {
        prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch {}
      setDeferredPrompt(null);
      savedPrompt = null;
      setInstalling(false);
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const canInstall = !isInstalled && Boolean(deferredPrompt || savedPrompt);

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
                    {canInstall && (
                      <button
                        onClick={handleInstallClick}
                        disabled={installing}
                        className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 rounded-xl font-semibold transition-colors shadow-sm"
                      >
                        <Download size={18} />
                        {installing
                          ? (lang === 'hi' ? 'इंस्टॉल हो रहा है...' : 'Installing...')
                          : (lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App')}
                      </button>
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
