'use client';

import { BookOpen, Lightbulb, ListChecks, Smartphone } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { GUIDE_SECTIONS } from '@/data/guideSections';

const SECTION_COLORS = [
  'from-blue-500 to-blue-700',
  'from-indigo-500 to-indigo-700',
  'from-violet-500 to-violet-700',
  'from-sky-500 to-sky-700',
  'from-teal-500 to-teal-700',
  'from-emerald-500 to-emerald-700',
  'from-green-500 to-green-700',
  'from-amber-500 to-amber-700',
  'from-orange-500 to-orange-700',
  'from-rose-500 to-rose-700',
  'from-pink-500 to-pink-700',
  'from-purple-500 to-purple-700',
];

export default function HowToUsePage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-5 pb-28">

        {/* ── Hero header ── */}
        <header className="rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white px-5 pt-6 pb-5 shadow-lg relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute bottom-0 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{t('app_name')}</p>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">{t('guide_page_title')}</h1>
            </div>
          </div>
          <p className="text-sm text-white/85 leading-relaxed relative z-10 border-t border-white/20 pt-3 mt-1">
            {t('guide_page_subtitle')}
          </p>
        </header>

        {/* ── Info boxes ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-600 shrink-0" />
              <p className="font-bold text-amber-900 text-xs">{t('guide_box_how_to_read_title')}</p>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">{t('guide_box_how_to_read_body')}</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-slate-500 shrink-0" />
              <p className="font-bold text-slate-800 text-xs">{t('guide_box_screenshots_title')}</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{t('guide_tip_screenshots')}</p>
          </div>
        </div>

        {/* ── Guide sections ── */}
        <ol className="space-y-5 list-none p-0 m-0">
          {GUIDE_SECTIONS.map((sec, i) => {
            const gradient = SECTION_COLORS[i % SECTION_COLORS.length];
            const stepsText = t(sec.stepsKey);
            const steps = stepsText.split('\n').map((s) => s.trim()).filter(Boolean);
            return (
              <li key={sec.titleKey} className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">

                {/* Section header with gradient */}
                <div className={`bg-gradient-to-r ${gradient} px-4 py-3.5 flex items-center gap-3`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/25 text-white font-black text-base">
                    {i + 1}
                  </span>
                  <h2 className="text-white font-bold text-[15px] leading-snug">{t(sec.titleKey)}</h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Intro */}
                  <p className="text-sm text-gray-600 leading-relaxed">{t(sec.introKey)}</p>

                  {/* Screenshot — phone mockup style */}
                  <div className="flex justify-center">
                    <div className="relative rounded-[22px] border-[3px] border-gray-300 bg-gray-900 overflow-hidden shadow-md w-52 sm:w-64">
                      {/* Notch */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full z-10" />
                      <img
                        src={sec.image}
                        alt={t(sec.titleKey)}
                        loading={i < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-auto block"
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs uppercase tracking-wide mb-3">
                      <ListChecks size={15} className="text-primary-600" />
                      {t('guide_steps_heading')}
                    </div>
                    <ul className="space-y-2.5">
                      {steps.map((line, li) => (
                        <li key={`${sec.stepsKey}-${li}`} className="flex gap-2.5 items-start">
                          <span className={`flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white text-[10px] font-black`}>
                            {li + 1}
                          </span>
                          <span className="text-sm text-gray-800 leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── Footer note ── */}
        <div className="rounded-2xl bg-primary-50 border border-primary-100 px-4 py-4 text-center text-sm text-primary-900 leading-relaxed">
          {t('guide_footer_note')}
        </div>
      </div>
    </AppShell>
  );
}
