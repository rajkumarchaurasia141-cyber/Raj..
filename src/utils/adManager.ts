// Ad manager to handle programmatic pop-up / popunder / interstitial ad triggers
// Ensures ads run 24/7 (not just in the evening), every 2-5 minutes automatically,
// and on every icon / Live section click across the app.

const POPUP_AD_SCRIPT_SRC = 'https://abscloud.org/1/0d674643633dcda9940775dbdcf0857e';
const SOCIAL_BAR_SCRIPT_SRC = 'https://bauval.org/14/77d5b7efc1ac76950df3e6aa2ad18dfa';

// Clear any third-party ad network frequency-cap keys stored in localStorage/sessionStorage
// so that ads are never throttled to only once per day or evening hours
export const clearAdNetworkFrequencyCaps = () => {
  try {
    if (typeof window === 'undefined') return;
    const preservePrefixes = ['bseb_', 'firebase:', 'google', 'vapid'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      const shouldKeep = preservePrefixes.some((p) => key.startsWith(p));
      if (!shouldKeep && (key.includes('ad') || key.includes('pop') || key.includes('freq') || key.includes('cap') || key.includes('ppu') || key.includes('sb_') || key.includes('atOptions'))) {
        localStorage.removeItem(key);
      }
    }
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      const shouldKeep = preservePrefixes.some((p) => key.startsWith(p));
      if (!shouldKeep) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const triggerAd = (source: string = 'user_click') => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. Clear frequency caps so ads work 24 hours a day (morning, afternoon, evening, night)
    clearAdNetworkFrequencyCaps();

    // 2. If the ad script exposes a global trigger function, invoke it
    if (typeof (window as any).show_ad_function === 'function') {
      try {
        (window as any).show_ad_function();
      } catch (e) {}
    }

    const cacheBuster = Date.now() + '_' + Math.floor(Math.random() * 100000);

    // 3. Dynamically inject fresh Popunder/Popup script tag with cache-buster
    const existingDynamic = document.querySelectorAll('script[data-dynamic-popup-ad="true"]');
    existingDynamic.forEach((el) => el.remove());

    const popScript = document.createElement('script');
    popScript.setAttribute('data-cfasync', 'false');
    popScript.setAttribute('data-dynamic-popup-ad', 'true');
    popScript.src = `${POPUP_AD_SCRIPT_SRC}?t=${cacheBuster}`;
    popScript.async = true;
    (document.body || document.head || document.documentElement).appendChild(popScript);

    // 4. Dynamically re-inject Social Bar / In-Page Push script with cache-buster
    const existingSocial = document.querySelectorAll('script[data-dynamic-social-ad="true"]');
    existingSocial.forEach((el) => el.remove());

    const socialScript = document.createElement('script');
    socialScript.setAttribute('data-cfasync', 'false');
    socialScript.setAttribute('data-dynamic-social-ad', 'true');
    socialScript.src = `${SOCIAL_BAR_SCRIPT_SRC}?t=${cacheBuster}`;
    socialScript.async = true;
    (document.body || document.head || document.documentElement).appendChild(socialScript);

    // 5. Dispatch custom event so GlobalAdController can display the Full-Screen / Interstitial Ad Modal
    // and refresh all banner ad slots immediately
    window.dispatchEvent(
      new CustomEvent('bseb-trigger-ad', {
        detail: { source, timestamp: Date.now() }
      })
    );
  } catch (err) {
    console.error('Error triggering ad:', err);
  }
};
