import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';
import fbConfig from '../firebase-applet-config.json';

const app = initializeApp(fbConfig);
const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  (fbConfig as any).firestoreDatabaseId || "(default)"
);

async function inspectCollections() {
  console.log("=========================================");
  console.log("🔍 INSPECTING FIRESTORE DATABASE STRUCTURE");
  console.log("Database ID:", (fbConfig as any).firestoreDatabaseId || "(default)");
  console.log("=========================================\n");

  try {
    // 1. Inspect 'subjects' and their subcollection 'chapters'
    console.log("📂 1. Inspecting 'subjects' collection...");
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    console.log(`Found ${subjectsSnap.size} subjects.`);
    
    for (const subDoc of subjectsSnap.docs) {
      const subId = subDoc.id;
      const subData = subDoc.data();
      console.log(`\n  Subject ID: "${subId}"`);
      console.log(`  Subject Data:`, {
        name: subData.name || subData.nameHindi || null,
        tagline: subData.tagline || null,
        icon: subData.icon || null,
        updatedAt: subData.updatedAt || null
      });

      // Fetch chapters subcollection
      console.log(`  📖 Querying chapters subcollection: "subjects/${subId}/chapters"...`);
      const chaptersSnap = await getDocs(collection(db, 'subjects', subId, 'chapters'));
      console.log(`  Found ${chaptersSnap.size} chapters inside "subjects/${subId}/chapters".`);

      if (chaptersSnap.size > 0) {
        // Take the first chapter as a representative sample
        const sampleChapter = chaptersSnap.docs[0];
        const chapterId = sampleChapter.id;
        const chapterData = sampleChapter.data();

        console.log(`\n  --- Representative Chapter Sample [ID: ${chapterId}] ---`);
        console.log(`  • chapter_no:`, chapterData.chapter_no);
        console.log(`  • chapter_name:`, chapterData.chapter_name || chapterData.chapter_name_hindi);
        
        // Notes / Text Content Structure
        console.log(`  • notes_hindi (type/length):`, chapterData.notes_hindi ? `${typeof chapterData.notes_hindi} (${chapterData.notes_hindi.length} chars)` : 'undefined');
        console.log(`  • intro_hindi (type/length):`, chapterData.intro_hindi ? `${typeof chapterData.intro_hindi} (${chapterData.intro_hindi.length} chars)` : 'undefined');
        console.log(`  • topper_tips (type/length):`, chapterData.topper_tips ? `${typeof chapterData.topper_tips} (${chapterData.topper_tips.length} chars)` : 'undefined');

        // Subjective Q&A Structure
        if (chapterData.subjective_qa && Array.isArray(chapterData.subjective_qa)) {
          console.log(`  • subjective_qa: Array with ${chapterData.subjective_qa.length} items.`);
          if (chapterData.subjective_qa.length > 0) {
            console.log(`    Sample Subjective Q&A Item Fields:`, Object.keys(chapterData.subjective_qa[0]));
            console.log(`    Sample Item detail:`, {
              question: chapterData.subjective_qa[0].question || chapterData.subjective_qa[0].q || null,
              answer: chapterData.subjective_qa[0].answer || chapterData.subjective_qa[0].a || null
            });
          }
        } else {
          console.log(`  • subjective_qa:`, typeof chapterData.subjective_qa);
        }

        // MCQ Structure
        if (chapterData.mcq && Array.isArray(chapterData.mcq)) {
          console.log(`  • mcq: Array with ${chapterData.mcq.length} items.`);
          if (chapterData.mcq.length > 0) {
            console.log(`    Sample MCQ Item Fields:`, Object.keys(chapterData.mcq[0]));
            console.log(`    Sample Item detail:`, {
              id: chapterData.mcq[0].id || null,
              question: chapterData.mcq[0].question || chapterData.mcq[0].q || null,
              options: chapterData.mcq[0].options || null,
              answer: chapterData.mcq[0].answer || chapterData.mcq[0].correct || null,
              explanation: chapterData.mcq[0].explanation || null
            });
          }
        } else {
          console.log(`  • mcq:`, typeof chapterData.mcq);
        }
      }
    }

    // 2. Inspect 'paid_notes' collection
    console.log("\n=========================================");
    console.log("📂 2. Inspecting 'paid_notes' collection (PDF/Class Notes)...");
    const paidNotesSnap = await getDocs(collection(db, 'paid_notes'));
    console.log(`Found ${paidNotesSnap.size} documents in 'paid_notes'.`);
    if (paidNotesSnap.size > 0) {
      const sampleNote = paidNotesSnap.docs[0];
      console.log(`  Sample Document ID: "${sampleNote.id}"`);
      console.log(`  Sample Document Data:`, sampleNote.data());
    }

    // 3. Inspect other minor collections for comprehensive view
    console.log("\n=========================================");
    console.log("📂 3. Checking other collection sizes...");
    const colList = ['payment_requests', 'users', 'live_classes', 'admin_courses', 'notifications'];
    for (const colName of colList) {
      try {
        const snap = await getDocs(collection(db, colName));
        console.log(`  • Collection "${colName}": ${snap.size} documents`);
      } catch (e: any) {
        console.log(`  • Collection "${colName}": error reading (${e?.message || e})`);
      }
    }

  } catch (error) {
    console.error("❌ Inspection error:", error);
  }
}

inspectCollections();
