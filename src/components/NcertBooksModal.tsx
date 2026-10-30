import React, { useState } from 'react';
import { X, BookMarked, BookOpen, ChevronRight, Download, CheckCircle2, Sparkles } from 'lucide-react';

interface NcertBooksModalProps {
  onClose: () => void;
  onOpenSubject: (subjectId: string) => void;
}

export function NcertBooksModal({ onClose, onOpenSubject }: NcertBooksModalProps) {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = [
    {
      id: 'sanskrit',
      title: 'संस्कृत - पीयूषम् (भाग-2)',
      board: 'BSEB / NCERT',
      chaptersCount: 14,
      color: 'from-amber-600 to-amber-800',
      description: 'मङ्गलम्, पाटलिपुत्रवैभवम्, अलसकथा, संस्कृतसाहित्ये लेखिकाः, भारतमहिमा आदि 14 सम्पूर्ण पाठ एवं व्याकरण।',
      features: ['सम्पूर्ण श्लोक हिन्दी अर्थ सहित', 'NCERT प्रश्नोत्तर व अभ्यास', '50 वस्तुनिष्ठ प्रश्न']
    },
    {
      id: 'science',
      title: 'विज्ञान (Science) - Class 10',
      board: 'NCERT (BSEB)',
      chaptersCount: 16,
      color: 'from-blue-600 to-cyan-800',
      description: 'रासायनिक अभिक्रियाएँ, अम्ल-क्षारक, धातु-अधातु, जैव प्रक्रम, नियंत्रण एवं समन्वय, प्रकाश, विद्युत आदि।',
      features: ['डायग्राम आधारित व्याख्या', 'VVI बोर्ड लघु एवं दीर्घ प्रश्न', 'प्रयोगिक विज्ञान टिप्स']
    },
    {
      id: 'math',
      title: 'गणित (Mathematics)',
      board: 'NCERT (BSEB)',
      chaptersCount: 15,
      color: 'from-red-600 to-red-800',
      description: 'वास्तविक संख्याएँ, बहुपद, दो चरों वाले रैखिक समीकरण, द्विघात समीकरण, समानांतर श्रेढ़ी, त्रिकोणमिति, वृत्त।',
      features: ['स्टेप बाई स्टेप समाधान', 'प्रमेय (Theorems) सिद्ध करना', 'शॉर्टकट ट्रिक्स']
    },
    {
      id: 'history',
      title: 'इतिहास - भारत और समकालीन विश्व (भाग-2)',
      board: 'BSEB / NCERT',
      chaptersCount: 8,
      color: 'from-amber-700 to-red-800',
      description: 'यूरोप में राष्ट्रवाद, समाजवाद एवं साम्यवाद, हिन्द-चीन में राष्ट्रवादी आंदोलन, भारत में राष्ट्रवाद, अर्थव्यवस्था, शहरीकरण, व्यापार, प्रेस संस्कृति।',
      features: ['सम्पूर्ण 8 अध्याय (400 MCQs)', 'विस्तृत नोट्स व टॉपर टिप्स', 'BSEB परीक्षा उपयोगी अभ्यास']
    },
    {
      id: 'political_science',
      title: 'राजनीति शास्त्र - लोकतांत्रिक राजनीति (भाग-2)',
      board: 'BSEB / NCERT',
      chaptersCount: 5,
      color: 'from-orange-600 to-amber-800',
      description: 'लोकतंत्र में सत्ता की साझेदारी, कार्यप्रणाली, प्रतिस्पर्धा एवं संघर्ष, लोकतंत्र की उपलब्धियाँ एवं लोकतंत्र की चुनौतियाँ।',
      features: ['सम्पूर्ण 5 अध्याय (250 MCQs)', 'प्रत्येक अध्याय में 50 वस्तुनिष्ठ प्रश्न', 'OMR टाइमर टेस्ट व समाधान']
    },
    {
      id: 'geography',
      title: 'भूगोल - भारत : संसाधन एवं उपयोग (भाग-2)',
      board: 'BSEB / NCERT',
      chaptersCount: 6,
      color: 'from-emerald-700 to-teal-800',
      description: 'भारत : संसाधन एवं उपयोग, कृषि, निर्माण उद्योग, परिवहन संचार एवं व्यापार, बिहार (संसाधन एवं उद्योग), मानचित्र अध्ययन एवं आपदा प्रबंधन।',
      features: ['सम्पूर्ण 6 अध्याय (300 MCQs)', 'प्रत्येक अध्याय में 50 वस्तुनिष्ठ प्रश्न', 'मानचित्र कार्य व संपूर्ण नोट्स']
    },
    {
      id: 'economics',
      title: 'अर्थशास्त्र - हमारी अर्थव्यवस्था (भाग-2)',
      board: 'BSEB / NCERT',
      chaptersCount: 7,
      color: 'from-teal-700 to-emerald-900',
      description: 'अर्थव्यवस्था एवं इसके विकास का इतिहास, राज्य एवं राष्ट्र की आय, मुद्रा बचत एवं साख, हमारी वित्तीय संस्थाएं, रोजगार एवं सेवाएं, वैश्वीकरण एवं उपभोक्ता जागरण।',
      features: ['सम्पूर्ण 7 अध्याय (350 MCQs)', 'प्रत्येक अध्याय में 50 वस्तुनिष्ठ प्रश्न', 'आंकड़े, संस्थाएं व टॉपर टिप्स']
    },
    {
      id: 'sst',
      title: 'सामाजिक विज्ञान (SST Combo)',
      board: 'BSEB 4 Books',
      chaptersCount: 22,
      color: 'from-emerald-600 to-teal-800',
      description: 'इतिहास (भारत में राष्ट्रवाद), भूगोल (संसाधन एवं उपयोग), लोकतांत्रिक राजनीति, हमारी अर्थव्यवस्था एवं आपदा प्रबंधन।',
      features: ['मानचित्र (Map) कार्य', 'महत्वपूर्ण तिथियाँ व घटनाएँ', 'पॉइंट-वाइज उत्तर लेखन']
    },
    {
      id: 'hindi',
      title: 'हिंदी - गोधूलि & वर्णिका (भाग-2)',
      board: 'BSEB पाठ्यपुस्तक',
      chaptersCount: 24,
      color: 'from-purple-600 to-indigo-800',
      description: 'श्रम विभाजन और जाति प्रथा, विष के दांत, भारत से हम क्या सीखें, दही वाली मंगम्मा, ढाते विश्वास आदि।',
      features: ['लेखक परिचय व सारांश', 'पाठ्यपुस्तक प्रश्नोत्तर', 'व्याकरण व निबंध पत्र']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-red-700 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                NCERT & बिहार बोर्ड पुस्तकें
              </h3>
              <p className="text-xs text-amber-200">कक्षा 10वीं सम्पूर्ण डिजिटल ई-बुक्स एवं नोट्स</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {books.map((b) => (
            <div
              key={b.id}
              className="border border-slate-200 hover:border-red-400 rounded-2xl p-4 bg-slate-50/60 hover:bg-white transition-all shadow-xs hover:shadow-md space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center font-black text-xs shadow-md shrink-0`}>
                    10th
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm">{b.title}</h4>
                    <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      {b.chaptersCount} अध्याय उपलब्ध • {b.board}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSubject(b.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <span>पढ़ें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {b.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/80 text-[10px] text-stone-500 font-medium">
                {b.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-xs text-stone-500">
            💡 किसी भी पुस्तक के अध्याय व नोट्स पढ़ने के लिए <strong>"पढ़ें"</strong> बटन दबाएं।
          </p>
        </div>
      </div>
    </div>
  );
}
