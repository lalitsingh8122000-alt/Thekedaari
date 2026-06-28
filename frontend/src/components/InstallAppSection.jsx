'use client';

import { Download } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.thekedaari.app&hl=en_IN&pli=1';

export default function InstallAppSection({ lang, t }) {
  const hi = lang === 'hi';

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
    >
      <Download size={20} />
      {hi ? 'ऐप डाउनलोड करें' : t('install_app')}
    </a>
  );
}
