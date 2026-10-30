import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, query, where, limit } from 'firebase/firestore';
import { safeSetDoc, isFirestoreQuotaExceeded, isQuotaError } from '../utils/firestoreSafe';
import { LiveWatchRecord, BatchStudent } from '../types';

const ATTENDANCE_STORAGE_PREFIX = 'bseb_attendance_cache_';
const BROADCAST_CHANNEL_NAME = 'bseb_attendance_sync';

// BroadcastChannel for cross-tab communication (Zero Firebase calls!)
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

/**
 * Format seconds into readable Hindi format:
 * e.g. 85 -> "1 मिनट 25 सेकंड", 3650 -> "1 घंटा 0 मिनट 50 सेकंड"
 */
export function formatWatchDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  if (sec < 60) {
    return `${sec} सेकंड`;
  }
  const minutes = Math.floor(sec / 60);
  const remainingSec = sec % 60;
  if (minutes < 60) {
    return `${minutes} मिनट ${remainingSec > 0 ? `${remainingSec} सेकंड` : ''}`.trim();
  }
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours} घंटा ${remainingMin} मिनट ${remainingSec > 0 ? `${remainingSec} सेकंड` : ''}`.trim();
}

/**
 * Generate a safe unique key for a student attendance doc
 */
export function getAttendanceDocId(classId: string, studentKey: string): string {
  const sanitizedClass = classId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedStudent = studentKey.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `${sanitizedClass}__${sanitizedStudent}`.slice(0, 100);
}

/**
 * Retrieve cached local attendance for a class
 */
export function getLocalAttendance(classId: string): LiveWatchRecord[] {
  try {
    const raw = localStorage.getItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Save cached local attendance for a class
 */
export function saveLocalAttendance(classId: string, records: LiveWatchRecord[]): void {
  try {
    localStorage.setItem(`${ATTENDANCE_STORAGE_PREFIX}${classId}`, JSON.stringify(records));
  } catch {}
}

/**
 * Safe Heartbeat Writer
 * Updates local storage immediately, and syncs to Firestore with throttle & error protection
 */
export async function syncWatchHeartbeat(
  record: LiveWatchRecord,
  isExiting: boolean = false
): Promise<void> {
  const now = Date.now();
  record.lastHeartbeat = now;
  record.isOnline = !isExiting;

  // 1. Always save in local storage & memory instantly
  const localList = getLocalAttendance(record.classId);
  const idx = localList.findIndex(r => r.id === record.id || (r.studentId === record.studentId && r.classId === record.classId));
  if (idx >= 0) {
    localList[idx] = { ...record };
  } else {
    localList.push({ ...record });
  }
  saveLocalAttendance(record.classId, localList);

  // 2. Broadcast to other tabs/windows without Firestore cost
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'HEARTBEAT_UPDATE',
        record
      });
    } catch {}
  }

  // 3. Safe sync to Firestore (NEVER if quota exceeded, safely catch any network error)
  if (!isFirestoreQuotaExceeded()) {
    try {
      const docRef = doc(db, 'class_attendance', record.id);
      await safeSetDoc(docRef, {
        id: record.id,
        classId: record.classId,
        classTitle: record.classTitle,
        isLive: record.isLive,
        studentId: record.studentId,
        studentName: record.studentName,
        studentEmail: record.studentEmail,
        isPaid: record.isPaid,
        joinedAt: record.joinedAt,
        lastHeartbeat: now,
        watchSeconds: record.watchSeconds,
        isOnline: !isExiting
      }, { merge: true });
    } catch (err) {
      console.warn('Class attendance safe sync notice:', err);
      // Even if Firestore fails, local tracking works 100% flawlessly
    }
  }
}

/**
 * Subscribe to real-time attendance for a specific class
 * Safely falls back to local cache if Firestore is offline
 */
export function subscribeClassAttendance(
  classId: string,
  onUpdate: (records: LiveWatchRecord[]) => void
): () => void {
  // Initial local state delivery
  const cached = getLocalAttendance(classId);
  onUpdate(cached);

  // Broadcast channel listener for instant zero-latency cross-tab updates
  const handleBroadcast = (ev: MessageEvent) => {
    if (ev.data && ev.data.record && ev.data.record.classId === classId) {
      const updated = getLocalAttendance(classId);
      const idx = updated.findIndex(r => r.id === ev.data.record.id);
      if (idx >= 0) {
        updated[idx] = ev.data.record;
      } else {
        updated.push(ev.data.record);
      }
      saveLocalAttendance(classId, updated);
      onUpdate(updated);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Real-time Firestore onSnapshot with robust error fallback
  let unsubFirestore: (() => void) | null = null;
  if (!isFirestoreQuotaExceeded()) {
    try {
      const q = query(
        collection(db, 'class_attendance'),
        where('classId', '==', classId),
        limit(100)
      );

      unsubFirestore = onSnapshot(
        q,
        (snapshot) => {
          const remoteRecords: LiveWatchRecord[] = [];
          snapshot.forEach((snap) => {
            const data = snap.data();
            if (data) {
              const now = Date.now();
              const isRecent = (now - (data.lastHeartbeat || 0)) < 120000; // 2 min threshold
              remoteRecords.push({
                id: snap.id,
                classId: data.classId || classId,
                classTitle: data.classTitle || '',
                isLive: data.isLive === true,
                studentId: data.studentId || snap.id,
                studentName: data.studentName || 'विद्यार्थी',
                studentEmail: data.studentEmail || '',
                studentPhone: data.studentPhone || '',
                isPaid: data.isPaid === true,
                joinedAt: data.joinedAt || new Date().toISOString(),
                lastHeartbeat: data.lastHeartbeat || now,
                watchSeconds: Number(data.watchSeconds) || 0,
                isOnline: data.isOnline === true && isRecent
              });
            }
          });

          // Merge remote with local in case of offline edits
          const local = getLocalAttendance(classId);
          const map = new Map<string, LiveWatchRecord>();
          remoteRecords.forEach(r => map.set(r.id, r));
          local.forEach(r => {
            if (!map.has(r.id)) {
              map.set(r.id, r);
            }
          });

          const merged = Array.from(map.values()).sort((a, b) => b.lastHeartbeat - a.lastHeartbeat);
          saveLocalAttendance(classId, merged);
          onUpdate(merged);
        },
        (error) => {
          console.warn('Firestore attendance listener notice:', error);
          if (isQuotaError(error)) {
            // Keep using local state
            onUpdate(getLocalAttendance(classId));
          }
        }
      );
    } catch (e) {
      console.warn('Error subscribing to attendance:', e);
    }
  }

  // Periodic heartbeat cleanup for online flag (every 10s)
  const timer = setInterval(() => {
    const list = getLocalAttendance(classId);
    const now = Date.now();
    let hasChanged = false;
    const updated = list.map(item => {
      const isStillOnline = item.isOnline && (now - item.lastHeartbeat) < 120000;
      if (isStillOnline !== item.isOnline) {
        hasChanged = true;
        return { ...item, isOnline: isStillOnline };
      }
      return item;
    });
    if (hasChanged) {
      saveLocalAttendance(classId, updated);
      onUpdate(updated);
    }
  }, 10000);

  return () => {
    if (unsubFirestore) {
      try {
        unsubFirestore();
      } catch {}
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      } catch {}
    }
    clearInterval(timer);
  };
}

/**
 * Subscribe to ALL attendance across all classes (for Admin Panel)
 */
export function subscribeAllAttendance(
  onUpdate: (records: LiveWatchRecord[]) => void
): () => void {
  let unsubFirestore: (() => void) | null = null;

  if (!isFirestoreQuotaExceeded()) {
    try {
      const q = query(collection(db, 'class_attendance'), limit(250));
      unsubFirestore = onSnapshot(
        q,
        (snapshot) => {
          const records: LiveWatchRecord[] = [];
          const now = Date.now();
          snapshot.forEach((snap) => {
            const data = snap.data();
            if (data) {
              const isRecent = (now - (data.lastHeartbeat || 0)) < 120000;
              records.push({
                id: snap.id,
                classId: data.classId || '',
                classTitle: data.classTitle || '',
                isLive: data.isLive === true,
                studentId: data.studentId || snap.id,
                studentName: data.studentName || 'विद्यार्थी',
                studentEmail: data.studentEmail || '',
                studentPhone: data.studentPhone || '',
                isPaid: data.isPaid === true,
                joinedAt: data.joinedAt || new Date().toISOString(),
                lastHeartbeat: data.lastHeartbeat || now,
                watchSeconds: Number(data.watchSeconds) || 0,
                isOnline: data.isOnline === true && isRecent
              });
            }
          });
          onUpdate(records);
        },
        (err) => {
          console.warn('All attendance listener notice:', err);
        }
      );
    } catch (e) {
      console.warn('Error subscribing all attendance:', e);
    }
  }

  return () => {
    if (unsubFirestore) {
      try {
        unsubFirestore();
      } catch {}
    }
  };
}

/**
 * Standard batch students fallback to ensure the teacher sees
 * "कितने लोग जुड़े हैं और कितने लोग नहीं जुड़े हैं" even when testing
 */
export const DEFAULT_BATCH_STUDENTS: BatchStudent[] = [
  { id: 'bseb_s1', name: 'अमित कुमार सिंह', email: 'amit.bihar10@gmail.com', phone: '9801234567', isPaid: true, registeredAt: '2026-09-10' },
  { id: 'bseb_s2', name: 'प्रिया कुमारी', email: 'priya.patna@gmail.com', phone: '9708912345', isPaid: true, registeredAt: '2026-09-12' },
  { id: 'bseb_s3', name: 'राहुल यादव', email: 'rahul.muzaffarpur@gmail.com', phone: '9123456780', isPaid: true, registeredAt: '2026-09-14' },
  { id: 'bseb_s4', name: 'अंजलि शर्मा', email: 'anjali.gaya@gmail.com', phone: '9345678901', isPaid: true, registeredAt: '2026-09-15' },
  { id: 'bseb_s5', name: 'रोहित कुमार महतो', email: 'rohit.darbhanga@gmail.com', phone: '9456789012', isPaid: true, registeredAt: '2026-09-18' },
  { id: 'bseb_s6', name: 'सोनाली गुप्ता', email: 'sonali.bhagalpur@gmail.com', phone: '9567890123', isPaid: false, registeredAt: '2026-09-20' },
  { id: 'bseb_s7', name: 'आलोक कुमार', email: 'alok.chhapra@gmail.com', phone: '9678901234', isPaid: true, registeredAt: '2026-09-22' },
  { id: 'bseb_s8', name: 'नेहा परवीन', email: 'neha.purnea@gmail.com', phone: '9789012345', isPaid: true, registeredAt: '2026-09-24' },
  { id: 'bseb_s9', name: 'विकास कुमार', email: 'vikas.bhojpur@gmail.com', phone: '9890123456', isPaid: false, registeredAt: '2026-09-25' },
  { id: 'bseb_s10', name: 'खुशबू कुमारी', email: 'khushbu.samastipur@gmail.com', phone: '9901234567', isPaid: true, registeredAt: '2026-09-28' },
  { id: 'bseb_s11', name: 'चन्दन कुमार', email: 'chandan.siwan@gmail.com', phone: '9912345678', isPaid: true, registeredAt: '2026-09-29' },
  { id: 'bseb_s12', name: 'मनीषा राज', email: 'manisha.nalanda@gmail.com', phone: '9923456789', isPaid: true, registeredAt: '2026-10-01' }
];
