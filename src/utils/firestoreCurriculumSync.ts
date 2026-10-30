import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { safeSetDoc } from './firestoreSafe';
import { defaultSubjectsData } from '../data/defaultCurriculum';

/**
 * Automatically syncs all subjects and all chapters from defaultSubjectsData to Firestore
 * so that all users and devices instantly have access to newly added chapters (Ch 1, 2, 3, etc.).
 */
export async function syncInitialCurriculumToFirestore() {
  try {
    for (const [subKey, subject] of Object.entries(defaultSubjectsData)) {
      const subRef = doc(db, 'subjects', subKey);
      await safeSetDoc(subRef, {
        id: subject.id,
        subject_name: subject.subject_name,
        subject_name_hindi: subject.subject_name_hindi,
        updated_at: new Date().toISOString()
      }, { merge: true });

      if (subject.chapters && Array.isArray(subject.chapters)) {
        for (const chapter of subject.chapters) {
          const chNo = chapter.chapter_no || 1;
          const chRef = doc(db, 'subjects', subKey, 'chapters', `ch${chNo}`);
          const written = await safeSetDoc(chRef, {
            ...chapter,
            updated_at: new Date().toISOString()
          }, { merge: true });
          if (!written) return;
        }
      }
    }
    console.log("Firestore Curriculum Sync: All subjects and chapters successfully synced.");
  } catch (err: any) {
    console.warn("Firestore Curriculum Sync notice:", err?.message || String(err));
  }
}

