
let cachedData: any = null;
let lastFetch = 0;

export async function getStaticData() {
  try {
    const res = await fetch(`/app_data.json?t=${Date.now()}`, {
      cache: 'no-cache'
    }); 
    if (!res.ok) throw new Error('Failed to fetch');
    
    const data = await res.json();
    cachedData = data;
    lastFetch = Date.now();
    return data;
  } catch (e) {
    console.error("Static data load fail, cache use kar raha hu", e);
    return cachedData;
  }
}

export async function getStaticCollection(collectionName: string) {
  const data = await getStaticData();
  return data ? (data[collectionName] || []) : [];
}
