import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';

// Read Firebase Web configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error("❌ ERROR: firebase-applet-config.json not found!");
  process.exit(1);
}

const fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(fbConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, fbConfig.firestoreDatabaseId || "(default)");

async function seed() {
  console.log("Saving app_settings/payment_config in Firestore...");
  const docRef = doc(db, 'app_settings', 'payment_config');
  await setDoc(docRef, {
    upiId: "9708868515@yb1",
    price: 299,
    qrCodeUrl: ""
  }, { merge: true });
  console.log("✅ Seeded payment_config successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
