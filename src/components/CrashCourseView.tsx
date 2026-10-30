import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Search, 
  BookOpen, 
  Award, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  Zap, 
  Timer, 
  RefreshCw, 
  Trophy, 
  Filter, 
  Check, 
  X,
  Clock,
  Ticket,
  Tag
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CrashCoursePdf } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { CRASH_COURSE_SUBJECTS, getChapter30Questions, CrashTestQuestion } from '../data/crashCourseTestsData';
import { HINDI_ALL_CHAPTERS_LIST, HindiChapterMeta } from '../data/hindiCrashCourseQuestions';
import { SANSKRIT_ALL_CHAPTERS_LIST, SanskritChapterMeta } from '../data/sanskritCrashCourseQuestions';
import { SCIENCE_ALL_CHAPTERS_LIST, ScienceChapterMeta } from '../data/scienceCrashCourseQuestions';
import { MATH_ALL_CHAPTERS_LIST, MathChapterMeta } from '../data/mathCrashCourseQuestions';
import { SST_ALL_CHAPTERS_LIST, SstChapterMeta } from '../data/sstCrashCourseQuestions';
import { ENGLISH_ALL_CHAPTERS_LIST, EnglishChapterMeta } from '../data/englishCrashCourseQuestions';
import { CrashCoursePaywallModal } from './CrashCoursePaywallModal';
import { playSound } from '../utils/audio';

interface CrashCourseViewProps {
  onBack: () => void;
  onOpenVip: () => void;
}

export function CrashCourseView({ onBack, onOpenVip }: CrashCourseViewProps) {
  const { crashCoursePdfs } = useData();
  const { user, isVIP, isAdmin, hasCrashCourse } = useAuth();
  const isCrashCourseUnlocked = isAdmin || hasCrashCourse;
  const [showCrashCourseModal, setShowCrashCourseModal] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    const studentEmail = (user?.email || '').trim().toLowerCase();
    try {
      const localItems = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
      if (studentEmail) {
        const found = localItems.find((r: any) => (r.studentEmail || '').toLowerCase() === studentEmail);
        if (found) setExistingRequest(found);
      } else if (localItems.length > 0) {
        setExistingRequest(localItems[0]);
      }
    } catch {}

    if (studentEmail) {
      try {
        const unsub = onSnapshot(collection(db, 'crash_course_requests'), (snapshot) => {
          const found = snapshot.docs.find(d => {
            const data = d.data();
            return (data.studentEmail || data.userEmail || '').toLowerCase() === studentEmail;
          });
          if (found) {
            setExistingRequest({ id: found.id, ...found.data() });
          }
        }, () => {});
        return () => unsub();
      } catch {}
    }
  }, [user?.email]);

  const [activeSection, setActiveSection] = useState<'pdfs' | 'tests'>('tests');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('hindi');
  const [selectedHindiCategory, setSelectedHindiCategory] = useState<string>('all');
  const [selectedSanskritCategory, setSelectedSanskritCategory] = useState<string>('all');
  const [selectedScienceCategory, setSelectedScienceCategory] = useState<string>('all');
  const [selectedMathCategory, setSelectedMathCategory] = useState<string>('all');
  const [selectedSstCategory, setSelectedSstCategory] = useState<string>('all');
  const [selectedEnglishCategory, setSelectedEnglishCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingPdf, setReadingPdf] = useState<CrashCoursePdf | null>(null);

  // Test Runner State
  const [testActive, setTestActive] = useState(false);
  const [testSubject, setTestSubject] = useState(CRASH_COURSE_SUBJECTS[3]); // Default Hindi
  const [testChapterNo, setTestChapterNo] = useState(1);
  const [testChapterName, setTestChapterName] = useState('श्रम विभाजन और जाति प्रथा');
  const [testQuestions, setTestQuestions] = useState<CrashTestQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Real-time Per-Question Feedback State: Record<questionIndex, { selectedOpt: number; isCorrect: boolean }>
  const [answeredState, setAnsweredState] = useState<Record<number, { selectedOpt: number; isCorrect: boolean }>>({});
  const [testFinished, setTestFinished] = useState(false);

  const subjects = [
    { id: 'hindi', name: 'हिन्दी (Hindi - 29 Ch + व्याकरण)', icon: '📖' },
    { id: 'sanskrit', name: 'संस्कृत (Sanskrit - 14 Ch + व्याकरण)', icon: '🕉️' },
    { id: 'science', name: 'विज्ञान (Science - 16 Ch + 4 बूस्टर)', icon: '🔬' },
    { id: 'math', name: 'गणित (Maths - 15 Ch + 5 सूत्र बूस्टर)', icon: '📐' },
    { id: 'social_science', name: 'सामाजिक विज्ञान (SST - 27 Ch + 3 बूस्टर)', icon: '🌍' },
    { id: 'english', name: 'अंग्रेजी (English - 22 Ch + 6 ग्रामर)', icon: '🔤' }
  ];

  // Filtered PDFs
  const filteredPdfs = crashCoursePdfs.filter(item => {
    if (selectedSubjectId !== 'all' && item.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchChapter = item.chapterName.toLowerCase().includes(q);
      const matchSubject = item.subjectName.toLowerCase().includes(q);
      if (!matchTitle && !matchChapter && !matchSubject) return false;
    }
    return true;
  });

  // Filtered Hindi Chapters
  const filteredHindiChapters = HINDI_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedHindiCategory === 'gadya' && ch.section !== 'गोधूलि गद्य खंड') return false;
    if (selectedHindiCategory === 'padya' && ch.section !== 'गोधूलि पद्य खंड') return false;
    if (selectedHindiCategory === 'varnika' && ch.section !== 'वर्णिका भाग-2') return false;
    if (selectedHindiCategory === 'vyakaran' && ch.section !== 'हिन्दी व्याकरण') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchAuthor = ch.author.toLowerCase().includes(q);
      const matchSec = ch.section.toLowerCase().includes(q);
      if (!matchName && !matchAuthor && !matchSec) return false;
    }
    return true;
  });

  // Filtered Sanskrit Chapters (1-14 Piyusham + 8 Sanskrit Grammar Topics)
  const filteredSanskritChapters = SANSKRIT_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedSanskritCategory === 'textbook' && ch.section !== 'पीयूषम् भाग-2') return false;
    if (selectedSanskritCategory === 'vyakaran' && ch.section !== 'संस्कृत व्याकरण') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchAuthor = ch.author.toLowerCase().includes(q);
      const matchSec = ch.section.toLowerCase().includes(q);
      if (!matchName && !matchAuthor && !matchSec) return false;
    }
    return true;
  });

  // Filtered Science Chapters (16 Textbook Chapters + 4 Special Boosters)
  const filteredScienceChapters = SCIENCE_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedScienceCategory === 'physics' && ch.category !== 'physics') return false;
    if (selectedScienceCategory === 'chemistry' && ch.category !== 'chemistry') return false;
    if (selectedScienceCategory === 'biology' && ch.category !== 'biology') return false;
    if (selectedScienceCategory === 'booster' && ch.category !== 'booster') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchBranch = ch.branch.toLowerCase().includes(q);
      const matchTopics = ch.topics.toLowerCase().includes(q);
      if (!matchName && !matchBranch && !matchTopics) return false;
    }
    return true;
  });

  // Filtered Math Chapters (15 Textbook Chapters + 5 Special Formula Boosters)
  const filteredMathChapters = MATH_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedMathCategory === 'algebra' && ch.category !== 'algebra') return false;
    if (selectedMathCategory === 'geometry' && ch.category !== 'geometry') return false;
    if (selectedMathCategory === 'trigonometry' && ch.category !== 'trigonometry') return false;
    if (selectedMathCategory === 'mensuration' && ch.category !== 'mensuration') return false;
    if (selectedMathCategory === 'booster' && ch.category !== 'booster') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchBranch = ch.branch.toLowerCase().includes(q);
      const matchTopics = ch.topics.toLowerCase().includes(q);
      if (!matchName && !matchBranch && !matchTopics) return false;
    }
    return true;
  });

  // Filtered SST Chapters (27 Textbook Chapters + 3 Special Boosters)
  const filteredSstChapters = SST_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedSstCategory === 'history' && ch.category !== 'history') return false;
    if (selectedSstCategory === 'geography' && ch.category !== 'geography') return false;
    if (selectedSstCategory === 'civics' && ch.category !== 'civics') return false;
    if (selectedSstCategory === 'economics' && ch.category !== 'economics') return false;
    if (selectedSstCategory === 'booster' && ch.category !== 'booster') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchBranch = ch.branch.toLowerCase().includes(q);
      const matchTopics = ch.topics.toLowerCase().includes(q);
      if (!matchName && !matchBranch && !matchTopics) return false;
    }
    return true;
  });

  // Filtered English Chapters (22 Panorama Chapters + 6 English Grammar Chapters)
  const filteredEnglishChapters = ENGLISH_ALL_CHAPTERS_LIST.filter(ch => {
    if (selectedEnglishCategory === 'prose' && ch.category !== 'prose') return false;
    if (selectedEnglishCategory === 'poetry' && ch.category !== 'poetry') return false;
    if (selectedEnglishCategory === 'reader' && ch.category !== 'reader') return false;
    if (selectedEnglishCategory === 'grammar' && ch.category !== 'grammar') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchBranch = ch.branch.toLowerCase().includes(q);
      const matchAuthor = ch.authorOrPoet.toLowerCase().includes(q);
      const matchTopics = ch.topics.toLowerCase().includes(q);
      if (!matchName && !matchBranch && !matchAuthor && !matchTopics) return false;
    }
    return true;
  });

  // Calculate live score
  const correctCount = Object.values(answeredState).filter(a => a.isCorrect).length;
  const wrongCount = Object.values(answeredState).filter(a => !a.isCorrect).length;
  const answeredCount = Object.keys(answeredState).length;

  const startChapterTest = (subId: string, chapNo: number, chapName: string) => {
    // If not unlocked and beyond sample Chapter 1, open unlock modal
    if (!isCrashCourseUnlocked && chapNo > 1) {
      setShowCrashCourseModal(true);
      return;
    }

    const subObj = CRASH_COURSE_SUBJECTS.find(s => s.id === subId) || CRASH_COURSE_SUBJECTS[0];
    const qList = getChapter30Questions(subId, chapNo, chapName);
    setTestSubject(subObj);
    setTestChapterNo(chapNo);
    setTestChapterName(chapName);
    setTestQuestions(qList);
    setCurrentQuestionIdx(0);
    setAnsweredState({});
    setTestFinished(false);
    setTestActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Instant Right / Wrong Option Click Handler
  const handleSelectOption = (optIdx: number) => {
    // If already answered this question, do not allow changes
    if (answeredState[currentQuestionIdx] !== undefined) return;

    const currentQ = testQuestions[currentQuestionIdx];
    const isCorrect = optIdx === currentQ.correctAnswer;

    if (isCorrect) {
      playSound('right');
    } else {
      playSound('wrong');
    }

    setAnsweredState(prev => ({
      ...prev,
      [currentQuestionIdx]: {
        selectedOpt: optIdx,
        isCorrect
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-6 pb-28 animate-fade-in font-sans">
      {/* Top Back Navigation & VIP Action */}
      <div className="flex items-center justify-between gap-2">
        <button 
          onClick={onBack} 
          className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" /> 
          <span>होम पर वापस जाएं</span>
        </button>

        {!isCrashCourseUnlocked ? (
          <button
            onClick={() => setShowCrashCourseModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-yellow-300" />
            <span>क्रैश कोर्स अनलॉक (₹299 / कोड से ₹199)</span>
          </button>
        ) : (
          <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>क्रैश कोर्स सक्रिय (Unlocked)</span>
          </div>
        )}
      </div>

      {/* Payment Status & Secret Discount Code Section (पेमेंट स्टेटस & कोड डिस्काउंट सेक्शन) */}
      {!isCrashCourseUnlocked && (
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0 border border-amber-500/30">
                {existingRequest ? <Clock className="w-5 h-5 text-amber-400 animate-spin" /> : <Ticket className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">
                    {existingRequest ? 'आपका क्रैश कोर्स पेमेंट स्टेटस (Payment Status):' : 'क्रैश कोर्स स्पेशल डिस्काउंट कोड ऑफर:'}
                  </span>
                  {existingRequest ? (
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      existingRequest.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : existingRequest.status === 'rejected'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                    }`}>
                      {existingRequest.status === 'approved' ? 'सक्रिय / अनलॉक्ड' : existingRequest.status === 'rejected' ? 'अस्वीकृत' : '⏳ पेंडिंग सत्यापन'}
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                      ₹100 की विशेष छूट
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {existingRequest ? (
                    <span>
                      भुगतान राशि: <strong className="text-emerald-400">₹{existingRequest.amount}</strong>
                      {existingRequest.discountCode && <span className="ml-1.5 text-amber-300 font-bold">(गुप्त कूपन: {existingRequest.discountCode} लागू)</span>}
                      {existingRequest.status === 'pending' && ' • एडमिन द्वारा सत्यापन प्रगति पर है।'}
                    </span>
                  ) : (
                    <span>
                      सामान्य फीस <b>₹299</b> है। यदि एडमिन द्वारा दिया गया गुप्त कोड है तो <b>₹100 डिस्काउंट</b> के साथ मात्र <b>₹199</b> में अनलॉक करें।
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCrashCourseModal(true)}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Ticket className="w-4 h-4 text-stone-950" />
              <span>{existingRequest ? 'पेमेंट स्टेटस देखें / कोड डालें' : 'कोड डालें & ₹199 में अनलॉक करें'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <Zap className="w-3 h-3 text-yellow-300 fill-current" />
            BSEB 10वीं ऑनलाइन टेस्ट हब • Test (केवल टेस्ट सेक्शन)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Test (ऑनलाइन टेस्ट हब)
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
            बिहार बोर्ड परीक्षा की तैयारी के लिए सभी 6 विषयों — हिन्दी (35 Ch), संस्कृत (18 Ch), विज्ञान (20 Ch), गणित (20 Ch), सामाजिक विज्ञान (30 Ch) व अंग्रेजी (28 Ch) के 30-30 VVI ऑब्जेक्टिव प्रश्न सेट्स और तुरंत लाइव मूल्यांकन!
          </p>

          <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-amber-200 flex-wrap">
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 35 हिन्दी + व्याकरण</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 18 संस्कृत + व्याकरण</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 20 विज्ञान + बूस्टर</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 20 गणित + सूत्र बूस्टर</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 30 SST + महा-बूस्टर</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">✔ 28 अंग्रेजी + ग्रामर</span>
          </div>
        </div>
      </div>

      {/* -------------------- 30 VVI CHAPTER TESTS SECTION -------------------- */}
      {!testActive && (
        <div className="space-y-4">
          {/* Subject Switcher Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSubjectId(s.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedSubjectId === s.id
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Hindi Category Sub-tabs: All | गद्य खंड (1-12) | पद्य खंड (13-24) | वर्णिका (25-29) | व्याकरण (30-36) */}
          {selectedSubjectId === 'hindi' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedHindiCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedHindiCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी अध्याय (36)
                </button>
                <button
                  onClick={() => setSelectedHindiCategory('gadya')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedHindiCategory === 'gadya'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📖 गद्य खंड (Ch 1 - 12)
                </button>
                <button
                  onClick={() => setSelectedHindiCategory('padya')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedHindiCategory === 'padya'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📜 पद्य खंड (Ch 13 - 24)
                </button>
                <button
                  onClick={() => setSelectedHindiCategory('varnika')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedHindiCategory === 'varnika'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📚 वर्णिका (Ch 25 - 29)
                </button>
                <button
                  onClick={() => setSelectedHindiCategory('vyakaran')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedHindiCategory === 'vyakaran'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ✍️ हिन्दी व्याकरण (7 टॉपिक्स)
                </button>
              </div>

              {/* Search Bar for Chapters */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="अध्याय का नाम या लेखक खोजें (उदा. श्रम विभाजन, मंगम्मा, संधि)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>

              {/* Hindi Chapters 1 to 29 + Vyakaran Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredHindiChapters.map(ch => (
                  <div
                    key={ch.no}
                    className="bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                            {ch.no}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            {ch.section}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          30 VVI MCQ
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-amber-800 leading-snug">
                          {ch.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                          लेखक / विषय: {ch.author}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ⚡ तुरंत सही/गलत उत्तर
                      </span>

                      <button
                        onClick={() => startChapterTest('hindi', ch.no, `${ch.name} (${ch.section})`)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>30 MCQ टेस्ट</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sanskrit Category Sub-tabs & Chapters Grid (1-14 Piyusham + 8 Sanskrit Grammar Topics) */}
          {selectedSubjectId === 'sanskrit' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSanskritCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSanskritCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी अध्याय एवं व्याकरण (22)
                </button>
                <button
                  onClick={() => setSelectedSanskritCategory('textbook')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSanskritCategory === 'textbook'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🕉️ पीयूषम् भाग-2 (Ch 1 - 14)
                </button>
                <button
                  onClick={() => setSelectedSanskritCategory('vyakaran')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSanskritCategory === 'vyakaran'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ✍️ संस्कृत व्याकरण (8 टॉपिक्स)
                </button>
              </div>

              {/* Search Bar for Sanskrit */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="संस्कृत पाठ या व्याकरण खोजें (उदा. मंगलम्, पाटलिपुत्र, सन्धि, समास, कारक)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                />
              </div>

              {/* Sanskrit Chapters 1 to 14 + Vyakaran 15 to 22 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSanskritChapters.map(ch => (
                  <div
                    key={ch.no}
                    className="bg-white border-2 border-stone-200 hover:border-purple-400 rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {ch.no}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            {ch.section}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                          30 VVI MCQ
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-purple-800 leading-snug">
                          {ch.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                          स्रोत / रचयिता: {ch.author}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ⚡ तुरंत सही/गलत उत्तर
                      </span>

                      <button
                        onClick={() => startChapterTest('sanskrit', ch.no, `${ch.name} (${ch.section})`)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-purple-600 hover:text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>30 MCQ टेस्ट</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Science Category Sub-tabs & Chapters Grid (1-16 NCERT/BSEB + 4 Special Boosters) */}
          {selectedSubjectId === 'science' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedScienceCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedScienceCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी अध्याय एवं बूस्टर (20)
                </button>
                <button
                  onClick={() => setSelectedScienceCategory('physics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedScienceCategory === 'physics'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ⚛️ भौतिकी (Physics - 5 Ch)
                </button>
                <button
                  onClick={() => setSelectedScienceCategory('chemistry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedScienceCategory === 'chemistry'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🧪 रसायन विज्ञान (Chemistry - 5 Ch)
                </button>
                <button
                  onClick={() => setSelectedScienceCategory('biology')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedScienceCategory === 'biology'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🧬 जीव विज्ञान (Biology - 6 Ch)
                </button>
                <button
                  onClick={() => setSelectedScienceCategory('booster')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedScienceCategory === 'booster'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ⚡ विशेष बूस्टर टेस्ट (4 सेट्स)
                </button>
              </div>

              {/* Search Bar for Science */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="विज्ञान पाठ या टॉपिक खोजें (उदा. प्रकाश, विद्युत, अम्ल, धातु, पाचन, नेफ्रॉन, सूत्र)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
              </div>

              {/* Science Chapters 1 to 20 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredScienceChapters.map(ch => {
                  const badgeColor = 
                    ch.category === 'physics' ? 'bg-blue-600 text-white' :
                    ch.category === 'chemistry' ? 'bg-amber-600 text-white' :
                    ch.category === 'biology' ? 'bg-emerald-600 text-white' :
                    'bg-purple-600 text-white';

                  const badgeBorder =
                    ch.category === 'physics' ? 'hover:border-blue-400' :
                    ch.category === 'chemistry' ? 'hover:border-amber-400' :
                    ch.category === 'biology' ? 'hover:border-emerald-400' :
                    'hover:border-purple-400';

                  const tagBg =
                    ch.category === 'physics' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    ch.category === 'chemistry' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    ch.category === 'biology' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-purple-50 text-purple-800 border-purple-200';

                  return (
                    <div
                      key={ch.no}
                      className={`bg-white border-2 border-stone-200 ${badgeBorder} rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-lg ${badgeColor} font-black text-xs flex items-center justify-center shrink-0`}>
                              {ch.no}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                              {ch.branch}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tagBg}`}>
                            30 VVI MCQ
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-cyan-800 leading-snug">
                            {ch.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                            प्रमुख बिंदु: {ch.topics}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ⚡ तुरंत सही/गलत उत्तर
                        </span>

                        <button
                          onClick={() => startChapterTest('science', ch.no, `${ch.name} (${ch.branch})`)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-cyan-600 hover:text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>30 MCQ टेस्ट</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Math Category Sub-tabs & Chapters Grid (1-15 NCERT/BSEB + 5 Special Formula Boosters) */}
          {selectedSubjectId === 'math' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedMathCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी अध्याय (20)
                </button>
                <button
                  onClick={() => setSelectedMathCategory('algebra')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'algebra'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🔢 बीजगणित (Ch 1 - 5)
                </button>
                <button
                  onClick={() => setSelectedMathCategory('geometry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'geometry'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📏 ज्यामिति (Ch 6, 7, 10, 11)
                </button>
                <button
                  onClick={() => setSelectedMathCategory('trigonometry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'trigonometry'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🔺 त्रिकोणमिति (Ch 8, 9, 17)
                </button>
                <button
                  onClick={() => setSelectedMathCategory('mensuration')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'mensuration'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📊 क्षेत्रमिति व सांख्यिकी (Ch 12-15, 19)
                </button>
                <button
                  onClick={() => setSelectedMathCategory('booster')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedMathCategory === 'booster'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ⚡ सूत्र व महा-बूस्टर (Ch 16 - 20)
                </button>
              </div>

              {/* Math Chapters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMathChapters.map(ch => {
                  const badgeColor =
                    ch.category === 'algebra' ? 'bg-amber-100 text-amber-900' :
                    ch.category === 'geometry' ? 'bg-indigo-100 text-indigo-900' :
                    ch.category === 'trigonometry' ? 'bg-rose-100 text-rose-900' :
                    ch.category === 'mensuration' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-purple-100 text-purple-900';

                  const badgeBorder =
                    ch.category === 'algebra' ? 'hover:border-amber-400' :
                    ch.category === 'geometry' ? 'hover:border-indigo-400' :
                    ch.category === 'trigonometry' ? 'hover:border-rose-400' :
                    ch.category === 'mensuration' ? 'hover:border-emerald-400' :
                    'hover:border-purple-400';

                  const tagBg =
                    ch.category === 'algebra' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    ch.category === 'geometry' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                    ch.category === 'trigonometry' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    ch.category === 'mensuration' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-purple-50 text-purple-800 border-purple-200';

                  return (
                    <div
                      key={ch.no}
                      className={`bg-white border-2 border-stone-200 ${badgeBorder} rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-lg ${badgeColor} font-black text-xs flex items-center justify-center shrink-0`}>
                              {ch.no}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                              {ch.branch}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tagBg}`}>
                            30 VVI MCQ
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-amber-800 leading-snug">
                            {ch.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                            प्रमुख बिंदु: {ch.topics}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ⚡ तुरंत सही/गलत उत्तर
                        </span>

                        <button
                          onClick={() => startChapterTest('math', ch.no, `${ch.name} (${ch.branch})`)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>30 MCQ टेस्ट</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SST Category Sub-tabs & Chapters Grid (27 Curriculum + 3 Special Boosters) */}
          {selectedSubjectId === 'social_science' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSstCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी अध्याय (30)
                </button>
                <button
                  onClick={() => setSelectedSstCategory('history')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'history'
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🏰 इतिहास (Ch 1 - 8)
                </button>
                <button
                  onClick={() => setSelectedSstCategory('geography')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'geography'
                      ? 'bg-teal-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🗺️ भूगोल व आपदा (Ch 9 - 15)
                </button>
                <button
                  onClick={() => setSelectedSstCategory('civics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'civics'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ⚖️ राजनीति विज्ञान (Ch 16 - 20)
                </button>
                <button
                  onClick={() => setSelectedSstCategory('economics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'economics'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  💰 अर्थशास्त्र (Ch 21 - 27)
                </button>
                <button
                  onClick={() => setSelectedSstCategory('booster')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSstCategory === 'booster'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🚀 महा-बूस्टर (Ch 28 - 30)
                </button>
              </div>

              {/* SST Chapters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSstChapters.map(ch => {
                  const badgeColor =
                    ch.category === 'history' ? 'bg-orange-100 text-orange-900' :
                    ch.category === 'geography' ? 'bg-teal-100 text-teal-900' :
                    ch.category === 'civics' ? 'bg-blue-100 text-blue-900' :
                    ch.category === 'economics' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-purple-100 text-purple-900';

                  const badgeBorder =
                    ch.category === 'history' ? 'hover:border-orange-400' :
                    ch.category === 'geography' ? 'hover:border-teal-400' :
                    ch.category === 'civics' ? 'hover:border-blue-400' :
                    ch.category === 'economics' ? 'hover:border-emerald-400' :
                    'hover:border-purple-400';

                  const tagBg =
                    ch.category === 'history' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    ch.category === 'geography' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                    ch.category === 'civics' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    ch.category === 'economics' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-purple-50 text-purple-800 border-purple-200';

                  return (
                    <div
                      key={ch.no}
                      className={`bg-white border-2 border-stone-200 ${badgeBorder} rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-lg ${badgeColor} font-black text-xs flex items-center justify-center shrink-0`}>
                              {ch.no}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                              {ch.branch}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tagBg}`}>
                            30 VVI MCQ
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-emerald-800 leading-snug">
                            {ch.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                            प्रमुख बिंदु: {ch.topics}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ⚡ तुरंत सही/गलत उत्तर
                        </span>

                        <button
                          onClick={() => startChapterTest('social_science', ch.no, `${ch.name} (${ch.branch})`)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-emerald-600 hover:text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>30 MCQ टेस्ट</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* English Category Sub-tabs & Chapters Grid (22 Panorama + 6 Grammar) */}
          {selectedSubjectId === 'english' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedEnglishCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedEnglishCategory === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All 28 Chapters (28)
                </button>
                <button
                  onClick={() => setSelectedEnglishCategory('prose')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedEnglishCategory === 'prose'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📖 Panorama Prose (Ch 1 - 8)
                </button>
                <button
                  onClick={() => setSelectedEnglishCategory('poetry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedEnglishCategory === 'poetry'
                      ? 'bg-pink-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🎭 Panorama Poetry (Ch 9 - 16)
                </button>
                <button
                  onClick={() => setSelectedEnglishCategory('reader')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedEnglishCategory === 'reader'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📚 Supplementary Reader (Ch 17 - 22)
                </button>
                <button
                  onClick={() => setSelectedEnglishCategory('grammar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedEnglishCategory === 'grammar'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ✍️ Grammar & Translation (Ch 23 - 28)
                </button>
              </div>

              {/* English Chapters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEnglishChapters.map(ch => {
                  const badgeColor =
                    ch.category === 'prose' ? 'bg-blue-100 text-blue-900' :
                    ch.category === 'poetry' ? 'bg-pink-100 text-pink-900' :
                    ch.category === 'reader' ? 'bg-amber-100 text-amber-900' :
                    'bg-purple-100 text-purple-900';

                  const badgeBorder =
                    ch.category === 'prose' ? 'hover:border-blue-400' :
                    ch.category === 'poetry' ? 'hover:border-pink-400' :
                    ch.category === 'reader' ? 'hover:border-amber-400' :
                    'hover:border-purple-400';

                  const tagBg =
                    ch.category === 'prose' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    ch.category === 'poetry' ? 'bg-pink-50 text-pink-800 border-pink-200' :
                    ch.category === 'reader' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-purple-50 text-purple-800 border-purple-200';

                  return (
                    <div
                      key={ch.no}
                      className={`bg-white border-2 border-stone-200 ${badgeBorder} rounded-2xl p-3.5 transition-all shadow-2xs flex flex-col justify-between group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-lg ${badgeColor} font-black text-xs flex items-center justify-center shrink-0`}>
                              {ch.no}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                              {ch.branch}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${tagBg}`}>
                            30 VVI MCQ
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-indigo-800 leading-snug">
                              {ch.name}
                            </h4>
                          </div>
                          {ch.authorOrPoet && (
                            <p className="text-[10px] text-indigo-700 font-bold mt-0.5">
                              ✍️ {ch.authorOrPoet}
                            </p>
                          )}
                          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                            Key Topics: {ch.topics}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ⚡ Instant Feedback
                        </span>

                        <button
                          onClick={() => startChapterTest('english', ch.no, `${ch.name} (${ch.branch})`)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-indigo-600 hover:text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>30 MCQ Test</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- INTERACTIVE TEST RUNNER WITH INSTANT FEEDBACK -------------------- */}
      {activeSection === 'tests' && testActive && testQuestions.length > 0 && !testFinished && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-4 sm:p-7 shadow-xl space-y-5 animate-fade-in">
          {/* Top Test Header & Live Score Ticker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{testSubject.icon}</span>
                <h3 className="text-sm sm:text-base font-black text-stone-900">{testChapterName}</h3>
              </div>
              <p className="text-[11px] text-stone-500 font-bold mt-0.5">
                प्रश्न {currentQuestionIdx + 1} / {testQuestions.length}
              </p>
            </div>

            {/* Live Real-Time Score Badges */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>सही: {correctCount}</span>
              </span>

              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1">
                <X className="w-3.5 h-3.5 stroke-[3]" />
                <span>गलत: {wrongCount}</span>
              </span>

              <button
                onClick={() => setTestActive(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer ml-1"
                title="बंद करें"
              >
                ✕ बंद
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / testQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wider">
                VVI प्रश्न {currentQuestionIdx + 1}
              </span>
              <span className="text-[10px] font-bold text-stone-500">
                एक विकल्प पर टैप करें (तुरंत परिणाम दिखेगा)
              </span>
            </div>
            <p className="text-sm sm:text-base font-black text-stone-900 leading-relaxed pt-1">
              {testQuestions[currentQuestionIdx].question}
            </p>
          </div>

          {/* 4 Options with INSTANT CORRECT / WRONG EVALUATION */}
          {(() => {
            const currentQ = testQuestions[currentQuestionIdx];
            const answerInfo = answeredState[currentQuestionIdx];
            const isAnswered = answerInfo !== undefined;

            return (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = isAnswered && answerInfo.selectedOpt === oIdx;
                    const isCorrectOption = oIdx === currentQ.correctAnswer;

                    let btnClasses = "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-amber-50 hover:border-amber-300 cursor-pointer";
                    let badgeEl = null;

                    if (isAnswered) {
                      if (isSelected) {
                        if (answerInfo.isCorrect) {
                          // Correct clicked
                          btnClasses = "bg-emerald-600 text-white font-black border-emerald-500 ring-2 ring-emerald-300 shadow-md";
                          badgeEl = (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" /> बिल्कुल सही!
                            </span>
                          );
                        } else {
                          // Wrong clicked
                          btnClasses = "bg-rose-600 text-white font-black border-rose-500 ring-2 ring-rose-300 shadow-md";
                          badgeEl = (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-black">
                              <XCircle className="w-3.5 h-3.5" /> गलत उत्तर!
                            </span>
                          );
                        }
                      } else if (isCorrectOption) {
                        // Reveal the right option in green when wrong option was clicked
                        btnClasses = "bg-emerald-100 border-emerald-400 text-emerald-950 font-black ring-2 ring-emerald-300";
                        badgeEl = (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-black">
                            <Check className="w-3.5 h-3.5" /> सही उत्तर यह है
                          </span>
                        );
                      } else {
                        btnClasses = "opacity-40 bg-stone-50 border-stone-200 text-stone-500 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-3 ${btnClasses}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isAnswered && (isSelected || isCorrectOption)
                              ? 'bg-white/25 text-inherit'
                              : 'bg-stone-200 text-stone-800'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                        {badgeEl}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Explanation / Result Message Banner */}
                {isAnswered && (
                  <div className={`p-4 rounded-2xl border transition-all animate-fade-in space-y-2 ${
                    answerInfo.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                      {answerInfo.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>शानदार! आपका उत्तर 100% सही है।</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>
                            यह गलत है! सही उत्तर विकल्प <b>{String.fromCharCode(65 + currentQ.correctAnswer)}: {currentQ.options[currentQ.correctAnswer]}</b> है।
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-xs font-medium bg-white/70 p-3 rounded-xl border border-black/5 text-stone-700 leading-relaxed">
                      <b className="text-stone-900">💡 व्याख्या (Explanation):</b> {currentQ.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-40 cursor-pointer"
            >
              ← पिछला प्रश्न
            </button>

            {currentQuestionIdx < testQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(testQuestions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-stone-900 hover:bg-black text-white cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>अगला प्रश्न</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setTestFinished(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>🏁 टेस्ट समाप्त करें (View Result)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* -------------------- FINAL SCORE & CELEBRATION SUMMARY -------------------- */}
      {activeSection === 'tests' && testActive && testFinished && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-fade-in max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg text-3xl">
            🏆
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              30 VVI टेस्ट परिणाम
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 pt-1">
              {testChapterName}
            </h3>
            <p className="text-xs text-stone-500 font-semibold">
              {correctCount >= 25 ? '🌟 उत्कृष्ट प्रदर्शन! आप 100% बोर्ड टॉपर हैं!' : '👍 अच्छा प्रयास! पुनः अभ्यास करके 30/30 अंक प्राप्त करें।'}
            </p>
          </div>

          {/* Big Score Box */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl p-5 space-y-2 shadow-inner">
            <span className="text-xs text-stone-400 font-bold">आपका कुल स्कोर</span>
            <div className="text-4xl font-black text-yellow-400 tracking-tight">
              {correctCount} <span className="text-lg text-stone-400">/ {testQuestions.length}</span>
            </div>
            <div className="text-xs font-black text-emerald-400">
              सटीकता: {Math.round((correctCount / testQuestions.length) * 100)}% अंक
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="text-[10px] font-bold block text-emerald-700">सही उत्तर</span>
              <span className="text-lg font-black text-emerald-600">{correctCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <span className="text-[10px] font-bold block text-rose-700">गलत उत्तर</span>
              <span className="text-lg font-black text-rose-600">{wrongCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
              <span className="text-[10px] font-bold block text-stone-500">छूटे हुए</span>
              <span className="text-lg font-black text-stone-600">
                {Math.max(0, testQuestions.length - answeredCount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setAnsweredState({});
                setCurrentQuestionIdx(0);
                setTestFinished(false);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>🔄 दोबारा टेस्ट दें (Retake Test)</span>
            </button>

            <button
              onClick={() => {
                setTestActive(false);
                setTestFinished(false);
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              📚 दूसरा चैप्टर चुनें (Back to Chapters)
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen PDF Viewer Modal */}
      {readingPdf && (
        <PdfViewerModal
          note={{
            id: readingPdf.id,
            subjectId: readingPdf.subjectId,
            subjectName: readingPdf.subjectName,
            chapterNo: readingPdf.chapterNo,
            title: readingPdf.title,
            description: `क्रैश कोर्स फास्ट-ट्रैक नोट्स • ${readingPdf.chapterName}`,
            pdfUrl: readingPdf.pdfUrl,
            totalPages: readingPdf.totalPages || 8,
            fileSize: readingPdf.fileSize || '1.4 MB',
            uploadedAt: readingPdf.uploadedAt,
            isVip: readingPdf.isVip ?? true
          }}
          onClose={() => setReadingPdf(null)}
        />
      )}

      {/* Crash Course Dedicated Unlock / Payment Request Modal */}
      {showCrashCourseModal && (
        <CrashCoursePaywallModal 
          onClose={() => setShowCrashCourseModal(false)} 
        />
      )}
    </div>
  );
}
