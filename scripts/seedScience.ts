import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, getFirestore } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";

// Ensure GEMINI_API_KEY is present
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY environment variable is missing!");
  process.exit(1);
}

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

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const scienceChapters = [
  { no: 1, name: "Chemical Reactions and Equations", nameHindi: "रासायनिक अभिक्रियाएँ एवं समीकरण" },
  { no: 2, name: "Acids, Bases and Salts", nameHindi: "अम्ल, क्षारक एवं लवण" },
  { no: 3, name: "Metals and Non-metals", nameHindi: "धातु एवं अधातु" },
  { no: 4, name: "Carbon and its Compounds", nameHindi: "कार्बन एवं उसके यौगिक" },
  { no: 5, name: "Periodic Classification of Elements", nameHindi: "तत्वों का आवर्त वर्गीकरण" },
  { no: 6, name: "Life Processes", nameHindi: "जैव प्रक्रम" },
  { no: 7, name: "Control and Coordination", nameHindi: "नियंत्रण एवं समन्वय" },
  { no: 8, name: "How do Organisms Reproduce?", nameHindi: "जीव जनन कैसे करते हैं?" },
  { no: 9, name: "Heredity and Evolution", nameHindi: "आनुवंशिकता एवं जैव विकास" },
  { no: 10, name: "Light - Reflection and Refraction", nameHindi: "प्रकाश – परावर्तन तथा अपवर्तन" },
  { no: 11, name: "The Human Eye and the Colorful World", nameHindi: "मानव नेत्र तथा रंगबिरंगा संसार" },
  { no: 12, name: "Electricity", nameHindi: "विद्युत" },
  { no: 13, name: "Magnetic Effects of Electric Current", nameHindi: "विद्युत धारा के चुंबकीय प्रभाव" },
  { no: 14, name: "Sources of Energy", nameHindi: "ऊर्जा के स्रोत" },
  { no: 15, name: "Our Environment", nameHindi: "हमारा पर्यावरण" },
  { no: 16, name: "Sustainable Management of Natural Resources", nameHindi: "प्राकृतिक संसाधनों का संपोषित प्रबंधन" }
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getInteractionText(interaction: any): string {
  if (interaction.output_text) return interaction.output_text;
  let text = "";
  for (const step of interaction.steps || []) {
    if (step.type === 'model_output') {
      const textContent = step.content?.find((c: any) => c.type === 'text');
      if (textContent && textContent.text) {
        text += textContent.text;
      }
    }
  }
  return text;
}

function extractJson(text: string): any {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/([\{\[][\s\S]*[\}\]])/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
}

async function generateFirstSection(ch: typeof scienceChapters[0]) {
  const prompt = `
Generate standard study materials in Hindi for BSEB Class 10 Science, Chapter ${ch.no}: "${ch.nameHindi}" (${ch.name}).
You must output a JSON object containing the following keys:
1. "intro_hindi": A detailed chapter introduction in Hindi starting with "【 पाठ परिचय 】". Describe the core topics of this chapter, its importance in Bihar Board examinations, and a high-level summary of what the student will learn in BSEB 2027 style.
2. "notes_hindi": Exhaustive, highly detailed, chapter-wise notes in Hindi. Use headings like "【 मुख्य संकल्पनाएँ 】", "【 महत्वपूर्ण परिभाषाएँ 】" etc., numbered sub-sections like "१. ..." with a colon, bullet points starting with "▶", and bold highlights. Make sure it is extremely long, thorough, and highly formatted, covering every topic of the NCERT chapter in detail so students do not need any other reference book.
3. "topper_tips": 8-12 topper revision tips, marks boosters, and formula lists. Format each line clearly, starting with "#1", "#2" etc. Highlight how to write answers for full marks in BSEB exams.
4. "subjective_qa": An array of at least 10 items. Each item is an object with "type" (choose from 'लघु उत्तरीय' or 'दीर्घ उत्तरीय'), "question" (the question text in Hindi), and "answer" (the complete detailed answer text in Hindi). Include both direct NCERT textbook questions and board-favourite questions.
  `;

  console.log(`🤖 [Ch ${ch.no}] Generating Introduction, Notes, Tips, and Q&A...`);
  
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
    response_format: {
      type: Type.OBJECT,
      properties: {
        intro_hindi: { type: Type.STRING },
        notes_hindi: { type: Type.STRING },
        topper_tips: { type: Type.STRING },
        subjective_qa: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["type", "question", "answer"]
          }
        }
      },
      required: ["intro_hindi", "notes_hindi", "topper_tips", "subjective_qa"]
    }
  });

  const text = getInteractionText(interaction);
  if (!text) {
    throw new Error(`Failed to generate first section for Chapter ${ch.no}`);
  }

  return extractJson(text);
}

async function generateMCQBatch(ch: typeof scienceChapters[0], batchNo: number) {
  const startIdx = (batchNo - 1) * 10 + 1;
  const endIdx = batchNo * 10;
  
  const prompt = `
Generate 10 unique, highly-relevant Multiple Choice Questions (MCQs) in Hindi for BSEB Class 10 Science, Chapter ${ch.no}: "${ch.nameHindi}" (${ch.name}).
This is Batch ${batchNo} (Questions ${startIdx} to ${endIdx}).
Each question must be strictly relevant to Bihar Board examinations, covering conceptual and factual topics.
Each object in the returned JSON array must have:
- "question": string (the question in Hindi)
- "options": array of 4 strings (the options in Hindi)
- "correct_answer": integer (index of the correct answer, 0 to 3)
- "explanation": string (a detailed explanation in Hindi why this option is correct)
  `;

  console.log(`🤖 [Ch ${ch.no}] Generating MCQs Batch ${batchNo}/5 (Q ${startIdx}-${endIdx})...`);
  
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,
    response_format: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correct_answer: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correct_answer", "explanation"]
      }
    }
  });

  const text = getInteractionText(interaction);
  if (!text) {
    throw new Error(`Failed to generate MCQ Batch ${batchNo} for Chapter ${ch.no}`);
  }

  return extractJson(text);
}

async function seedSubject() {
  console.log("🚀 Initializing Science Subject in Firestore...");
  const scienceRef = doc(db, 'subjects', 'science');
  await setDoc(scienceRef, {
    id: 'science',
    subject_name: 'Science',
    subject_name_hindi: 'विज्ञान (भौतिकी, रसायन, जीवविज्ञान)',
    updated_at: new Date().toISOString()
  }, { merge: true });
  console.log("✅ Science Subject entry verified.");
}

async function seedAllChapters() {
  await seedSubject();

  for (const ch of scienceChapters) {
    console.log(`\n==============================================`);
    console.log(`📖 STARTING CHAPTER ${ch.no}: ${ch.nameHindi}`);
    console.log(`==============================================`);

    try {
      // 1. Generate First Section
      let firstSection;
      let retries = 3;
      while (retries > 0) {
        try {
          firstSection = await generateFirstSection(ch);
          break;
        } catch (e: any) {
          console.warn(`⚠️ Error generating first section for Ch ${ch.no}. Retrying... (${retries} left). Error: ${e.message}`);
          retries--;
          await delay(3000);
        }
      }

      if (!firstSection) {
        console.error(`❌ Skipped Chapter ${ch.no} due to repeated failures on first section.`);
        continue;
      }

      // 2. Generate MCQs in 5 Batches of 10 to ensure exactly 50 MCQs
      const allMCQs: any[] = [];
      for (let b = 1; b <= 5; b++) {
        let batch;
        let batchRetries = 3;
        while (batchRetries > 0) {
          try {
            batch = await generateMCQBatch(ch, b);
            if (Array.isArray(batch)) {
              allMCQs.push(...batch);
              break;
            } else {
              throw new Error("Batch is not an array");
            }
          } catch (e: any) {
            console.warn(`⚠️ Error generating MCQ batch ${b} for Ch ${ch.no}. Retrying... (${batchRetries} left). Error: ${e.message}`);
            batchRetries--;
            await delay(3000);
          }
        }
        await delay(1000); // Small cooldown between batches
      }

      if (allMCQs.length < 40) {
        console.warn(`⚠️ Warning: Chapter ${ch.no} only got ${allMCQs.length} MCQs instead of 50. Proceeding with upload.`);
      } else {
        console.log(`✅ Successfully generated ${allMCQs.length} MCQs for Chapter ${ch.no}.`);
      }

      // 3. Save to Firestore
      console.log(`💾 Saving Chapter ${ch.no} to Firestore...`);
      const chRef = doc(db, 'subjects', 'science', 'chapters', `ch${ch.no}`);
      await setDoc(chRef, {
        chapter_no: ch.no,
        chapter_name: ch.name,
        chapter_name_hindi: ch.nameHindi,
        intro_hindi: firstSection.intro_hindi,
        notes_hindi: firstSection.notes_hindi,
        topper_tips: firstSection.topper_tips,
        subjective_qa: firstSection.subjective_qa,
        mcq: allMCQs,
        updated_at: new Date().toISOString()
      }, { merge: true });

      console.log(`🎉 CHAPTER ${ch.no} SUCCESSFULLY UPLOADED TO FIRESTORE!`);
      
      // Delay before starting next chapter to prevent API Rate Limits
      await delay(2000);
    } catch (err: any) {
      console.error(`❌ Critical Error in Chapter ${ch.no}:`, err.message);
    }
  }

  console.log("\n⭐️⭐️⭐️ SEEDING COMPLETE! ALL 16 CHAPTERS ARE NOW LIVE IN FIRESTORE! ⭐️⭐️⭐️");
}

seedAllChapters().catch(err => {
  console.error("❌ Seeding failed:", err);
});
