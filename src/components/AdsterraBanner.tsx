import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { triggerAd, clearAdNetworkFrequencyCaps } from '../utils/adManager';

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
        width: 300px;
        height: 250px;
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
    <script type="text/javascript" src="https://bauval.org/14/77d5b7efc1ac76950df3e6aa2ad18dfa?t=${refreshSeed}"></script>
  </body>
</html>`;
}

export function AdsterraBanner() {
  const [refreshSeed, setRefreshSeed] = useState<number>(() => Date.now());

  useEffect(() => {
    // Refresh banner every 2.5 minutes (150 seconds) automatically 24/7
    const interval = setInterval(() => {
      clearAdNetworkFrequencyCaps();
      setRefreshSeed(Date.now());
    }, 150 * 1000);

    // Also refresh whenever triggerAd is called anywhere in the app
    const handleAdTrigger = () => {
      setRefreshSeed(Date.now() + Math.floor(Math.random() * 10000));
    };
    window.addEventListener('bseb-trigger-ad', handleAdTrigger);

    return () => {
      clearInterval(interval);
      window.removeEventListener('bseb-trigger-ad', handleAdTrigger);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-3 pt-1 pb-2">
      <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mb-1">
        विज्ञापन • Advertisement
      </span>
      <div className="w-[300px] h-[250px] bg-white rounded-2xl shadow-xs border border-[#EADBB8] flex items-center justify-center overflow-hidden">
        <iframe
          key={refreshSeed}
          title="Adsterra 300x250 Banner Ad"
          srcDoc={buildAdIframeHtml(refreshSeed)}
          width="300"
          height="250"
          scrolling="no"
          style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}

/**
 * GlobalAdController:
 * 1. Automatically triggers the large/full-screen & popunder/social-bar ads every 3 minutes (within the 2-5 minute window) 24/7.
 * 2. Displays a clean full-screen sponsored ad overlay when triggered by the 2-5 min timer, Live section click, or icon clicks.
 */
export function GlobalAdController() {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [adSeed, setAdSeed] = useState(() => Date.now());
  const [countdown, setCountdown] = useState(3);
  const lastModalShownRef = React.useRef<number>(0);

  const openInterstitialModal = (force: boolean = false) => {
    const now = Date.now();
    // Prevent annoying double-pop within 15 seconds on rapid multi-clicks unless forced by timer
    if (!force && now - lastModalShownRef.current < 15000) {
      return;
    }
    lastModalShownRef.current = now;
    setAdSeed(now);
    setCountdown(3);
    setShowInterstitial(true);
  };

  useEffect(() => {
    // Automatic timer: runs every 3 minutes (180,000 ms) — right inside the 2 to 5 minute requirement!
    // Also runs an initial automatic ad at 2 minutes (120,000 ms)
    const firstTimer = setTimeout(() => {
      triggerAd('auto_2min_timer');
      openInterstitialModal(true);
    }, 120 * 1000);

    const recurringInterval = setInterval(() => {
      triggerAd('auto_3min_timer');
      openInterstitialModal(true);
    }, 180 * 1000);

    const handleUserAdTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const source = customEvent.detail?.source || 'click';
      // Always show full-screen ad on Live section click or timer, and on icon clicks (throttled to 20s)
      if (source.includes('live') || source.includes('timer')) {
        openInterstitialModal(true);
      } else {
        openInterstitialModal(false);
      }
    };

    window.addEventListener('bseb-trigger-ad', handleUserAdTrigger);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(recurringInterval);
      window.removeEventListener('bseb-trigger-ad', handleUserAdTrigger);
    };
  }, []);

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
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-[#FFFDF7] border-2 border-[#D8B45A] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-[#222222] to-[#3a3220] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D8B45A]" />
            <span className="text-[11px] font-black tracking-wider uppercase text-[#F8E8B5]">
              Sponsored Ad • विज्ञापन
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowInterstitial(false)}
            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition"
          >
            {countdown > 0 ? (
              <span>बंद करें ({countdown}s)</span>
            ) : (
              <>
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Ad Content Area */}
        <div className="p-4 flex flex-col items-center justify-center bg-white min-h-[275px]">
          <div className="w-[300px] h-[250px] rounded-2xl border border-[#EADBB8] overflow-hidden shadow-sm flex items-center justify-center bg-[#FFFDF7]">
            <iframe
              key={adSeed}
              title="Adsterra Fullscreen Sponsored Ad"
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
            onClick={() => setShowInterstitial(false)}
            className="w-full py-2.5 bg-gradient-to-r from-[#D8B45A] to-[#c49b38] hover:opacity-95 text-[#222222] font-black text-xs rounded-xl shadow-xs cursor-pointer transition"
          >
            आगे बढ़ें (Continue to App) →
          </button>
        </div>
      </div>
    </div>
  );
}
