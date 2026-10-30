import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import { hindiChapter1Data } from '../src/data/hindiChapter1Data.js';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function uploadHindiChapter1() {
  console.log('🚀 Connecting to Firestore database:', config.firestoreDatabaseId);

  // 1. Ensure subject 'hindi' exists
  await setDoc(doc(db, 'subjects', 'hindi'), {
    subject_id: 'hindi',
    subject_name: 'Hindi',
    subject_name_hindi: 'हिंदी (Hindi) - गोधूलि व वर्णिका',
    tagline: 'गोधूलि (भाग 2), वर्णिका (भाग 2) एवं मानक हिंदी व्याकरण',
    icon: 'BookOpen',
    color: 'from-rose-600 to-red-600',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Subject doc "hindi" verified/updated.');

  const chapterPayload = {
    ...hindiChapter1Data,
    updatedAt: new Date().toISOString()
  };

  // 2. Upload to ch_1, ch_1_0, and ch1 for complete compatibility
  const targetDocIds = ['ch_1', 'ch_1_0', 'ch1'];
  for (const docId of targetDocIds) {
    await setDoc(doc(db, 'subjects', 'hindi', 'chapters', docId), chapterPayload, { merge: true });
    console.log(`✅ Uploaded Hindi Chapter 1 to doc ID: ${docId} with ${chapterPayload.mcq.length} MCQs, ${chapterPayload.subjective_qa.length} NCERT Q&A, detailed notes, intro & topper tips.`);
  }

  console.log('🎉 All Hindi Chapter 1 data successfully uploaded to Firestore!');
  process.exit(0);
}

uploadHindiChapter1().catch(err => {
  console.error('❌ Error uploading to Firestore:', err);
  process.exit(1);
});
