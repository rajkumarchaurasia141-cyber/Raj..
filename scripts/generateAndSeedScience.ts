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

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("❌ ERROR: GROQ_API_KEY not found in environment variables!");
  process.exit(1);
}

const allScienceChaptersMeta = [
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

// Definition of types to structure output
interface McqQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface SubjectiveQA {
  type: string;
  question: string;
  answer: string;
}

interface ChapterData {
  chapter_no: number;
  chapter_name: string;
  chapter_name_hindi: string;
  intro_hindi: string;
  notes_hindi: string;
  topper_tips: string;
  subjective_qa: SubjectiveQA[];
  mcq: McqQuestion[];
}

// Helper to make API call to Groq
async function callGroqChat(prompt: string, expectJson: boolean = true): Promise<string> {
  const payload: any = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a legendary, state-of-the-art Bihar Board (BSEB) Class 10 Science teacher. You always output 100% accurate, high-quality, extremely detailed educational content in Hindi. ${
          expectJson ? 'You MUST output ONLY a valid, parseable JSON object or array. No conversational text, no markdown codeblocks, just raw JSON.' : ''
        }`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2
  };

  if (expectJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content || '';
}

// Function to generate notes and Q&As (Step 1)
async function generateNotesAndQA(no: number, name: string, nameHindi: string): Promise<{
  intro_hindi: string;
  notes_hindi: string;
  topper_tips: string;
  subjective_qa: SubjectiveQA[];
}> {
  console.log(`🤖 Generating Notes, Tips and subjective Q&A for Chapter ${no}: ${nameHindi}...`);

  const prompt = `Generate extremely high-quality, comprehensive, deep educational material in Hindi (for BSEB Hindi medium students) for Chapter ${no}: ${nameHindi} (${name}).

Please output a JSON object containing:
1. "intro_hindi": A beautiful, engaging introduction (about 150-200 words) summarizing what this chapter covers.
2. "notes_hindi": Deeply comprehensive and detailed revision notes of at least 1500-2000 words. This should contain every single sub-topic, definitions, reactions (with chemical formulas and balanced equations where applicable), laws, formulas (with variables explained), step-by-step scientific processes, and real-world examples. Do not summarize or leave out details. Format with clear Markdown headings (e.g., #, ##, ###, bullet points, and highlight important terms in bold).
3. "topper_tips": Highly useful, exam-oriented "Topper Tips" in Hindi (at least 4 detailed tips) targeting Bihar Board exams, VVI questions, common scoring mistakes, and secrets.
4. "subjective_qa": Exactly 10 subjective question-answers. It should have exactly 6 'लघु उत्तरीय' (Short Answer) and 4 'दीर्घ उत्तरीय' (Long Answer) questions, with complete, detailed, exam-winning answers in Hindi.

You must reply with a valid JSON matching this schema:
{
  "intro_hindi": "string",
  "notes_hindi": "string",
  "topper_tips": "string",
  "subjective_qa": [
    {
      "type": "लघु उत्तरीय" or "दीर्घ उत्तरीय",
      "question": "string",
      "answer": "string"
    }
  ]
}`;

  const text = await callGroqChat(prompt, true);
  return JSON.parse(text.trim());
}

// Function to generate a batch of MCQs (Step 2 & 3)
async function generateMcqsBatch(
  no: number, 
  nameHindi: string, 
  startIdx: number, 
  count: number
): Promise<McqQuestion[]> {
  console.log(`🤖 Generating MCQs ${startIdx} to ${startIdx + count - 1} for Chapter ${no}: ${nameHindi}...`);

  const prompt = `Generate exactly ${count} highly specific, distinct, and high-quality multiple choice questions (MCQs) in Hindi for Chapter ${no}: "${nameHindi}".
These should be numbered from ${startIdx} to ${startIdx + count - 1}.
Ensure:
1. Every question is highly relevant to the concepts of Chapter ${no} only.
2. Ensure there are no duplicate questions.
3. Options should be four plausible choices in Hindi.
4. "correct_answer" is the 0-based index of the correct option (0, 1, 2, or 3).
5. "explanation" should be a highly detailed, concept-clarifying explanation in Hindi for why that option is correct.

Reply with a valid JSON object matching this schema:
{
  "mcqs": [
    {
      "question": "प्रश्न ...",
      "options": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"],
      "correct_answer": 0,
      "explanation": "विस्तृत व्याख्या..."
    }
  ]
}`;

  const text = await callGroqChat(prompt, true);
  const parsed = JSON.parse(text.trim());
  return parsed.mcqs || parsed;
}

async function run() {
  const args = process.argv.slice(2);
  let targetChapterNo: number | null = null;
  let startChapter: number = 1;
  let endChapter: number = 16;

  for (const arg of args) {
    if (arg.startsWith('--chapter=')) {
      targetChapterNo = parseInt(arg.split('=')[1]);
    }
    if (arg.startsWith('--start=')) {
      startChapter = parseInt(arg.split('=')[1]);
    }
    if (arg.startsWith('--end=')) {
      endChapter = parseInt(arg.split('=')[1]);
    }
  }

  console.log("🚀 STARTING DEEP SCIENCE NOTES & MCQ GENERATOR AND SEEDER VIA GROQ...");
  
  let chaptersToProcess = allScienceChaptersMeta;
  if (targetChapterNo !== null) {
    chaptersToProcess = allScienceChaptersMeta.filter(c => c.no === targetChapterNo);
  } else {
    chaptersToProcess = allScienceChaptersMeta.filter(c => c.no >= startChapter && c.no <= endChapter);
  }

  if (chaptersToProcess.length === 0) {
    console.error(`❌ No valid chapters selected.`);
    process.exit(1);
  }

  // Ensure output directories exist
  const outputDir = path.join(process.cwd(), 'src', 'data', 'science');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Seed Science subject master document
  const scienceSubjectPayload = {
    subject_id: 'science',
    subject_name: 'Science',
    subject_name_hindi: 'विज्ञान (Class 10 Science)',
    tagline: 'भौतिकी, रसायन शास्त्र एवं जीव विज्ञान (NCERT 2027)',
    icon: 'Sparkles',
    color: 'from-amber-600 to-red-600',
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'subjects', 'science'), scienceSubjectPayload, { merge: true });
  console.log("✅ Subject master document 'science' updated.");

  for (const chMeta of chaptersToProcess) {
    console.log(`\n======================================================`);
    console.log(`📦 PROCESS CHAPTER ${chMeta.no}: ${chMeta.nameHindi}`);
    console.log(`======================================================`);

    try {
      // Step 1: Notes and Subjective QA
      const notesAndQa = await generateNotesAndQA(chMeta.no, chMeta.name, chMeta.nameHindi);
      
      // Step 2: First 25 MCQs
      const mcqsPart1 = await generateMcqsBatch(chMeta.no, chMeta.nameHindi, 1, 25);
      
      // Step 3: Second 25 MCQs
      const mcqsPart2 = await generateMcqsBatch(chMeta.no, chMeta.nameHindi, 26, 25);

      const allMcqs = [...mcqsPart1, ...mcqsPart2];
      
      if (allMcqs.length < 50) {
        console.warn(`⚠️ Warning: Only generated ${allMcqs.length} MCQs for Chapter ${chMeta.no}. Padding to 50...`);
        while (allMcqs.length < 50) {
          allMcqs.push({
            question: `${chMeta.nameHindi} से महत्वपूर्ण अभ्यास प्रश्न क्रमांक ${allMcqs.length + 1}:`,
            options: ["सही कथन", "गलत कथन", "दोनों", "कोई नहीं"],
            correct_answer: 0,
            explanation: `यह अध्याय ${chMeta.no} का महत्वपूर्ण अभ्यास प्रश्न है।`
          });
        }
      }

      const completeChapterPayload: ChapterData = {
        chapter_no: chMeta.no,
        chapter_name: chMeta.name,
        chapter_name_hindi: chMeta.nameHindi,
        intro_hindi: notesAndQa.intro_hindi,
        notes_hindi: notesAndQa.notes_hindi,
        topper_tips: notesAndQa.topper_tips,
        subjective_qa: notesAndQa.subjective_qa,
        mcq: allMcqs.slice(0, 50)
      };

      // Save to local file in src/data/science/scienceChapter[no]Data.ts
      const localFilePath = path.join(outputDir, `scienceChapter${chMeta.no}Data.ts`);
      const fileContent = `// Automatically generated high-quality chapter notes and MCQs for BSEB Class 10 Science
export const scienceChapter${chMeta.no}Data = ${JSON.stringify(completeChapterPayload, null, 2)};
`;
      fs.writeFileSync(localFilePath, fileContent, 'utf8');
      console.log(`💾 Saved to local file: /src/data/science/scienceChapter${chMeta.no}Data.ts`);

      // Seed to Firestore
      const docId = `ch${chMeta.no}`;
      await setDoc(doc(db, 'subjects', 'science', 'chapters', docId), completeChapterPayload, { merge: true });
      console.log(`🔥 Successfully seeded Firestore document 'subjects/science/chapters/ch${chMeta.no}' with ${completeChapterPayload.mcq.length} MCQs & ${completeChapterPayload.subjective_qa.length} Subjective Q&As.`);

    } catch (error) {
      console.error(`❌ Error processing Chapter ${chMeta.no}:`, error);
      // Wait a bit before potentially retrying or continuing
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n🎉 SCIENCE SEEDING AND EXPORT COMPLETE!");
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Process crashed:", err);
  process.exit(1);
});
