import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeatureGridProps {
  onNavigate: (view: string, extra?: any) => void;
}

export function FeatureGrid({ onNavigate }: FeatureGridProps) {
  const { isVIP } = useAuth();

  const gridItems = [
    {
      id: 'course',
      title: 'Course',
      subtitle: 'सभी विषय (Class 10 BSEB)',
      badge: 'FREE',
      badgeColor: 'bg-emerald-600 text-white',
      icon: GraduationCap,
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-full shadow-2xs">
            10th
          </span>
        </div>
      )
    },
    {
      id: 'crash_course',
      title: 'Test',
      subtitle: 'सभी विषयों के 30 ऑब्जेक्टिव VVI टेस्ट',
      badge: 'MCQ',
      badgeColor: 'bg-emerald-600 text-white',
      icon: FileText,
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded-full shadow-2xs">
            MCQ
          </span>
        </div>
      )
    },
    {
      id: 'daily_test',
      title: 'Daily Test',
      subtitle: 'रोजाना VVI प्रैक्टिस टेस्ट',
      badge: 'LIVE',
      badgeColor: 'bg-amber-500 text-stone-950 font-black',
      icon: Target,
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 font-black text-[8px] px-1.5 py-0.2 rounded-full shadow-2xs">
            NEW
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-2.5">
      {/* Section Title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-[#222222] flex items-center gap-1.5">
          <span className="w-2 h-3.5 rounded-full bg-[#D8B45A] inline-block"></span>
          <span>मुख्य सुविधाएँ & अध्ययन सामग्री</span>
        </h3>
        <span className="text-[10px] text-[#777777] font-bold">100% Free Access</span>
      </div>

      {/* Exactly 3 Feature Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {gridItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 sm:p-4 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between relative overflow-hidden"
          >
            {/* Top Icon */}
            <div className="pt-1">
              {item.renderIcon()}
            </div>

            {/* Labels */}
            <div className="w-full mt-2.5 space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-[#222222] tracking-tight leading-tight group-hover:text-[#D8B45A] transition-colors">
                {item.title}
              </h4>
              <p className="text-[9px] sm:text-[10px] text-[#777777] font-medium line-clamp-2 leading-tight">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
