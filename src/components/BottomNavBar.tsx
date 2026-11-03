import React from 'react';
import { Home, BookOpen, Radio, CheckSquare, Trophy, DownloadCloud, MessageCircle, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const navItems = [
    { id: 'home', label: 'Home', hindiLabel: 'होम', icon: Home },
    { id: 'my_courses', label: 'Courses', hindiLabel: 'कोर्स', icon: BookOpen },
    { id: 'live', label: 'Live', hindiLabel: 'लाइव', icon: Radio },
    { id: 'daily_quiz', label: 'Quiz', hindiLabel: 'क्विज', icon: CheckSquare },
    { id: 'leaderboard', label: 'Rank', hindiLabel: 'टॉपर', icon: Trophy },
    { id: 'downloads', label: 'Notes', hindiLabel: 'नोट्स', icon: DownloadCloud },
    { id: 'chat', label: 'Bihar Guru', hindiLabel: 'बिहार गुरु', icon: MessageCircle },
    { id: 'profile', label: 'Profile', hindiLabel: 'प्रोफाइल', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EADBB8] px-1.5 py-1.5 flex items-center justify-between shadow-lg overflow-x-auto scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`min-w-[44px] flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
              isActive ? 'text-[#222222] font-black' : 'text-[#777777] hover:text-[#222222] font-medium'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1 w-5 h-0.5 bg-[#D8B45A] rounded-full" />
            )}
            <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-[#D8B45A]' : ''}`} />
            <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
