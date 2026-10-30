import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { recordAppDownload } from '../services/downloadTracker';

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    return typeof window !== 'undefined' ? (window as any).__deferredPrompt : null;
  });
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if dismissed recently in this session
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');

    // Also check if already in standalone mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)
    ) {
      setInstalled(true);
      recordAppDownload({ method: 'standalone_launch' });
      return;
    }

    if (typeof window !== 'undefined' && (window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt);
      if (!dismissed) setShowBanner(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      (window as any).__deferredPrompt = e;
      setDeferredPrompt(e);
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    const readyHandler = () => {
      if (typeof window !== 'undefined' && (window as any).__deferredPrompt) {
        setDeferredPrompt((window as any).__deferredPrompt);
        if (!dismissed) setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('app-install-ready', readyHandler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      recordAppDownload({ method: 'pwa_prompt' });
    });

    if (!dismissed) {
      const t = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('app-install-ready', readyHandler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('app-install-ready', readyHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    // Track install button click immediately
    recordAppDownload({ method: 'install_button' });

    const prompt = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPrompt : null);

    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setInstalled(true);
          setShowBanner(false);
          recordAppDownload({ method: 'pwa_prompt' });
        }
      } catch (err) {
        console.warn('Install banner error:', err);
      }
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') (window as any).__deferredPrompt = null;
      return;
    }

    // If in WhatsApp / in-app browser on Android
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const isInApp = typeof navigator !== 'undefined' && /WhatsApp|FBAN|FBAV|Instagram/i.test(navigator.userAgent);
    if (isAndroid && isInApp) {
      const fullUrl = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${fullUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }

    // Dismiss banner cleanly
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (installed || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-[#FFFFFF] border border-[#EADBB8] text-[#222222] p-3.5 sm:p-4 rounded-3xl shadow-lg backdrop-blur-xl animate-fade-in flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AppLogo className="w-11 h-11 ring-2 ring-[#D8B45A] shrink-0 shadow-xs rounded-2xl" />
        <div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#D8B45A] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#D8B45A]" /> वेब ऐप (PWA)
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#222222] leading-tight">
            फोन में ऐप इंस्टॉल करें
          </h4>
          <p className="text-[10px] sm:text-[11px] text-[#777777]">
            सीधे 1-टैप में अपने फोन में जोड़ें
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black px-3.5 py-2 rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#222222]" />
          <span>इनस्टॉल</span>
        </button>
        <button
          onClick={handleDismiss}
          className="text-[#777777] hover:text-[#222222] p-1.5 rounded-lg bg-[#FFF4D6] hover:bg-[#F8E8B5] border border-[#EADBB8] transition-colors cursor-pointer"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
