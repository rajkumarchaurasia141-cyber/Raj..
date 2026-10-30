import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle,
  Instagram,
  Youtube,
  ArrowRight,
  BookOpen,
  Globe,
  FlaskConical,
  ListChecks,
  GraduationCap,
  Landmark,
  Compass,
  Scale,
  TrendingUp,
  Bell
} from 'lucide-react';
import { ClassRoutineModal } from './ClassRoutineModal';
import { NcertBooksModal } from './NcertBooksModal';
import { SocialMediaModal } from './SocialMediaModal';
import { AdsterraBanner } from './AdsterraBanner';
import { triggerAd } from '../utils/adManager';
import { getDevicePushState } from '../services/pushNotificationService';

interface HomeScreenProps {
  onSelect?: (subjectId: string) => void;
  onOpenSubject?: (subjectId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenVip?: () => void;
  onOpenNotifications?: () => void;
}

export function HomeScreen({ onSelect, onOpenSubject, onNavigateTab, onOpenNotifications }: HomeScreenProps) {
  const { subjects, paidNotes, motivationalQuotes, appConfig } = useData();
  const { isAdmin, user } = useAuth();
  const handleSelectSubject = onSelect || onOpenSubject || (() => {});

  const [showRoutine, setShowRoutine] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const pushState = getDevicePushState();

  const handleFeatureNavigate = (id: string) => {
    triggerAd();

    switch (id) {
      case 'course':
        if (onNavigateTab) {
          onNavigateTab('my_courses');
        } else {
          handleSelectSubject('sanskrit');
        }
        break;
      case 'test_pdfs':
      case 'crash_course':
        if (onNavigateTab) {
          onNavigateTab('crash_course');
        }
        break;
      case 'daily_test':
        if (onNavigateTab) {
          onNavigateTab('daily_test');
        }
        break;
      default:
        break;
    }
  };

  const handleOpenSubjectCard = (subjectId: string) => {
    triggerAd();
    handleSelectSubject(subjectId);
  };

  // Retrieve actual chapter/note counts from existing application data
  const getSubjectChapterCount = (id: string): number => {
    if (id === 'math') {
      return subjects['math']?.chapters?.length ?? subjects['mathematics']?.chapters?.length ?? 0;
    }
    if (id === 'science') {
      return subjects['science']?.chapters?.length ?? 0;
    }
    if (id === 'social_science' || id === 'sst') {
      const directCount = subjects['social_science']?.chapters?.length || subjects['sst']?.chapters?.length || 0;
      if (directCount > 0) return directCount;
      return (
        (subjects['history']?.chapters?.length || 0) +
        (subjects['geography']?.chapters?.length || 0) +
        (subjects['political_science']?.chapters?.length || 0) +
        (subjects['economics']?.chapters?.length || 0)
      );
    }
    if (id === 'hindi') {
      return subjects['hindi']?.chapters?.length ?? 0;
    }
    if (id === 'sanskrit') {
      return subjects['sanskrit']?.chapters?.length ?? 0;
    }
    if (id === 'english') {
      const chCount = subjects['english']?.chapters?.length || 0;
      if (chCount > 0) return chCount;
      const noteCount = paidNotes?.filter(n => n.subjectId === 'english').length || 0;
      return noteCount;
    }
    return subjects[id]?.chapters?.length ?? 0;
  };

  // Primary 6 subject cards matching the reference screenshot
  const primarySubjectCards = [
    {
      id: 'math',
      name: 'गणित',
      chaptersCount: getSubjectChapterCount('math'),
      circleBg: 'bg-[#FF574A]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <circle cx="17" cy="7" r="3.6" />
          <polygon points="7,13.5 3.2,20.5 10.8,20.5" />
          <path d="M17 13.5v7M13.5 17h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'science',
      name: 'विज्ञान',
      chaptersCount: getSubjectChapterCount('science'),
      circleBg: 'bg-[#00B8D4]',
      renderIcon: () => <FlaskConical className="w-6 h-6 text-white stroke-[2.2]" />
    },
    {
      id: 'social_science',
      name: 'सामाजिक विज्ञान (SST)',
      chaptersCount: getSubjectChapterCount('social_science'),
      circleBg: 'bg-[#2E7D32]',
      renderIcon: () => <Globe className="w-6 h-6 text-white stroke-[2.2]" />
    },
    {
      id: 'hindi',
      name: 'हिंदी',
      chaptersCount: getSubjectChapterCount('hindi'),
      circleBg: 'bg-[#29B6F6]',
      renderIcon: () => <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />
    },
    {
      id: 'sanskrit',
      name: 'संस्कृत',
      chaptersCount: getSubjectChapterCount('sanskrit'),
      circleBg: 'bg-[#4DB6AC]',
      renderIcon: () => <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />
    },
    {
      id: 'english',
      name: 'English',
      chaptersCount: getSubjectChapterCount('english'),
      circleBg: 'bg-[#8BC34A]',
      renderIcon: () => <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />
    }
  ];

  // Include any additional existing subjects from application data so no existing subject or chapter is removed
  const ignoredDuplicateKeys = new Set([
    'math', 'mathematics', 'science', 'social_science', 'sst', 'hindi', 'sanskrit', 'english',
    'arthashastra', 'bhugol', 'polscience', 'civics'
  ]);

  const additionalSubjectMeta: Record<string, { name: string; circleBg: string; renderIcon: () => React.ReactNode }> = {
    history: {
      name: 'इतिहास (History)',
      circleBg: 'bg-[#D84315]',
      renderIcon: () => <Landmark className="w-6 h-6 text-white stroke-[2.2]" />
    },
    geography: {
      name: 'भूगोल (Geography)',
      circleBg: 'bg-[#00897B]',
      renderIcon: () => <Compass className="w-6 h-6 text-white stroke-[2.2]" />
    },
    political_science: {
      name: 'राजनीति शास्त्र (Civics)',
      circleBg: 'bg-[#5E35B1]',
      renderIcon: () => <Scale className="w-6 h-6 text-white stroke-[2.2]" />
    },
    economics: {
      name: 'अर्थशास्त्र (Economics)',
      circleBg: 'bg-[#F57C00]',
      renderIcon: () => <TrendingUp className="w-6 h-6 text-white stroke-[2.2]" />
    }
  };

  const additionalSubjectCards = Object.values(subjects)
    .filter((sub: any) => sub && sub.id && !ignoredDuplicateKeys.has(sub.id))
    .map((sub: any) => {
      const meta = additionalSubjectMeta[sub.id];
      return {
        id: sub.id,
        name: meta?.name || sub.subject_name_hindi || sub.subject_name || sub.id,
        chaptersCount: sub.chapters?.length ?? 0,
        circleBg: meta?.circleBg || 'bg-[#3949AB]',
        renderIcon: meta?.renderIcon || (() => <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />)
      };
    });

  const allSubjectCards = [...primarySubjectCards, ...additionalSubjectCards];

  return (
    <div className="p-2.5 sm:p-3 w-full max-w-2xl mx-auto space-y-3.5 sm:space-y-4 pb-12">
      {/* Admin Quick Access Banner */}
      {isAdmin && (
        <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-xl p-2 px-3 text-[#222222] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F8E8B5] text-[#222222] border border-[#D8B45A]/50 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#D8B45A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-[#222222]">एडमिन मोड सक्रिय</span>
                <span className="text-[9px] bg-[#FFF4D6] text-[#D8B45A] border border-[#EADBB8] px-1.5 py-0.2 rounded font-black">सुपर एडमिन</span>
              </div>
              <p className="text-[10px] text-[#777777] truncate">
                नमस्ते {user?.name || 'राजकुमार sir'}!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigateTab && onNavigateTab('admin_daily_test')}
              className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-[10px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              title="Daily Test Manager"
            >
              <span>📝 डेली टेस्ट</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('admin')}
              className="px-2.5 py-1 bg-[#F8E8B5] hover:bg-[#F3DD9C] border border-[#D8B45A] text-[#222222] font-black text-[10px] rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs ml-1"
            >
              <span>एडमिन पैनल</span>
              <ArrowRight className="w-3 h-3 text-[#222222]" />
            </button>
          </div>
        </div>
      )}

      {/* Motivational Quote Ticker */}
      {motivationalQuotes.filter(q => q.isActive).length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#D8B45A] shrink-0" />
          <span className="text-[10px] font-black uppercase text-[#D8B45A] tracking-wider shrink-0">सुविचार:</span>
          <p className="text-[11px] font-bold text-[#222222] truncate">
            "{motivationalQuotes.filter(q => q.isActive)[0]?.quote}"
          </p>
        </div>
      )}

      {/* Student Smart Push Notification Opt-In Bar */}
      {onOpenNotifications && (!pushState.subscribed || pushState.permission !== 'granted') && (
        <div
          onClick={onOpenNotifications}
          className="bg-white border border-amber-300/90 rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2 shadow-xs hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-stone-900 truncate">
                नए नोट्स, डेली टेस्ट और लाइव क्लास का तुरंत अलर्ट पाएं
              </p>
              <p className="text-[10px] font-bold text-stone-500 truncate">
                BSEB GURU स्मार्ट स्टडी रिमाइंडर • 100% मुफ़्त
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotifications();
            }}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-black text-[11px] rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            🔔 Notifications चालू करें
          </button>
        </div>
      )}

      {/* Top Test & Daily Test Quick Access (Preserving Test and Daily Test Navigation) */}
      <div className="space-y-2.5">
        <h3 className="text-center text-sm sm:text-base font-extrabold text-[#1A237E] tracking-tight">
          अब हज़ारों बच्चों के साथ टेस्ट दीजिये
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {/* Daily Test Card */}
          <div
            onClick={() => handleFeatureNavigate('daily_test')}
            className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
          >
            <div className="pt-4 pb-2.5 px-3 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100/90 flex items-center justify-center mb-2 shadow-inner">
                <div className="w-12 h-12 rounded-full bg-[#00897B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ListChecks className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">Daily Live Test</span>
            </div>
            <div className="border-t border-slate-100 py-2.5 px-2 text-center bg-white">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#00897B] transition-colors">
                Daily Test
              </h4>
            </div>
          </div>

          {/* Test Section Card */}
          <div
            onClick={() => handleFeatureNavigate('crash_course')}
            className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
          >
            <div className="pt-4 pb-2.5 px-3 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100/90 flex items-center justify-center mb-2 shadow-inner">
                <div className="w-12 h-12 rounded-full bg-[#607D8B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">30 VVI MCQ Test</span>
            </div>
            <div className="border-t border-slate-100 py-2.5 px-2 text-center bg-white">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#1A237E] transition-colors">
                Test
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Study Cards Section (2-Column Grid matching Reference Screenshot) */}
      <div className="space-y-2.5 pt-1">
        <div className="text-center space-y-0.5">
          <h2 className="text-sm sm:text-base font-extrabold text-[#1A237E] tracking-tight">
            अब होगी हर विषय की पूरी तैयारी
          </h2>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500">
            अपने विषय का चयन करें
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {allSubjectCards.map((sub) => (
            <div
              key={sub.id}
              onClick={() => handleOpenSubjectCard(sub.id)}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col justify-between"
            >
              {/* Top Icon & Chapter Count */}
              <div className="pt-4 pb-2.5 px-3 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100/90 flex items-center justify-center mb-2 shadow-inner">
                  <div className={`w-12 h-12 rounded-full ${sub.circleBg} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                    {sub.renderIcon()}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {sub.chaptersCount} Chapters
                </span>
              </div>

              {/* Bottom Divider & Subject Name */}
              <div className="border-t border-slate-100 py-2.5 px-2.5 text-center bg-white">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#1A237E] transition-colors">
                  {sub.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Study Campaign Announcement */}
      <div className="bg-[#FFFFFF] border border-[#EADBB8] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF4D6] text-[#222222] border border-[#EADBB8] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 fill-[#D8B45A] text-[#D8B45A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#222222]">100% मुफ़्त शिक्षा अभियान (All Courses Free)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-[#777777] leading-snug mt-0.5">
              बिहार बोर्ड परीक्षा की तैयारी के लिए सभी कोर्सेज, टेस्ट सीरीज और पीडीएफ नोट्स पूर्ण रूप से मुफ्त उपलब्ध हैं।
            </p>
          </div>
        </div>
      </div>

      {/* Connect With Us Section (WhatsApp, Instagram, YouTube) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-[#222222] flex items-center gap-1.5">
            <span className="w-2 h-3.5 rounded-full bg-[#D8B45A] inline-block"></span>
            <span>Connect With Us (जुड़ें)</span>
          </h3>
          <span className="text-[10px] text-[#777777] font-bold">Official Social Media</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/91${appConfig.whatsappNumber || '9241511070'}?text=${encodeURIComponent('नमस्ते सर, मुझे BSEB GURU 10वीं कोर्स की जानकारी चाहिए।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <MessageCircle className="w-6 h-6 fill-emerald-600 text-white" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-emerald-600 transition-colors">
                WhatsApp
              </h4>
              <p className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Connect Now
              </p>
            </div>
          </a>

          {/* Instagram Card */}
          <a
            href={appConfig.instagramUrl || 'https://instagram.com/unbroken_raj_01'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-rose-600 transition-colors">
                Instagram
              </h4>
              <p className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Follow Now
              </p>
            </div>
          </a>

          {/* YouTube Card */}
          <a
            href={appConfig.youtubeUrl || 'https://youtube.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFFFFF] hover:bg-[#FFFDF7] rounded-2xl p-3 border border-[#EADBB8] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Youtube className="w-6 h-6 fill-red-600 text-white" />
            </div>
            <div className="w-full mt-2 space-y-0.5">
              <h4 className="text-xs font-black text-[#222222] tracking-tight group-hover:text-red-600 transition-colors">
                YouTube
              </h4>
              <p className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                Subscribe
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Bihar Guru AI Assistant Card */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('chat')}
        className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#EADBB8] hover:border-[#D8B45A] transition-all group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E8B5] border border-[#D8B45A]/50 text-[#222222] flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6 fill-[#D8B45A] text-[#D8B45A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-[#222222] text-sm sm:text-base leading-tight">
                  बिहार गुरु (Bihar Guru) AI Assistant
                </h4>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#D8B45A] mt-0.5 font-bold">
                BSEB Class 10 • All Subjects Doubt Solver
              </p>
              <p className="text-[11px] text-[#777777] mt-0.5">
                आसान भाषा में समझें और परीक्षा अनुसार सटीक उत्तर पाएं ↗
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF4D6] border border-[#EADBB8] group-hover:bg-[#F8E8B5] text-[#222222] flex items-center justify-center transition-all shrink-0 ml-2">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Adsterra 300x250 Banner Ad (Centered at Bottom) */}
      <AdsterraBanner />

      {/* Modals */}
      {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
      {showNcert && <NcertBooksModal onClose={() => setShowNcert(false)} onOpenSubject={(id) => handleSelectSubject(id)} />}
      {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
    </div>
  );
}
