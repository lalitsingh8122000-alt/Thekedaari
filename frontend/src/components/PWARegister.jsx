'use client';

import { useEffect } from 'react';
import { attachPwaInstallListeners } from '@/lib/pwaInstallStore';

export default function PWARegister() {
  useEffect(() => {
    attachPwaInstallListeners();
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }, []);

  return null;
}
