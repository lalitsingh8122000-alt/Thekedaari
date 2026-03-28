"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {/* ...other profile info... */}
      {showInstall && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
          onClick={handleInstall}
        >
          Install App
        </button>
      )}
      {!showInstall && (
        <p className="text-gray-500 mt-4">You can install this app from your browser menu.</p>
      )}
    </div>
  );
}
