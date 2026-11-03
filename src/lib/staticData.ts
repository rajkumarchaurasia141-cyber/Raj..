const STATIC_DATA_STORAGE_KEY = 'bseb_static_app_data_cache';

let cachedData: any = null;
let lastFetch = 0;

function loadCachedFromStorage(): any {
  if (cachedData) return cachedData;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STATIC_DATA_STORAGE_KEY);
      if (raw) {
        cachedData = JSON.parse(raw);
        return cachedData;
      }
    }
  } catch {
    // ignore storage read errors
  }
  return null;
}

export async function getStaticData() {
  // Return in-memory cache if fetched within the last 30 seconds
  if (cachedData && Date.now() - lastFetch < 30000) {
    return cachedData;
  }

  try {
    const res = await fetch('/app_data.json', {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) {
      return loadCachedFromStorage();
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
      return loadCachedFromStorage();
    }

    const data = await res.json();
    if (data && typeof data === 'object') {
      cachedData = data;
      lastFetch = Date.now();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STATIC_DATA_STORAGE_KEY, JSON.stringify(data));
        }
      } catch {
        // ignore storage quota errors
      }
      return data;
    }
    return loadCachedFromStorage();
  } catch {
    // Gracefully fall back to cached / default data when offline or during dev server reload
    return loadCachedFromStorage();
  }
}

export async function getStaticCollection(collectionName: string) {
  const data = await getStaticData();
  return data ? (data[collectionName] || []) : [];
}
