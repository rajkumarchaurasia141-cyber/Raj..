/**
 * BSEB GURU Ad Management System
 * Production-ready, student-friendly, and non-intrusive.
 * 
 * Rules:
 * 1. Strict 5–6 minute cooldown (300–360 seconds) between popup ads.
 * 2. Never show popup ads immediately on app startup (at least 300s initial buffer).
 * 3. Never interrupt during active study, tests, quizzes, video lectures, or form inputs.
 * 4. Zero rogue click-hijackers: normal clicks, navigation tabs, cards NEVER open external tabs or apps.
 * 5. Single active popup ad modal at any time with a prominent close button.
 */

// Timing constants (in milliseconds)
export const MIN_POPUP_INTERVAL_MS = 300 * 1000; // 5 minutes (300 seconds)
export const MAX_POPUP_INTERVAL_MS = 360 * 1000; // 6 minutes (360 seconds)
export const INITIAL_STARTUP_DELAY_MS = 300 * 1000; // 5 minutes before first popup

// In-memory state tracking
const appStartTime = Date.now();
let lastPopupShownTime = appStartTime; // Ensures no immediate startup popup
let isStudyOrTestActive = false;
let studyOrTestReason: string | null = null;
let isAdModalCurrentlyOpen = false;

/**
 * Notify the ad system whether the student is currently in an active learning activity
 * (taking a daily test, solving MCQs, reading deep notes, watching class video, submitting forms).
 */
export function setStudyOrTestMode(active: boolean, reason?: string) {
  isStudyOrTestActive = active;
  studyOrTestReason = active ? (reason || 'active_study_or_test') : null;
}

export function isStudyOrTestMode(): boolean {
  return isStudyOrTestActive;
}

export function isAdModalOpen(): boolean {
  return isAdModalCurrentlyOpen;
}

export function setAdModalOpen(open: boolean) {
  isAdModalCurrentlyOpen = open;
  if (!open) {
    // Reset timer on close so student gets full 5-6 min buffer
    lastPopupShownTime = Date.now();
  }
}

/**
 * Checks if a popup / interstitial ad is eligible to be shown right now.
 */
export function canShowPopupAd(): boolean {
  // 1. Guard against interrupting active study, tests, quiz, or video lectures
  if (isStudyOrTestActive) {
    return false;
  }

  // 2. Prevent multiple concurrent popup ads
  if (isAdModalCurrentlyOpen) {
    return false;
  }

  const now = Date.now();

  // 3. Prevent popup ads immediately when app opens (5 minutes initial delay)
  if (now - appStartTime < INITIAL_STARTUP_DELAY_MS) {
    return false;
  }

  // 4. Enforce strict 5-6 minute (300 seconds) interval between ads
  if (now - lastPopupShownTime < MIN_POPUP_INTERVAL_MS) {
    return false;
  }

  return true;
}

/**
 * Request to show a popup ad at an appropriate transition point.
 * Returns true if an ad will be shown, false if denied (e.g. cooldown active or user studying).
 */
export function requestPopupAd(source: string = 'safe_transition'): boolean {
  if (typeof window === 'undefined') return false;

  if (!canShowPopupAd()) {
    return false;
  }

  lastPopupShownTime = Date.now();
  isAdModalCurrentlyOpen = true;

  window.dispatchEvent(
    new CustomEvent('bseb-show-popup-ad', {
      detail: { source, timestamp: Date.now() }
    })
  );

  return true;
}

/**
 * Backward compatibility wrapper for triggerAd().
 * Does NOT inject rogue popunders or hijack clicks.
 * Only triggers if the 5-6 minute cooldown and safe context criteria are satisfied.
 */
export const triggerAd = (source: string = 'user_click'): boolean => {
  return requestPopupAd(source);
};

/**
 * Legacy utility export maintained for compatibility.
 * Safe no-op that prevents corruption of session storage.
 */
export const clearAdNetworkFrequencyCaps = () => {
  // Safe no-op
};
