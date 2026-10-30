import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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

async function cleanup() {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects', 'science', 'chapters'));
    console.log(`🧹 Found ${querySnapshot.size} total chapter documents under 'science'. Starting cleanup...`);
    
    let deletedCount = 0;
    for (const docSnap of querySnapshot.docs) {
      const id = docSnap.id;
      const data = docSnap.data();
      const chNo = data.chapter_no;
      
      // Keep only ids that are exactly 'ch' followed by the chapter number
      const expectedId = `ch${chNo}`;
      if (id !== expectedId) {
        console.log(`❌ Deleting legacy document: ID: "${id}" | Ch: ${chNo} | "${data.chapter_name_hindi || ''}"`);
        const docRef = doc(db, 'subjects', 'science', 'chapters', id);
        await deleteDoc(docRef);
        deletedCount++;
      } else {
        console.log(`✅ Keeping correct document: ID: "${id}" | Ch: ${chNo} | "${data.chapter_name_hindi || ''}"`);
      }
    }
    
    console.log(`\n🎉 CLEANUP COMPLETED: Deleted ${deletedCount} legacy/duplicate documents!`);
  } catch (err: any) {
    console.error("❌ Error during cleanup:", err.message);
  }
}

cleanup().then(() => process.exit(0));
