'use client';

export default function AuthPageLayout({ children, onSwitchLang, langLabel }) {
  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1f38] to-[#123056]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.55] bg-[radial-gradient(ellipse_110%_55%_at_50%_-15%,rgba(59,130,246,0.38),transparent_52%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.11] bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:44px_44px]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_15%_85%,rgba(255,255,255,0.08),transparent_42%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_85%_25%,rgba(56,189,248,0.12),transparent_35%)]"
        aria-hidden
      />

      <div
        className="relative flex justify-end px-4 pt-4 pb-2 sm:px-5 sm:pt-5"
        style={{ paddingTop: 'max(1rem, var(--safe-top))' }}
      >
        <button
          type="button"
          onClick={onSwitchLang}
          className="rounded-full bg-white/10 backdrop-blur-md text-white/95 font-medium px-4 py-2.5 text-sm border border-white/15 shadow-lg shadow-slate-950/20 hover:bg-white/18 hover:border-white/25 active:scale-[0.98] transition-all"
        >
          {langLabel}
        </button>
      </div>

      <div
        className="relative flex-1 flex flex-col items-center justify-center px-4 pb-12 sm:pb-14 pt-2"
        style={{ paddingBottom: 'max(2.5rem, calc(2.5rem + var(--safe-bottom)))' }}
      >
        <div className="w-full max-w-[440px] motion-safe:animate-auth-enter">
          <div className="rounded-[1.75rem] overflow-hidden bg-white/[0.98] backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(15,23,42,0.55),0_0_0_1px_rgba(255,255,255,0.65)_inset] border border-white/50 ring-1 ring-slate-900/[0.06]">
            <div
              className="h-1 w-full bg-gradient-to-r from-sky-400 via-primary-500 to-primary-700"
              aria-hidden
            />
            <div className="px-6 py-7 sm:px-9 sm:py-9 sm:pb-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
