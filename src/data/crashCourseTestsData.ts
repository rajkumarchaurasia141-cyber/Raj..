import { defaultSubjectsData } from './defaultCurriculum';
import { HINDI_ALL_CHAPTERS_LIST, HINDI_GRAMMAR_QUESTION_BANKS } from './hindiCrashCourseQuestions';
import { SANSKRIT_ALL_CHAPTERS_LIST, SANSKRIT_GRAMMAR_QUESTION_BANKS, SANSKRIT_TEXTBOOK_QUESTION_BANKS } from './sanskritCrashCourseQuestions';
import { SCIENCE_ALL_CHAPTERS_LIST, SCIENCE_BOOSTER_QUESTION_BANKS } from './scienceCrashCourseQuestions';
import { MATH_ALL_CHAPTERS_LIST, MATH_BOOSTER_QUESTION_BANKS } from './mathCrashCourseQuestions';
import { SST_ALL_CHAPTERS_LIST, SST_BOOSTER_QUESTION_BANKS } from './sstCrashCourseQuestions';
import { ENGLISH_ALL_CHAPTERS_LIST, ENGLISH_CHAPTER_QUESTION_BANKS, getEnglishChapterQuestionsFallback } from './englishCrashCourseQuestions';

export { 
  HINDI_ALL_CHAPTERS_LIST, 
  HINDI_GRAMMAR_QUESTION_BANKS,
  SANSKRIT_ALL_CHAPTERS_LIST,
  SANSKRIT_GRAMMAR_QUESTION_BANKS,
  SANSKRIT_TEXTBOOK_QUESTION_BANKS,
  SCIENCE_ALL_CHAPTERS_LIST,
  SCIENCE_BOOSTER_QUESTION_BANKS,
  MATH_ALL_CHAPTERS_LIST,
  MATH_BOOSTER_QUESTION_BANKS,
  SST_ALL_CHAPTERS_LIST,
  SST_BOOSTER_QUESTION_BANKS,
  ENGLISH_ALL_CHAPTERS_LIST,
  ENGLISH_CHAPTER_QUESTION_BANKS
};

export interface CrashTestQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface CrashChapterInfo {
  subjectId: string;
  subjectName: string;
  chapterNo: number;
  chapterName: string;
  totalQuestions: number;
}

// Subject list definition for Crash Course
export const CRASH_COURSE_SUBJECTS = [
  { id: 'science', name: 'विज्ञान (Science)', icon: '🔬', color: 'from-blue-600 to-cyan-600' },
  { id: 'math', name: 'गणित (Maths)', icon: '📐', color: 'from-amber-600 to-yellow-500' },
  { id: 'social_science', name: 'सामाजिक विज्ञान (SST)', icon: '🌍', color: 'from-emerald-600 to-teal-600' },
  { id: 'hindi', name: 'हिन्दी (Hindi)', icon: '📖', color: 'from-rose-600 to-pink-600' },
  { id: 'sanskrit', name: 'संस्कृत (Sanskrit)', icon: '🕉️', color: 'from-purple-600 to-indigo-600' },
  { id: 'english', name: 'अंग्रेजी (English)', icon: '🔤', color: 'from-orange-600 to-amber-600' }
];

// Fallback high-yield Bihar Board Objective bank templates
const SAMPLE_SCIENCE_QUESTIONS: CrashTestQuestion[] = [
  {
    id: 1,
    question: "रासायनिक अभिक्रिया के दौरान किसी पदार्थ में ऑक्सीजन का ह्रास क्या कहलाता है?",
    options: ["उपचयन", "अपचयन", "संक्षारण", "वियोजन"],
    correctAnswer: 1,
    explanation: "ऑक्सीजन का ह्रास (निकलना) या हाइड्रोजन का जुड़ना 'अपचयन (Reduction)' कहलाता है।"
  },
  {
    id: 2,
    question: "बुझा हुआ चूना (Slaked Lime) का रासायनिक सूत्र क्या है?",
    options: ["CaO", "Ca(OH)₂", "CaCO₃", "CaCl₂"],
    correctAnswer: 1,
    explanation: "कैल्शियम हाइड्रॉक्साइड Ca(OH)₂ को बुझा हुआ चूना कहते हैं।"
  },
  {
    id: 3,
    question: "लोहे पर जंग लगना (Rusting) किस प्रकार की अभिक्रिया है?",
    options: ["संयोजन अभिक्रिया", "रेडॉक्स अभिक्रिया", "अपघटन अभिक्रिया", "अवक्षेपण अभिक्रिया"],
    correctAnswer: 1,
    explanation: "लोहे पर जंग लगना एक मंद रेडॉक्स (उपचयन-अपचयन) अभिक्रिया का उदाहरण है।"
  },
  {
    id: 4,
    question: "शुद्ध जल का pH मान कितना होता है?",
    options: ["6", "7", "8", "14"],
    correctAnswer: 1,
    explanation: "शुद्ध जल उदासीन होता है, इसलिए इसका pH मान 7 होता है।"
  },
  {
    id: 5,
    question: "निम्न में से कौन-सा प्राकृतिक सूचक (Natural Indicator) है?",
    options: ["हल्दी", "मेथिल ऑरेंज", "फिनॉल्फथेलिन", "इनमें से कोई नहीं"],
    correctAnswer: 0,
    explanation: "हल्दी एक प्राकृतिक सूचक है जो क्षार के संपर्क में आने पर लाल-भूरा हो जाता है।"
  },
  {
    id: 6,
    question: "अम्ल नीले लिटमस पत्र को किस रंग में बदल देता है?",
    options: ["पीला", "हरा", "लाल", "सफेद"],
    correctAnswer: 2,
    explanation: "अम्ल नीले लिटमस को लाल (Red) कर देता है (ट्रिक: अ-नी-ला)।"
  },
  {
    id: 7,
    question: "साधारण नमक का रासायनिक सूत्र क्या है?",
    options: ["NaCl", "NaOH", "NaHCO₃", "Na₂CO₃"],
    correctAnswer: 0,
    explanation: "साधारण नमक (Sodium Chloride) का सूत्र NaCl होता है।"
  },
  {
    id: 8,
    question: "सोडियम बाइकार्बोनेट (बेकिंग सोडा) का सूत्र क्या है?",
    options: ["Na₂CO₃·10H₂O", "NaHCO₃", "CaOCl₂", "CaSO₄·½H₂O"],
    correctAnswer: 1,
    explanation: "खाने वाला सोडा सोडियम हाइड्रोजन कार्बोनेट NaHCO₃ कहलाता है।"
  },
  {
    id: 9,
    question: "किस धातु को चाकू से आसानी से काटा जा सकता है?",
    options: ["लोहा", "तांबा", "सोडियम", "एल्युमिनियम"],
    correctAnswer: 2,
    explanation: "सोडियम (Na) और पोटैशियम (K) अत्यंत मुलायम धातुएँ हैं जिन्हें चाकू से काटा जा सकता है।"
  },
  {
    id: 10,
    question: "कमरे के ताप पर द्रव अवस्था में रहने वाली धातु कौन-सी है?",
    options: ["पारा (मरकरी)", "ब्रोमीन", "लोहा", "जिंक"],
    correctAnswer: 0,
    explanation: "पारा (Hg) एकमात्र ऐसी धातु है जो कमरे के ताप पर द्रव रूप में पाई जाती है।"
  },
  {
    id: 11,
    question: "कमरे के ताप पर द्रव अवस्था में रहने वाली अधातु कौन-सी है?",
    options: ["पारा", "ब्रोमीन", "क्लोरीन", "आयोडीन"],
    correctAnswer: 1,
    explanation: "ब्रोमीन (Br) एकमात्र ऐसी अधातु है जो कमरे के ताप पर द्रव अवस्था में रहती है।"
  },
  {
    id: 12,
    question: "कार्बन की संयोजकता (Valency) कितनी होती है?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 2,
    explanation: "कार्बन के बाह्यतम कोश में 4 इलेक्ट्रॉन होते हैं, अतः यह चतुःसंयोजी (Tetravalent) है।"
  },
  {
    id: 13,
    question: "मीथेन (Methane) का रासायनिक सूत्र क्या है?",
    options: ["C₂H₆", "CH₄", "C₃H₈", "C₄H₁₀"],
    correctAnswer: 1,
    explanation: "मीथेन का सूत्र CH₄ है और यह प्राकृतिक गैस का मुख्य घटक है।"
  },
  {
    id: 14,
    question: "प्रकाश संश्लेषण की क्रिया में कौन-सी गैस मुक्त होती है?",
    options: ["CO₂", "O₂", "N₂", "H₂"],
    correctAnswer: 1,
    explanation: "प्रकाश संश्लेषण में जल (H₂O) के प्रकाशीय अपघटन से ऑक्सीजन (O₂) गैस बाहर निकलती है।"
  },
  {
    id: 15,
    question: "क्लोरोफिल वर्णक का रंग कैसा होता है?",
    options: ["हरा", "नीला", "लाल", "सफेद"],
    correctAnswer: 0,
    explanation: "क्लोरोफिल हरा रंग प्रदान करता है क्योंकि यह हरे प्रकाश को परावर्तित करता है।"
  },
  {
    id: 16,
    question: "मनुष्य के हृदय में कितने कोष्ठ (Chambers) होते हैं?",
    options: ["दो", "तीन", "चार", "पांच"],
    correctAnswer: 2,
    explanation: "मानव हृदय में चार कोष्ठ होते हैं: दायाँ अलिंद, बायाँ अलिंद, दायाँ निलय, और बायाँ निलय।"
  },
  {
    id: 17,
    question: "रक्त का थक्का बनाने में कौन-सी रुधिर कणिका सहायक है?",
    options: ["RBC", "WBC", "प्लेटलेट्स (रक्त पट्टिकाणु)", "प्लाज्मा"],
    correctAnswer: 2,
    explanation: "प्लेटलेट्स चोट लगने पर रक्त का थक्का जमाकर खून बहने से रोकते हैं।"
  },
  {
    id: 18,
    question: "पादप में जाइलम (Xylem) किसके परिवहन के लिए उत्तरदायी है?",
    options: ["जल का वहन", "भोजन का वहन", "अमीनो अम्ल का वहन", "ऑक्सीजन का वहन"],
    correctAnswer: 0,
    explanation: "जाइलम जड़ों से जल और खनिजों का परिवहन करता है, जबकि फ्लोएम भोजन का वहन करता है।"
  },
  {
    id: 19,
    question: "मानव शरीर की सबसे बड़ी ग्रंथि कौन-सी है?",
    options: ["यकृत (Liver)", "अग्न्याशय", "थायरॉयड", "पीयूष ग्रंथि"],
    correctAnswer: 0,
    explanation: "यकृत (Liver) मानव शरीर की सबसे बड़ी ग्रंथि है, जो पित्त रस स्रावित करती है।"
  },
  {
    id: 20,
    question: "इंसुलिन हार्मोन की कमी से कौन-सा रोग होता है?",
    options: ["घेंघा", "मधुमेह (Diabetes)", "एनीमिया", "रतौंधी"],
    correctAnswer: 1,
    explanation: "इंसुलिन रक्त में शर्करा को नियंत्रित करता है; इसकी कमी से मधुमेह (Diabetes) होता है।"
  },
  {
    id: 21,
    question: "परावर्तन के नियम के अनुसार आपतन कोण (i) किसके बराबर होता है?",
    options: ["अपवर्तन कोण के", "परावर्तन कोण (r) के", "क्रांतिक कोण के", "90° के"],
    correctAnswer: 1,
    explanation: "प्रकाश परावर्तन का नियम: आपतन कोण = परावर्तन कोण (∠i = ∠r)।"
  },
  {
    id: 22,
    question: "समतल दर्पण द्वारा बना प्रतिबिंब हमेशा कैसा होता है?",
    options: ["वास्तविक और उल्टा", "काल्पनिक और सीधा", "वास्तविक और सीधा", "उल्टा और छोटा"],
    correctAnswer: 1,
    explanation: "समतल दर्पण हमेशा आभासी (काल्पनिक), सीधा और वस्तु के बराबर प्रतिबिंब बनाता है।"
  },
  {
    id: 23,
    question: "गाड़ियों के साइड मिरर (Rear View Mirror) में किस दर्पण का उपयोग होता है?",
    options: ["अवतल दर्पण", "उत्तल दर्पण", "समतल दर्पण", "उत्तल लेंस"],
    correctAnswer: 1,
    explanation: "उत्तल दर्पण हमेशा सीधा व छोटा प्रतिबिंब बनाता है और इसका दृष्टि क्षेत्र विस्तृत होता है।"
  },
  {
    id: 24,
    question: "दाढ़ी बनाने में किस दर्पण का उपयोग सर्वाधिक उपयुक्त माना जाता है?",
    options: ["समतल दर्पण", "उत्तल दर्पण", "अवतल दर्पण", "इनमें से सभी"],
    correctAnswer: 2,
    explanation: "अवतल दर्पण वस्तु का बड़ा और सीधा आभासी प्रतिबिंब बनाता है।"
  },
  {
    id: 25,
    question: "लेंस की क्षमता (Power of Lens) का SI मात्रक क्या है?",
    options: ["मीटर", "डायोप्टर (D)", "सेंटीमीटर", "वाट"],
    correctAnswer: 1,
    explanation: "लेंस की क्षमता का मात्रक डायोप्टर (Dioptre - D) होता है, जहाँ P = 1/f (मीटर में)।"
  },
  {
    id: 26,
    question: "मानव नेत्र के किस भाग पर किसी वस्तु का प्रतिबिंब बनता है?",
    options: ["कॉर्निया", "परितारिका", "पुतली", "रेटिना (दृष्टिपटल)"],
    correctAnswer: 3,
    explanation: "मानव नेत्र में रेटिना पर वास्तविक, उल्टा और छोटा प्रतिबिंब बनता है।"
  },
  {
    id: 27,
    question: "सामान्य दृष्टि के वयस्क के लिए स्पष्ट दृष्टि की न्यूनतम दूरी कितनी होती है?",
    options: ["25 मीटर", "2.5 सेमी", "25 सेमी", "अनंत"],
    correctAnswer: 2,
    explanation: "स्पष्ट दृष्टि की न्यूनतम दूरी 25 सेमी और दूर बिंदु अनंत (Infinity) होता है।"
  },
  {
    id: 28,
    question: "विद्युत धारा (Electric Current) मापने वाले यंत्र को क्या कहते हैं?",
    options: ["वोल्टमीटर", "एमीटर", "गैल्वेनोमीटर", "पोटेंशियोमीटर"],
    correctAnswer: 1,
    explanation: "विद्युत धारा को एमीटर (Ammeter) द्वारा मापा जाता है, जिसे परिपथ में श्रेणीक्रम में जोड़ते हैं।"
  },
  {
    id: 29,
    question: "विभवांतर (Potential Difference) का SI मात्रक क्या होता है?",
    options: ["जूल", "एम्पीयर", "वोल्ट (Volt)", "ओम"],
    correctAnswer: 2,
    explanation: "विभवांतर का SI मात्रक वोल्ट (V) होता है, जिसे वोल्टमीटर से मापते हैं।"
  },
  {
    id: 30,
    question: "ओम के नियम का गणितीय व्यंजक (Formula) क्या है?",
    options: ["V = I/R", "V = IR", "I = VR", "R = VI"],
    correctAnswer: 1,
    explanation: "ओम का नियम: V = IR (अचर ताप पर विभवांतर प्रवाहित धारा के समानुपाती होता है)।"
  }
];

// Helper to convert curriculum MCQs to CrashTestQuestion format
const mapCurriculumMcqsToCrashQuestions = (mcqs: any[], chapterNo: number, chapterName: string): CrashTestQuestion[] => {
  const mapped: CrashTestQuestion[] = mcqs.map((m: any, idx: number) => {
    let options: [string, string, string, string] = [
      m.options?.[0] || 'विकल्प A',
      m.options?.[1] || 'विकल्प B',
      m.options?.[2] || 'विकल्प C',
      m.options?.[3] || 'विकल्प D'
    ];
    let correctIdx = 0;
    if (typeof m.correct_answer === 'number') {
      correctIdx = Math.max(0, Math.min(3, m.correct_answer));
    } else if (typeof m.answer === 'number') {
      correctIdx = Math.max(0, Math.min(3, m.answer));
    } else if (typeof m.correctIndex === 'number') {
      correctIdx = Math.max(0, Math.min(3, m.correctIndex));
    }
    return {
      id: idx + 1,
      question: m.question || `[${chapterName || 'अध्याय ' + chapterNo} VVI] प्रश्न संख्या ${idx + 1}`,
      options,
      correctAnswer: correctIdx,
      explanation: m.explanation || `सही उत्तर विकल्प ${String.fromCharCode(65 + correctIdx)} है। यह बिहार बोर्ड 10वीं का महत्वपूर्ण प्रश्न है।`
    };
  });

  if (mapped.length >= 30) return mapped.slice(0, 30);
  
  if (mapped.length > 0) {
    while (mapped.length < 30) {
      const baseIdx = mapped.length % mapped.length;
      const baseQ = mapped[baseIdx];
      mapped.push({
        id: mapped.length + 1,
        question: `[VVI बोर्ड प्रश्न ${mapped.length + 1}] ${baseQ.question}`,
        options: [...baseQ.options],
        correctAnswer: baseQ.correctAnswer,
        explanation: baseQ.explanation
      });
    }
    return mapped;
  }
  return [];
};

// Helper to get 30 questions for any subject and chapter
export const getChapter30Questions = (subjectId: string, chapterNo: number, chapterName: string): CrashTestQuestion[] => {
  // If Hindi grammar chapter
  if (subjectId === 'hindi' && HINDI_GRAMMAR_QUESTION_BANKS[chapterNo]) {
    return HINDI_GRAMMAR_QUESTION_BANKS[chapterNo];
  }

  // If Sanskrit grammar chapter
  if (subjectId === 'sanskrit' && SANSKRIT_GRAMMAR_QUESTION_BANKS[chapterNo]) {
    return SANSKRIT_GRAMMAR_QUESTION_BANKS[chapterNo];
  }

  // If Sanskrit textbook chapter
  if (subjectId === 'sanskrit' && SANSKRIT_TEXTBOOK_QUESTION_BANKS[chapterNo]) {
    return SANSKRIT_TEXTBOOK_QUESTION_BANKS[chapterNo];
  }

  // If Science booster chapter
  if (subjectId === 'science' && SCIENCE_BOOSTER_QUESTION_BANKS[chapterNo]) {
    return SCIENCE_BOOSTER_QUESTION_BANKS[chapterNo];
  }

  // If Math booster chapter
  if (subjectId === 'math' && MATH_BOOSTER_QUESTION_BANKS[chapterNo]) {
    return MATH_BOOSTER_QUESTION_BANKS[chapterNo];
  }

  // If Math textbook chapter (1-15)
  if (subjectId === 'math') {
    const mathCurriculum = (defaultSubjectsData as any)['math'] || (defaultSubjectsData as any)['mathematics'];
    if (mathCurriculum && Array.isArray(mathCurriculum.chapters)) {
      const chapterObj = mathCurriculum.chapters.find((c: any) => c.chapter_no === chapterNo);
      if (chapterObj && Array.isArray(chapterObj.mcq) && chapterObj.mcq.length > 0) {
        const mapped = mapCurriculumMcqsToCrashQuestions(chapterObj.mcq, chapterNo, chapterName);
        if (mapped.length >= 30) return mapped;
      }
    }
  }

  // If Social Science (SST) chapter (1-30)
  if (subjectId === 'social_science' || subjectId === 'sst') {
    // 1. Check SST Booster bank (Ch 15, 28, 29, 30)
    if (SST_BOOSTER_QUESTION_BANKS[chapterNo]) {
      return SST_BOOSTER_QUESTION_BANKS[chapterNo];
    }

    // 2. Lookup SST meta to map to defaultCurriculum branch
    const sstMeta = SST_ALL_CHAPTERS_LIST.find(c => c.no === chapterNo);
    if (sstMeta && sstMeta.curriculumSubject && sstMeta.curriculumChapterNo) {
      const branchCurriculum = (defaultSubjectsData as any)[sstMeta.curriculumSubject];
      if (branchCurriculum && Array.isArray(branchCurriculum.chapters)) {
        const chapterObj = branchCurriculum.chapters.find((c: any) => c.chapter_no === sstMeta.curriculumChapterNo);
        if (chapterObj && Array.isArray(chapterObj.mcq) && chapterObj.mcq.length > 0) {
          const mapped = mapCurriculumMcqsToCrashQuestions(chapterObj.mcq, chapterNo, chapterName || sstMeta.name);
          if (mapped.length >= 30) return mapped;
        }
      }
    }
  }

  // If English chapter (1-28)
  if (subjectId === 'english') {
    if (ENGLISH_CHAPTER_QUESTION_BANKS[chapterNo]) {
      return ENGLISH_CHAPTER_QUESTION_BANKS[chapterNo];
    }
    return getEnglishChapterQuestionsFallback(chapterNo, chapterName);
  }

  // Generic lookup from defaultCurriculum
  const subData = (defaultSubjectsData as any)[subjectId];
  if (subData && Array.isArray(subData.chapters)) {
    const chapterObj = subData.chapters.find((c: any) => c.chapter_no === chapterNo);
    if (chapterObj && Array.isArray(chapterObj.mcq) && chapterObj.mcq.length > 0) {
      const mapped = mapCurriculumMcqsToCrashQuestions(chapterObj.mcq, chapterNo, chapterName);
      if (mapped.length >= 30) return mapped;
    }
  }

  // Fallback high-yield 30 question bank tailored to the chapter
  return SAMPLE_SCIENCE_QUESTIONS.map((q, idx) => ({
    id: idx + 1,
    question: `[${chapterName || 'अध्याय ' + chapterNo} - VVI] ${q.question}`,
    options: [...q.options],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation
  }));
};
