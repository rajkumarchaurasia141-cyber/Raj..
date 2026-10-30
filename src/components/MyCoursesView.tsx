import React from 'react';
import { 
  Crown, 
  CheckCircle2, 
  ChevronRight, 
  BookText,
  Star,
  GraduationCap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface MyCoursesViewProps {
  onSelectSubject: (subjectId: string) => void;
  onOpenVip: () => void;
}

export function MyCoursesView({ onSelectSubject, onOpenVip }: MyCoursesViewProps) {
  const { subjects } = useData();
  const { isVIP } = useAuth();
  
  const subList = Object.values(subjects);

  return (
    <div className="p-2.5 sm:p-3 max-w-2xl mx-auto space-y-3 pb-8">
      {/* Topper Batch फुल सिलेबस Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-stone-900 rounded-3xl p-5 text-white shadow-lg border border-red-500/30">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-red-500/20 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              BSEB 10TH SPECIAL BATCH
            </span>

            {isVIP ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                VIP बैच सक्रिय
              </span>
            ) : (
              <span className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% फ्री
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-300" />
              टॉपर बैच (Topper Batch फुल सिलेबस)
            </h2>
            <p className="text-xs text-stone-200 mt-1">
              कक्षा 10वीं बिहार विद्यालय परीक्षा समिति (BSEB) फुल सिलेबस के लिए सम्पूर्ण डिजिटल कोर्स, हस्तलिखित नोट्स व टेस्ट सीरीज़।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">6 विषय</span>
              <span className="text-[10px] text-stone-300">सम्पूर्ण पाठ्यक्रम</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">अध्याय-वार</span>
              <span className="text-[10px] text-stone-300">विस्तृत नोट्स</span>
            </div>
            <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="block text-xs font-black text-amber-300">50 MCQs</span>
              <span className="text-[10px] text-stone-300">प्रति अध्याय टेस्ट</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Access Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-emerald-900 text-xs">
            सभी कोर्स और विषय 100% मुफ़्त हैं (All Courses Free)
          </h4>
          <p className="text-[11px] text-emerald-700">
            नीचे दिए गए किसी भी विषय पर क्लिक करके उसके सभी अध्याय, नोट्स और ऑनलाइन टेस्ट एक्सेस करें।
          </p>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <span className="w-2 h-3.5 rounded-full bg-amber-500 inline-block"></span>
            <span>बिहार बोर्ड 10वीं - सभी विषय (All Subjects)</span>
          </h3>
          <span className="text-[10px] text-stone-500 font-bold">100% Free Access</span>
        </div>

        {subList.map((sub: any) => (
          <div
            key={sub.id}
            onClick={() => onSelectSubject(sub.id)}
            className="bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-100 group-hover:scale-105 transition-transform shrink-0">
                <BookText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm sm:text-base group-hover:text-red-700 transition-colors">
                  {sub.subject_name_hindi || sub.subject_name || sub.id}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {sub.chapters?.length || 0} सम्पूर्ण अध्याय • नोट्स, टॉपर टिप्स & 50 MCQs
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-red-50 text-stone-400 group-hover:text-red-700 flex items-center justify-center transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
