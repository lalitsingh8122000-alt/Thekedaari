'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDeferredPrompt,
  clearDeferredPrompt,
  subscribePwaInstall,
  checkStandalone,
} from '@/lib/pwaInstallStore';

export function usePwaInstall() {
  const [, setRevision] = useState(0);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setRevision((r) => r + 1);
    return subscribePwaInstall(() => setRevision((r) => r + 1));
  }, []);

  const deferredPrompt = getDeferredPrompt();
  const isInstalled = checkStandalone();
  const canInstall = Boolean(deferredPrompt) && !isInstalled;

  const promptInstall = useCallback(async () => {
    const p = getDeferredPrompt();
    if (!p) return;
    setInstalling(true);
    try {
      await p.prompt();
      await p.userChoice;
    } catch {
      /* user dismissed or prompt failed */
    } finally {
      clearDeferredPrompt();
      setInstalling(false);
      setRevision((r) => r + 1);
    }
  }, []);

  return {
    canInstall,
    isInstalled,
    installing,
    promptInstall,
    hasBrowserInstallPrompt: Boolean(deferredPrompt),
  };
}
