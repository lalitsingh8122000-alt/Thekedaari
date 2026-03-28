'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { isLikelyIOS, isLikelyAndroid } from '@/lib/pwaPlatform';
import { getDeferredPrompt, checkStandalone } from '@/lib/pwaInstallStore';

export default function InstallAppSection({ lang, t }) {
  const { isInstalled, installing, promptInstall } = usePwaInstall();
  const [showManual, setShowManual] = useState(false);
  const timerRef = useRef(null);
  const hi = lang === 'hi';

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (isInstalled) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-semibold text-green-800">{hi ? 'ऐप इंस्टॉल है' : 'App is installed'}</p>
          <p className="text-sm text-green-700/90 mt-1">
            {hi
              ? 'आप होम स्क्रीन से Thekedaari खोल रहे हैं।'
              : 'You are using Thekedaari from your home screen.'}
          </p>
        </div>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowManual(false);

    const shown = await promptInstall();
    if (shown) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (checkStandalone()) return;
      if (getDeferredPrompt()) return;
      setShowManual(true);
    }, 500);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center gap-2 text-white">
        <Smartphone size={20} />
        <span className="font-semibold">{hi ? 'फ़ोन पर ऐप की तरह' : 'Use like an app'}</span>
      </div>
      <div className="p-4 space-y-4">
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 transition-colors shadow-sm"
        >
          <Download size={20} />
          {installing ? (hi ? 'इंस्टॉल हो रहा है...' : 'Installing...') : t('install_app')}
        </button>

        {showManual && (
          <>
            <p className="text-sm text-gray-700 font-medium">{t('install_fallback_intro')}</p>
            {isLikelyIOS() && (
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800">{hi ? 'iPhone / iPad' : 'iPhone / iPad'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>{hi ? 'Safari में शेयर बटन (□↑) पर टैप करें।' : 'Tap the Share button (square with arrow) in Safari.'}</li>
                  <li>
                    {hi ? '「होम स्क्रीन में जोड़ें」 चुनें।' : 'Choose “Add to Home Screen”.'}
                  </li>
                </ol>
              </div>
            )}

            {isLikelyAndroid() && (
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800">{hi ? 'Android (Chrome)' : 'Android (Chrome)'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>{hi ? 'ऊपर दाईं ओर ⋮ मेनू खोलें।' : 'Open the ⋮ menu (top right).'}</li>
                  <li>
                    {hi
                      ? '「ऐप इंस्टॉल करें」 या 「इंस्टॉल ऐप」 पर टैप करें।'
                      : 'Tap “Install app” or “Add to Home screen”.'}
                  </li>
                </ol>
                <p className="text-xs text-gray-500 pt-1">{t('install_android_hint')}</p>
              </div>
            )}

            {!isLikelyIOS() && !isLikelyAndroid() && (
              <p className="text-sm text-gray-600">{t('install_desktop_hint')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
