import { collection, doc, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { safeSetDoc } from '../utils/firestoreSafe';

export type InstallMethodType = 'pwa_prompt' | 'install_button' | 'standalone_launch' | 'apk_direct';

export interface AppDownloadRecord {
  id: string;
  deviceId: string;
  studentName: string;
  studentEmail: string;
  deviceType: 'Android' | 'iPhone/iOS' | 'Windows PC' | 'Mac' | 'Other';
  browser: string;
  installMethod: InstallMethodType;
  installMethodLabel: string;
  source: string;
  downloadedAt: string;
  lastActiveAt: string;
  userAgentSummary?: string;
}

export interface DownloadStatsSummary {
  totalDownloads: number;
  recordedCount: number;
  baseOffset: number;
  todayDownloads: number;
  weekDownloads: number;
  androidCount: number;
  iosCount: number;
  desktopCount: number;
  pwaInstalledCount: number;
  records: AppDownloadRecord[];
}

const LOCAL_STORAGE_DEVICE_KEY = 'bseb_device_tracker_id';
const LOCAL_STORAGE_DOWNLOADS_CACHE = 'bseb_app_downloads_cache_v1';
const LOCAL_STORAGE_BASE_OFFSET_KEY = 'bseb_app_downloads_base_offset';
const LOCAL_STORAGE_HAS_DOWNLOADED_KEY = 'bseb_device_has_downloaded_v1';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    let existing = localStorage.getItem(LOCAL_STORAGE_DEVICE_KEY);
    if (!existing) {
      existing = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(LOCAL_STORAGE_DEVICE_KEY, existing);
    }
    return existing;
  } catch {
    return 'dev_fallback_' + Math.random().toString(36).substring(2, 8);
  }
}

export function detectDeviceAndBrowser(): {
  deviceType: AppDownloadRecord['deviceType'];
  browser: string;
  userAgentSummary: string;
} {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'Other', browser: 'Unknown', userAgentSummary: '' };
  }

  const ua = navigator.userAgent || '';

  let deviceType: AppDownloadRecord['deviceType'] = 'Other';
  if (/Android/i.test(ua)) {
    deviceType = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    deviceType = 'iPhone/iOS';
  } else if (/Windows/i.test(ua)) {
    deviceType = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = 'Mac';
  }

  let browser = 'Browser';
  if (/WhatsApp/i.test(ua)) {
    browser = 'WhatsApp Browser';
  } else if (/Instagram/i.test(ua)) {
    browser = 'Instagram Browser';
  } else if (/FBAN|FBAV/i.test(ua)) {
    browser = 'Facebook Browser';
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  }

  // Extract Android model if available e.g. "Android 13; SM-M336BU"
  let modelInfo = `${deviceType} • ${browser}`;
  const androidMatch = ua.match(/Android\s+([\d.]+);\s*([^;)]+)/i);
  if (androidMatch && androidMatch[2]) {
    const cleanModel = androidMatch[2].replace(/Build\/.*$/i, '').trim();
    modelInfo = `Android ${androidMatch[1]} (${cleanModel})`;
  }

  return {
    deviceType,
    browser,
    userAgentSummary: modelInfo
  };
}

export function detectTrafficSource(): string {
  if (typeof window === 'undefined') return 'Direct App';
  try {
    const params = new URLSearchParams(window.location.search);
    const sourceParam =
      params.get('source') ||
      params.get('utm_source') ||
      params.get('ref') ||
      sessionStorage.getItem('bseb_traffic_source');

    if (sourceParam) {
      sessionStorage.setItem('bseb_traffic_source', sourceParam);
      const s = sourceParam.toLowerCase();
      if (s.includes('whatsapp') || s === 'wa') return 'WhatsApp Share';
      if (s.includes('youtube') || s === 'yt') return 'YouTube Channel';
      if (s.includes('insta') || s === 'ig') return 'Instagram Bio';
      if (s.includes('ad') || s.includes('google') || s.includes('fb')) return 'Ads Campaign';
      return sourceParam;
    }

    const ref = document.referrer || '';
    if (ref.includes('whatsapp')) return 'WhatsApp Share';
    if (ref.includes('youtube.com') || ref.includes('youtu.be')) return 'YouTube Channel';
    if (ref.includes('instagram.com')) return 'Instagram Bio';
    if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
    if (ref.includes('google.')) return 'Google Search / Ads';

    const ua = navigator.userAgent || '';
    if (/WhatsApp/i.test(ua)) return 'WhatsApp Share';
    if (/Instagram/i.test(ua)) return 'Instagram Bio';
    if (/FBAN|FBAV/i.test(ua)) return 'Facebook';
  } catch {}
  return 'Direct / App Link';
}

export function getMethodLabel(method: InstallMethodType): string {
  switch (method) {
    case 'pwa_prompt':
      return '📲 फोन में इंस्टॉल (PWA Installed)';
    case 'standalone_launch':
      return '📱 इंस्टॉल्ड ऐप ओपन (Standalone App)';
    case 'apk_direct':
      return '📥 Install APK बटन (Login Page)';
    case 'install_button':
    default:
      return '⬇️ ऐप इंस्टॉल बैनर क्लिक';
  }
}

function getCachedDownloads(): AppDownloadRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOWNLOADS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedDownloads(records: AppDownloadRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_DOWNLOADS_CACHE, JSON.stringify(records.slice(0, 500)));
  } catch {}
}

function getCachedBaseOffset(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = parseInt(localStorage.getItem(LOCAL_STORAGE_BASE_OFFSET_KEY) || '0', 10);
    return Number.isNaN(val) ? 0 : Math.max(0, val);
  } catch {
    return 0;
  }
}

export async function recordAppDownload(options: {
  method: InstallMethodType;
  studentName?: string;
  studentEmail?: string;
  forceNewEvent?: boolean;
}): Promise<AppDownloadRecord | null> {
  if (typeof window === 'undefined') return null;

  try {
    const deviceId = getOrCreateDeviceId();
    const { deviceType, browser, userAgentSummary } = detectDeviceAndBrowser();
    const source = detectTrafficSource();
    const nowIso = new Date().toISOString();

    // Try to read logged-in user from localStorage if not passed explicitly
    let savedName = (options.studentName || '').trim();
    let savedEmail = (options.studentEmail || '').trim().toLowerCase();

    if (!savedName || !savedEmail) {
      try {
        const storedUser = localStorage.getItem('bseb_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (!savedName && parsedUser?.name) savedName = String(parsedUser.name).trim();
          if (!savedEmail && parsedUser?.email) savedEmail = String(parsedUser.email).trim().toLowerCase();
        }
      } catch {}
    }

    const existingList = getCachedDownloads();
    const existingRecord = existingList.find((r) => r.deviceId === deviceId || r.id === deviceId);

    // Priority of install methods: pwa_prompt > standalone_launch > apk_direct > install_button
    const methodPriority: Record<InstallMethodType, number> = {
      install_button: 1,
      apk_direct: 2,
      standalone_launch: 3,
      pwa_prompt: 4
    };

    const chosenMethod: InstallMethodType =
      existingRecord && methodPriority[existingRecord.installMethod] > methodPriority[options.method]
        ? existingRecord.installMethod
        : options.method;

    const record: AppDownloadRecord = {
      id: deviceId,
      deviceId,
      studentName: savedName || existingRecord?.studentName || 'अतिथि छात्र (Guest Student)',
      studentEmail: savedEmail || existingRecord?.studentEmail || 'बिना लॉगिन (Direct Install)',
      deviceType,
      browser,
      installMethod: chosenMethod,
      installMethodLabel: getMethodLabel(chosenMethod),
      source: existingRecord?.source || source,
      downloadedAt: existingRecord?.downloadedAt || nowIso,
      lastActiveAt: nowIso,
      userAgentSummary
    };

    // Mark locally that this device has downloaded/installed the app
    try {
      localStorage.setItem(LOCAL_STORAGE_HAS_DOWNLOADED_KEY, 'true');
    } catch {}

    // Update local cache immediately
    const updatedList = [record, ...existingList.filter((r) => r.id !== record.id && r.deviceId !== deviceId)];
    saveCachedDownloads(updatedList);

    // 1. Persist to backend server (app_data.json)
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {
      console.warn('Server download track note:', e);
    }

    // 2. Persist to Firestore collection 'app_downloads'
    try {
      await safeSetDoc(doc(db, 'app_downloads', record.id), record, { merge: true });
    } catch (e) {
      console.warn('Firestore download track note:', e);
    }

    // Dispatch custom event so any open Admin Panel updates immediately
    window.dispatchEvent(new CustomEvent('bseb-download-tracked', { detail: record }));

    return record;
  } catch (err) {
    console.warn('recordAppDownload error:', err);
    return null;
  }
}

/**
 * When a student logs in with their Name & Gmail, if they already clicked Install
 * or are running the installed PWA, enrich their download record with their name & email.
 */
export async function syncUserIdentityWithDownload(studentName: string, studentEmail: string): Promise<void> {
  if (typeof window === 'undefined' || !studentName.trim()) return;

  try {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as any).standalone);
    const hasDownloadedLocally = localStorage.getItem(LOCAL_STORAGE_HAS_DOWNLOADED_KEY) === 'true';

    if (isStandalone || hasDownloadedLocally) {
      await recordAppDownload({
        method: isStandalone ? 'standalone_launch' : 'apk_direct',
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase()
      });
    }
  } catch {}
}

export function computeDownloadStats(
  records: AppDownloadRecord[],
  baseOffset: number = 0
): DownloadStatsSummary {
  const uniqueMap = new Map<string, AppDownloadRecord>();
  for (const r of records) {
    if (!r || !r.id) continue;
    const key = r.deviceId || r.id;
    const prev = uniqueMap.get(key);
    if (!prev) {
      uniqueMap.set(key, r);
    } else {
      // Keep the one with more complete student info or newer activity
      const merged: AppDownloadRecord = {
        ...prev,
        ...r,
        studentName:
          r.studentName && !r.studentName.includes('अतिथि') ? r.studentName : prev.studentName,
        studentEmail:
          r.studentEmail && !r.studentEmail.includes('बिना लॉगिन') ? r.studentEmail : prev.studentEmail,
        downloadedAt:
          prev.downloadedAt && prev.downloadedAt < r.downloadedAt ? prev.downloadedAt : r.downloadedAt
      };
      uniqueMap.set(key, merged);
    }
  }

  const deduped = Array.from(uniqueMap.values()).sort((a, b) => {
    const tA = new Date(a.downloadedAt || 0).getTime();
    const tB = new Date(b.downloadedAt || 0).getTime();
    return tB - tA;
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

  let todayDownloads = 0;
  let weekDownloads = 0;
  let androidCount = 0;
  let iosCount = 0;
  let desktopCount = 0;
  let pwaInstalledCount = 0;

  for (const item of deduped) {
    const ts = new Date(item.downloadedAt || 0).getTime();
    if (ts >= startOfToday) todayDownloads++;
    if (ts >= startOfWeek) weekDownloads++;

    if (item.deviceType === 'Android') androidCount++;
    else if (item.deviceType === 'iPhone/iOS') iosCount++;
    else desktopCount++;

    if (item.installMethod === 'pwa_prompt' || item.installMethod === 'standalone_launch') {
      pwaInstalledCount++;
    }
  }

  const cleanOffset = Math.max(0, Number(baseOffset) || 0);

  return {
    totalDownloads: deduped.length + cleanOffset,
    recordedCount: deduped.length,
    baseOffset: cleanOffset,
    todayDownloads,
    weekDownloads,
    androidCount,
    iosCount,
    desktopCount,
    pwaInstalledCount,
    records: deduped
  };
}

export function subscribeToAppDownloads(
  onUpdate: (stats: DownloadStatsSummary) => void
): () => void {
  let serverRecords: AppDownloadRecord[] = [];
  let firestoreRecords: AppDownloadRecord[] = [];
  let baseOffset = getCachedBaseOffset();
  let isActive = true;

  const emitCombined = () => {
    if (!isActive) return;
    const localRecords = getCachedDownloads();
    const combined = [...firestoreRecords, ...serverRecords, ...localRecords];
    const summary = computeDownloadStats(combined, baseOffset);
    saveCachedDownloads(summary.records);
    onUpdate(summary);
  };

  // Initial emit from cache
  emitCombined();

  // Fetch from server API
  const fetchFromServer = async () => {
    try {
      const res = await fetch('/api/app-downloads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.downloads)) {
          serverRecords = data.downloads;
        }
        if (typeof data.baseOffset === 'number') {
          baseOffset = data.baseOffset;
          try {
            localStorage.setItem(LOCAL_STORAGE_BASE_OFFSET_KEY, String(baseOffset));
          } catch {}
        }
        emitCombined();
      }
    } catch {}
  };

  fetchFromServer();

  // Listen to Firestore 'app_downloads' collection in real-time
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    unsubscribeFirestore = onSnapshot(
      collection(db, 'app_downloads'),
      (snap) => {
        const list: AppDownloadRecord[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as AppDownloadRecord;
          if (d && (d.id || docSnap.id)) {
            list.push({
              ...d,
              id: d.id || docSnap.id,
              deviceId: d.deviceId || docSnap.id
            });
          }
        });
        firestoreRecords = list;
        emitCombined();
      },
      () => {
        // Fallback if Firestore rules or quota restrict real-time listener
        getDocs(collection(db, 'app_downloads'))
          .then((snap) => {
            const list: AppDownloadRecord[] = [];
            snap.forEach((docSnap) => {
              const d = docSnap.data() as AppDownloadRecord;
              if (d) list.push({ ...d, id: d.id || docSnap.id, deviceId: d.deviceId || docSnap.id });
            });
            firestoreRecords = list;
            emitCombined();
          })
          .catch(() => {});
      }
    );
  } catch {}

  const handleCustomEvent = () => {
    fetchFromServer();
    emitCombined();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('bseb-download-tracked', handleCustomEvent);
  }

  return () => {
    isActive = false;
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('bseb-download-tracked', handleCustomEvent);
    }
  };
}

export async function updateAdminDownloadBaseOffset(newOffset: number): Promise<void> {
  const clean = Math.max(0, Math.floor(Number(newOffset) || 0));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_BASE_OFFSET_KEY, String(clean));
    } catch {}
  }
  try {
    await fetch('/api/admin/download-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_offset', baseOffset: clean })
    });
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bseb-download-tracked'));
  }
}

export async function deleteDownloadRecord(id: string): Promise<void> {
  if (!id) return;
  const cached = getCachedDownloads().filter((r) => r.id !== id && r.deviceId !== id);
  saveCachedDownloads(cached);

  try {
    await fetch('/api/admin/download-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_record', id })
    });
  } catch {}

  try {
    await deleteDoc(doc(db, 'app_downloads', id));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bseb-download-tracked'));
  }
}
