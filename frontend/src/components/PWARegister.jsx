'use client';

import { useEffect } from 'react';
import { attachPwaInstallListeners } from '@/lib/pwaInstallStore';

export default function PWARegister() {
  useEffect(() => {
    return attachPwaInstallListeners();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {});
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
