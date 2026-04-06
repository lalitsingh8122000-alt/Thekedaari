'use client';

import { BookOpen, Lightbulb, ListChecks, Camera } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { GUIDE_SECTIONS } from '@/data/guideSections';

export default function HowToUsePage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 pb-28">
        <header className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-white/15">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('app_name')}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{t('guide_page_title')}</h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed border-t border-white/20 pt-4 mt-4">
            {t('guide_page_subtitle')}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
            <Lightbulb className="shrink-0 text-amber-600" size={22} />
            <div>
              <p className="font-bold text-amber-900 mb-1">{t('guide_box_how_to_read_title')}</p>
              <p className="text-amber-900/90 leading-relaxed">{t('guide_box_how_to_read_body')}</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            <Camera className="shrink-0 text-slate-500" size={22} />
            <div>
              <p className="font-bold text-slate-900 mb-1">{t('guide_box_screenshots_title')}</p>
              <p className="text-slate-700 leading-relaxed">{t('guide_tip_screenshots')}</p>
            </div>
          </div>
        </div>

        <ol className="space-y-10 list-none p-0 m-0">
          {GUIDE_SECTIONS.map((sec, i) => {
            const stepsText = t(sec.stepsKey);
            const steps = stepsText.split('\n').map((s) => s.trim()).filter(Boolean);
            return (
              <li
                key={sec.titleKey}
                className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden scroll-mt-4"
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-sky-400" />
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white font-extrabold text-lg shadow-md">
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h2 className="text-xl font-bold text-gray-900 leading-snug">{t(sec.titleKey)}</h2>
                      <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">{t(sec.introKey)}</p>
                    </div>
                  </div>

                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden flex justify-center p-1 sm:p-2">
                    {/* Full-page PNGs: natural height; scale to card width so nothing is cropped */}
                    <img
                      src={sec.image}
                      alt={t(sec.titleKey)}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full h-auto block"
                    />
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-3">
                      <ListChecks size={18} className="text-primary-600" />
                      {t('guide_steps_heading')}
                    </div>
                    <ul className="space-y-2.5 text-sm text-gray-800 leading-relaxed">
                      {steps.map((line, li) => (
                        <li key={`${sec.stepsKey}-${li}`} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                            {li + 1}
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl bg-primary-50 border border-primary-100 px-4 py-5 text-center text-sm text-primary-900 leading-relaxed">
          {t('guide_footer_note')}
        </div>
      </div>
    </AppShell>
  );
}
