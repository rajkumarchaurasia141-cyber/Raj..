import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import fbConfig from '../../firebase-applet-config.json';

// Suppress internal Firestore connection / quota error logs from flooding the console
setLogLevel('silent');

export const app = initializeApp(fbConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Use initializeFirestore with experimentalAutoDetectLongPolling to ensure reliable
// connectivity in container, proxy, and iframe preview environments.
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  (fbConfig as any).firestoreDatabaseId || "(default)"
);
