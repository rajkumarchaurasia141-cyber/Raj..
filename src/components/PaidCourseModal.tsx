import React from 'react';
import { X, Award, BookOpen, CheckSquare, Youtube, Send, Users, ChevronRight, Sparkles, Instagram } from 'lucide-react';

interface PaidCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubject: (subjectId: string) => void;
  onOpenPaidTest: () => void;
}

export function PaidCourseModal({ isOpen, onClose, onSelectSubject, onOpenPaidTest }: PaidCourseModalProps) {
  if (!isOpen) return null;

  const subjectsList = [
    { id: 'math', name: 'गणित', chapters: '15 Chapters', icon: '📐', color: 'from-rose-500 to-red-600', textColor: 'text-rose-700', bg: 'bg-rose-50' },
    { id: 'science', name: 'विज्ञान', chapters: '16 Chapters', icon: '🧪', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-700', bg: 'bg-cyan-50' },
    { id: 'sst', name: 'SST', chapters: '40 Chapters', icon: '🌍', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
    { id: 'hindi', name: 'हिंदी', chapters: '29 Chapters', icon: '📖', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'sanskrit', name: 'संस्कृत', chapters: '14 Chapters', icon: '📜', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-700', bg: 'bg-amber-50' },
    { id: 'english', name: 'English', chapters: '23 Chapters', icon: '✍️', color: 'from-purple-500 to-pink-600', textColor: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-xl bg-slate-50 h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-indigo-950 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center font-bold text-stone-950 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">Padhega Bihar - Topper Batch</h3>
              <p className="text-[11px] text-indigo-200">बिहार बोर्ड कक्षा 10वीं संपूर्ण तैयारी (फुल सिलेबस)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Section 1: Tests / Quiz */}
          <div className="space-y-2.5">
            <h4 className="text-center font-extrabold text-xs sm:text-sm text-indigo-950 uppercase tracking-wide">
              अब हजारों बच्चों के साथ टेस्ट दीजिए
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Daily Live Test */}
              <div 
                onClick={() => { onClose(); onOpenPaidTest(); }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Daily Live Test</span>
                <h5 className="font-extrabold text-stone-900 text-sm mt-0.5">Daily Quiz</h5>
              </div>

              {/* Test Results */}
              <div 
                onClick={() => { onClose(); onOpenPaidTest(); }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 text-stone-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Test Results</span>
                <h5 className="font-extrabold text-stone-900 text-sm mt-0.5">Quiz Result</h5>
              </div>
            </div>
          </div>

          {/* Section 2: Subjects Preparation */}
          <div className="space-y-3">
            <h4 className="text-center font-extrabold text-xs sm:text-sm text-indigo-950 uppercase tracking-wide">
              अब होगी हर विषय की पूरी तैयारी (टॉपर बैच फुल सिलेबस)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjectsList.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    onClose();
                    onSelectSubject(sub.id);
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className={`w-12 h-12 rounded-full ${sub.bg} ${sub.textColor} flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform shadow-inner`}>
                    {sub.icon}
                  </div>
                  <span className="text-[10px] text-stone-500 font-bold">{sub.chapters}</span>
                  <h5 className="font-black text-stone-900 text-base mt-0.5">{sub.name}</h5>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar (YouTube, Instagram, Telegram, About us) */}
        <div className="bg-indigo-950 p-2.5 grid grid-cols-4 gap-1.5 shrink-0 border-t border-indigo-900">
          <a
            href="https://www.youtube.com/@Vidyaagent2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-1 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-xs"
          >
            <Youtube className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">YouTube</span>
          </a>

          <a
            href="https://www.instagram.com/unbroken_raj_01?stkn=dmJwNzNhNDl0cXhz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-1 bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 hover:opacity-90 text-white rounded-xl transition-all shadow-xs"
          >
            <Instagram className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Instagram</span>
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all shadow-xs"
          >
            <Send className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold">Telegram</span>
          </a>

          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); alert('Padhega Bihar - Bihar Board Class 10 Topper App फुल सिलेबस.\nDirector: Raj Kumar Chaurasia.\nHelpline: 9241511070'); }}
            className="flex flex-col items-center justify-center py-1.5 px-1 bg-amber-600 hover:bg-amber-700 text-stone-950 font-black rounded-xl transition-all shadow-xs"
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-black">About us</span>
          </a>
        </div>

      </div>
    </div>
  );
}
