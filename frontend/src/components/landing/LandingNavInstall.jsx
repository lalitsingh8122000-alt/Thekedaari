'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { isLikelyIOS, isLikelyAndroid } from '@/lib/pwaPlatform';
import { getDeferredPrompt, checkStandalone } from '@/lib/pwaInstallStore';

export default function LandingNavInstall() {
  const { lang, t } = useLanguage();
  const [installHintOpen, setInstallHintOpen] = useState(false);
  const { isInstalled, installing, promptInstall } = usePwaInstall();
  const installHintTimerRef = useRef(null);
  const hi = lang === 'hi';

  useEffect(() => {
    return () => {
      if (installHintTimerRef.current) {
        clearTimeout(installHintTimerRef.current);
        installHintTimerRef.current = null;
      }
    };
  }, []);

  const handleInstall = async () => {
    if (installHintTimerRef.current) {
      clearTimeout(installHintTimerRef.current);
      installHintTimerRef.current = null;
    }
    setInstallHintOpen(false);

    const shown = await promptInstall();
    if (shown) return;

    installHintTimerRef.current = setTimeout(() => {
      installHintTimerRef.current = null;
      if (checkStandalone()) return;
      if (getDeferredPrompt()) return;
      setInstallHintOpen(true);
    }, 500);
  };

  if (isInstalled) {
    return (
      <div className="landing-nav-installed">
        <CheckCircle size={16} className="landing-nav-installed-icon" aria-hidden />
        <span className="landing-nav-installed-text">{hi ? 'ऐप इंस्टॉल है' : 'App installed'}</span>
      </div>
    );
  }

  return (
    <div className="landing-nav-install-root">
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className={`landing-nav-install-btn${installing ? ' landing-nav-install-btn-busy' : ''}`}
        aria-label={t('install_app')}
      >
        <Download size={17} className="landing-nav-install-icon" aria-hidden />
        <span className="landing-nav-install-label">
          {installing ? (hi ? 'इंस्टॉल…' : 'Installing…') : t('install_app')}
        </span>
      </button>
      {installHintOpen && (
        <div className="landing-nav-install-hint" role="status">
          <p className="landing-nav-install-hint-intro">{t('install_fallback_intro')}</p>
          {isLikelyIOS() && (
            <p className="landing-nav-install-hint-line">
              {hi
                ? 'Safari → शेयर (□↑) →「होम स्क्रीन में जोड़ें」'
                : 'Safari: Share → Add to Home Screen.'}
            </p>
          )}
          {isLikelyAndroid() && (
            <p className="landing-nav-install-hint-line">
              {hi
                ? 'Chrome: ⋮ मेनू →「ऐप इंस्टॉल करें」या「होम स्क्रीन में जोड़ें」'
                : 'Chrome: ⋮ menu → Install app or Add to Home screen.'}
            </p>
          )}
          {!isLikelyIOS() && !isLikelyAndroid() && (
            <p className="landing-nav-install-hint-line">{t('install_desktop_hint')}</p>
          )}
        </div>
      )}
    </div>
  );
}
