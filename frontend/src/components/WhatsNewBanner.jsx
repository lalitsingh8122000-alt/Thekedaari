'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ClipboardList, UserCheck, Clock, LayoutDashboard, Sparkles } from 'lucide-react';

const BANNER_KEY = 'thekedaari_whats_new_v3';

const features = [
  {
    icon: <ClipboardList size={18} className="text-blue-500" />,
    bg: 'bg-blue-50',
    title: 'Attendance Report',
    desc: 'Project-wise daily attendance with full history',
  },
  {
    icon: <UserCheck size={18} className="text-emerald-500" />,
    bg: 'bg-emerald-50',
    title: 'Worker Salary Report',
    desc: 'Per-worker salary & payment ledger in one tap',
  },
  {
    icon: <Clock size={18} className="text-purple-500" />,
    bg: 'bg-purple-50',
    title: 'Overtime (OT)',
    desc: 'Track & record OT earnings directly in attendance',
  },
  {
    icon: <LayoutDashboard size={18} className="text-orange-500" />,
    bg: 'bg-orange-50',
    title: 'New Attendance UI',
    desc: 'Redesigned project attendance — faster & cleaner',
  },
];

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(BANNER_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(BANNER_KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className={`relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${closing ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-5 pt-7 pb-10 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-8 -right-2 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-indigo-900/30" />

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Logo + badge row */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src="/icon-192x192.png" alt="Thekedaari" width={44} height={44} className="rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> NEW
                </span>
                <span className="text-xs text-blue-200 font-medium">Just Released</span>
              </div>
              <p className="text-lg font-black leading-tight tracking-tight">Thekedaari</p>
            </div>
          </div>

          {/* Version headline */}
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight leading-none">
              Version 3.0
              <span className="text-yellow-300"> 🎉</span>
            </h2>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              Bigger. Faster. Smarter.
            </p>
          </div>
        </div>

        {/* Feature cards — overlapping the header */}
        <div className="relative -mt-5 mx-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            What&apos;s new in this update
          </p>
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                {f.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-tight">{f.title}</p>
                <p className="text-xs text-gray-500 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-4 pt-3 pb-5">
          <button
            onClick={dismiss}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            Explore What&apos;s New 🚀
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-2">Tap outside or press × to dismiss</p>
        </div>
      </div>
    </div>
  );
}
