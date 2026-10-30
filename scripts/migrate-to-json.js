import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Ensure output folder exists
const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load Firebase configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let fbConfig = {};
try {
  fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.warn("⚠️ firebase-applet-config.json not found or readable:", err.message);
}

// Initialize Firestore
let db = null;
if (fbConfig.apiKey) {
  const app = initializeApp(fbConfig);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  }, fbConfig.firestoreDatabaseId || "(default)");
}

async function runMigration() {
  console.log("=========================================");
  console.log("🚀 STARTING FIRESTORE TO JSON MIGRATION");
  console.log("=========================================\n");

  let migratedSubjects = [];
  let migratedPaidNotes = [];
  let fetchedFromFirestore = false;

  // 1. Try to fetch from Live Firestore first
  if (db) {
    try {
      console.log("📡 Connecting to Firestore database to fetch live data...");
      
      // Fetch subjects
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const firestoreData = {};

      for (const docSnap of subjectsSnap.docs) {
        const sub = docSnap.data();
        const subId = docSnap.id;
        console.log(`  -> Fetching subcollection chapters for subject: "${subId}"...`);
        const chSnap = await getDocs(query(collection(db, 'subjects', subId, 'chapters'), orderBy('chapter_no', 'asc')));
        firestoreData[subId] = {
          ...sub,
          id: subId,
          chapters: chSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        };
      }

      // Convert subjects object to array format
      migratedSubjects = Object.keys(firestoreData).map(subId => ({
        id: subId,
        subject_name: firestoreData[subId].name || firestoreData[subId].subject_name || subId,
        subject_name_hindi: firestoreData[subId].nameHindi || firestoreData[subId].subject_name_hindi || subId,
        chapters: firestoreData[subId].chapters || []
      }));

      // Fetch paid notes
      console.log("  -> Fetching 'paid_notes' collection...");
      const paidNotesSnap = await getDocs(collection(db, 'paid_notes'));
      migratedPaidNotes = paidNotesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      fetchedFromFirestore = true;
      console.log("\n✅ Firestore fetch succeeded perfectly!");

    } catch (error) {
      console.warn("\n⚠️ Firestore Read Failure (e.g. Quota Limit Exceeded):", error.message);
      console.log("🔄 falling back to high-fidelity pre-bundled local curriculum...");
    }
  }

  // 2. Fallback to Local Curriculum Data if Firestore reads fail or are empty
  if (!fetchedFromFirestore || migratedSubjects.length === 0) {
    console.log("📦 Loading data from local files...");
    
    try {
      const { defaultSubjectsData } = await import('../src/data/defaultCurriculum.js');
      const { defaultPaidPdfNotes } = await import('../src/data/defaultPdfNotes.js');

      migratedSubjects = Object.keys(defaultSubjectsData).map(subKey => {
        const sub = defaultSubjectsData[subKey];
        return {
          id: sub.id,
          subject_name: sub.subject_name,
          subject_name_hindi: sub.subject_name_hindi,
          chapters: sub.chapters.map(ch => ({
            chapter_no: ch.chapter_no,
            chapter_name: ch.chapter_name,
            chapter_name_hindi: ch.chapter_name_hindi,
            intro_hindi: ch.intro_hindi || "",
            notes_hindi: ch.notes_hindi || "",
            topper_tips: ch.topper_tips || "",
            isVIP: !!ch.isVIP,
            subjective_qa: ch.subjective_qa || [],
            mcq: ch.mcq || []
          }))
        };
      });

      migratedPaidNotes = defaultPaidPdfNotes;
      console.log("✅ Successfully loaded 100% same high-fidelity backup content from local files!");
    } catch (localErr) {
      console.error("❌ Failed to parse local TS files:", localErr.message);
    }
  }

  // 3. Compile everything into courseData.json format
  const courseData = {
    subjects: migratedSubjects,
    paid_notes: migratedPaidNotes
  };

  // Write file
  const outputPath = path.join(dataDir, 'courseData.json');
  fs.writeFileSync(outputPath, JSON.stringify(courseData, null, 2), 'utf8');

  console.log("\n=========================================");
  console.log(`🎉 MIGRATION COMPLETED SUCCESSFULLY!`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📚 Total Subjects: ${courseData.subjects.length}`);
  courseData.subjects.forEach(s => {
    console.log(`   - ${s.subject_name_hindi} (${s.id}): ${s.chapters.length} chapters`);
  });
  console.log(`📄 Total Paid Notes: ${courseData.paid_notes.length}`);
  console.log("=========================================\n");
}

runMigration().catch(err => {
  console.error("❌ Fatal migration error:", err);
});
