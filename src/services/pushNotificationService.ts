import { db } from '../lib/firebase';
import {
  doc,
  collection,
  getDocs,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { safeSetDoc } from '../utils/firestoreSafe';

export type TargetClassType = 'all' | 'Class 10' | 'Class 9';

export type AutoContentType =
  | 'notes'
  | 'test'
  | 'daily_test'
  | 'chapter'
  | 'video'
  | 'announcement';

export interface DailyReminderSlot {
  id: string;
  labelHindi: string;
  label?: string;
  time: string; // HH:mm in 24-hour Asia/Kolkata format (e.g., "07:00", "10:00", "14:00", "18:00", "21:00")
  enabled: boolean;
  title: string;
  defaultMessage: string;
  body?: string;
  messagePool: string[];
  targetUrl: string;
  url?: string;
}

export interface PushNotificationSettings {
  dailyRemindersEnabled: boolean;
  timezone: string; // Always "Asia/Kolkata"
  dailySlots: DailyReminderSlot[];
  autoContentNotificationsEnabled: boolean;
  batchDigestEnabled: boolean;
  batchDigestMode?: boolean;
  batchWindowMinutes: number;
  autoNotifyOnNotes?: boolean;
  autoNotifyOnTest?: boolean;
  autoNotifyOnDailyTest?: boolean;
  autoNotifyOnChapter?: boolean;
  autoNotifyOnVideo?: boolean;
  autoNotifyTypes: {
    notes: boolean;
    test: boolean;
    daily_test: boolean;
    chapter: boolean;
    video: boolean;
    announcement: boolean;
  };
  updatedAt: string;
}

export type PushNotificationConfig = PushNotificationSettings;

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  studentName: string;
  studentEmail: string;
  studentClass: TargetClassType;
  deviceType: string;
  userAgent: string;
  isAdminDevice: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SentNotificationLog {
  id: string;
  title: string;
  body: string;
  targetUrl: string;
  url?: string;
  targetClass: TargetClassType;
  category: 'manual' | 'daily_reminder' | 'auto_content' | 'test_admin' | 'admin_test' | 'batch_digest';
  contentType?: AutoContentType;
  contentId?: string;
  idempotencyKey: string;
  sentCount: number;
  failedCount: number;
  cleanedInvalidCount: number;
  totalTargeted: number;
  errors: string[];
  sentBy: string;
  createdAt: string;
}

export type PushNotificationLog = SentNotificationLog;

export const DEFAULT_DAILY_SLOTS: DailyReminderSlot[] = [
  {
    id: 'slot_morning_7am',
    labelHindi: '1. सुबह 7:00 बजे — पढ़ाई शुरू करने का रिमाइंडर',
    time: '07:00',
    enabled: true,
    title: '🌞 सुप्रभात! BSEB GURU स्टडी टाइम',
    defaultMessage: '🌞 सुप्रभात! BSEB GURU के साथ आज की पढ़ाई शुरू करो। आज कुछ नया सीखते हैं!',
    messagePool: [
      '🌞 सुप्रभात! BSEB GURU के साथ आज की पढ़ाई शुरू करो। आज कुछ नया सीखते हैं!',
      '🌅 सुबह का समय याद करने के लिए सबसे उत्तम है! BSEB GURU खोलें और 1 नया अध्याय पढ़ें।',
      '☀️ टॉपर बनने की शुरुआत सुबह की पहली पढ़ाई से होती है। BSEB GURU पर आज का लक्ष्य पूरा करें!',
      '📘 सुप्रभात! आज के महत्वपूर्ण बिहार बोर्ड नोट्स और फॉर्मूले BSEB GURU पर आपका इंतज़ार कर रहे हैं।'
    ],
    targetUrl: '/?tab=home'
  },
  {
    id: 'slot_morning_10am',
    labelHindi: '2. सुबह 10:00 बजे — सुबह के रिवीजन का रिमाइंडर',
    time: '10:00',
    enabled: true,
    title: '📚 BSEB GURU — मॉर्निंग रिवीजन समय',
    defaultMessage: '📚 BSEB GURU पर आज पढ़े हुए टॉपिक को एक बार दोहराने का समय है।',
    messagePool: [
      '📚 BSEB GURU पर आज पढ़े हुए टॉपिक को एक बार दोहराने का समय है।',
      '🧠 जो सुबह पढ़ा था, उसे 15 मिनट दोहरा लें ताकि परीक्षा तक हमेशा याद रहे! — BSEB GURU',
      '📖 थोड़ा ब्रेक लें और BSEB GURU में अपने विषय के VVI प्रश्नोत्तर का क्विक रिवीजन करें।',
      '✨ निरंतर अभ्यास ही 450+ अंकों की कुंजी है। BSEB GURU पर आज का दूसरा स्टडी सेशन शुरू करें!'
    ],
    targetUrl: '/?tab=my_courses'
  },
  {
    id: 'slot_afternoon_2pm',
    labelHindi: '3. दोपहर 2:00 बजे — प्रैक्टिस टेस्ट रिमाइंडर',
    time: '14:00',
    enabled: true,
    title: '📝 BSEB GURU — प्रैक्टिस टेस्ट समय',
    defaultMessage: '📝 अपनी तैयारी जाँचने के लिए आज का प्रैक्टिस टेस्ट जरूर दो।',
    messagePool: [
      '📝 अपनी तैयारी जाँचने के लिए आज का प्रैक्टिस टेस्ट जरूर दो।',
      '🔥 आज का Daily Test लाइव है! BSEB GURU में अभी टेस्ट दें और अपना स्कोर जांचें।',
      '🏆 टॉपर लीडरबोर्ड में अपना नाम दर्ज कराएं—BSEB GURU पर आज का MCQ प्रैक्टिस टेस्ट हल करें!',
      '⚡ परीक्षा में ओएमआर (OMR) गलती से बचने के लिए BSEB GURU पर रोज़ाना प्रैक्टिस टेस्ट दें।'
    ],
    targetUrl: '/daily-test'
  },
  {
    id: 'slot_evening_6pm',
    labelHindi: '4. शाम 6:00 बजे — शाम का टॉपिक रिवीजन',
    time: '18:00',
    enabled: true,
    title: '🎯 BSEB GURU — शाम का टॉपिक रिवीजन',
    defaultMessage: '🎯 आज तुमने जो पढ़ा है, उसका एक बार रिवीजन कर लो। अभ्यास से आत्मविश्वास बढ़ता है।',
    messagePool: [
      '🎯 आज तुमने जो पढ़ा है, उसका एक बार रिवीजन कर लो। अभ्यास से आत्मविश्वास बढ़ता है।',
      '🌇 शाम की पढ़ाई का समय! BSEB GURU पर गणित या विज्ञान के महत्वपूर्ण प्रश्नों का अभ्यास करें।',
      '📺 BSEB GURU पर आज की महत्वपूर्ण वीडियो क्लास और नोट्स देखकर अपने डाउट्स क्लियर करें।',
      '💪 बोर्ड परीक्षा में हर एक अंक महत्वपूर्ण है—शाम का 1 घंटा BSEB GURU के साथ रिवीजन को दें।'
    ],
    targetUrl: '/?tab=live'
  },
  {
    id: 'slot_night_9pm',
    labelHindi: '5. रात 9:00 बजे — सोने से पहले हल्का रिवीजन',
    time: '21:00',
    enabled: true,
    title: '🌙 BSEB GURU — नाइट क्विक रिवीजन',
    defaultMessage: '🌙 सोने से पहले आज के मुख्य प्रश्नों को दोहराओ। कल फिर एक नई शुरुआत करेंगे!',
    messagePool: [
      '🌙 सोने से पहले आज के मुख्य प्रश्नों को दोहराओ। कल फिर एक नई शुरुआत करेंगे!',
      '🌟 आज की मेहनत कल का परिणाम बनेगी! सोने से पहले 10 मिनट मुख्य सूत्र और परिभाषाएँ देख लें।',
      '📖 रात को सोने से पहले पढ़ी गई चीजें दिमाग में लंबे समय तक रहती हैं। BSEB GURU पर हल्का रिवीजन करें।',
      '✨ शाबाश! आज का दिन पूरा करने से पहले BSEB GURU में 5 मुख्य ऑब्जेक्टिव प्रश्न दोहरा लें। शुभ रात्रि!'
    ],
    targetUrl: '/?tab=home'
  }
];

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  dailyRemindersEnabled: true,
  timezone: 'Asia/Kolkata',
  dailySlots: DEFAULT_DAILY_SLOTS.map((s) => ({
    ...s,
    label: s.labelHindi,
    body: s.defaultMessage,
    url: s.targetUrl
  })),
  autoContentNotificationsEnabled: true,
  batchDigestEnabled: false,
  batchDigestMode: false,
  batchWindowMinutes: 5,
  autoNotifyOnNotes: true,
  autoNotifyOnTest: true,
  autoNotifyOnDailyTest: true,
  autoNotifyOnChapter: true,
  autoNotifyOnVideo: true,
  autoNotifyTypes: {
    notes: true,
    test: true,
    daily_test: true,
    chapter: true,
    video: true,
    announcement: true
  },
  updatedAt: new Date().toISOString()
};

export const DEFAULT_PUSH_CONFIG = DEFAULT_PUSH_SETTINGS;

const LOCAL_SUB_KEY = 'bseb_guru_push_subscription';
const LOCAL_PREF_CLASS_KEY = 'bseb_guru_student_class';
const LOCAL_SENT_CONTENT_KEYS = 'bseb_guru_sent_content_keys';

// Synchronous helper for UI components to read current device push state immediately
export function getDevicePushState(): {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  studentClass: TargetClassType;
  endpoint: string | null;
} {
  const studentClass = getSavedStudentClass();
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      supported: false,
      permission: 'default',
      subscribed: false,
      studentClass,
      endpoint: null
    };
  }
  const permission = Notification.permission;
  try {
    const localRaw = localStorage.getItem(LOCAL_SUB_KEY);
    if (localRaw && permission === 'granted') {
      const parsed = JSON.parse(localRaw);
      if (parsed && parsed.enabled !== false && parsed.endpoint) {
        return {
          supported: true,
          permission,
          subscribed: true,
          studentClass: parsed.studentClass || studentClass,
          endpoint: parsed.endpoint
        };
      }
    }
  } catch {}
  return {
    supported: true,
    permission,
    subscribed: false,
    studentClass,
    endpoint: null
  };
}

// Show immediate Service Worker or Browser notification on current device
export async function showLocalSwNotification(
  title: string,
  body: string,
  url: string = '/'
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: { url }
        });
        return;
      }
    }
    new Notification(title, { body, icon: '/icon-192.png' });
  } catch {}
}

// Convert base64 URL-safe VAPID public key to Uint8Array for pushManager.subscribe
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Create deterministic subscription ID from endpoint URL
export function getSubscriptionIdFromEndpoint(endpoint: string): string {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    const chr = endpoint.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  const suffix = endpoint.slice(-18).replace(/[^a-zA-Z0-9]/g, '');
  return `sub_${Math.abs(hash)}_${suffix}`;
}

export function detectDeviceType(): string {
  if (typeof navigator === 'undefined') return 'Web';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Windows|Macintosh|Linux/.test(ua)) return 'Desktop';
  return 'Mobile Web';
}

export function getSavedStudentClass(): TargetClassType {
  try {
    const saved = localStorage.getItem(LOCAL_PREF_CLASS_KEY);
    if (saved === 'Class 10' || saved === 'Class 9' || saved === 'all') {
      return saved;
    }
  } catch {}
  return 'Class 10';
}

export function setSavedStudentClass(cls: TargetClassType): void {
  try {
    localStorage.setItem(LOCAL_PREF_CLASS_KEY, cls);
  } catch {}
}

// Check current browser Push Notification & Service Worker status
export async function getClientPushStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  studentClass: TargetClassType;
  endpoint: string | null;
}> {
  const studentClass = getSavedStudentClass();
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return {
      supported: false,
      permission: 'default',
      isSubscribed: false,
      studentClass,
      endpoint: null
    };
  }

  const permission = Notification.permission;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager?.getSubscription();
    if (sub && permission === 'granted') {
      return {
        supported: true,
        permission,
        isSubscribed: true,
        studentClass,
        endpoint: sub.endpoint
      };
    }

    // Also check local fallback record if pushManager subscription was stored locally
    const localRaw = localStorage.getItem(LOCAL_SUB_KEY);
    if (localRaw && permission === 'granted') {
      const parsed = JSON.parse(localRaw);
      if (parsed?.enabled && parsed?.endpoint) {
        return {
          supported: true,
          permission,
          isSubscribed: true,
          studentClass: parsed.studentClass || studentClass,
          endpoint: parsed.endpoint
        };
      }
    }
  } catch {}

  return {
    supported: 'PushManager' in window || 'Notification' in window,
    permission,
    isSubscribed: false,
    studentClass,
    endpoint: null
  };
}

// Subscribe student or admin device to Web Push Notifications
export async function subscribeDeviceToPush(params: {
  studentName?: string;
  studentEmail?: string;
  studentClass?: TargetClassType | string;
  isAdminDevice?: boolean;
  isAdmin?: boolean;
}): Promise<{
  ok: boolean;
  success: boolean;
  message: string;
  subscription?: PushSubscriptionRecord;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      ok: false,
      success: false,
      message: 'आपका ब्राउज़र पुश नोटिफिकेशन को सपोर्ट नहीं करता है। कृपया Chrome ब्राउज़र का उपयोग करें।'
    };
  }

  try {
    // 1. Request Browser Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        ok: false,
        success: false,
        message:
          'आपने नोटिफिकेशन की अनुमति (Allow) नहीं दी है। आप ब्राउज़र की साइट सेटिंग्स में जाकर कभी भी Notifications को Allow कर सकते हैं।'
      };
    }

    const chosenClass = ((params.studentClass as TargetClassType) || getSavedStudentClass());
    setSavedStudentClass(chosenClass);

    // 2. Ensure Service Worker is registered & ready
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    await navigator.serviceWorker.ready;

    // 3. Fetch VAPID Public Key from Backend
    const keyRes = await fetch('/api/notifications/vapid-public-key');
    const keyData = await keyRes.json();
    const publicKey = keyData?.publicKey;

    let subJson: any = null;
    if (publicKey && registration.pushManager) {
      let existingSub = await registration.pushManager.getSubscription();
      if (!existingSub) {
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);
        existingSub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as any
        });
      }
      subJson = existingSub.toJSON();
    }

    // If pushManager is restricted in an iframe preview, create a valid fallback client endpoint so local/in-app SW notifications still work seamlessly
    const endpoint =
      subJson?.endpoint ||
      `https://bseb-guru-browser-client.local/${
        params.studentEmail || 'student'
      }_${Date.now()}`;
    const keys = {
      p256dh: subJson?.keys?.p256dh || 'local_preview_p256dh_key',
      auth: subJson?.keys?.auth || 'local_preview_auth_key'
    };

    const subId = getSubscriptionIdFromEndpoint(endpoint);
    const nowIso = new Date().toISOString();

    const record: PushSubscriptionRecord = {
      id: subId,
      endpoint,
      keys,
      studentName: params.studentName || 'विद्यार्थी (Student)',
      studentEmail: params.studentEmail || 'guest@bsebguru.com',
      studentClass: chosenClass,
      deviceType: detectDeviceType(),
      userAgent: navigator.userAgent.slice(0, 140),
      isAdminDevice: Boolean(params.isAdminDevice || params.isAdmin),
      enabled: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // 4. Save to Backend Server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }).catch(() => {});

    // 5. Save to Cloud Firestore (`push_subscriptions`) for cross-instance persistence
    await safeSetDoc(doc(db, 'push_subscriptions', subId), record, { merge: true }, 4000, true).catch(
      () => {}
    );

    // 6. Save locally
    try {
      localStorage.setItem(LOCAL_SUB_KEY, JSON.stringify(record));
    } catch {}

    // 7. Show immediate welcome notification via Service Worker
    try {
      if (registration && registration.showNotification) {
        await registration.showNotification('🔔 BSEB GURU Notifications चालू हो गए!', {
          body: `बधाई हो! अब आपको ${chosenClass} के नए नोट्स, डेली टेस्ट और 5 स्मार्ट स्टडी रिमाइंडर समय पर मिलेंगे।`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'bseb-guru-welcome',
          data: { url: '/?tab=home' }
        });
      }
    } catch {}

    return {
      ok: true,
      success: true,
      message: '🎉 बधाई हो! BSEB GURU स्मार्ट नोटिफिकेशन आपके फोन पर सफलतापूर्वक चालू हो गए हैं।',
      subscription: record
    };
  } catch (err: any) {
    console.warn('Push subscription warning:', err);
    return {
      ok: false,
      success: false,
      message: 'नोटिफिकेशन चालू करने में समस्या: ' + (err?.message || 'कृपया पुनः प्रयास करें')
    };
  }
}

// Unsubscribe / Disable Push Notifications anytime
export async function unsubscribeDeviceFromPush(): Promise<{
  ok: boolean;
  success: boolean;
  message: string;
}> {
  try {
    let endpointToRemove: string | null = null;

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        endpointToRemove = sub.endpoint;
        await sub.unsubscribe().catch(() => {});
      }
    }

    try {
      const localRaw = localStorage.getItem(LOCAL_SUB_KEY);
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (!endpointToRemove && parsed?.endpoint) {
          endpointToRemove = parsed.endpoint;
        }
        localStorage.removeItem(LOCAL_SUB_KEY);
      }
    } catch {}

    if (endpointToRemove) {
      const subId = getSubscriptionIdFromEndpoint(endpointToRemove);
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subId, endpoint: endpointToRemove })
      }).catch(() => {});

      await deleteDoc(doc(db, 'push_subscriptions', subId)).catch(() => {});
    }

    return {
      ok: true,
      success: true,
      message: '🔕 आपके डिवाइस के लिए पुश नोटिफिकेशन बंद कर दिए गए हैं। आप जब चाहें इसे फिर से चालू कर सकते हैं।'
    };
  } catch (err: any) {
    return {
      ok: false,
      success: false,
      message: 'नोटिफिकेशन बंद करने में त्रुटि: ' + (err?.message || String(err))
    };
  }
}

// Gather all active subscriptions from Firestore + Backend so serverless/preview sends to every student
export async function fetchAllActiveSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const map = new Map<string, PushSubscriptionRecord>();
  try {
    const snap = await getDocs(collection(db, 'push_subscriptions'));
    snap.forEach((d) => {
      const data = d.data() as PushSubscriptionRecord;
      if (data && data.enabled !== false && data.endpoint) {
        map.set(d.id, { ...data, id: d.id });
      }
    });
  } catch {}

  try {
    const localRaw = localStorage.getItem(LOCAL_SUB_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as PushSubscriptionRecord;
      if (parsed && parsed.enabled !== false && parsed.endpoint) {
        map.set(parsed.id, parsed);
      }
    }
  } catch {}

  return Array.from(map.values());
}

// Fetch Push Notification Dashboard Data (Settings + Logs + Stats)
export async function fetchPushDashboardData(): Promise<{
  settings: PushNotificationSettings;
  subscriptionsCount: number;
  classBreakdown: Record<string, number>;
  history: SentNotificationLog[];
  vapidConfigured: boolean;
}> {
  let serverData: any = null;
  try {
    const res = await fetch('/api/notifications/dashboard');
    if (res.ok) {
      serverData = await res.json();
    }
  } catch {}

  // Merge Firestore settings if available
  let settings: PushNotificationSettings = serverData?.settings || DEFAULT_PUSH_SETTINGS;
  try {
    const docSnap = await getDoc(doc(db, 'app_settings', 'push_notification_config'));
    if (docSnap.exists()) {
      const fsSettings = docSnap.data() as PushNotificationSettings;
      if (fsSettings && Array.isArray(fsSettings.dailySlots)) {
        settings = {
          ...DEFAULT_PUSH_SETTINGS,
          ...fsSettings
        };
      }
    }
  } catch {}

  // Normalize slot alias fields
  settings = {
    ...DEFAULT_PUSH_SETTINGS,
    ...settings,
    batchDigestMode: Boolean(settings.batchDigestMode ?? settings.batchDigestEnabled),
    autoNotifyOnNotes: Boolean(settings.autoNotifyOnNotes ?? settings.autoNotifyTypes?.notes ?? true),
    autoNotifyOnTest: Boolean(settings.autoNotifyOnTest ?? settings.autoNotifyTypes?.test ?? true),
    autoNotifyOnDailyTest: Boolean(settings.autoNotifyOnDailyTest ?? settings.autoNotifyTypes?.daily_test ?? true),
    autoNotifyOnChapter: Boolean(settings.autoNotifyOnChapter ?? settings.autoNotifyTypes?.chapter ?? true),
    autoNotifyOnVideo: Boolean(settings.autoNotifyOnVideo ?? settings.autoNotifyTypes?.video ?? true),
    dailySlots: (settings.dailySlots || DEFAULT_DAILY_SLOTS).map((s) => ({
      ...s,
      labelHindi: s.labelHindi || s.label || s.id,
      label: s.label || s.labelHindi || s.id,
      defaultMessage: s.defaultMessage || s.body || '',
      body: s.body || s.defaultMessage || '',
      targetUrl: s.targetUrl || s.url || '/',
      url: s.url || s.targetUrl || '/'
    }))
  };

  // Merge Firestore subscriptions count
  const fsSubs = await fetchAllActiveSubscriptions();
  const combinedSubMap = new Map<string, PushSubscriptionRecord>();
  if (Array.isArray(serverData?.subscriptions)) {
    serverData.subscriptions.forEach((s: PushSubscriptionRecord) => {
      if (s && s.id && s.enabled !== false) combinedSubMap.set(s.id, s);
    });
  }
  fsSubs.forEach((s) => combinedSubMap.set(s.id, s));

  const allSubs = Array.from(combinedSubMap.values());
  const classBreakdown: Record<string, number> = {
    'Class 10': 0,
    'Class 9': 0,
    all: 0
  };
  allSubs.forEach((s) => {
    const c = s.studentClass || 'Class 10';
    classBreakdown[c] = (classBreakdown[c] || 0) + 1;
  });

  // Merge Firestore history logs with server history logs
  const historyMap = new Map<string, SentNotificationLog>();
  if (Array.isArray(serverData?.history)) {
    serverData.history.forEach((h: SentNotificationLog) => {
      if (h && h.id) historyMap.set(h.id, { ...h, url: h.url || h.targetUrl || '/' });
    });
  }
  try {
    const histSnap = await getDocs(collection(db, 'push_notification_logs'));
    histSnap.forEach((d) => {
      const item = d.data() as SentNotificationLog;
      if (item && item.id) historyMap.set(item.id, { ...item, url: item.url || item.targetUrl || '/' });
    });
  } catch {}

  const history = Array.from(historyMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    settings,
    subscriptionsCount: Math.max(serverData?.subscriptionsCount || 0, allSubs.length),
    classBreakdown,
    history: history.slice(0, 50),
    vapidConfigured: Boolean(serverData?.vapidConfigured ?? true)
  };
}

// Save updated Push Notification Settings (Daily Reminder Slots & Auto-Notification Toggles)
export async function savePushNotificationSettings(
  settings: PushNotificationSettings
): Promise<boolean> {
  const normalizedSlots = (settings.dailySlots || DEFAULT_DAILY_SLOTS).map((s) => ({
    ...s,
    labelHindi: s.label || s.labelHindi || s.id,
    label: s.label || s.labelHindi || s.id,
    defaultMessage: s.body || s.defaultMessage || '',
    body: s.body || s.defaultMessage || '',
    targetUrl: s.url || s.targetUrl || '/',
    url: s.url || s.targetUrl || '/'
  }));

  const updated: PushNotificationSettings = {
    ...settings,
    timezone: 'Asia/Kolkata',
    batchDigestEnabled: Boolean(settings.batchDigestMode ?? settings.batchDigestEnabled),
    batchDigestMode: Boolean(settings.batchDigestMode ?? settings.batchDigestEnabled),
    dailySlots: normalizedSlots,
    autoNotifyTypes: {
      notes: Boolean(settings.autoNotifyOnNotes ?? settings.autoNotifyTypes?.notes ?? true),
      test: Boolean(settings.autoNotifyOnTest ?? settings.autoNotifyTypes?.test ?? true),
      daily_test: Boolean(settings.autoNotifyOnDailyTest ?? settings.autoNotifyTypes?.daily_test ?? true),
      chapter: Boolean(settings.autoNotifyOnChapter ?? settings.autoNotifyTypes?.chapter ?? true),
      video: Boolean(settings.autoNotifyOnVideo ?? settings.autoNotifyTypes?.video ?? true),
      announcement: true
    },
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('bseb_guru_push_settings', JSON.stringify(updated));
  } catch {}

  try {
    await fetch('/api/notifications/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '#656920578506#'
      },
      body: JSON.stringify(updated)
    });
  } catch {}

  try {
    await safeSetDoc(
      doc(db, 'app_settings', 'push_notification_config'),
      updated,
      { merge: true },
      4000,
      true
    );
  } catch {}

  return true;
}

// Send Manual Broadcast, Class-Targeted Notification, or Admin Self-Test Notification
export async function sendPushNotificationNow(params: {
  title: string;
  body: string;
  targetUrl?: string;
  url?: string;
  targetClass?: TargetClassType;
  actionType?: 'live' | 'vip' | 'courses' | 'none';
  testOnlyAdmin?: boolean;
  category?: SentNotificationLog['category'];
  idempotencyKey?: string;
  sentBy?: string;
}): Promise<{
  success: boolean;
  log?: SentNotificationLog;
  error?: string;
}> {
  try {
    const finalTargetUrl = params.targetUrl || params.url || '/?tab=home';
    const activeSubs = await fetchAllActiveSubscriptions();
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '#656920578506#'
      },
      body: JSON.stringify({
        ...params,
        title: params.title.trim(),
        body: params.body.trim(),
        targetUrl: finalTargetUrl,
        targetClass: params.targetClass || 'all',
        clientSubscriptions: activeSubs
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || 'नोटिफिकेशन भेजने में त्रुटि हुई'
      };
    }

    // If testing on current browser/device and permission is granted, also trigger Service Worker notification immediately if push endpoint was a local browser preview fallback
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const pushSub = await reg?.pushManager?.getSubscription();
        // Only show local fallback if browser didn't already receive Web Push via FCM/Mozilla endpoint
        if (!pushSub && reg?.showNotification) {
          await reg.showNotification(params.title.trim(), {
            body: params.body.trim(),
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: data.log?.idempotencyKey || 'bseb-manual-' + Date.now(),
            data: { url: finalTargetUrl }
          });
        }
      } catch {}
    }

    if (data.log) {
      await safeSetDoc(
        doc(db, 'push_notification_logs', data.log.id),
        data.log,
        { merge: true },
        3000,
        true
      ).catch(() => {});

      // Clean up any expired/invalid endpoints reported by web-push (404 / 410)
      if (Array.isArray(data.cleanedIds) && data.cleanedIds.length > 0) {
        for (const badId of data.cleanedIds) {
          deleteDoc(doc(db, 'push_subscriptions', badId)).catch(() => {});
        }
      }
    }

    return {
      success: true,
      log: data.log
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'नेटवर्क त्रुटि'
    };
  }
}

// Automatically Trigger Push Notification when Admin Publishes New Content
export async function triggerAutoContentNotification(params: {
  contentType: AutoContentType;
  contentId: string;
  title: string;
  subjectName?: string;
  subjectId?: string;
  chapterNo?: number | string;
  chapterName?: string;
  targetClass?: TargetClassType;
  customUrl?: string;
  url?: string;
  isEdit?: boolean;
  forceReNotify?: boolean;
  questionsCount?: number;
}): Promise<{
  sent: boolean;
  batched?: boolean;
  reason?: string;
  notificationTitle?: string;
  notificationBody?: string;
  targetUrl?: string;
}> {
  try {
    // Rule 1: Never auto-notify on edits to old content unless Admin explicitly requested re-notification
    if (params.isEdit && !params.forceReNotify) {
      return { sent: false, reason: 'existing_content_edit_skipped' };
    }

    // Rule 2: Check client-side idempotency key so duplicate calls for same content item are blocked
    const idempotencyKey = `content_${params.contentType}_${params.contentId}${
      params.forceReNotify ? '_' + Date.now() : ''
    }`;
    try {
      const rawKeys = localStorage.getItem(LOCAL_SENT_CONTENT_KEYS);
      const sentKeys: string[] = rawKeys ? JSON.parse(rawKeys) : [];
      if (sentKeys.includes(idempotencyKey)) {
        return { sent: false, reason: 'duplicate_content_idempotency' };
      }
    } catch {}

    // Build Hindi Title, Body & Deep-Link URL according to content type
    const effectiveCustomUrl = params.customUrl || params.url;
    const subjectLabel = params.subjectName || 'बिहार बोर्ड कक्षा 10वीं';
    let notificationTitle = '📢 BSEB GURU नया अपडेट!';
    let notificationBody = `BSEB GURU में ${subjectLabel} की नई अध्ययन सामग्री "${params.title}" उपलब्ध है।`;
    let targetUrl = effectiveCustomUrl || '/?tab=home';

    switch (params.contentType) {
      case 'notes':
        notificationTitle = '📚 नया नोट्स उपलब्ध है!';
        notificationBody = `BSEB GURU में ${subjectLabel} का नया नोट्स "${params.title}" अपलोड हो गया है। अभी पढ़ना शुरू करें।`;
        targetUrl =
          effectiveCustomUrl ||
          `/?tab=downloads${params.subjectId ? `&subject=${encodeURIComponent(params.subjectId)}` : ''}`;
        break;

      case 'test':
        notificationTitle = '📝 नया टेस्ट अपलोड हुआ!';
        notificationBody = `BSEB GURU पर ${subjectLabel} का नया टेस्ट "${params.title}" जोड़ दिया गया है। अभी अपनी तैयारी जांचें।`;
        targetUrl = effectiveCustomUrl || '/?tab=daily_quiz';
        break;

      case 'daily_test':
        notificationTitle = '🔥 आज का Daily Test लाइव है!';
        notificationBody = `BSEB GURU में आज का Daily Test${
          params.questionsCount ? ` (${params.questionsCount} प्रश्न)` : ''
        } उपलब्ध है। तुरंत टेस्ट दें और अपना स्कोर देखें।`;
        targetUrl = effectiveCustomUrl || '/daily-test';
        break;

      case 'chapter':
        notificationTitle = '📖 नया अध्याय जोड़ा गया!';
        notificationBody = `BSEB GURU में ${subjectLabel} का नया अध्याय "${params.title}" जोड़ दिया गया है। अभी पढ़ें।`;
        targetUrl =
          effectiveCustomUrl ||
          `/?tab=explorer&subject=${encodeURIComponent(params.subjectId || 'sanskrit')}${
            params.chapterNo ? `&chapter=${encodeURIComponent(String(params.chapterNo))}` : ''
          }`;
        break;

      case 'video':
        notificationTitle = '🎥 नया क्लास वीडियो उपलब्ध है!';
        notificationBody = `BSEB GURU में ${subjectLabel} की नई क्लास "${params.title}" अपलोड की गई है। अभी देखें।`;
        targetUrl =
          effectiveCustomUrl || `/?tab=live&video=${encodeURIComponent(params.contentId)}`;
        break;

      case 'announcement':
      default:
        notificationTitle = `📢 ${params.title}`;
        notificationBody = `BSEB GURU में महत्वपूर्ण सूचना: ${params.title}। अभी ऐप खोलें।`;
        targetUrl = effectiveCustomUrl || '/?tab=home';
        break;
    }

    const activeSubs = await fetchAllActiveSubscriptions();
    const res = await fetch('/api/notifications/auto-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '#656920578506#'
      },
      body: JSON.stringify({
        contentType: params.contentType,
        contentId: params.contentId,
        idempotencyKey,
        title: notificationTitle,
        body: notificationBody,
        targetUrl,
        targetClass: params.targetClass || 'all',
        forceReNotify: Boolean(params.forceReNotify),
        clientSubscriptions: activeSubs
      })
    });

    const data = await res.json();
    if (!res.ok || data.skipped) {
      return {
        sent: false,
        batched: Boolean(data?.batched),
        reason: data?.reason || 'auto_notify_disabled_or_skipped',
        notificationTitle,
        notificationBody,
        targetUrl
      };
    }

    // Record idempotency key locally
    try {
      const rawKeys = localStorage.getItem(LOCAL_SENT_CONTENT_KEYS);
      const sentKeys: string[] = rawKeys ? JSON.parse(rawKeys) : [];
      sentKeys.unshift(idempotencyKey);
      localStorage.setItem(LOCAL_SENT_CONTENT_KEYS, JSON.stringify(sentKeys.slice(0, 200)));
    } catch {}

    // Persist delivery log to Firestore
    if (data.log) {
      await safeSetDoc(
        doc(db, 'push_notification_logs', data.log.id),
        data.log,
        { merge: true },
        3000,
        true
      ).catch(() => {});
    }

    // Also store in Firestore `notifications` collection so in-app bell icon modal shows it for all students
    const inAppNotif = {
      id: 'notif_' + Date.now(),
      title: notificationTitle,
      description: notificationBody,
      timeLabel: 'अभी-अभी',
      isNew: true,
      actionType:
        params.contentType === 'video'
          ? 'live'
          : params.contentType === 'notes' || params.contentType === 'chapter'
          ? 'courses'
          : 'none',
      targetUrl,
      clickUrl: targetUrl,
      createdAt: new Date().toISOString()
    };
    await safeSetDoc(doc(db, 'notifications', inAppNotif.id), inAppNotif, { merge: true }, 3000, true).catch(
      () => {}
    );

    return {
      sent: true,
      batched: Boolean(data?.batched),
      notificationTitle,
      notificationBody,
      targetUrl
    };
  } catch (err: any) {
    console.warn('Auto content push trigger error:', err);
    return { sent: false, reason: err?.message || 'error' };
  }
}

// Manually trigger Daily Study Reminder Cron Check from Admin Panel
export async function triggerDailyStudyCronCheck(forceSlotId?: string): Promise<{
  success: boolean;
  message: string;
  triggeredSlots?: string[];
}> {
  try {
    const activeSubs = await fetchAllActiveSubscriptions();
    const res = await fetch('/api/notifications/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '#656920578506#'
      },
      body: JSON.stringify({
        forceSlotId,
        clientSubscriptions: activeSubs
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data?.error || 'क्रॉन चेक में त्रुटि हुई'
      };
    }
    return {
      success: true,
      message: data.message || 'डेली स्मार्ट रिमाइंडर शेड्यूलर सफलतापूर्वक जाँचा गया!',
      triggeredSlots: data.triggeredSlots || []
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'नेटवर्क त्रुटि'
    };
  }
}

// Admin Dashboard Convenience Wrappers
export async function fetchPushConfigAndStats() {
  const data = await fetchPushDashboardData();
  const activeSubs = await fetchAllActiveSubscriptions();
  const adminCount = activeSubs.filter((s) => s.isAdminDevice).length;
  return {
    config: data.settings,
    logs: data.history,
    pendingDigestCount: 0,
    stats: {
      totalSubscribers: data.subscriptionsCount,
      activeSubscribers: data.subscriptionsCount,
      adminSubscribers: adminCount,
      class10Count: data.classBreakdown['Class 10'] || 0,
      class9Count: data.classBreakdown['Class 9'] || 0
    }
  };
}

export const savePushConfigFromAdmin = savePushNotificationSettings;

export async function sendAdminManualPushNotification(params: {
  title: string;
  body: string;
  url: string;
  targetClass?: TargetClassType;
  category?: SentNotificationLog['category'];
}) {
  const res = await sendPushNotificationNow({
    title: params.title,
    body: params.body,
    targetUrl: params.url,
    targetClass: params.targetClass || 'all',
    category: params.category || 'manual'
  });
  return {
    ok: res.success,
    sentCount: res.log?.sentCount || 0,
    failedCount: res.log?.failedCount || 0,
    cleanedInvalidCount: res.log?.cleanedInvalidCount || 0,
    message: res.error || 'नोटिफिकेशन सफलतापूर्वक भेज दिया गया!'
  };
}

export async function sendAdminSelfTestNotification(adminEmail?: string) {
  const res = await sendPushNotificationNow({
    title: '🧪 BSEB GURU — एडमिन टेस्ट नोटिफिकेशन सफल!',
    body: 'बधाई हो! आपका Smart Push Notification System 100% सही तरीके से काम कर रहा है।',
    targetUrl: '/daily-test',
    targetClass: 'all',
    testOnlyAdmin: true,
    category: 'test_admin',
    sentBy: adminEmail || 'Admin'
  });
  return {
    ok: res.success,
    sentCount: res.log?.sentCount || 1,
    failedCount: res.log?.failedCount || 0,
    message: res.error || 'आपके एडमिन डिवाइस पर टेस्ट पुश नोटिफिकेशन भेज दिया गया है!'
  };
}

export async function triggerDailySlotTest(slotId: string) {
  const res = await triggerDailyStudyCronCheck(slotId);
  return {
    ok: res.success,
    sentCount: 1,
    message: res.message
  };
}

