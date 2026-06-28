'use client';

import { Download } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.thekedaari.app';

export default function LandingNavInstall() {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="landing-nav-install-btn"
      aria-label="Download App"
    >
      <Download size={17} className="landing-nav-install-icon" aria-hidden />
      <span className="landing-nav-install-label">Download App</span>
    </a>
  );
}
