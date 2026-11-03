import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { canShowPopupAd, requestPopupAd, setAdModalOpen } from '../utils/adManager';

function buildAdIframeHtml(refreshSeed: number): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '5cae615bda5e362588ae0356f4e60624',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://bauval.org/22/5cae615bda5e362588ae0356f4e60624?t=${refreshSeed}"></script>
  </body>
</html>`;
}

/**
 * Clean, non-intrusive 300x250 Banner Ad Component.
 * - Does not block navigation or buttons.
 * - Sized cleanly for mobile screens.
 * - If blocked or offline, degrades gracefully without awkward empty white space.
 */
export function AdsterraBanner() {
  const [refreshSeed, setRefreshSeed] = useState<number>(() => Date.now());
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Refresh banner every 3.5 minutes (210s) smoothly
    const interval = setInterval(() => {
      setRefreshSeed(Date.now());
    }, 210 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (hasError) {
    return (
      <div className="w-full flex justify-center my-3 px-4">
        <div className="w-full max-w-[320px] p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-700 text-center flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold">बिहार बोर्ड 10वीं टॉपर बनने के लिए रोज़ाना अभ्यास करें!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 px-2">
      <span className="text-[10px] text-stone-400 font-bold tracking-wider uppercase mb-1 select-none">
        विज्ञापन • Advertisement
      </span>
      <div className="w-[300px] h-[250px] max-w-full bg-white rounded-2xl shadow-xs border border-[#EADBB8] flex items-center justify-center overflow-hidden">
        <iframe
          key={refreshSeed}
          title="BSEB Sponsored Banner Ad"
          srcDoc={buildAdIframeHtml(refreshSeed)}
          width="300"
          height="250"
          scrolling="no"
          onError={() => setHasError(true)}
          style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}

/**
 * GlobalAdController:
 * - Controls the Popup / Interstitial Ad System.
 * - Displays ads strictly every 5–6 minutes (300–360 seconds).
 * - Never shows immediately upon app startup.
 * - Never interrupts active tests, quizzes, video lectures, or forms.
 * - Single active popup at a time.
 * - Prominent, unmissable close button with countdown.
 * - Does not block the app if ad loading fails.
 */
export function GlobalAdController() {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [adSeed, setAdSeed] = useState(() => Date.now());
  const [countdown, setCountdown] = useState(4);
  const isCheckingRef = useRef(false);

  const handleClose = useCallback(() => {
    setShowInterstitial(false);
    setAdModalOpen(false);
  }, []);

  // Keyboard Escape listener to close popup
  useEffect(() => {
    if (!showInterstitial) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInterstitial, handleClose]);

  // Periodic timer check (every 20 seconds) to safely trigger popup ads at 5-6 min intervals
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (isCheckingRef.current || showInterstitial) return;
      if (canShowPopupAd()) {
        requestPopupAd('auto_interval_timer');
      }
    }, 20 * 1000);

    const onShowPopupEvent = () => {
      setAdSeed(Date.now());
      setCountdown(4);
      setShowInterstitial(true);
      setAdModalOpen(true);
    };

    window.addEventListener('bseb-show-popup-ad', onShowPopupEvent);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('bseb-show-popup-ad', onShowPopupEvent);
    };
  }, [showInterstitial]);

  // Countdown timer for Skip button
  useEffect(() => {
    if (!showInterstitial) return;
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [showInterstitial, countdown]);

  if (!showInterstitial) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored Advertisement"
    >
      <div 
        className="bg-[#FFFDF7] border-2 border-[#D8B45A] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with clear close button */}
        <div className="bg-gradient-to-r from-[#222222] to-[#3a3220] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D8B45A]" />
            <span className="text-[11px] font-black tracking-wider uppercase text-[#F8E8B5]">
              Sponsored • विज्ञापन
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Advertisement"
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition select-none active:scale-95"
          >
            {countdown > 0 ? (
              <span>बंद करें ({countdown}s)</span>
            ) : (
              <>
                <span>Skip Ad</span>
                <X className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Ad Container Box */}
        <div className="p-4 flex flex-col items-center justify-center bg-white min-h-[275px]">
          <div className="w-[300px] h-[250px] max-w-full rounded-2xl border border-[#EADBB8] overflow-hidden shadow-xs flex items-center justify-center bg-[#FFFDF7]">
            <iframe
              key={adSeed}
              title="BSEB Sponsored Interstitial Ad"
              srcDoc={buildAdIframeHtml(adSeed)}
              width="300"
              height="250"
              scrolling="no"
              style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }}
            />
          </div>
          <p className="text-[10px] font-bold text-stone-500 mt-2.5 text-center">
            BSEB GURU 100% मुफ़्त शिक्षा अभियान को सपोर्ट करने के लिए धन्यवाद
          </p>
        </div>

        {/* Bottom Continue Button */}
        <div className="px-4 pb-3.5 pt-1 bg-[#FFFDF7]">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 bg-gradient-to-r from-[#D8B45A] to-[#c49b38] hover:opacity-95 text-[#222222] font-black text-xs rounded-xl shadow-xs cursor-pointer transition select-none active:scale-[0.99]"
          >
            आगे बढ़ें (Continue to App) →
          </button>
        </div>
      </div>
    </div>
  );
}
