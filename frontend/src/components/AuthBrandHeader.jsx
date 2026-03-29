'use client';

import Image from 'next/image';

export default function AuthBrandHeader({ subtitle }) {
  return (
    <header className="text-center">
      <div className="mx-auto w-fit max-w-full">
        <div className="rounded-2xl bg-gradient-to-b from-slate-50/95 to-white p-4 sm:p-5 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 border border-white/80">
          <Image
            src="/thekedaari-logo.png"
            alt="thekedaari.com — Attendance & Income/Expense Management"
            width={320}
            height={175}
            className="mx-auto w-full max-w-[260px] sm:max-w-[288px] h-auto select-none"
            priority
          />
        </div>
      </div>
      {subtitle ? (
        <>
          <div className="mx-auto mt-6 mb-1 h-px w-12 rounded-full bg-gradient-to-r from-transparent via-primary-300/80 to-transparent" aria-hidden />
          <p className="text-slate-500 mt-4 text-[0.95rem] sm:text-base font-medium leading-relaxed max-w-[280px] sm:max-w-sm mx-auto tracking-tight">
            {subtitle}
          </p>
        </>
      ) : null}
    </header>
  );
}
