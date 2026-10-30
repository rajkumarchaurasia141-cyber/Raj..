import React from 'react';
import { X, Calendar, Clock, BookOpen, CheckCircle, Bell, Download } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ClassRoutineModalProps {
  onClose: () => void;
}

export function ClassRoutineModal({ onClose }: ClassRoutineModalProps) {
  const { routine } = useData();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                टॉपर बैच फुल सिलेबस - टाइम टेबल
              </h3>
              <p className="text-xs text-amber-200">बिहार बोर्ड कक्षा 10वीं दैनिक क्लास रूटीन (एडमिन द्वारा अपडेटेड)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <span>लाइव एवं रिकॉर्डेड क्लासेज इसी रूटीन अनुसार ऐप के VIP सेक्शन में उपलब्ध रहती हैं।</span>
        </div>

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {routine.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border border-slate-200/80 border-l-4 ${item.color || 'border-l-red-500 bg-red-50/50'} shadow-xs space-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900 text-sm">
                  {item.subject}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {item.time}
                </span>
              </div>
              <div className="text-xs text-stone-600 font-medium">
                {item.topic}
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-slate-200/60">
                <span>शिक्षक: <strong>{item.instructor}</strong></span>
                <span className="text-red-700 font-semibold">{item.days}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">परीक्षा तक नियमित अध्ययन करें</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            ठीक है (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
}
