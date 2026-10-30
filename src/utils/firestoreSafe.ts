import { setDoc, deleteDoc, getDoc, DocumentReference, SetOptions } from 'firebase/firestore';

const QUOTA_STORAGE_KEY = 'bseb_firestore_quota_exhausted';

/**
 * Recursively strips `undefined` properties from objects so Firestore `setDoc()`
 * never throws `Unsupported field value: undefined`.
 */
export function sanitizeForFirestore(val: any): any {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) {
    return val.filter((item) => item !== undefined).map((item) => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      cleaned[k] = sanitizeForFirestore(v);
    }
  }
  return cleaned;
}

// Initialize from localStorage if marked recently (within 2 hours so it recovers quickly)
let quotaExceededState = (() => {
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const elapsed = Date.now() - (parsed.exceededAt || 0);
      if (elapsed < 2 * 60 * 60 * 1000) {
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    }
  } catch {}
  return false;
})();

export function isFirestoreQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function setFirestoreQuotaExceeded(val: boolean) {
  quotaExceededState = val;
  try {
    if (val) {
      localStorage.setItem(
        QUOTA_STORAGE_KEY,
        JSON.stringify({
          exceededAt: Date.now(),
          date: new Date().toISOString()
        })
      );
    } else {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  } catch {}
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const msg = err.message || String(err);
  return (
    code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('Free daily write units') ||
    msg.includes('Free daily read units') ||
    msg.includes('Quota exceeded')
  );
}

export async function safeGetDoc<T = any>(
  reference: DocumentReference<T>,
  timeoutMs: number = 2500
): Promise<any | null> {
  if (isFirestoreQuotaExceeded()) {
    return null;
  }

  try {
    const getPromise = getDoc(reference);
    const timeoutPromise = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), timeoutMs)
    );

    const result = await Promise.race([getPromise, timeoutPromise]);
    if (result === 'timeout') {
      return null;
    }

    return result;
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
    return null;
  }
}

export async function safeSetDoc<T = any>(
  reference: DocumentReference<T>,
  data: any,
  options?: SetOptions,
  timeoutMs: number = 3500,
  forceAttempt: boolean = false
): Promise<boolean> {
  if (isFirestoreQuotaExceeded() && !forceAttempt) {
    return false;
  }

  try {
    const cleanData = sanitizeForFirestore(data);
    const writePromise = options
      ? setDoc(reference, cleanData, options)
      : setDoc(reference, cleanData);
    const timeoutPromise = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), timeoutMs)
    );

    const result = await Promise.race([writePromise, timeoutPromise]);
    if (result === 'timeout') {
      return false;
    }
    if (isFirestoreQuotaExceeded()) {
      setFirestoreQuotaExceeded(false);
    }
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return false;
    }
    console.warn('Firestore write notice:', err?.message || String(err));
    return false;
  }
}

export async function safeDeleteDoc<T = any>(
  reference: DocumentReference<T>,
  timeoutMs: number = 2500,
  forceAttempt: boolean = false
): Promise<boolean> {
  if (isFirestoreQuotaExceeded() && !forceAttempt) {
    return false;
  }

  try {
    const delPromise = deleteDoc(reference);
    const timeoutPromise = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), timeoutMs)
    );

    const result = await Promise.race([delPromise, timeoutPromise]);
    if (result === 'timeout') {
      return false;
    }
    if (isFirestoreQuotaExceeded()) {
      setFirestoreQuotaExceeded(false);
    }
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return false;
    }
    return false;
  }
}
