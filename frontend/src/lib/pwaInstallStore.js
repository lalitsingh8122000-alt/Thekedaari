let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function setDeferredPrompt(event) {
  deferredPrompt = event;
  notify();
}

export function clearDeferredPrompt() {
  deferredPrompt = null;
  notify();
}

export function subscribePwaInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function checkStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  );
}

let installListenersAttached = false;

/**
 * beforeinstallprompt / appinstalled — attached once per page load.
 * React Strict Mode would otherwise remove listeners on the dev double-mount and we can miss the event.
 */
export function attachPwaInstallListeners() {
  if (typeof window === 'undefined') return () => {};
  if (installListenersAttached) return () => {};
  installListenersAttached = true;

  const onBeforeInstall = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  const onAppInstalled = () => {
    clearDeferredPrompt();
    notify();
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstall);
  window.addEventListener('appinstalled', onAppInstalled);

  return () => {};
}
