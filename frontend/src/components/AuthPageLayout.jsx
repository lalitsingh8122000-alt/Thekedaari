'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Same chrome as the app after login: Navbar uses bg-primary-600, body uses bg-gray-50.
 */
export default function AuthPageLayout({ children, onSwitchLang, langLabel }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header
        className="bg-primary-600 text-white shadow-md shrink-0 z-20"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.6rem)',
          paddingLeft: 'calc(var(--safe-left) + 1rem)',
          paddingRight: 'calc(var(--safe-right) + 1rem)',
          paddingBottom: '0.75rem',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <Image
                src="/thekedaari-logo.png"
                alt=""
                width={48}
                height={48}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
              Thekedaari
            </h1>
          </div>
          <button
            type="button"
            onClick={onSwitchLang}
            className="bg-white/20 text-white font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-sm active:bg-white/30 transition-colors shrink-0"
          >
            {langLabel}
          </button>
        </div>
      </header>

      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10"
        style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + var(--safe-bottom)))' }}
      >
        <div className="w-full max-w-[420px] sm:max-w-[440px] motion-safe:animate-auth-enter">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md px-6 py-7 sm:px-8 sm:py-8">
            {children}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4 px-2 leading-relaxed max-w-md mx-auto">
            {t('auth_footer_tagline')}
          </p>
        </div>
      </div>
    </div>
  );
}
