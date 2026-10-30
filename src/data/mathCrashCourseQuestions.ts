import { CrashTestQuestion } from './crashCourseTestsData';

export interface MathChapterMeta {
  no: number;
  name: string;
  category: 'algebra' | 'geometry' | 'trigonometry' | 'mensuration' | 'booster';
  branch: string;
  topics: string;
  questionCount: number;
}

export const MATH_ALL_CHAPTERS_LIST: MathChapterMeta[] = [
  {
    no: 1,
    name: 'वास्तविक संख्याएँ (Real Numbers)',
    category: 'algebra',
    branch: 'संख्या पद्धति',
    topics: 'यूक्लिड विभाजन, HCF-LCM संबंध, परिमेय/अपरिमेय संख्याएँ (√2, √3, √5), सांत/असांत दशमलव',
    questionCount: 30
  },
  {
    no: 2,
    name: 'बहुपद (Polynomials)',
    category: 'algebra',
    branch: 'बीजगणित',
    topics: 'शून्यकों की संख्या, द्विघात बहुपद (α+β = -b/a, αβ = c/a), घात एवं शून्यक',
    questionCount: 30
  },
  {
    no: 3,
    name: 'दो चर वाले रैखिक समीकरण युग्म (Pair of Linear Equations)',
    category: 'algebra',
    branch: 'बीजगणित',
    topics: 'विरोधी/अविरोधी/आश्रित, प्रतिच्छेदी/समांतर/संपाती रेखाएँ, अद्वितीय/अनंत/कोई हल नहीं की शर्तें',
    questionCount: 30
  },
  {
    no: 4,
    name: 'द्विघात समीकरण (Quadratic Equations)',
    category: 'algebra',
    branch: 'बीजगणित',
    topics: 'विविक्तकर D = b² - 4ac, मूलों की प्रकृति (वास्तविक/समान/काल्पनिक), द्विघाती सूत्र',
    questionCount: 30
  },
  {
    no: 5,
    name: 'समांतर श्रेढ़ियाँ (Arithmetic Progressions - AP)',
    category: 'algebra',
    branch: 'बीजगणित',
    topics: 'सार्व अंतर (d = a₂-a₁), nवाँ पद (an = a+(n-1)d), प्रथम n पदों का योग Sn',
    questionCount: 30
  },
  {
    no: 6,
    name: 'त्रिभुज (Triangles)',
    category: 'geometry',
    branch: 'ज्यामिति',
    topics: 'थेल्स प्रमेय (BPT), समरूप त्रिभुज कसौटियाँ (AAA, SAS, SSS), क्षेत्रफलों का अनुपात',
    questionCount: 30
  },
  {
    no: 7,
    name: 'निर्देशांक ज्यामिति (Coordinate Geometry)',
    category: 'geometry',
    branch: 'निर्देशांक ज्यामिति',
    topics: 'दूरी सूत्र √[(x₂-x₁)²+(y₂-y₁)²], मूल बिंदु से दूरी, मध्य बिंदु, विभाजन सूत्र, त्रिभुज का क्षेत्रफल',
    questionCount: 30
  },
  {
    no: 8,
    name: 'त्रिकोणमिति का परिचय (Introduction to Trigonometry)',
    category: 'trigonometry',
    branch: 'त्रिकोणमिति',
    topics: 'sin, cos, tan, cot, sec, cosec सूत्र, पूरक कोण सूत्र, sin²θ + cos²θ = 1',
    questionCount: 30
  },
  {
    no: 9,
    name: 'त्रिकोणमिति के कुछ अनुप्रयोग - ऊँचाई और दूरी (Applications of Trigonometry)',
    category: 'trigonometry',
    branch: 'त्रिकोणमिति',
    topics: 'उन्नयन कोण, अवनमन कोण, दृष्टि रेखा, 30°, 45°, 60° पर खंभे, मीनार और छाया की गणना',
    questionCount: 30
  },
  {
    no: 10,
    name: 'वृत्त (Circles)',
    category: 'geometry',
    branch: 'ज्यामिति',
    topics: 'वृत्त की स्पर्श रेखा, स्पर्श बिंदु पर त्रिज्या लंब, बाह्य बिंदु से स्पर्श रेखाओं की लंबाई',
    questionCount: 30
  },
  {
    no: 11,
    name: 'रचनाएँ (Constructions)',
    category: 'geometry',
    branch: 'ज्यामिति',
    topics: 'रेखाखंड का दिए अनुपात में विभाजन, वृत्त पर स्पर्श रेखा युग्म की रचना, समरूप त्रिभुज रचना',
    questionCount: 30
  },
  {
    no: 12,
    name: 'वृत्तों से संबंधित क्षेत्रफल (Areas Related to Circles)',
    category: 'mensuration',
    branch: 'क्षेत्रमिति',
    topics: 'त्रिज्यखंड का क्षेत्रफल (θ/360×πr²), चाप की लंबाई, वृत्तखंड, वलय का क्षेत्रफल',
    questionCount: 30
  },
  {
    no: 13,
    name: 'पृष्ठीय क्षेत्रफल और आयतन (Surface Areas & Volumes)',
    category: 'mensuration',
    branch: 'क्षेत्रमिति',
    topics: 'बेलन, शंकु, गोला, अर्धगोला, छिन्नक का वक्र एवं कुल पृष्ठीय क्षेत्रफल व आयतन',
    questionCount: 30
  },
  {
    no: 14,
    name: 'सांख्यिकी (Statistics)',
    category: 'mensuration',
    branch: 'सांख्यिकी',
    topics: 'माध्य (प्रत्यक्ष/कल्पित विधि), बहुलक (बहुलक = 3×माध्यक - 2×माध्य), माध्यक, तोरण',
    questionCount: 30
  },
  {
    no: 15,
    name: 'प्रायिकता (Probability)',
    category: 'mensuration',
    branch: 'प्रायिकता',
    topics: 'P(E) = n(E)/n(S), निश्चित घटना (1), असंभव घटना (0), ताश की गड्डी व सिक्के/पासे के नियम',
    questionCount: 30
  },
  {
    no: 16,
    name: 'विशेष बूस्टर: गणित के सभी VVI सूत्र एवं सर्वसमिकाएँ',
    category: 'booster',
    branch: 'महा-बूस्टर',
    topics: 'बीजगणित, निर्देशांक, त्रिकोणमिति व क्षेत्रमिति के शत-प्रतिशत पूछे जाने वाले सूत्र',
    questionCount: 30
  },
  {
    no: 17,
    name: 'विशेष बूस्टर: त्रिकोणमिति मान सारणी (0°-90°) एवं ट्रिक्स',
    category: 'booster',
    branch: 'महा-बूस्टर',
    topics: '0°, 30°, 45°, 60°, 90° मान सारणी, पूरक कोण, व्युत्क्रम व वर्ग सर्वसमिकाएँ',
    questionCount: 30
  },
  {
    no: 18,
    name: 'विशेष बूस्टर: ज्यामिति एवं निर्देशांक ज्यामिति शॉर्टकट्स',
    category: 'booster',
    branch: 'महा-बूस्टर',
    topics: 'दूरी, भुज, कोटि, चतुर्थांश, संरेखता, थेल्स प्रमेय व वृत्त स्पर्श रेखा ट्रिक्स',
    questionCount: 30
  },
  {
    no: 19,
    name: 'विशेष बूस्टर: क्षेत्रमिति (मेंसुरेशन) सूत्र एवं आयतन गणना',
    category: 'booster',
    branch: 'महा-बूस्टर',
    topics: 'शंकु, बेलन, गोला, अर्धगोला पिघलाने व बदलने वाले प्रश्न एवं शॉर्टकट सूत्र',
    questionCount: 30
  },
  {
    no: 20,
    name: 'विशेष बूस्टर: बिहार बोर्ड 100/100 टॉपर महा-मॉडल सेट',
    category: 'booster',
    branch: 'महा-बूस्टर',
    topics: 'सम्पूर्ण गणित पाठ्यक्रम से चुनिंदा सर्वाधिक बार रिपीट हुए 30 बोर्ड प्रश्न',
    questionCount: 30
  }
];

export const MATH_BOOSTER_QUESTION_BANKS: Record<number, CrashTestQuestion[]> = {
  // Chapter 16: All Formulas Booster
  16: [
    {
      id: 1,
      question: "द्विघात समीकरण ax² + bx + c = 0 का विविक्तकर (Discriminant, D) का सूत्र क्या होता है?",
      options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "√b² - 4ac"],
      correctAnswer: 0,
      explanation: "द्विघात समीकरण का विविक्तकर D = b² - 4ac होता है।"
    },
    {
      id: 2,
      question: "यदि द्विघात बहुपद ax² + bx + c के शून्यक α और β हों, तो α + β का मान क्या होता है?",
      options: ["-b/a", "c/a", "-c/a", "b/a"],
      correctAnswer: 0,
      explanation: "शून्यकों का योग α + β = -b/a (अर्थात -x का गुणांक / x² का गुणांक) होता है।"
    },
    {
      id: 3,
      question: "द्विघात बहुपद के शून्यकों का गुणनफल (α · β) का सूत्र क्या होता है?",
      options: ["c/a", "-c/a", "-b/a", "b/a"],
      correctAnswer: 0,
      explanation: "शून्यकों का गुणनफल αβ = c/a (अचर पद / x² का गुणांक) होता है।"
    },
    {
      id: 4,
      question: "समांतर श्रेढ़ी (AP) का nवाँ पद (an) ज्ञात करने का सूत्र क्या है?",
      options: ["a + (n - 1)d", "a + nd", "a + (n + 1)d", "n/2 [2a + (n - 1)d]"],
      correctAnswer: 0,
      explanation: "AP का nवाँ पद an = a + (n - 1)d होता है।"
    },
    {
      id: 5,
      question: "AP के प्रथम n पदों का योगफल (Sn) का सूत्र क्या होता है?",
      options: ["n/2 [2a + (n - 1)d]", "n/2 [a + d]", "n [2a + (n - 1)d]", "2n [a + l]"],
      correctAnswer: 0,
      explanation: "योगफल Sn = n/2 [2a + (n - 1)d] या Sn = n/2 [a + l] होता है।"
    },
    {
      id: 6,
      question: "मूल बिंदु O(0, 0) से किसी बिंदु P(x, y) की दूरी का सूत्र क्या है?",
      options: ["√(x² + y²)", "x² + y²", "√(x² - y²)", "x + y"],
      correctAnswer: 0,
      explanation: "मूल बिंदु से बिंदु (x, y) की दूरी √(x² + y²) होती है।"
    },
    {
      id: 7,
      question: "दो बिंदुओं A(x₁, y₁) और B(x₂, y₂) के बीच की दूरी का सूत्र क्या है?",
      options: ["√[(x₂ - x₁)² + (y₂ - y₁)²]", "√[(x₂ + x₁)² + (y₂ + y₁)²]", "[(x₂ - x₁)² + (y₂ - y₁)²]", "(x₂ - x₁) + (y₂ - y₁)"],
      correctAnswer: 0,
      explanation: "दूरी सूत्र d = √[(x₂ - x₁)² + (y₂ - y₁)²] होता है।"
    },
    {
      id: 8,
      question: "बिंदुओं (x₁, y₁) और (x₂, y₂) को मिलाने वाले रेखाखंड के मध्य-बिंदु का निर्देशांक क्या होता है?",
      options: ["((x₁ + x₂)/2, (y₁ + y₂)/2)", "((x₁ - x₂)/2, (y₁ - y₂)/2)", "((x₁ + y₁)/2, (x₂ + y₂)/2)", "(x₁x₂, y₁y₂)"],
      correctAnswer: 0,
      explanation: "मध्य-बिंदु का निर्देशांक ((x₁ + x₂)/2, (y₁ + y₂)/2) होता है।"
    },
    {
      id: 9,
      question: "त्रिकोणमिति में sin²θ + cos²θ का मान सदैव कितना होता है?",
      options: ["1", "0", "-1", "2"],
      correctAnswer: 0,
      explanation: "मूल सर्वसमिका: sin²θ + cos²θ = 1 होती है।"
    },
    {
      id: 10,
      question: "1 + tan²θ का मान किसके बराबर होता है?",
      options: ["sec²θ", "cosec²θ", "cos²θ", "cot²θ"],
      correctAnswer: 0,
      explanation: "सर्वसमिका: 1 + tan²θ = sec²θ (अर्थात sec²θ - tan²θ = 1) होती है।"
    },
    {
      id: 11,
      question: "1 + cot²θ का मान किसके बराबर होता है?",
      options: ["cosec²θ", "sec²θ", "sin²θ", "tan²θ"],
      correctAnswer: 0,
      explanation: "सर्वसमिका: 1 + cot²θ = cosec²θ (अर्थात cosec²θ - cot²θ = 1) होती है।"
    },
    {
      id: 12,
      question: "वृत्त के त्रिज्यखंड का क्षेत्रफल (जब कोण θ हो) क्या होता है?",
      options: ["(θ/360°) × πr²", "(θ/180°) × πr²", "(θ/360°) × 2πr", "(θ/720°) × 2πr"],
      correctAnswer: 0,
      explanation: "त्रिज्यखंड का क्षेत्रफल = (θ/360°) × πr² होता है।"
    },
    {
      id: 13,
      question: "त्रिज्या r और कोण θ वाले त्रिज्यखंड के संगत चाप की लंबाई (l) क्या होती है?",
      options: ["(θ/360°) × 2πr", "(θ/180°) × πr²", "(θ/360°) × πr²", "2πr"],
      correctAnswer: 0,
      explanation: "चाप की लंबाई l = (θ/360°) × 2πr = (θ/180°) × πr होती है।"
    },
    {
      id: 14,
      question: "बेलन का वक्र पृष्ठीय क्षेत्रफल का सूत्र क्या है?",
      options: ["2πrh", "πr²h", "2πr(r + h)", "πrl"],
      correctAnswer: 0,
      explanation: "बेलन का वक्र पृष्ठीय क्षेत्रफल 2πrh होता है।"
    },
    {
      id: 15,
      question: "बेलन का आयतन (Volume) ज्ञात करने का सूत्र क्या है?",
      options: ["πr²h", "2πrh", "1/3 πr²h", "4/3 πr³"],
      correctAnswer: 0,
      explanation: "बेलन का आयतन = πr²h होता है।"
    },
    {
      id: 16,
      question: "शंकु का आयतन (Volume of Cone) का सूत्र क्या होता है?",
      options: ["1/3 πr²h", "πr²h", "πrl", "4/3 πr³"],
      correctAnswer: 0,
      explanation: "शंकु का आयतन = 1/3 πr²h (बेलन के आयतन का एक तिहाई) होता है।"
    },
    {
      id: 17,
      question: "शंकु की तिर्यक ऊँचाई l का सूत्र त्रिज्या r और ऊँचाई h के पदों में क्या है?",
      options: ["√(r² + h²)", "r² + h²", "√(h² - r²)", "r + h"],
      correctAnswer: 0,
      explanation: "पाइथागोरस प्रमेय से तिर्यक ऊँचाई l = √(h² + r²) होती है।"
    },
    {
      id: 18,
      question: "त्रिज्या r वाले गोले का आयतन (Volume of Sphere) क्या होता है?",
      options: ["4/3 πr³", "2/3 πr³", "4πr²", "πr³"],
      correctAnswer: 0,
      explanation: "गोले का आयतन = 4/3 πr³ होता है।"
    },
    {
      id: 19,
      question: "गोले का कुल पृष्ठीय क्षेत्रफल कितना होता है?",
      options: ["4πr²", "2πr²", "3πr²", "πr²"],
      correctAnswer: 0,
      explanation: "गोले का पृष्ठीय क्षेत्रफल = 4πr² होता है।"
    },
    {
      id: 20,
      question: "अर्धगोले का कुल पृष्ठीय क्षेत्रफल (Total Surface Area) कितना होता है?",
      options: ["3πr²", "2πr²", "4πr²", "πr²"],
      correctAnswer: 0,
      explanation: "अर्धगोले का वक्र पृष्ठ 2πr² + आधार πr² = कुल 3πr² होता है।"
    },
    {
      id: 21,
      question: "सांख्यिकी में बहुलक, माध्यक और माध्य के बीच का आनुभविक संबंध (Empirical Formula) क्या है?",
      options: ["बहुलक = 3 माध्यक - 2 माध्य", "बहुलक = 2 माध्यक - 3 माध्य", "माध्यक = 3 बहुलक - 2 माध्य", "माध्य = 3 माध्यक - 2 बहुलक"],
      correctAnswer: 0,
      explanation: "महत्वपूर्ण सूत्र: बहुलक = 3(माध्यक) - 2(माध्य) होता है।"
    },
    {
      id: 22,
      question: "किसी निश्चित घटना (Sure Event) की प्रायिकता का मान कितना होता है?",
      options: ["1", "0", "0.5", "अनंत"],
      correctAnswer: 0,
      explanation: "निश्चित घटना की प्रायिकता 1 तथा असंभव घटना की प्रायिकता 0 होती है।"
    },
    {
      id: 23,
      question: "प्रायिकता P(E) और P(E नहीं) का योगफल कितना होता है?",
      options: ["1", "0", "-1", "2"],
      correctAnswer: 0,
      explanation: "किसी घटना के होने और न होने की प्रायिकताओं का योग: P(E) + P(E') = 1 होता है।"
    },
    {
      id: 24,
      question: "दो संख्याओं a और b के LCM और HCF का गुणनफल किसके बराबर होता है?",
      options: ["a × b", "a / b", "a + b", "a - b"],
      correctAnswer: 0,
      explanation: "सूत्र: HCF(a, b) × LCM(a, b) = a × b (दोनों संख्याओं का गुणनफल)।"
    },
    {
      id: 25,
      question: "यदि a₁/a₂ ≠ b₁/b₂ हो, तो दो चर वाले रैखिक समीकरण युग्म के कितने हल होंगे?",
      options: ["अद्वितीय हल (केवल एक हल)", "कोई हल नहीं", "अनंत हल", "दो हल"],
      correctAnswer: 0,
      explanation: "जब a₁/a₂ ≠ b₁/b₂ हो, तो रेखाएं प्रतिच्छेदी होती हैं और अद्वितीय (एक) हल होता है।"
    },
    {
      id: 26,
      question: "यदि a₁/a₂ = b₁/b₂ = c₁/c₂ हो, तो समीकरण निकाय की रेखाएं कैसी होंगी?",
      options: ["संपाती (अनंत हल)", "समांतर (कोई हल नहीं)", "प्रतिच्छेदी (एक हल)", "लंबवत"],
      correctAnswer: 0,
      explanation: "तीनों अनुपात बराबर होने पर रेखाएं संपाती (Coincident) और अपरिमित रूप से अनेक हल होते हैं।"
    },
    {
      id: 27,
      question: "यदि a₁/a₂ = b₁/b₂ ≠ c₁/c₂ हो, तो रेखाएं कैसी होंगी और कितने हल होंगे?",
      options: ["समांतर रेखाएँ, कोई हल नहीं", "संपाती रेखाएँ, अनेक हल", "प्रतिच्छेदी, एक हल", "अद्वितीय हल"],
      correctAnswer: 0,
      explanation: "यह समांतर रेखाओं की शर्त है, जिनका कोई उभयनिष्ठ बिंदु नहीं होता, अतः कोई हल नहीं।"
    },
    {
      id: 28,
      question: "पाइथागोरस प्रमेय के अनुसार समकोण त्रिभुज में क्या संबंध होता है?",
      options: ["कर्ण² = लंब² + आधार²", "लंब² = कर्ण² + आधार²", "आधार² = कर्ण² + लंब²", "कर्ण = लंब + आधार"],
      correctAnswer: 0,
      explanation: "समकोण त्रिभुज में: (कर्ण)² = (लंब)² + (आधार)²।"
    },
    {
      id: 29,
      question: "वृत्त की परिधि ज्ञात करने का सूत्र क्या है?",
      options: ["2πr", "πr²", "πr", "4πr"],
      correctAnswer: 0,
      explanation: "वृत्त की परिधि (Circumference) = 2πr या πd होती है।"
    },
    {
      id: 30,
      question: "प्रथम n प्राकृत संख्याओं का योगफल (1 + 2 + 3 + ... + n) क्या होता है?",
      options: ["n(n + 1)/2", "n(n - 1)/2", "n²/2", "n(n + 1)"],
      correctAnswer: 0,
      explanation: "प्रथम n प्राकृत संख्याओं का योग = n(n + 1)/2 होता है।"
    }
  ],

  // Chapter 17: Trigonometry Table & Values Booster
  17: [
    {
      id: 1,
      question: "sin 30° का मान कितना होता है?",
      options: ["1/2", "√3/2", "1/√2", "1"],
      correctAnswer: 0,
      explanation: "sin 30° का मान 1/2 होता है।"
    },
    {
      id: 2,
      question: "cos 60° का मान किसके बराबर होता है?",
      options: ["1/2", "√3/2", "1/√2", "0"],
      correctAnswer: 0,
      explanation: "cos 60° = sin 30° = 1/2 होता है।"
    },
    {
      id: 3,
      question: "tan 45° का मान कितना होता है?",
      options: ["1", "0", "1/√3", "√3"],
      correctAnswer: 0,
      explanation: "tan 45° = cot 45° = 1 होता है।"
    },
    {
      id: 4,
      question: "tan 60° का मान क्या होता है?",
      options: ["√3", "1/√3", "1", "2"],
      correctAnswer: 0,
      explanation: "tan 60° का मान √3 होता है।"
    },
    {
      id: 5,
      question: "tan 30° का मान कितना होता है?",
      options: ["1/√3", "√3", "1", "0"],
      correctAnswer: 0,
      explanation: "tan 30° का मान 1/√3 होता है।"
    },
    {
      id: 6,
      question: "sin 90° का मान कितना होता है?",
      options: ["1", "0", "1/2", "अपरिभाषित"],
      correctAnswer: 0,
      explanation: "sin 90° = 1 और cos 90° = 0 होता है।"
    },
    {
      id: 7,
      question: "cos 0° का मान कितना होता है?",
      options: ["1", "0", "1/2", "-1"],
      correctAnswer: 0,
      explanation: "cos 0° = 1 तथा sin 0° = 0 होता है।"
    },
    {
      id: 8,
      question: "sec 60° का मान क्या होता है?",
      options: ["2", "1/2", "√3/2", "2/√3"],
      correctAnswer: 0,
      explanation: "sec 60° = 1 / cos 60° = 1 / (1/2) = 2 होता है।"
    },
    {
      id: 9,
      question: "cosec 30° का मान क्या होता है?",
      options: ["2", "1/2", "1/√2", "√2"],
      correctAnswer: 0,
      explanation: "cosec 30° = 1 / sin 30° = 1 / (1/2) = 2 होता है।"
    },
    {
      id: 10,
      question: "sin 45° और cos 45° दोनों का मान कितना होता है?",
      options: ["1/√2", "√3/2", "1/2", "1"],
      correctAnswer: 0,
      explanation: "sin 45° = cos 45° = 1/√2 होता है।"
    },
    {
      id: 11,
      question: "tan 90° का मान क्या होता है?",
      options: ["अपरिभाषित (∞)", "0", "1", "√3"],
      correctAnswer: 0,
      explanation: "tan 90° = sin 90° / cos 90° = 1/0 = अपरिभाषित (Undefined) होता है।"
    },
    {
      id: 12,
      question: "sin(90° - θ) किसके बराबर होता है?",
      options: ["cos θ", "-cos θ", "sin θ", "tan θ"],
      correctAnswer: 0,
      explanation: "पूरक कोण सूत्र: sin(90° - θ) = cos θ होता है।"
    },
    {
      id: 13,
      question: "cos(90° - θ) किसके बराबर होता है?",
      options: ["sin θ", "cos θ", "-sin θ", "cot θ"],
      correctAnswer: 0,
      explanation: "पूरक कोण सूत्र: cos(90° - θ) = sin θ होता है।"
    },
    {
      id: 14,
      question: "tan(90° - θ) का मान किसके बराबर होता है?",
      options: ["cot θ", "tan θ", "sec θ", "cosec θ"],
      correctAnswer: 0,
      explanation: "tan(90° - θ) = cot θ होता है।"
    },
    {
      id: 15,
      question: "sec(90° - θ) किसके बराबर होता है?",
      options: ["cosec θ", "sec θ", "sin θ", "cos θ"],
      correctAnswer: 0,
      explanation: "sec(90° - θ) = cosec θ होता है।"
    },
    {
      id: 16,
      question: "sin 18° / cos 72° का मान क्या होगा?",
      options: ["1", "0", "2", "-1"],
      correctAnswer: 0,
      explanation: "sin 18° = cos(90° - 18°) = cos 72°। अतः cos 72° / cos 72° = 1।"
    },
    {
      id: 17,
      question: "tan 26° / cot 64° का मान कितना होगा?",
      options: ["1", "0", "-1", "2"],
      correctAnswer: 0,
      explanation: "tan 26° = cot(90° - 26°) = cot 64°। अतः मान 1 होगा।"
    },
    {
      id: 18,
      question: "cos 48° - sin 42° का मान क्या होगा?",
      options: ["0", "1", "-1", "2"],
      correctAnswer: 0,
      explanation: "cos 48° = sin(90° - 48°) = sin 42°। इसलिए sin 42° - sin 42° = 0।"
    },
    {
      id: 19,
      question: "cosec 31° - sec 59° का मान क्या होगा?",
      options: ["0", "1", "-1", "2"],
      correctAnswer: 0,
      explanation: "cosec 31° = sec(90° - 31°) = sec 59°। इसलिए sec 59° - sec 59° = 0।"
    },
    {
      id: 20,
      question: "9 sec²A - 9 tan²A का मान क्या होगा?",
      options: ["9", "1", "0", "8"],
      correctAnswer: 0,
      explanation: "9(sec²A - tan²A) = 9 × 1 = 9।"
    },
    {
      id: 21,
      question: "यदि tan θ = 4/3 हो, तो sin θ का मान क्या होगा?",
      options: ["4/5", "3/5", "5/4", "3/4"],
      correctAnswer: 0,
      explanation: "लंब = 4, आधार = 3, अतः कर्ण = √(4² + 3²) = 5। sin θ = लंब/कर्ण = 4/5।"
    },
    {
      id: 22,
      question: "यदि sin θ = cos θ हो, तो कोण θ का मान कितना होगा (0° ≤ θ ≤ 90°)?",
      options: ["45°", "30°", "60°", "90°"],
      correctAnswer: 0,
      explanation: "sin 45° = cos 45° = 1/√2, अतः θ = 45°।"
    },
    {
      id: 23,
      question: "(1 - cos²θ)(1 + cot²θ) का मान क्या होगा?",
      options: ["1", "0", "sin²θ", "cos²θ"],
      correctAnswer: 0,
      explanation: "(1 - cos²θ) = sin²θ तथा (1 + cot²θ) = cosec²θ। sin²θ × cosec²θ = 1।"
    },
    {
      id: 24,
      question: "sin² 20° + sin² 70° का मान कितना होगा?",
      options: ["1", "0", "2", "-1"],
      correctAnswer: 0,
      explanation: "sin 70° = cos 20°, अतः sin² 20° + cos² 20° = 1।"
    },
    {
      id: 25,
      question: "tan 10° × tan 80° का मान क्या होगा?",
      options: ["1", "0", "√3", "1/√3"],
      correctAnswer: 0,
      explanation: "tan 80° = cot 10°, और tan 10° × cot 10° = 1।"
    },
    {
      id: 26,
      question: "cos 1° × cos 2° × cos 3° × ... × cos 90° का मान क्या होगा?",
      options: ["0", "1", "-1", "1/2"],
      correctAnswer: 0,
      explanation: "चूँकि cos 90° = 0 होता है, अतः पूरी शृंखला का गुणनफल 0 हो जाएगा।"
    },
    {
      id: 27,
      question: "यदि √3 tan θ = 3 sin θ हो, तो sin²θ - cos²θ का मान क्या होगा?",
      options: ["1/3", "2/3", "1", "0"],
      correctAnswer: 0,
      explanation: "√3 (sin θ / cos θ) = 3 sin θ => cos θ = 1/√3। sin²θ - cos²θ = (1 - 1/3) - 1/3 = 1/3।"
    },
    {
      id: 28,
      question: "यदि sec θ + tan θ = x हो, तो sec θ - tan θ का मान क्या होगा?",
      options: ["1/x", "x", "-x", "x²"],
      correctAnswer: 0,
      explanation: "sec²θ - tan²θ = 1 => (sec θ + tan θ)(sec θ - tan θ) = 1 => sec θ - tan θ = 1/x।"
    },
    {
      id: 29,
      question: "sin 60° × cos 30° + cos 60° × sin 30° का मान क्या होगा?",
      options: ["1", "0", "1/2", "√3/2"],
      correctAnswer: 0,
      explanation: "(√3/2 × √3/2) + (1/2 × 1/2) = 3/4 + 1/4 = 1।"
    },
    {
      id: 30,
      question: "2 tan 30° / (1 + tan² 30°) किसके बराबर होता है?",
      options: ["sin 60°", "cos 60°", "tan 60°", "sin 30°"],
      correctAnswer: 0,
      explanation: "2(1/√3) / (1 + 1/3) = (2/√3) / (4/3) = √3/2 = sin 60°।"
    }
  ],

  // Chapter 18: Geometry & Coordinate Shortcuts Booster
  18: [
    {
      id: 1,
      question: "बिंदु P(-4, 3) किस चतुर्थांश (Quadrant) में स्थित है?",
      options: ["द्वितीय चतुर्थांश", "प्रथम चतुर्थांश", "तृतीय चतुर्थांश", "चतुर्थ चतुर्थांश"],
      correctAnswer: 0,
      explanation: "x ऋणात्मक और y धनात्मक (- , +) द्वितीय चतुर्थांश में होता है।"
    },
    {
      id: 2,
      question: "बिंदु (2, 3) की दूरी मूल बिंदु (0, 0) से क्या होगी?",
      options: ["√13", "√5", "5", "13"],
      correctAnswer: 0,
      explanation: "मूल बिंदु से दूरी = √(x² + y²) = √(2² + 3²) = √(4 + 9) = √13।"
    },
    {
      id: 3,
      question: "बिंदु (-3, -5) किस चतुर्थांश में स्थित है?",
      options: ["तृतीय चतुर्थांश", "प्रथम चतुर्थांश", "द्वितीय चतुर्थांश", "चतुर्थ चतुर्थांश"],
      correctAnswer: 0,
      explanation: "दोनों निर्देशांक ऋणात्मक (- , -) तृतीय चतुर्थांश में होते हैं।"
    },
    {
      id: 4,
      question: "बिंदु (4, -5) में भुज (Abscissa) का मान क्या है?",
      options: ["4", "-5", "5", "-4"],
      correctAnswer: 0,
      explanation: "x-निर्देशांक को भुज (4) और y-निर्देशांक को कोटि (-5) कहते हैं।"
    },
    {
      id: 5,
      question: "बिंदु (-2, 8) में कोटि (Ordinate) का मान क्या है?",
      options: ["8", "-2", "2", "-8"],
      correctAnswer: 0,
      explanation: "y-निर्देशांक को कोटि कहते हैं, अतः कोटि = 8।"
    },
    {
      id: 6,
      question: "x-अक्ष पर स्थित किसी बिंदु का y-निर्देशांक क्या होता है?",
      options: ["0", "1", "x", "कोई भी मान"],
      correctAnswer: 0,
      explanation: "x-अक्ष पर स्थित प्रत्येक बिंदु का y-निर्देशांक सदैव 0 होता है (x, 0)।"
    },
    {
      id: 7,
      question: "y-अक्ष पर स्थित किसी बिंदु का x-निर्देशांक क्या होता है?",
      options: ["0", "1", "y", "-1"],
      correctAnswer: 0,
      explanation: "y-अक्ष पर स्थित प्रत्येक बिंदु का रूप (0, y) होता है, अतः x = 0।"
    },
    {
      id: 8,
      question: "बिंदुओं (2, 4) और (4, 6) को मिलाने वाले रेखाखंड के मध्य-बिंदु का निर्देशांक क्या होगा?",
      options: ["(3, 5)", "(2, 3)", "(6, 10)", "(1, 1)"],
      correctAnswer: 0,
      explanation: "x = (2+4)/2 = 3 तथा y = (4+6)/2 = 5, अतः (3, 5)।"
    },
    {
      id: 9,
      question: "किसी वृत्त की कितनी स्पर्श रेखाएँ हो सकती हैं?",
      options: ["अनंत (अपरिमित)", "एक", "दो", "चार"],
      correctAnswer: 0,
      explanation: "वृत्त के प्रत्येक बिंदु पर एक स्पर्श रेखा खींची जा सकती है, अतः वृत्त की अनंत स्पर्श रेखाएं हो सकती हैं।"
    },
    {
      id: 10,
      question: "वृत्त के किसी बाह्य बिंदु से वृत्त पर अधिकतम कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
      options: ["2", "1", "3", "अनंत"],
      correctAnswer: 0,
      explanation: "बाह्य बिंदु से वृत्त पर ठीक 2 स्पर्श रेखाएं खींची जा सकती हैं और दोनों की लंबाइयाँ समान होती हैं।"
    },
    {
      id: 11,
      question: "वृत्त की स्पर्श रेखा और स्पर्श बिंदु से जाने वाली त्रिज्या के बीच का कोण कितना होता है?",
      options: ["90° (समकोण)", "45°", "60°", "180°"],
      correctAnswer: 0,
      explanation: "प्रमेय 10.1: वृत्त के किसी बिंदु पर स्पर्श रेखा स्पर्श बिंदु से जाने वाली त्रिज्या पर लंब (90°) होती है।"
    },
    {
      id: 12,
      question: "दो समरूप त्रिभुजों की संगत भुजाओं का अनुपात 4 : 9 है, तो उनके क्षेत्रफलों का अनुपात क्या होगा?",
      options: ["16 : 81", "2 : 3", "8 : 18", "81 : 16"],
      correctAnswer: 0,
      explanation: "समरूप त्रिभुजों के क्षेत्रफलों का अनुपात उनकी संगत भुजाओं के वर्ग के अनुपात के बराबर होता है: (4/9)² = 16/81।"
    },
    {
      id: 13,
      question: "यदि दो समरूप त्रिभुजों के क्षेत्रफलों का अनुपात 64 : 121 है, तो उनकी संगत भुजाओं का अनुपात क्या होगा?",
      options: ["8 : 11", "11 : 8", "4 : 11", "16 : 22"],
      correctAnswer: 0,
      explanation: "भुजाओं का अनुपात = √(क्षेत्रफल अनुपात) = √(64/121) = 8/11।"
    },
    {
      id: 14,
      question: "थेल्स प्रमेय (आधारभूत आनुपातिकता प्रमेय) के अनुसार त्रिभुज ABC में यदि DE || BC हो, तो क्या सत्य है?",
      options: ["AD/DB = AE/EC", "AD/AB = EC/AE", "AD × DB = AE × EC", "AD + DB = AE + EC"],
      correctAnswer: 0,
      explanation: "थेल्स प्रमेय के अनुसार यदि किसी त्रिभुज की एक भुजा के समांतर रेखा खींची जाए तो AD/DB = AE/EC होता है।"
    },
    {
      id: 15,
      question: "अर्धवृत्त का कोण कितना होता है?",
      options: ["90° (समकोण)", "180°", "60°", "45°"],
      correctAnswer: 0,
      explanation: "अर्धवृत्त में बना कोण सदैव समकोण (90°) होता है।"
    },
    {
      id: 16,
      question: "चक्रीय चतुर्भुज के सम्मुख कोणों का योग कितना होता है?",
      options: ["180°", "360°", "90°", "270°"],
      correctAnswer: 0,
      explanation: "चक्रीय चतुर्भुज के सम्मुख कोण संपूरक होते हैं (योग = 180°)।"
    },
    {
      id: 17,
      question: "एक बिंदु P से वृत्त पर स्पर्श रेखा की लंबाई 24 cm और P की केंद्र से दूरी 25 cm है, तो वृत्त की त्रिज्या क्या होगी?",
      options: ["7 cm", "12 cm", "15 cm", "24.5 cm"],
      correctAnswer: 0,
      explanation: "r = √(25² - 24²) = √(625 - 576) = √49 = 7 cm।"
    },
    {
      id: 18,
      question: "त्रिभुज के तीनों अंतःकोणों का योग कितना होता है?",
      options: ["180°", "360°", "90°", "270°"],
      correctAnswer: 0,
      explanation: "त्रिभुज के तीनों कोणों का योग सदैव 180° होता है।"
    },
    {
      id: 19,
      question: "यदि त्रिभुज के तीनों शीर्ष संरेखी (Collinear) हों, तो उस त्रिभुज का क्षेत्रफल कितना होगा?",
      options: ["0", "1", "ऋणात्मक", "अनंत"],
      correctAnswer: 0,
      explanation: "संरेखी बिंदुओं से बने त्रिभुज का क्षेत्रफल शून्य (0) होता है।"
    },
    {
      id: 20,
      question: "त्रिभुज के केंद्रक (Centroid) का निर्देशांक यदि शीर्ष (x₁, y₁), (x₂, y₂), (x₃, y₃) हों, तो क्या होगा?",
      options: ["((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3)", "((x₁+x₂+x₃)/2, (y₁+y₂+y₃)/2)", "(x₁+x₂+x₃, y₁+y₂+y₃)", "((x₁x₂x₃)/3, (y₁y₂y₃)/3)"],
      correctAnswer: 0,
      explanation: "त्रिभुज के केंद्रक G का निर्देशांक = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3) होता है।"
    },
    {
      id: 21,
      question: "बिंदु (a, b) और (-a, -b) के बीच की दूरी क्या होगी?",
      options: ["2√(a² + b²)", "√(a² + b²)", "2(a + b)", "0"],
      correctAnswer: 0,
      explanation: "d = √[(-a - a)² + (-b - b)²] = √[4a² + 4b²] = 2√(a² + b²)।"
    },
    {
      id: 22,
      question: "वृत्त के केंद्र पर बना संपूर्ण कोण कितने डिग्री का होता है?",
      options: ["360°", "180°", "90°", "270°"],
      correctAnswer: 0,
      explanation: "वृत्त के केंद्र पर कुल कोण 360° का होता है।"
    },
    {
      id: 23,
      question: "दो वृत्त एक-दूसरे को बाह्यतः स्पर्श करते हैं, तो उनकी उभयनिष्ठ स्पर्श रेखाओं की कुल संख्या कितनी होगी?",
      options: ["3", "1", "2", "4"],
      correctAnswer: 0,
      explanation: "बाह्यतः स्पर्श करने वाले दो वृत्तों की 2 प्रत्यक्ष उभयनिष्ठ और 1 तिर्यक उभयनिष्ठ = कुल 3 स्पर्श रेखाएं होती हैं।"
    },
    {
      id: 24,
      question: "यदि दो वृत्त एक-दूसरे को बिल्कुल स्पर्श न करें (अलग-अलग हों), तो कुल कितनी उभयनिष्ठ स्पर्श रेखाएँ खींची जा सकती हैं?",
      options: ["4", "2", "3", "1"],
      correctAnswer: 0,
      explanation: "दो असंयुक्त वृत्तों की कुल 4 उभयनिष्ठ स्पर्श रेखाएं खींची जा सकती हैं।"
    },
    {
      id: 25,
      question: "एक बिंदु Q से एक वृत्त पर स्पर्श रेखा की लंबाई 12 सेमी है और केंद्र से Q की दूरी 13 सेमी है, तो वृत्त की त्रिज्या क्या होगी?",
      options: ["5 सेमी", "7 सेमी", "9 सेमी", "11 सेमी"],
      correctAnswer: 0,
      explanation: "पाइथागोरस: r = √(13² - 12²) = √(169 - 144) = √25 = 5 सेमी।"
    },
    {
      id: 26,
      question: "समबाहु त्रिभुज का प्रत्येक कोण कितने अंश का होता है?",
      options: ["60°", "90°", "45°", "30°"],
      correctAnswer: 0,
      explanation: "समबाहु त्रिभुज की तीनों भुजाएं समान होती हैं और प्रत्येक कोण 60° का होता है।"
    },
    {
      id: 27,
      question: "भुजा a वाले समबाहु त्रिभुज का क्षेत्रफल क्या होता है?",
      options: ["(√3/4) a²", "(√3/2) a²", "(1/2) a²", "√3 a²"],
      correctAnswer: 0,
      explanation: "समबाहु त्रिभुज का क्षेत्रफल = (√3/4) a² होता है।"
    },
    {
      id: 28,
      question: "भुजा a वाले समबाहु त्रिभुज की ऊँचाई (शीर्षलंब) का सूत्र क्या है?",
      options: ["(√3/2) a", "(√3/4) a", "√3 a", "a/2"],
      correctAnswer: 0,
      explanation: "समबाहु त्रिभुज की ऊँचाई h = (√3/2) a होती है।"
    },
    {
      id: 29,
      question: "बिंदु (0, 4) कहाँ स्थित है?",
      options: ["y-अक्ष पर", "x-अक्ष पर", "प्रथम चतुर्थांश में", "मूल बिंदु पर"],
      correctAnswer: 0,
      explanation: "चूँकि x = 0 है, अतः यह बिंदु y-अक्ष पर स्थित है।"
    },
    {
      id: 30,
      question: "बिंदु (-5, 0) कहाँ स्थित है?",
      options: ["ऋणात्मक x-अक्ष पर", "y-अक्ष पर", "द्वितीय चतुर्थांश में", "तृतीय चतुर्थांश में"],
      correctAnswer: 0,
      explanation: "चूँकि y = 0 है और x ऋणात्मक है, अतः यह बिंदु ऋणात्मक x-अक्ष पर स्थित है।"
    }
  ],

  // Chapter 19: Mensuration & Volume Booster
  19: [
    {
      id: 1,
      question: "यदि एक वृत्त की त्रिज्या दुगुनी कर दी जाए, तो उसका क्षेत्रफल कितना गुना हो जाएगा?",
      options: ["4 गुना", "2 गुना", "8 गुना", "16 गुना"],
      correctAnswer: 0,
      explanation: "क्षेत्रफल A = πr²। त्रिज्या 2r करने पर नया क्षेत्रफल π(2r)² = 4πr² (4 गुना) हो जाता है।"
    },
    {
      id: 2,
      question: "यदि किसी वृत्त की त्रिज्या आधी कर दी जाए, तो उसका क्षेत्रफल कितना हो जाएगा?",
      options: ["1/4 गुना", "1/2 गुना", "1/8 गुना", "अपरिवर्तित"],
      correctAnswer: 0,
      explanation: "त्रिज्या r/2 करने पर क्षेत्रफल π(r/2)² = (1/4) πr² हो जाएगा।"
    },
    {
      id: 3,
      question: "दो वृत्तों के क्षेत्रफलों का अनुपात 9 : 4 है, तो उनकी त्रिज्याओं का अनुपात क्या होगा?",
      options: ["3 : 2", "2 : 3", "9 : 4", "81 : 16"],
      correctAnswer: 0,
      explanation: "त्रिज्याओं का अनुपात = √(क्षेत्रफल अनुपात) = √(9/4) = 3 : 2।"
    },
    {
      id: 4,
      question: "दो वृत्तों की परिधियों का अनुपात 3 : 4 है, तो उनके क्षेत्रफलों का अनुपात क्या होगा?",
      options: ["9 : 16", "3 : 4", "16 : 9", "√3 : 2"],
      correctAnswer: 0,
      explanation: "परिधि का अनुपात = त्रिज्या का अनुपात (3:4)। अतः क्षेत्रफलों का अनुपात = (3/4)² = 9:16।"
    },
    {
      id: 5,
      question: "एक घन का किनारा a है, तो उसका कुल पृष्ठीय क्षेत्रफल क्या होगा?",
      options: ["6a²", "4a²", "a³", "12a"],
      correctAnswer: 0,
      explanation: "घन में 6 वर्गाकार फलक होते हैं, अतः कुल पृष्ठीय क्षेत्रफल = 6a²।"
    },
    {
      id: 6,
      question: "घन का विकर्ण (Diagonal) ज्ञात करने का सूत्र क्या है?",
      options: ["√3 a", "√2 a", "3a", "a/√3"],
      correctAnswer: 0,
      explanation: "घन का विकर्ण = √(a² + a² + a²) = √3 a होता है।"
    },
    {
      id: 7,
      question: "घनाभ की विमाएँ l, b, h हैं, तो उसका कुल पृष्ठीय क्षेत्रफल क्या होगा?",
      options: ["2(lb + bh + hl)", "lbh", "l + b + h", "4(l + b + h)"],
      correctAnswer: 0,
      explanation: "घनाभ का कुल पृष्ठीय क्षेत्रफल = 2(lb + bh + hl) होता है।"
    },
    {
      id: 8,
      question: "घनाभ का आयतन (Volume) क्या होता है?",
      options: ["l × b × h", "2(lb + bh + hl)", "√(l² + b² + h²)", "l² + b² + h²"],
      correctAnswer: 0,
      explanation: "घनाभ का आयतन = लंबाई × चौड़ाई × ऊँचाई = lbh।"
    },
    {
      id: 9,
      question: "घनाभ के विकर्ण की लंबाई क्या होती है?",
      options: ["√(l² + b² + h²)", "l + b + h", "lbh", "√(lb + bh + hl)"],
      correctAnswer: 0,
      explanation: "घनाभ का विकर्ण = √(l² + b² + h²) होता है।"
    },
    {
      id: 10,
      question: "एक अर्धगोले की त्रिज्या r है, तो उसका वक्र पृष्ठीय क्षेत्रफल क्या होगा?",
      options: ["2πr²", "3πr²", "4πr²", "πr²"],
      correctAnswer: 0,
      explanation: "अर्धगोले का वक्र पृष्ठीय क्षेत्रफल = 2πr² होता है।"
    },
    {
      id: 11,
      question: "अर्धगोले का आयतन (Volume of Hemisphere) क्या होता है?",
      options: ["2/3 πr³", "4/3 πr³", "πr³", "1/3 πr³"],
      correctAnswer: 0,
      explanation: "अर्धगोले का आयतन = 2/3 πr³ (पूरे गोले के आयतन का आधा) होता है।"
    },
    {
      id: 12,
      question: "एक ठोस गोले को पिघलाकर छोटी गोलियाँ बनाई जाती हैं, तो दोनों का क्या समान रहता है?",
      options: ["कुल आयतन", "पृष्ठीय क्षेत्रफल", "त्रिज्या", "परिधि"],
      correctAnswer: 0,
      explanation: "किसी ठोस को पिघलाकर नए रूप में बदलने पर उसका कुल आयतन अपरिवर्तित रहता है।"
    },
    {
      id: 13,
      question: "शंकु का वक्र पृष्ठीय क्षेत्रफल (Curved Surface Area) क्या होता है?",
      options: ["πrl", "2πrh", "πr(l + r)", "1/3 πr²h"],
      correctAnswer: 0,
      explanation: "शंकु का वक्र पृष्ठीय क्षेत्रफल = πrl होता है (जहाँ l तिर्यक ऊँचाई है)।"
    },
    {
      id: 14,
      question: "शंकु का कुल पृष्ठीय क्षेत्रफल (Total Surface Area) क्या होता है?",
      options: ["πr(l + r)", "πrl", "2πrh", "πr² + h"],
      correctAnswer: 0,
      explanation: "शंकु का कुल पृष्ठ = वक्र पृष्ठ + आधार = πrl + πr² = πr(l + r)।"
    },
    {
      id: 15,
      question: "7 सेमी त्रिज्या वाले वृत्त का क्षेत्रफल क्या होगा? (π = 22/7)",
      options: ["154 सेमी²", "44 सेमी²", "308 सेमी²", "77 सेमी²"],
      correctAnswer: 0,
      explanation: "A = πr² = (22/7) × 7 × 7 = 154 सेमी²।"
    },
    {
      id: 16,
      question: "7 सेमी त्रिज्या वाले वृत्त की परिधि क्या होगी?",
      options: ["44 सेमी", "22 सेमी", "88 सेमी", "154 सेमी"],
      correctAnswer: 0,
      explanation: "परिधि = 2πr = 2 × (22/7) × 7 = 44 सेमी।"
    },
    {
      id: 17,
      question: "एक पहिए का व्यास 40 सेमी है। 1 चक्कर में वह कितनी दूरी तय करेगा?",
      options: ["40π सेमी", "80π सेमी", "20π सेमी", "1600π सेमी"],
      correctAnswer: 0,
      explanation: "1 चक्कर की दूरी = परिधि = πd = 40π सेमी।"
    },
    {
      id: 18,
      question: "अर्धवृत्त की परिमिति (Perimeter of Semicircle) क्या होती है?",
      options: ["πr + 2r", "πr", "2πr", "πr + r"],
      correctAnswer: 0,
      explanation: "अर्धवृत्त की परिमिति = चाप (πr) + व्यास (2r) = r(π + 2)।"
    },
    {
      id: 19,
      question: "यदि अर्धवृत्त का व्यास 14 सेमी हो, तो उसकी परिमिति क्या होगी?",
      options: ["36 सेमी", "22 सेमी", "44 सेमी", "28 सेमी"],
      correctAnswer: 0,
      explanation: "r = 7 सेमी। परिमिति = πr + 2r = (22/7 × 7) + 14 = 22 + 14 = 36 सेमी।"
    },
    {
      id: 20,
      question: "समान त्रिज्या r और समान ऊँचाई h वाले बेलन और शंकु के आयतनों का अनुपात क्या होगा?",
      options: ["3 : 1", "1 : 3", "1 : 1", "2 : 3"],
      correctAnswer: 0,
      explanation: "बेलन का आयतन πr²h तथा शंकु का 1/3 πr²h, अतः अनुपात = 3 : 1।"
    },
    {
      id: 21,
      question: "एक बेलन के आधार का व्यास 14 सेमी और ऊँचाई 10 सेमी है, तो उसका वक्र पृष्ठीय क्षेत्रफल क्या होगा?",
      options: ["440 सेमी²", "220 सेमी²", "880 सेमी²", "1540 सेमी²"],
      correctAnswer: 0,
      explanation: "r = 7 सेमी। वक्र पृष्ठ = 2πrh = 2 × (22/7) × 7 × 10 = 440 सेमी²।"
    },
    {
      id: 22,
      question: "यदि एक घन का आयतन 125 सेमी³ है, तो उसका कुल पृष्ठीय क्षेत्रफल क्या होगा?",
      options: ["150 सेमी²", "125 सेमी²", "100 सेमी²", "25 सेमी²"],
      correctAnswer: 0,
      explanation: "a³ = 125 => a = 5 सेमी। कुल पृष्ठ = 6a² = 6 × 5² = 6 × 25 = 150 सेमी²।"
    },
    {
      id: 23,
      question: "दो गोलों के आयतनों का अनुपात 8 : 27 है, तो उनके पृष्ठीय क्षेत्रफलों का अनुपात क्या होगा?",
      options: ["4 : 9", "2 : 3", "8 : 27", "16 : 81"],
      correctAnswer: 0,
      explanation: "r₁/r₂ = ∛(8/27) = 2/3। क्षेत्रफलों का अनुपात = (2/3)² = 4/9।"
    },
    {
      id: 24,
      question: "शंकु के छिन्नक (Frustum of Cone) का आयतन क्या होता है?",
      options: ["1/3 πh (r₁² + r₂² + r₁r₂)", "1/3 πh (r₁ + r₂)", "πh (r₁² + r₂²)", "1/3 πh r₁r₂"],
      correctAnswer: 0,
      explanation: "छिन्नक का आयतन V = 1/3 πh (r₁² + r₂² + r₁r₂) होता है।"
    },
    {
      id: 25,
      question: "एक वर्ग की परिमिति 40 सेमी है, तो उसका क्षेत्रफल कितना होगा?",
      options: ["100 सेमी²", "160 सेमी²", "40 सेमी²", "200 सेमी²"],
      correctAnswer: 0,
      explanation: "भुजा = 40/4 = 10 सेमी। क्षेत्रफल = 10² = 100 सेमी²।"
    },
    {
      id: 26,
      question: "वलय (Ring) का क्षेत्रफल क्या होता है (बाहरी त्रिज्या R और आंतरिक त्रिज्या r)?",
      options: ["π(R² - r²)", "π(R - r)²", "2π(R - r)", "π(R + r)"],
      correctAnswer: 0,
      explanation: "वलय का क्षेत्रफल = बड़े वृत्त का क्षेत्रफल - छोटे वृत्त का क्षेत्रफल = πR² - πr² = π(R² - r²)।"
    },
    {
      id: 27,
      question: "एक शंकु की त्रिज्या 3 सेमी और ऊँचाई 4 सेमी है। इसकी तिर्यक ऊँचाई (l) क्या होगी?",
      options: ["5 सेमी", "7 सेमी", "12 सेमी", "25 सेमी"],
      correctAnswer: 0,
      explanation: "l = √(r² + h²) = √(3² + 4²) = √(9 + 16) = √25 = 5 सेमी।"
    },
    {
      id: 28,
      question: "एक बेलन की त्रिज्या 7 सेमी और ऊँचाई 5 सेमी है, तो इसका आयतन क्या होगा?",
      options: ["770 सेमी³", "440 सेमी³", "154 सेमी³", "1100 सेमी³"],
      correctAnswer: 0,
      explanation: "V = πr²h = (22/7) × 7 × 7 × 5 = 154 × 5 = 770 सेमी³।"
    },
    {
      id: 29,
      question: "एक समचतुर्भुज के विकर्ण 6 सेमी और 8 सेमी हैं, तो इसका क्षेत्रफल क्या होगा?",
      options: ["24 सेमी²", "48 सेमी²", "14 सेमी²", "28 सेमी²"],
      correctAnswer: 0,
      explanation: "समचतुर्भुज का क्षेत्रफल = 1/2 × d₁ × d₂ = 1/2 × 6 × 8 = 24 सेमी²।"
    },
    {
      id: 30,
      question: "1 घन मीटर (1 m³) में कितने लीटर पानी आता है?",
      options: ["1000 लीटर", "100 लीटर", "10,000 लीटर", "500 लीटर"],
      correctAnswer: 0,
      explanation: "1 m³ = 1000 लीटर होता है।"
    }
  ],

  // Chapter 20: 100/100 Maha Model Set Booster
  20: [
    {
      id: 1,
      question: "π (पाई) किस प्रकार की संख्या है?",
      options: ["अपरिमेय संख्या", "परिमेय संख्या", "पूर्णांक संख्या", "प्राकृत संख्या"],
      correctAnswer: 0,
      explanation: "π एक अपरिमेय संख्या है, जबकि इसका सन्निकट मान 22/7 एक परिमेय संख्या है।"
    },
    {
      id: 2,
      question: "निम्न में से कौन-सी परिमेय संख्या है?",
      options: ["2√3 / √3", "√3", "√5", "2 + √3"],
      correctAnswer: 0,
      explanation: "2√3 / √3 = 2, जो कि p/q के रूप की एक परिमेय संख्या है।"
    },
    {
      id: 3,
      question: "संख्या 0.23 (3 पर बार) को परिमेय रूप p/q में व्यक्त करने पर क्या प्राप्त होगा?",
      options: ["23/99", "23/90", "23/100", "7/30"],
      correctAnswer: 0,
      explanation: "दो अंकों पर बार होने पर हर में 99 आता है: 23/99।"
    },
    {
      id: 4,
      question: "द्विघात बहुपद x² - 3 के शून्यक क्या होंगे?",
      options: ["+√3, -√3", "3, -3", "√3, √3", "-3, -3"],
      correctAnswer: 0,
      explanation: "x² - 3 = 0 => x² = 3 => x = ±√3।"
    },
    {
      id: 5,
      question: "बहुपद 4x² - 4x + 1 के शून्यकों का गुणनफल क्या होगा?",
      options: ["1/4", "-1/4", "1", "-1"],
      correctAnswer: 0,
      explanation: "αβ = c/a = 1/4।"
    },
    {
      id: 6,
      question: "यदि α, β बहुपद x² - 2x - 8 के शून्यक हैं, तो α + β का मान क्या होगा?",
      options: ["2", "-2", "8", "-8"],
      correctAnswer: 0,
      explanation: "α + β = -(-2)/1 = 2।"
    },
    {
      id: 7,
      question: "द्विघात समीकरण 2x² - 4x + 3 = 0 के मूलों की प्रकृति कैसी होगी?",
      options: ["काल्पनिक (वास्तविक नहीं)", "वास्तविक एवं समान", "वास्तविक एवं असमान", "इनमें से कोई नहीं"],
      correctAnswer: 0,
      explanation: "D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8 < 0, अतः मूल काल्पनिक हैं।"
    },
    {
      id: 8,
      question: "समांतर श्रेढ़ी 2, 7, 12, ... का 10वाँ पद क्या होगा?",
      options: ["47", "42", "52", "49"],
      correctAnswer: 0,
      explanation: "a = 2, d = 5। a₁₀ = a + 9d = 2 + 9(5) = 2 + 45 = 47।"
    },
    {
      id: 9,
      question: "AP: 10, 7, 4, ... का 30वाँ पद क्या होगा?",
      options: ["-77", "77", "-87", "87"],
      correctAnswer: 0,
      explanation: "a = 10, d = -3। a₃₀ = 10 + 29(-3) = 10 - 87 = -77।"
    },
    {
      id: 10,
      question: "प्रथम 200 प्राकृत संख्याओं का योगफल क्या होगा?",
      options: ["20100", "20000", "19900", "40200"],
      correctAnswer: 0,
      explanation: "Sn = n(n + 1)/2 = 200 × 201 / 2 = 100 × 201 = 20100।"
    },
    {
      id: 11,
      question: "बिंदु (2, 3) और (4, 1) के बीच की दूरी क्या होगी?",
      options: ["2√2", "√2", "4", "2"],
      correctAnswer: 0,
      explanation: "d = √[(4-2)² + (1-3)²] = √[4 + 4] = √8 = 2√2।"
    },
    {
      id: 12,
      question: "बिंदुओं (4, -1) और (2, 3) के बीच की दूरी क्या होगी?",
      options: ["2√5", "√5", "4", "20"],
      correctAnswer: 0,
      explanation: "d = √[(2-4)² + (3 - (-1))²] = √[(-2)² + 4²] = √[4 + 16] = √20 = 2√5।"
    },
    {
      id: 13,
      question: "यदि cos A = 4/5 हो, तो tan A का मान क्या होगा?",
      options: ["3/4", "4/3", "3/5", "5/3"],
      correctAnswer: 0,
      explanation: "आधार = 4, कर्ण = 5, लंब = √(5² - 4²) = 3। tan A = लंब/आधार = 3/4।"
    },
    {
      id: 14,
      question: "9 cosec²θ - 9 cot²θ का मान क्या होगा?",
      options: ["9", "1", "0", "-9"],
      correctAnswer: 0,
      explanation: "9(cosec²θ - cot²θ) = 9 × 1 = 9।"
    },
    {
      id: 15,
      question: "(1 + tan² A) / (1 + cot² A) का मान किसके बराबर होता है?",
      options: ["tan² A", "sec² A", "-1", "cot² A"],
      correctAnswer: 0,
      explanation: "sec²A / cosec²A = (1/cos²A) / (1/sin²A) = sin²A / cos²A = tan²A।"
    },
    {
      id: 16,
      question: "भूमि के एक बिंदु से, जो मीनार के पाद-बिंदु से 30 m की दूरी पर है, मीनार के शिखर का उन्नयन कोण 30° है। मीनार की ऊँचाई क्या है?",
      options: ["10√3 m", "30√3 m", "10 m", "20 m"],
      correctAnswer: 0,
      explanation: "tan 30° = h / 30 => 1/√3 = h / 30 => h = 30/√3 = 10√3 m।"
    },
    {
      id: 17,
      question: "एक खंभे की छाया की लंबाई उसकी ऊँचाई के बराबर है। सूर्य का उन्नयन कोण कितना होगा?",
      options: ["45°", "30°", "60°", "90°"],
      correctAnswer: 0,
      explanation: "tan θ = ऊँचाई / छाया = h / h = 1 => θ = 45°।"
    },
    {
      id: 18,
      question: "यदि एक वृत्त का क्षेत्रफल और परिधि संख्यात्मक रूप से समान हों, तो वृत्त की त्रिज्या क्या होगी?",
      options: ["2 मात्रक", "π मात्रक", "4 मात्रक", "7 मात्रक"],
      correctAnswer: 0,
      explanation: "πr² = 2πr => r = 2 मात्रक।"
    },
    {
      id: 19,
      question: "एक सिक्के को उछालने पर 'चित (Head)' आने की प्रायिकता क्या होगी?",
      options: ["1/2", "1", "0", "1/4"],
      correctAnswer: 0,
      explanation: "संभावित परिणाम {H, T} = 2, चित = 1, अतः प्रायिकता = 1/2।"
    },
    {
      id: 20,
      question: "एक पासे को फेंकने पर एक अभाज्य संख्या (2, 3, 5) आने की प्रायिकता क्या होगी?",
      options: ["1/2", "1/3", "1/6", "2/3"],
      correctAnswer: 0,
      explanation: "अभाज्य संख्याएँ = {2, 3, 5} कुल 3 हैं। कुल परिणाम = 6। प्रायिकता = 3/6 = 1/2।"
    },
    {
      id: 21,
      question: "ताश की 52 पत्तों की गड्डी में से एक पत्ता निकाला जाता है। एक इक्का (Ace) आने की प्रायिकता क्या होगी?",
      options: ["1/13", "1/52", "1/4", "4/13"],
      correctAnswer: 0,
      explanation: "कुल इक्के = 4, कुल पत्ते = 52। प्रायिकता = 4/52 = 1/13।"
    },
    {
      id: 22,
      question: "बंटन 2, 3, 5, 3, 7, 3, 8 का बहुलक (Mode) क्या होगा?",
      options: ["3", "5", "7", "2"],
      correctAnswer: 0,
      explanation: "संख्या 3 की बारंबारता सबसे अधिक (3 बार) है, अतः बहुलक = 3।"
    },
    {
      id: 23,
      question: "प्रथम 5 विषम प्राकृत संख्याओं का माध्य क्या होगा?",
      options: ["5", "4", "6", "25"],
      correctAnswer: 0,
      explanation: "संख्याएँ: 1, 3, 5, 7, 9। योग = 25। माध्य = 25 / 5 = 5।"
    },
    {
      id: 24,
      question: "प्रथम 5 सम प्राकृत संख्याओं का माध्य क्या होगा?",
      options: ["6", "5", "4", "30"],
      correctAnswer: 0,
      explanation: "संख्याएँ: 2, 4, 6, 8, 10। योग = 30। माध्य = 30 / 5 = 6।"
    },
    {
      id: 25,
      question: "यदि एक बारंबारता बंटन का माध्य 9 और माध्यक 10 है, तो उसका बहुलक क्या होगा?",
      options: ["12", "11", "10", "8"],
      correctAnswer: 0,
      explanation: "बहुलक = 3(माध्यक) - 2(माध्य) = 3(10) - 2(9) = 30 - 18 = 12।"
    },
    {
      id: 26,
      question: "बिंदु P(x, y) की x-अक्ष से लांबिक दूरी क्या होती है?",
      options: ["|y| (कोटि का परिमाण)", "|x| (भुज का परिमाण)", "x + y", "√(x² + y²)"],
      correctAnswer: 0,
      explanation: "x-अक्ष से दूरी y-निर्देशांक के मान (|y|) के बराबर होती है।"
    },
    {
      id: 27,
      question: "बिंदु P(x, y) की y-अक्ष से लांबिक दूरी क्या होती है?",
      options: ["|x| (भुज का परिमाण)", "|y| (कोटि का परिमाण)", "x - y", "0"],
      correctAnswer: 0,
      explanation: "y-अक्ष से दूरी x-निर्देशांक के मान (|x|) के बराबर होती है।"
    },
    {
      id: 28,
      question: "किसी घटना E की प्रायिकता P(E) के लिए कौन-सा कथन सत्य है?",
      options: ["0 ≤ P(E) ≤ 1", "P(E) > 1", "P(E) < 0", "-1 ≤ P(E) ≤ 1"],
      correctAnswer: 0,
      explanation: "किसी भी घटना की प्रायिकता कभी ऋणात्मक नहीं होती और 1 से अधिक नहीं हो सकती (0 ≤ P(E) ≤ 1)।"
    },
    {
      id: 29,
      question: "625 के अभाज्य गुणनखंड में 5 का अधिकतम घातांक क्या है?",
      options: ["4", "3", "5", "2"],
      correctAnswer: 0,
      explanation: "625 = 5 × 5 × 5 × 5 = 5⁴। अतः घातांक 4 है।"
    },
    {
      id: 30,
      question: "दो लगातार सम संख्याओं का म०स० (HCF) सदैव कितना होता है?",
      options: ["2", "1", "4", "0"],
      correctAnswer: 0,
      explanation: "किन्हीं भी दो क्रमागत सम संख्याओं (जैसे 2, 4 या 10, 12) का HCF सदैव 2 होता है।"
    }
  ]
};
