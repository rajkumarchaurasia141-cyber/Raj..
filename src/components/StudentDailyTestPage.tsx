import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Sparkles,
  Clock
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { triggerAd } from '../utils/adManager';

interface StudentDailyTestPageProps {
  onBack?: () => void;
  onNavigateToAdmin?: () => void;
}

const MONTHS_LIST = [
  { id: 'jan', name: 'जनवरी', subtitle: 'वास्तविक संख्याएँ, रासायनिक अभिक्रियाएँ, यूरोप में राष्ट्रवाद', icon: '❄️' },
  { id: 'feb', name: 'फरवरी', subtitle: 'दो चर वाले रैखिक समीकरण, अम्ल-क्षार, भारत में राष्ट्रवाद', icon: '🌸' },
  { id: 'mar', name: 'मार्च', subtitle: 'द्विघात समीकरण, धातु एवं अधातु, अर्थव्यवस्था एवं विकास', icon: '☀️' },
  { id: 'apr', name: 'अप्रैल', subtitle: 'समांतर श्रेढ़ी, कार्बन यौगिक, मुद्रा और बचत', icon: '🌱' },
  { id: 'may', name: 'मई', subtitle: 'त्रिभुज व ज्यामिति, जैव प्रक्रम, वित्तीय संस्थाएँ', icon: '🔥' },
  { id: 'jun', name: 'जून', subtitle: 'निर्देशांक ज्यामिति, नियंत्रण एवं समन्वय, वैश्वीकरण', icon: '☀️' },
  { id: 'jul', name: 'जुलाई', subtitle: 'त्रिकोणमिति के अनुप्रयोग, जीव जनन कैसे करते हैं, उपभोक्ता अधिकार', icon: '🌧️' },
  { id: 'aug', name: 'अगस्त', subtitle: 'वृत्त व रचनाएँ, आनुवंशिकी, आपदा प्रबंधन', icon: '⚡' },
  { id: 'sep', name: 'सितंबर', subtitle: 'क्षेत्रमिति व पृष्ठीय क्षेत्रफल, प्रकाश परावर्तन, खनिज संसाधन', icon: '🍂' },
  { id: 'oct', name: 'अक्टूबर', subtitle: 'सांख्यिकी, मानव नेत्र व रंगबिरंगा संसार, कृषि एवं उद्योग', icon: '🍁' },
  { id: 'nov', name: 'नवंबर', subtitle: 'प्रायिकता, विद्युत धारा के चुंबकीय प्रभाव, परिवहन एवं संचार', icon: '🌤️' },
  { id: 'dec', name: 'दिसंबर', subtitle: 'बोर्ड परीक्षा फुल सिलेबस महा-अभ्यास टेस्ट सीरीज', icon: '🏆' }
];

const SUBJECTS_LIST = [
  { id: 'math', name: 'गणित (Maths)', icon: '📐', count: 30 },
  { id: 'science', name: 'विज्ञान (Science)', icon: '🔬', count: 30 },
  { id: 'social_science', name: 'सामाजिक विज्ञान (SST)', icon: '🌍', count: 30 },
  { id: 'hindi', name: 'हिन्दी (Hindi)', icon: '📖', count: 30 },
  { id: 'sanskrit', name: 'संस्कृत (Sanskrit)', icon: '🕉️', count: 30 },
  { id: 'english', name: 'अंग्रेजी (English)', icon: '🔤', count: 25 }
];

const WEEKLY_TESTS = [
  { id: 'w1', name: 'सप्ताह 1 प्रैक्टिस टेस्ट', desc: 'महत्वपूर्ण वस्तुनिष्ठ प्रश्न सेट 1', count: 30 },
  { id: 'w2', name: 'सप्ताह 2 VVI टेस्ट', desc: 'बिहार बोर्ड परीक्षा पैटर्न विशेष सेट 2', count: 30 },
  { id: 'w3', name: 'सप्ताह 3 मॉडल टेस्ट', desc: 'पिछले वर्षों के रिपीटेड प्रश्न सेट 3', count: 30 },
  { id: 'w4', name: 'सप्ताह 4 मेगा महाटेस्ट', desc: 'फुल चैप्टर रिविजन और अभ्यास सेट 4', count: 30 }
];

// Authentic Bihar Board Class 10 Question Banks by Subject
const SUBJECT_QUESTION_BANKS: Record<string, any[]> = {
  math: [
    {
      q: "दो संख्याओं a और b का म.स. (HCF) × ल.स. (LCM) किसके बराबर होता है?",
      options: ["a + b", "a - b", "a × b", "a / b"],
      correctIndex: 2,
      explanation: "सूत्र से: HCF(a,b) × LCM(a,b) = a × b होता है।"
    },
    {
      q: "निम्न में से कौन सी अभाज्य संख्या (Prime Number) है?",
      options: ["4", "9", "11", "15"],
      correctIndex: 2,
      explanation: "11 केवल 1 और 11 से विभाजित होती है, अतः यह अभाज्य संख्या है।"
    },
    {
      q: "द्विघात समीकरण ax² + bx + c = 0 का विवेचक (Discriminant D) क्या होता है?",
      options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "b - 4ac"],
      correctIndex: 0,
      explanation: "विवेचक D = b² - 4ac होता है।"
    },
    {
      q: "यदि किसी द्विघात समीकरण के मूल वास्तविक और समान हों, तो विवेचक D का मान क्या होगा?",
      options: ["D > 0", "D < 0", "D = 0", "D = 1"],
      correctIndex: 2,
      explanation: "मूल वास्तविक और समान होने पर D = 0 होता है।"
    },
    {
      q: "बिंदु (4, -3) किस चतुर्थांश (Quadrant) में स्थित है?",
      options: ["प्रथम चतुर्थांश", "द्वितीय चतुर्थांश", "तृतीय चतुर्थांश", "चतुर्थ चतुर्थांश"],
      correctIndex: 3,
      explanation: "(+, -) चतुर्थ चतुर्थांश (Fourth Quadrant) में होता है।"
    },
    {
      q: "मूलबिंदु (0, 0) से बिंदु (x, y) की दूरी क्या होती है?",
      options: ["x² + y²", "√(x² + y²)", "x - y", "√(x - y)"],
      correctIndex: 1,
      explanation: "मूलबिंदु से दूरी का सूत्र d = √(x² + y²) होता है।"
    },
    {
      q: "sin²θ + cos²θ का मान किसके बराबर होता है?",
      options: ["0", "1", "2", "-1"],
      correctIndex: 1,
      explanation: "त्रिकोणमितीय सर्वसमिका के अनुसार sin²θ + cos²θ = 1 होता है।"
    },
    {
      q: "1 + tan²θ किसके बराबर होता है?",
      options: ["sec²θ", "cosec²θ", "cot²θ", "sin²θ"],
      correctIndex: 0,
      explanation: "1 + tan²θ = sec²θ होता है।"
    },
    {
      q: "वृत्त की सबसे बड़ी जीव (Chord) क्या होती है?",
      options: ["त्रिज्या", "व्यास", "चाप", "छेदक रेखा"],
      correctIndex: 1,
      explanation: "वृत्त की सबसे बड़ी जीवा वृत्त का व्यास (Diameter) होती है।"
    },
    {
      q: "यदि किसी वृत्त की त्रिज्या 7 सेमी हो, तो उसकी परिधि क्या होगी?",
      options: ["22 सेमी", "44 सेमी", "14 सेमी", "88 सेमी"],
      correctIndex: 1,
      explanation: "परिधि = 2πr = 2 × (22/7) × 7 = 44 सेमी।"
    },
    {
      q: "अर्धवृत्त का कोण (Angle in a semi-circle) कितना होता है?",
      options: ["90°", "180°", "60°", "45°"],
      correctIndex: 0,
      explanation: "अर्धवृत्त का कोण समकोण (90°) होता है।"
    },
    {
      q: "प्रथम पाँच प्राकृत संख्याओं का माध्य (Mean) क्या होगा?",
      options: ["2", "3", "4", "5"],
      correctIndex: 1,
      explanation: "माध्य = (1 + 2 + 3 + 4 + 5) / 5 = 15 / 5 = 3।"
    },
    {
      q: "किसी घटना E के लिए P(E) + P(E') का मान कितना होता है?",
      options: ["0", "1", "0.5", "2"],
      correctIndex: 1,
      explanation: "घटना घटने की प्रायिकता + घटना न घटने की प्रायिकता हमेशा 1 होती है।"
    },
    {
      q: "निम्नलिखित में से कौन किसी घटना की प्रायिकता नहीं हो सकती है?",
      options: ["2/3", "-1.5", "15%", "0.7"],
      correctIndex: 1,
      explanation: "प्रायिकता का मान कभी भी ऋणात्मक (-1.5) नहीं हो सकता है।"
    },
    {
      q: "यदि समांतर श्रेणी (AP) का प्रथम पद a और सार्वअंतर d हो, तो n वाँ पद (an) क्या होगा?",
      options: ["a + nd", "a + (n-1)d", "a - (n-1)d", "na + d"],
      correctIndex: 1,
      explanation: "n वाँ पद an = a + (n-1)d होता है।"
    }
  ],
  science: [
    {
      q: "रासायनिक अभिक्रिया के दौरान किसी पदार्थ में ऑक्सीजन का ह्रास क्या कहलाता है?",
      options: ["उपचयन", "अपचयन", "संक्षारण", "वियोजन"],
      correctIndex: 1,
      explanation: "ऑक्सीजन का ह्रास 'अपचयन (Reduction)' कहलाता है।"
    },
    {
      q: "बुझा हुआ चूना (Slaked Lime) का रासायनिक सूत्र क्या है?",
      options: ["CaO", "Ca(OH)₂", "CaCO₃", "CaCl₂"],
      correctIndex: 1,
      explanation: "कैल्शियम हाइड्रॉक्साइड Ca(OH)₂ को बुझा हुआ चूना कहते हैं।"
    },
    {
      q: "शुद्ध जल का pH मान कितना होता है?",
      options: ["6", "7", "8", "14"],
      correctIndex: 1,
      explanation: "शुद्ध जल उदासीन होता है, इसलिए इसका pH मान 7 होता है।"
    },
    {
      q: "कमरे के ताप पर द्रव अवस्था में रहने वाली धातु कौन-सी है?",
      options: ["पारा (मरकरी)", "ब्रोमीन", "लोहा", "जिंक"],
      correctIndex: 0,
      explanation: "पारा (Hg) कमरे के ताप पर द्रव अवस्था में रहने वाली एकमात्र धातु है।"
    },
    {
      q: "कमरे के ताप पर द्रव अवस्था में रहने वाली अधातु कौन-सी है?",
      options: ["पारा", "ब्रोमीन", "क्लोरीन", "आयोडीन"],
      correctIndex: 1,
      explanation: "ब्रोमीन (Br) कमरे के ताप पर द्रव अवस्था में रहने वाली अधातु है।"
    },
    {
      q: "मनुष्य के हृदय में कितने कोष्ठ (Chambers) होते हैं?",
      options: ["दो", "तीन", "चार", "पांच"],
      correctIndex: 2,
      explanation: "मानव हृदय में चार कोष्ठ होते हैं।"
    },
    {
      q: "पादप में जाइलम (Xylem) किसके परिवहन के लिए उत्तरदायी है?",
      options: ["जल का वहन", "भोजन का वहन", "अमीनो अम्ल", "ऑक्सीजन"],
      correctIndex: 0,
      explanation: "जाइलम जल और खनिज लवणों का वहन करता है।"
    },
    {
      q: "मानव शरीर की सबसे बड़ी ग्रंथि कौन-सी है?",
      options: ["यकृत (Liver)", "अग्न्याशय", "थायरॉयड", "पीयूष ग्रंथि"],
      correctIndex: 0,
      explanation: "यकृत मानव शरीर की सबसे बड़ी ग्रंथि है।"
    },
    {
      q: "इंसुलिन की कमी से कौन-सा रोग होता है?",
      options: ["घेंघा", "मधुमेह (Diabetes)", "एनीमिया", "रतौंधी"],
      correctIndex: 1,
      explanation: "इंसुलिन की कमी से मधुमेह रोग होता है।"
    },
    {
      q: "गाड़ियों के साइड मिरर (Rear View Mirror) में किस दर्पण का उपयोग होता है?",
      options: ["अवतल दर्पण", "उत्तल दर्पण", "समतल दर्पण", "उत्तल लेंस"],
      correctIndex: 1,
      explanation: "उत्तल दर्पण का उपयोग साइड मिरर के रूप में होता है।"
    },
    {
      q: "लेंस की क्षमता का SI मात्रक क्या है?",
      options: ["मीटर", "डायोप्टर (D)", "सेंटीमीटर", "वाट"],
      correctIndex: 1,
      explanation: "लेंस की क्षमता का मात्रक डायोप्टर होता है।"
    },
    {
      q: "मानव नेत्र के किस भाग पर प्रतिबिंब बनता है?",
      options: ["कॉर्निया", "परितारिका", "पुतली", "रेटिना (दृष्टिपटल)"],
      correctIndex: 3,
      explanation: "मानव नेत्र में वस्तु का प्रतिबिंब रेटिना पर बनता है।"
    },
    {
      q: "विभवांतर का SI मात्रक क्या होता है?",
      options: ["जूल", "एम्पीयर", "वोल्ट (Volt)", "ओम"],
      correctIndex: 2,
      explanation: "विभवांतर का SI मात्रक वोल्ट होता है।"
    },
    {
      q: "विद्युत शक्ति (Electric Power) का SI मात्रक क्या है?",
      options: ["वाट (Watt)", "जूल", "एम्पीयर", "ओम"],
      correctIndex: 0,
      explanation: "विद्युत शक्ति का SI मात्रक वाट होता है।"
    },
    {
      q: "ओरिजिनल बायोगैस (Biogas) का मुख्य घटक क्या है?",
      options: ["मीथेन (CH₄)", "CO₂", "H₂", "O₂"],
      correctIndex: 0,
      explanation: "बायोगैस या गोबर गैस का मुख्य घटक मीथेन है।"
    }
  ],
  social_science: [
    {
      q: "यूरोप का मरीज किसे कहा जाता था?",
      options: ["तुर्की को", "इटली को", "रूस को", "ग्रीस को"],
      correctIndex: 0,
      explanation: "तुर्की को 'यूरोप का मरीज' कहा जाता था।"
    },
    {
      q: "जर्मनी के एकीकरण का प्रमुख वास्तुकार कौन था?",
      options: ["मेजिनी", "बिस्मार्क", "गैरीबाल्डी", "काउंर काबूर"],
      correctIndex: 1,
      explanation: "ओट्टो वॉन बिस्मार्क जर्मनी के एकीकरण के वास्तुकार थे।"
    },
    {
      q: "जलियांवाला बाग हत्याकांड कब हुआ था?",
      options: ["13 अप्रैल 1919", "15 अगस्त 1947", "1 राष्ट्रीय 1920", "5 फरवरी 1922"],
      correctIndex: 0,
      explanation: "जलियांवाला बाग हत्याकांड 13 अप्रैल 1919 को अमृतसर में हुआ था।"
    },
    {
      q: "सविनय अवज्ञा आंदोलन की शुरुआत किस यात्रा से हुई थी?",
      options: ["दांडी यात्रा", "चंपारण सत्याग्रह", "असहयोग आंदोलन", "खिलाफत आंदोलन"],
      correctIndex: 0,
      explanation: "1930 में महात्मा गांधी की दांडी यात्रा से सविनय अवज्ञा आंदोलन शुरू हुआ था।"
    },
    {
      q: "भारत में लोकतंत्र का कौन-सा रूप पाया जाता है?",
      options: ["प्रत्यक्ष लोकतंत्र", "अप्रत्यक्ष (प्रतिनिधि) लोकतंत्र", "राजतंत्र", "तानाशाही"],
      correctIndex: 1,
      explanation: "भारत में अप्रत्यक्ष या प्रतिनिधि लोकतंत्र है।"
    },
    {
      q: "भारतीय संविधान के किस अनुच्छेद के तहत देश में नागरिकों को स्वतंत्रता का अधिकार दिया गया है?",
      options: ["अनुच्छेद 19", "अनुच्छेद 20", "अनुच्छेद 21", "अनुच्छेद 22"],
      correctIndex: 0,
      explanation: "अनुच्छेद 19 के अंतर्गत स्वतंत्रता का अधिकार प्राप्त है।"
    },
    {
      q: "भारत की वित्तीय राजधानी (Financial Capital) किस शहर को कहा जाता है?",
      options: ["दिल्ली", "मुंबई", "पटना", "कोलकाता"],
      correctIndex: 1,
      explanation: "मुंबई को भारत की वित्तीय राजधानी कहा जाता है।"
    },
    {
      q: "रंगभेद की नीति के खिलाफ आवाज उठाने वाले नेता कौन थे?",
      options: ["महात्मा गांधी", "नेल्सन मंडेला", "अब्राहम लिंकन", "जॉर्ज वाशिंगटन"],
      correctIndex: 1,
      explanation: "दक्षिण अफ्रीका में नेल्सन मंडेला ने रंगभेद के खिलाफ लंबी लड़ाई लड़ी।"
    },
    {
      q: "बिहार में जीवन यापन का मुख्य साधन क्या है?",
      options: ["कृषि (Agriculture)", "उद्योग", "व्यापार", "सूचना तकनीक"],
      correctIndex: 0,
      explanation: "बिहार में अधिकांश आबादी कृषि कार्य पर निर्भर है।"
    },
    {
      q: "इनमें से कौन प्राकृतिक आपदा (Natural Disaster) है?",
      options: ["भूकंप", "आतंकवाद", "युद्ध", "दंगे"],
      correctIndex: 0,
      explanation: "भूकंप एक प्राकृतिक आपदा है।"
    }
  ],
  hindi: [
    {
      q: "'श्रम विभाजन और जाति प्रथा' पाठ के लेखक कौन हैं?",
      options: ["डॉ. भीमराव आंबेडकर", "हजारीप्रसाद द्विवेदी", "अमरकांत", "निलोजन विलोचन शर्मा"],
      correctIndex: 0,
      explanation: "'श्रम विभाजन और जाति प्रथा' के लेखक डॉ. भीमराव आंबेडकर हैं।"
    },
    {
      q: "सेन साहब की नई मोटर कार किस रंग की थी?",
      options: ["लाल", "सफेद", "काली (Black)", "नीली"],
      correctIndex: 2,
      explanation: "सेन साहब की चमचमाती नई मोटर कार काली (Black) रंग की थी।"
    },
    {
      q: "मैक्स मूलर कहाँ के रहने वाले थे?",
      options: ["जर्मनी", "इंग्लैंड", "फ्रांस", "अमेरिका"],
      correctIndex: 0,
      explanation: "मैक्स मूलर जर्मनी के प्रसिद्ध विद्वान थे।"
    },
    {
      q: "'बहादुर' कहानी के लेखक कौन हैं?",
      options: ["अमरकांत", "विनोद कुमार शुक्ल", "यतिेंद्र मिश्र", "गुणाकर मुले"],
      correctIndex: 0,
      explanation: "'बहादुर' कहानी अमरकांत जी द्वारा रची गई है।"
    },
    {
      q: "पंडित बिरजू महाराज का संबंध किस नृत्य शैली से है?",
      options: ["भरतनाट्यम", "कथक (Kathak)", "कुचिपुड़ी", "भांगड़ा"],
      correctIndex: 1,
      explanation: "पंडित बिरजू महाराज प्रसिद्ध कथक नर्तक थे।"
    },
    {
      q: "अशोक वाजपेयी के पिता का क्या नाम था?",
      options: ["परमानंद वाजपेयी", "रामविलास वाजपेयी", "अमरकांत वाजपेयी", "श्रीनिवास"],
      correctIndex: 0,
      explanation: "अशोक वाजपेयी के पिता का नाम परमानंद वाजपेयी था।"
    },
    {
      q: "दही वाली मंगम्मा कहानी किस भाषा से अनूदित है?",
      options: ["कन्नड़", "तमिल", "तेलुगु", "गुजराती"],
      correctIndex: 0,
      explanation: "'दही वाली मंगम्मा' कन्नड़ भाषा की कहानी है।"
    },
    {
      q: "मंगू कैसी लड़की थी?",
      options: ["गूँगी और बहरी (जन्मजात)", "अंधी", "चतुर", "सामान्य"],
      correctIndex: 0,
      explanation: "मंगू जन्म से गूँगी और पागल लड़की थी।"
    },
    {
      q: "हिन्दी में वर्णों की कुल संख्या कितनी है?",
      options: ["44", "48", "52", "56"],
      correctIndex: 2,
      explanation: "मानक हिन्दी वर्णमाला में कुल 52 वर्ण होते हैं।"
    },
    {
      q: "'विद्यालय' का सही संधि-विच्छेद क्या होगा?",
      options: ["विद्या + आलय", "विध + आलय", "विद्या + लय", "विद् + आलय"],
      correctIndex: 0,
      explanation: "विद्या + आलय = विद्यालय (दीर्घ स्वर संधि)।"
    }
  ],
  sanskrit: [
    {
      q: "'मङ्गलम्' पाठ में कितने मन्त्र संकलित हैं?",
      options: ["3", "4", "5", "6"],
      correctIndex: 2,
      explanation: "'मङ्गलम्' पाठ में उपनिषदों से कुल 5 मन्त्र संकलित हैं।"
    },
    {
      q: "पाटलिपुत्र किस नदी के किनारे स्थित है?",
      options: ["गंगा (Ganga)", "यमुना", "सोन", "कोसी"],
      correctIndex: 0,
      explanation: "पाटलिपुत्र गंगा नदी के तट पर बसा है।"
    },
    {
      q: "'अलसकथा' पाठ किस ग्रंथ से संकलित है?",
      options: ["पुरुषपरीक्षा", "नीतिशतकम्", "महाभारत", "रामायण"],
      correctIndex: 0,
      explanation: "'अलसकथा' विद्यापति रचित 'पुरुषपरीक्षा' कथा ग्रंथ से संकलित है।"
    },
    {
      q: "मैथिल कोकिल के नाम से कौन जाने जाते हैं?",
      options: ["विद्यापति", "कालिदास", "बाणभट्ट", "भास"],
      correctIndex: 0,
      explanation: "विद्यापति को 'मैथिल कोकिल' कहा जाता है।"
    },
    {
      q: "ऋग्वेद में कितने मंत्रवती ऋषिकाओं का उल्लेख है?",
      options: ["चतुर्विंशतिः (24)", "विंशतिः (20)", "पंचदश (15)", "दश (10)"],
      correctIndex: 0,
      explanation: "ऋग्वेद में 24 ऋषिकाओं का उल्लेख मिलता है।"
    },
    {
      q: "स्वामी दयानन्द के गुरु कौन थे?",
      options: ["स्वामी विरजानन्द", "रामकृष्ण परमहंस", "विवेकानन्द", "तुलसीदास"],
      correctIndex: 0,
      explanation: "स्वामी दयानन्द के गुरु स्वामी विरजानन्द थे।"
    },
    {
      q: "आर्य समाज की स्थापना किस वर्ष हुई थी?",
      options: ["1875 ई.", "1885 ई.", "1901 ई.", "1920 ई."],
      correctIndex: 0,
      explanation: "स्वामी दयानन्द ने 1875 ई. में मुंबई में आर्य समाज की स्थापना की थी।"
    },
    {
      q: "कर्ण किस देश का राजा था?",
      options: ["अङ्ग देश (Anga)", "मगाध", "कुरु", "पांचाल्"],
      correctIndex: 0,
      explanation: "कर्ण अंग देश के राजा थे।"
    },
    {
      q: "'भवति' रूप किस लकार का है?",
      options: ["लट् लकार (Present)", "लृट् लकार", "लङ् लकार", "लोट् लकार"],
      correctIndex: 0,
      explanation: "'भवति' लट्लकार (वर्तमान काल) प्रथम पुरुष एकवचन का रूप है।"
    },
    {
      q: "'हिमालयः' में कौन-सी संधि है?",
      options: ["स्वर संधि (दीर्घ)", "व्यंजन संधि", "विसर्ग संधि", "पूर्वरूप संधि"],
      correctIndex: 0,
      explanation: "हिम + आलय = हिमालयः (दीर्घ स्वर संधि)।"
    }
  ],
  english: [
    {
      q: "Who delivered the speech 'The Peace Offering'?",
      options: ["Aung San Suu Kyi", "Hereditary Chief Seattle", "Tony Morrison", "Mahatma Gandhi"],
      correctIndex: 0,
      explanation: "Aung San Suu Kyi delivered the speech."
    },
    {
      q: "What is the central theme of the story 'Little Girls Wiser than Men'?",
      options: ["Forgiveness and peace", "Anger and revenge", "Wealth accumulation", "School life"],
      correctIndex: 0,
      explanation: "The story emphasizes forgiveness and reconciliation."
    },
    {
      q: "Who wrote the poem 'God Made the Country'?",
      options: ["William Cowper", "Alexander Pope", "Walter de la Mare", "Percy Bysshe Shelley"],
      correctIndex: 0,
      explanation: "William Cowper is the poet of 'God Made the Country'."
    },
    {
      q: "What does the polythene bag cause according to the poem 'The Empty Heart' or 'Polythene Bag'?",
      options: ["Environmental pollution", "Water purification", "Soil fertility", "Clean air"],
      correctIndex: 0,
      explanation: "Polythene bag causes severe environmental pollution."
    },
    {
      q: "Choose the correct passive voice of: 'Ram helps Hari.'",
      options: ["Hari is helped by Ram.", "Hari was helped by Ram.", "Hari helps Ram.", "Ram is helping Hari."],
      correctIndex: 0,
      explanation: "Present simple passive: Object + is/am/are + V3 + by subject."
    },
    {
      q: "Choose the correct indirect speech of: He said, 'I am reading a book.'",
      options: ["He said that he was reading a book.", "He said that he is reading a book.", "He says that he is reading a book.", "He told that he read a book."],
      correctIndex: 0,
      explanation: "Present continuous changes to past continuous in indirect speech."
    },
    {
      q: "Fill in the blank with correct article: He is ...... honest man.",
      options: ["a", "an", "the", "no article"],
      correctIndex: 1,
      explanation: "'Honest' begins with a vowel sound (o), so 'an' is used."
    },
    {
      q: "Choose the correct preposition: She is fond ...... music.",
      options: ["in", "of", "at", "on"],
      correctIndex: 1,
      explanation: "The adjective 'fond' is followed by the preposition 'of'."
    }
  ]
};

export function StudentDailyTestPage({ onBack, onNavigateToAdmin }: StudentDailyTestPageProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [activeTest, setActiveTest] = useState<any | null>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [qIndex: number]: number }>({});
  const [score, setScore] = useState(0);

  // Ad Timer: Trigger ad after 90 seconds (1 to 2 minutes) during active test
  React.useEffect(() => {
    if (!activeTest) return;
    const adTimer = setTimeout(() => {
      triggerAd();
    }, 90000); // 90 seconds (1.5 min)
    return () => clearTimeout(adTimer);
  }, [activeTest]);

  const handleExitTest = () => {
    triggerAd();
    setActiveTest(null);
  };

  const handleSelectTest = (monthObj: any, subject: any, test: any, weekIndex: number = 0) => {
    const monthName = typeof monthObj === 'string' ? monthObj : monthObj.name;
    setSelectedMonth(monthName);
    setSelectedSubject(subject);
    setActiveTest(test);

    const monthIndex = MONTHS_LIST.findIndex(m => m.name === monthName);
    const validMonthIdx = monthIndex >= 0 ? monthIndex : 0;
    const validWeekIdx = weekIndex >= 0 ? weekIndex : 0;

    const bank = SUBJECT_QUESTION_BANKS[subject.id] || SUBJECT_QUESTION_BANKS['math'];
    
    // Divide bank into 12 sequential month blocks across the full syllabus
    const totalMonths = 12;
    const chunkSizePerMonth = Math.max(3, Math.floor(bank.length / totalMonths));
    const monthStartIdx = (validMonthIdx * chunkSizePerMonth) % bank.length;
    
    // Within each month, divide into 4 weeks
    const chunkSizePerWeek = Math.max(2, Math.floor(chunkSizePerMonth / 4));
    const weekStartIdx = monthStartIdx + (validWeekIdx * chunkSizePerWeek);

    const qList = [];
    for (let i = 0; i < test.count; i++) {
      const qIndex = (weekStartIdx + i) % bank.length;
      const template = bank[qIndex];
      const chapterNo = Math.floor(qIndex % 29) + 1;
      const qText = `[अध्याय ${chapterNo}] ${template.q}`;

      qList.push({
        ...template,
        q: qText
      });
    }

    setQuestions(qList);
    setAnswers({});
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (answers[questionIndex] !== undefined) return;

    const q = questions[questionIndex];
    const isCorrect = q.correctIndex === optionIndex;

    if (isCorrect) {
      playSound('right');
    } else {
      playSound('wrong');
    }

    setAnswers(prev => {
      const updated = { ...prev, [questionIndex]: optionIndex };
      const answeredCount = Object.keys(updated).length;
      
      // Trigger ad at 50% progress
      if (answeredCount === Math.floor(questions.length / 2)) {
        triggerAd();
      }

      const newScore = Object.entries(updated).reduce((acc, [qIdx, selOpt]) => {
        return questions[Number(qIdx)].correctIndex === selOpt ? acc + 1 : acc;
      }, 0);
      setScore(newScore);
      return updated;
    });
  };

  const handleReset = () => {
    if (window.confirm("क्या आप टेस्ट को रीसेट करके दोबारा शुरू करना चाहते हैं?")) {
      setAnswers({});
      setScore(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const answeredCount = Object.keys(answers).length;
  const optLabels = ['A', 'B', 'C', 'D'];

  // Active Test Runner View
  if (activeTest && selectedMonth && selectedSubject) {
    return (
      <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222] font-sans">
        <div className="max-w-3xl mx-auto space-y-4">
          
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 sticky top-2 z-20 backdrop-blur-md bg-white/95">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExitTest}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="वापस जाएं"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedSubject.name} • {activeTest.name}
                    </span>
                  </div>
                  <h1 className="text-base sm:text-xl font-black text-stone-900 mt-0.5">
                    बिहार बोर्ड 10वीं ऑनलाइन टेस्ट 🎯
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-[#FFFDF9] border-2 border-amber-400 px-3.5 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] font-black text-stone-500 uppercase">Live Score</div>
                  <div className="text-base sm:text-xl font-black text-stone-900">{score} / {questions.length}</div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={answeredCount === 0}
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    answeredCount > 0 ? 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300' : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-200'
                  }`}
                  title="रीसेट"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-bold">
                <span>हल किए गए: <b>{answeredCount} / {questions.length}</b></span>
                <span>{Math.round((answeredCount / questions.length) * 100)}% पूर्ण</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {questions.map((question, qIdx) => {
              const userAnswer = answers[qIdx];
              const isAnswered = userAnswer !== undefined;
              const isUserCorrect = isAnswered && userAnswer === question.correctIndex;

              return (
                <div
                  key={qIdx}
                  className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
                    isAnswered 
                      ? (isUserCorrect ? 'border-emerald-300' : 'border-rose-300')
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center border shadow-2xs ${
                      isAnswered
                        ? (isUserCorrect ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300')
                        : 'bg-amber-100 text-stone-900 border-amber-300'
                    }`}>
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed">
                        {question.q}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-3.5">
                    {question.options.map((optText: string, optIdx: number) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectAnswer = question.correctIndex === optIdx;

                      let optionBgStyle: React.CSSProperties = {};
                      let optionClasses = "relative p-3 rounded-xl text-xs sm:text-sm font-semibold transition border text-left flex items-center gap-2.5 ";

                      if (!isAnswered) {
                        optionClasses += "bg-white hover:bg-amber-50 hover:border-amber-400 border-stone-200 text-stone-800 cursor-pointer active:scale-[0.99]";
                      } else {
                        if (isCorrectAnswer) {
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#16a34a' };
                        } else if (isSelected && !isCorrectAnswer) {
                          optionClasses += "text-white font-bold border-transparent shadow-xs ";
                          optionBgStyle = { backgroundColor: '#dc2626' };
                        } else {
                          optionClasses += "bg-stone-50 border-stone-200 text-stone-400 opacity-60 ";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          style={optionBgStyle}
                          className={optionClasses}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition ${
                            isAnswered && (isCorrectAnswer || isSelected) ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {optLabels[optIdx]}
                          </span>

                          <span className="flex-1 text-left leading-snug">
                            {optText}
                          </span>

                          {isAnswered && isCorrectAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrectAnswer && (
                            <XCircle className="w-5 h-5 text-white flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className={`mt-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                      isUserCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUserCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>शाबाश! सही उत्तर (+1 अंक) 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>गलत उत्तर! सही उत्तर था: <b>विकल्प ({optLabels[question.correctIndex]}) {question.options[question.correctIndex]}</b></span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {answeredCount === questions.length && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-amber-400 space-y-3.5" 
                   ref={(el) => { if(el) triggerAd(); }}>
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-2xs">
                  🏆
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    टेस्ट समाप्त! आपका स्कोर: {score} / {questions.length}
                  </h3>
                  <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                    सफलता दर: {Math.round((score / questions.length) * 100)}%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  {score === questions.length ? 'अविश्वसनीय! आपने सभी प्रश्नों के 100% सही उत्तर दिए! बिहार बोर्ड टॉपर! 🌟' : 'शानदार अभ्यास! नियमित अभ्यास से आप और बेहतर कर सकते हैं। 💪'}
                </p>
                <div className="pt-1 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>दोबारा टेस्ट दें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTest(null)}
                    className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    विषय सूची पर लौटें
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Subject Selector View
  if (selectedMonth && !selectedSubject) {
    return (
      <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222] font-sans">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-black bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full uppercase">
                  मासिक प्रैक्टिस शेड्यूलर
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-stone-900 mt-0.5">
                  {selectedMonth} माह - विषय चुनें
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUBJECTS_LIST.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className="bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-bold border border-amber-200 group-hover:scale-105 transition-transform shrink-0">
                    {sub.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900 group-hover:text-amber-800">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      सप्ताहिक टेस्ट सीरीज़ • कुल {sub.count} वस्तुनिष्ठ प्रश्न
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-400 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Weekly Test Sets Selector View
  if (selectedMonth && selectedSubject) {
    return (
      <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222] font-sans">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubject(null)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-black bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedMonth} • {selectedSubject.name}
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-stone-900 mt-0.5">
                  सप्ताहिक टेस्ट सेट्स चुनें
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WEEKLY_TESTS.map((test, wIdx) => (
              <div
                key={test.id}
                onClick={() => handleSelectTest({ name: selectedMonth }, selectedSubject, test, wIdx)}
                className="bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {test.count} MCQ प्रश्न
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      तत्काल मूल्यांकन
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 group-hover:text-amber-800">
                    {test.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {test.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> 30 मिनट समय
                  </span>
                  <span className="px-3 py-1.5 bg-stone-900 group-hover:bg-amber-400 group-hover:text-stone-950 text-white font-black text-xs rounded-xl transition-colors flex items-center gap-1">
                    <span>टेस्ट दें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main 12 Months View
  return (
    <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222] font-sans">
      <div className="max-w-3xl mx-auto space-y-4">
        
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-yellow-300 fill-current" />
              12 महीने • जनवरी से दिसंबर अभ्यास टेस्ट हब
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              दैनिक & साप्ताहिक टेस्ट (Year-Round Test Hub)
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              बिहार बोर्ड कक्षा 10वीं के सभी विषयों के लिए जनवरी से लेकर दिसंबर तक के 12 महीनों की विशेष टेस्ट सीरीज। हर महीने हर विषय पर भरपूर प्रैक्टिस करें ताकि परीक्षा में कोई भी ऑब्जेक्टिव प्रश्न छूटे नहीं!
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-3.5 rounded-full bg-amber-500 inline-block" />
              <span>12 महीने की टेस्ट शेड्यूलर सूची (January - December)</span>
            </h3>
            <span className="text-[10px] text-stone-500 font-bold">100% फ्री प्रैक्टिस</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MONTHS_LIST.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => setSelectedMonth(m.name)}
                className="bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-black border border-amber-200 group-hover:scale-105 transition-transform shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-stone-900 group-hover:text-amber-800">
                        {m.name} माह टेस्ट
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                        4 सप्ताह
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 font-medium">
                      {m.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-400 group-hover:text-amber-900 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
