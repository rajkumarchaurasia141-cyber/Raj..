import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';

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

async function check() {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects', 'science', 'chapters'));
    console.log(`\n==========================================`);
    console.log(`📊 SCIENCE CHAPTERS IN FIRESTORE: ${querySnapshot.size} / 16`);
    console.log(`==========================================`);
    
    const docs = querySnapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        no: data.chapter_no,
        name: data.chapter_name_hindi,
        mcqs: Array.isArray(data.mcq) ? data.mcq.length : 0,
        qa: Array.isArray(data.subjective_qa) ? data.subjective_qa.length : 0
      };
    });
    
    docs.sort((a, b) => a.no - b.no);
    docs.forEach(doc => {
      console.log(`🔹 ID: "${doc.id}" | Ch ${doc.no}: "${doc.name}" | MCQs: ${doc.mcqs} | Q&A: ${doc.qa}`);
    });
    console.log(`==========================================\n`);
  } catch (err: any) {
    console.error("❌ Error querying chapters:", err.message);
  }
}

check().then(() => process.exit(0));
