import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw, Clock, ArrowRight, Sparkles, Crown } from 'lucide-react';

interface FreeTestModalProps {
  onClose: () => void;
  onOpenVip: () => void;
}

export function FreeTestModal({ onClose, onOpenVip }: FreeTestModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const questions = [
    {
      q: '1. "सत्यमेव जयते" किस उपनिषद् का मूल मंत्र है?',
      options: ['ईशावास्योपनिषद्', 'कठोपनिषद्', 'मुण्डकोपनिषद्', 'श्वेताश्वतरोपनिषद्'],
      correct: 2,
      exp: '"सत्यमेव जयते नानृतं..." मुण्डकोपनिषद् से लिया गया है।'
    },
    {
      q: '2. हिरण्मयेन पात्रेण कस्य मुखम् अपिहितम्? (सत्य का मुख किससे ढँका है?)',
      options: ['ताम्रपात्रेण', 'हिरण्मयेन पात्रेण (स्वर्णपात्र)', 'कांस्यपात्रेण', 'रजतपात्रेण'],
      correct: 1,
      exp: 'सत्य का मुख सोने जैसे ज्योतिर्मय पात्र से ढँका हुआ है।'
    },
    {
      q: '3. जीवों के हृदय रूपी गुहा में क्या स्थित रहता है?',
      options: ['शरीर', 'आत्मा (अणु से भी सूक्ष्म)', 'मस्तिष्क', 'रक्त'],
      correct: 1,
      exp: 'कठोपनिषद् अनुसार: अणोरणीयान् महतो महीयान्, आत्मस्य जन्तोर्निहितो गुहायाम्।'
    },
    {
      q: '4. रासायनिक अभिक्रिया में भाग लेने वाले पदार्थों को क्या कहा जाता है?',
      options: ['उत्पाद', 'अभिकारक (Reactant)', 'उत्प्रेरक', 'प्रतिफल'],
      correct: 1,
      exp: 'अभिक्रिया में भाग लेने वाले पदार्थ अभिकारक तथा बनने वाले नए पदार्थ उत्पाद कहलाते हैं।'
    },
    {
      q: '5. प्रकाश के परावर्तन के कितने नियम होते हैं?',
      options: ['1', '2', '3', '4'],
      correct: 1,
      exp: 'प्रकाश के परावर्तन के मुख्य रूप से 2 नियम होते हैं।'
    },
    {
      q: '6. किसी द्विघात समीकरण ax² + bx + c = 0 का विविक्तकर (Discriminant D) क्या होता है?',
      options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', '2a + b'],
      correct: 0,
      exp: 'D = b² - 4ac होता है।'
    },
    {
      q: '7. नदियाँ नाम और रूप को छोड़कर कहाँ विलीन हो जाती हैं?',
      options: ['तालाब में', 'झील में', 'समुद्र में', 'नदी में'],
      correct: 2,
      exp: 'यथा नद्यः स्यन्दमानाः समुद्रेऽस्तं गच्छन्ति नामरूपे विहाय।'
    },
    {
      q: '8. मानव नेत्र के किस भाग पर किसी वस्तु का प्रतिबिंब बनता है?',
      options: ['कॉर्निया', 'परितारिका', 'पुतली', 'दृष्टिपटल (रेटिना)'],
      correct: 3,
      exp: 'रेटिना (दृष्टिपटल) पर वास्तविक तथा उल्टा प्रतिबिंब बनता है।'
    },
    {
      q: '9. यूरोप का मरीज किसे कहा जाता था?',
      options: ['तुर्की को', 'इटली को', 'इंग्लैंड को', 'फ्रांस को'],
      correct: 0,
      exp: 'इतिहास अनुसार तुर्की को यूरोप का मरीज कहा जाता था।'
    },
    {
      q: '10. भारत में योजना आयोग का गठन कब हुआ था?',
      options: ['15 मार्च 1950', '15 सितम्बर 1950', '15 अक्टूबर 1951', 'इनमें से कोई नहीं'],
      correct: 0,
      exp: '15 मार्च 1950 को योजना आयोग (वर्तमान नीति आयोग) का गठन हुआ था।'
    }
  ];

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const handleSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optionIdx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct) score += 1;
    });
    return score;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-stone-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                डेली फ्री मॉक टेस्ट
              </h3>
              <p className="text-xs text-blue-200">10 VVI प्रश्न • 5 मिनट समय</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!submitted ? (
            <>
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span>प्रश्न {currentIdx + 1} / {questions.length}</span>
                <span className="text-blue-700">
                  {Object.keys(selectedAnswers).length} उत्तर दिए
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question text */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                  {questions[currentIdx].q}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {questions[currentIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-stone-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  पिछला
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((i) => i + 1)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    अगला प्रश्न
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    टेस्ट सबमिट करें
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Result Card */
            <div className="text-center py-4 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-amber-500/30">
                {score} / 10
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {score >= 8 ? '🎉 शानदार प्रदर्शन!' : score >= 5 ? '👍 अच्छा प्रयास!' : '📚 और अधिक अभ्यास की आवश्यकता है'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  आपने 10 में से {score} सही उत्तर दिए।
                </p>
              </div>

              {/* VIP Promotion for full 50 MCQs */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span className="font-extrabold text-stone-900 text-xs">
                    पूरे 50-50 MCQs टेस्ट सीरीज अनलॉक करें!
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  मंजिल VIP बैच में प्रत्येक अध्याय के 50-50 अति महत्वपूर्ण बोर्ड परीक्षा वस्तुनिष्ठ प्रश्न व व्याख्या उपलब्ध हैं।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenVip();
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  VIP क्रैश कोर्स देखें (मात्र ₹299)
                </button>
              </div>

              {/* Review Answers */}
              <div className="text-left space-y-2 max-h-60 overflow-y-auto pr-1">
                <h5 className="font-bold text-xs text-stone-900">प्रश्नोत्तर समीक्षा (Explanation):</h5>
                {questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correct;
                  return (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-stone-900 flex items-start gap-1.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span>{q.q}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        सही उत्तर: {q.options[q.correct]}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        व्याख्या: {q.exp}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setTimeLeft(300);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>दोबारा टेस्ट दें</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
