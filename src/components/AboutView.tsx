import React from 'react';
import { ArrowLeft, BookOpen, Award, Users, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5 pb-24 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>होम पर वापस जाएं</span>
      </button>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute right-0 top-0 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>About Us • हमारे बारे में</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          BSEB GURU — बिहार बोर्ड कक्षा 9वीं और 10वीं का नंबर 1 लर्निंग प्लेटफॉर्म
        </h1>
        <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
          यह ऐप विशेष रूप से बिहार विद्यालय परीक्षा समिति (BSEB) के कक्षा 9वीं और 10वीं के छात्र-छात्राओं के लिए बनाया गया है, ताकि वे घर बैठे बेहतरीन नोट्स, एमसीक्यू टेस्ट और लाइव कक्षाओं के जरिए बोर्ड परीक्षा में 450+ अंक प्राप्त कर सकें।
        </p>
      </div>

      {/* Core Mission */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 text-stone-800 text-xs sm:text-sm leading-relaxed">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-600" />
          <span>हम छात्रों की कैसे मदद करते हैं? (How This App Helps Students)</span>
        </h3>
        <p>
          <b>BSEB GURU</b> ऐप का मुख्य उद्देश्य ग्रामीण व शहरी क्षेत्रों के सभी जरूरतमंद विद्यार्थियों को उच्चतम गुणवत्ता के हस्तलिखित नोट्स (Handwritten Notes), अध्याय-वार महत्वपूर्ण प्रश्न (Chapter-wise Q&A), गेस पेपर और ऑनलाइन मॉक टेस्ट निःशुल्क या अत्यंत न्यूनतम शुल्क पर उपलब्ध कराना है।
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-stone-900 text-xs">विषयवार संपूर्ण नोट्स</h5>
              <p className="text-[11px] text-stone-600 mt-0.5">गणित, विज्ञान, सामाजिक विज्ञान, हिंदी, संस्कृत और अंग्रेजी के सरल भाषा में नोट्स।</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-stone-900 text-xs">लाइव क्लासेज व टेस्ट</h5>
              <p className="text-[11px] text-stone-600 mt-0.5">दैनिक लाइव क्लासेज और 50 महत्वपूर्ण प्रश्नों के OMR मॉक टेस्ट।</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Creator */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
          👑
        </div>
        <div>
          <h4 className="font-black text-sm text-stone-900">राजकुमार सर (Founder & Lead Educator)</h4>
          <p className="text-xs text-stone-600 mt-0.5">
            बिहार बोर्ड के हजारों छात्रों को टॉपर बनाने के लिए समर्पित और अनुभवी शिक्षक। किसी भी सहायता के लिए संपर्क करें: <b>rajkumarchaurasia141@gmail.com</b>
          </p>
        </div>
      </div>
    </div>
  );
}
