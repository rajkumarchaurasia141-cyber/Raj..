import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Crown, ChevronRight, CheckCircle2, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FreeNotesModalProps {
  onClose: () => void;
  onOpenVip: () => void;
  onOpenSubject: (subjectId: string) => void;
}

export function FreeNotesModal({ onClose, onOpenVip, onOpenSubject }: FreeNotesModalProps) {
  const { isAdmin } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const notesList = [
    {
      id: 'sanskrit-summary',
      subject: 'संस्कृत (पीयूषम्)',
      title: 'मङ्गलम् पाठ - सम्पूर्ण 5 मन्त्रों का हिंदी अर्थ',
      points: [
        '१. सत्य का मुख स्वर्णपात्र से ढँका हुआ है (ईशावास्योपनिषद्)।',
        '२. आत्मा अणु से भी सूक्ष्म और महान से महान है, जो हृदय रूपी गुहा में स्थित है (कठोपनिषद्)।',
        '३. "सत्यमेव जयते" - सत्य की ही सदा विजय होती है (मुण्डकोपनिषद्)।',
        '४. नदियाँ नाम और रूप को छोड़कर समुद्र में विलीन हो जाती हैं (मुण्डकोपनिषद्)।',
        '५. उस परम पुरुष को जानकर ही मृत्यु पर विजय प्राप्त की जा सकती है (श्वेताश्वतरोपनिषद्)।'
      ],
      tag: 'अध्याय 1 सारांश',
      subjectId: 'sanskrit'
    },
    {
      id: 'math-formulas',
      subject: 'गणित (Mathematics)',
      title: 'त्रिकोणमिति & बीजगणित महत्वपूर्ण सूत्र',
      points: [
        '• sin²θ + cos²θ = 1, sec²θ - tan²θ = 1, cosec²θ - cot²θ = 1',
        '• sin(90° - θ) = cosθ, tan(90° - θ) = cotθ',
        '• द्विघात सूत्र: x = [-b ± √(b² - 4ac)] / 2a',
        '• मूलों का योग: α + β = -b/a, मूलों का गुणनफल: αβ = c/a',
        '• समान्तर श्रेढ़ी nवाँ पद: aₙ = a + (n-1)d, योगफल Sₙ = n/2[2a + (n-1)d]'
      ],
      tag: 'फार्मूला शीट',
      subjectId: 'math'
    },
    {
      id: 'science-laws',
      subject: 'विज्ञान (Physics & Chemistry)',
      title: 'दर्पण सूत्र, लेंस सूत्र एवं रासायनिक नियम',
      points: [
        '• दर्पण सूत्र: 1/f = 1/v + 1/u, आवर्धन m = -v/u',
        '• लेंस सूत्र: 1/f = 1/v - 1/u, लेंस की क्षमता P = 1/f (मीटर में)',
        '• ओम का नियम: V = IR (स्थिर ताप पर विभवांतर धारा के समानुपाती होता है)',
        '• रासायनिक अभिक्रिया: संयोजन, वियोजन, विस्थापन एवं द्विविस्थापन अभिक्रियाएँ',
        '• pH पैमाना: अम्ल (pH < 7), उदासीन (pH = 7), क्षारक (pH > 7)'
      ],
      tag: 'VVI थ्योरी',
      subjectId: 'science'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-emerald-300 border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                मुफ्त क्विक रिवीजन नोट्स
              </h3>
              <p className="text-xs text-emerald-200">सूत्र, परिभाषाएँ एवं अध्याय सारांश</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notesList.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {n.subject} • {n.tag}
                </span>
                <button
                  onClick={() => handleCopy(n.points.join('\n'), n.id)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedId === n.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px]">कॉपी हुआ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>

              <h4 className="font-extrabold text-stone-900 text-sm">{n.title}</h4>

              <div className="space-y-1 text-xs text-stone-700 bg-white p-3 rounded-xl border border-slate-200">
                {n.points.map((pt, idx) => (
                  <p key={idx} className="leading-relaxed font-mono text-[11px] sm:text-xs">
                    {pt}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* VIP Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>पूरे हस्तलिखित चैप्टर नोट्स PDF चाहिए?</span>
            </div>
            <p className="text-[11px] text-stone-600">
              मंजिल VIP बैच में सभी 6 विषयों के सम्पूर्ण नोट्स, उत्तर एवं 50-50 MCQs अनलॉक हो जाते हैं।
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenVip();
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs cursor-pointer"
            >
              VIP क्रैश कोर्स में देखें (मात्र ₹299)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
