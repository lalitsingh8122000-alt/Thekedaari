'use client';

import { useEffect } from 'react';
import { attachPwaInstallListeners } from '@/lib/pwaInstallStore';

export default function PWARegister() {
  useEffect(() => {
    attachPwaInstallListeners();
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    let hasRefreshedForNewSw = false;
    let intervalId;
    const onControllerChange = () => {
      if (hasRefreshedForNewSw) return;
      hasRefreshedForNewSw = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Periodically check for newer service worker after deploys.
        intervalId = window.setInterval(() => registration.update(), 60 * 1000);
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
