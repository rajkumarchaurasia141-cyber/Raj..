import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaywallModal } from './PaywallModal';
import { PaidTestModal } from './PaidTestModal';
import { ChapterContentRenderer } from './ChapterContentRenderer';
import { 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Sparkles, 
  BookMarked 
} from 'lucide-react';

import { triggerAd } from '../utils/adManager';

export function SubjectsExplorer({ subjectId, onBack }: any) {
  const { subjects } = useData();
  const { isPaid, isVIP } = useAuth();
  const [selectedCh, setSelectedCh] = useState(1);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPaidTest, setShowPaidTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'notes' | 'tips' | 'qna' | 'mcq'>('intro');

  // Course section ad timers: Timer 1 at 90s (1-2 min), Timer 2 at 360s (5-10 min)
  React.useEffect(() => {
    const timer1 = setTimeout(() => {
      triggerAd();
    }, 90000); // 1.5 minutes

    const timer2 = setTimeout(() => {
      triggerAd();
    }, 360000); // 6 minutes

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [subjectId, selectedCh]);

  const handleBack = () => {
    triggerAd();
    if (onBack) onBack();
  };

  const resolveSubject = () => {
    const direct = subjects[subjectId] || 
      subjects[subjectId?.toLowerCase()] || 
      (subjectId?.toLowerCase().includes('sanskrit') ? subjects['sanskrit'] : undefined) ||
      (subjectId?.toLowerCase().includes('econ') || subjectId?.toLowerCase().includes('artha') || subjectId?.includes('अर्थशास्त्र') ? (subjects['economics'] || subjects['arthashastra']) : undefined) ||
      (subjectId?.toLowerCase().includes('geog') || subjectId?.toLowerCase().includes('bhugol') || subjectId?.includes('भूगोल') ? (subjects['geography'] || subjects['bhugol']) : undefined) ||
      (subjectId?.toLowerCase().includes('pol') || subjectId?.toLowerCase().includes('civic') || subjectId?.includes('राजनीति') ? (subjects['political_science'] || subjects['polscience']) : undefined) ||
      (subjectId?.toLowerCase().includes('hist') || subjectId?.includes('इतिहास') ? subjects['history'] : undefined);

    if (direct) return direct;

    const normId = (subjectId || '').toLowerCase();
    if (normId === 'social_science' || normId === 'sst' || normId.includes('सामाजिक')) {
      const sstBranches = [
        { key: 'history', label: 'इतिहास (इतिहास की दुनिया भाग-2)' },
        { key: 'geography', label: 'भूगोल (भारत : संसाधन एवं उपयोग भाग-2)' },
        { key: 'political_science', label: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)' },
        { key: 'economics', label: 'अर्थशास्त्र (हमारी अर्थव्यवस्था भाग-2)' }
      ];
      let seqNo = 1;
      const combinedChapters: any[] = [];
      sstBranches.forEach(({ key, label }) => {
        const sub = subjects[key];
        if (sub && Array.isArray(sub.chapters)) {
          sub.chapters.forEach((ch: any) => {
            combinedChapters.push({
              ...ch,
              id: ch.id || `${key}-ch-${ch.chapter_no}`,
              chapter_no: seqNo++,
              section_name: ch.section_name || sub.subject_name_hindi || label
            });
          });
        }
      });
      return {
        id: 'social_science',
        subject_name: 'Social Science (SST)',
        subject_name_hindi: 'सामाजिक विज्ञान (SST)',
        chapters: combinedChapters
      };
    }

    if (normId === 'english' || normId.includes('अंग्रेजी')) {
      return {
        id: 'english',
        subject_name: 'English',
        subject_name_hindi: 'English',
        chapters: subjects['english']?.chapters || []
      };
    }

    return undefined;
  };

  const subject = resolveSubject();
  if (!subject) return <div className="p-4 text-center text-stone-400">विषय नहीं मिला</div>;

  const normSubId = String(subjectId || subject?.id || '').toLowerCase();
  const isMathSubject =
    normSubId === 'math' ||
    normSubId === 'mathematics' ||
    normSubId === 'maths' ||
    normSubId.includes('गणित');

  const chapters = subject.chapters || [];
  const currentChapter = chapters.find((c: any) => Number(c.chapter_no) === Number(selectedCh)) || chapters[0];

  const handleSelectChapter = (chNo: number | string) => {
    const numericCh = Number(chNo);
    if (!isMathSubject && numericCh > 1 && !isPaid) {
      setShowPaywall(true);
      return;
    }
    setSelectedCh(numericCh);
    setActiveTab(isMathSubject ? 'qna' : 'intro');
  };

  const effectiveTab = isMathSubject && activeTab !== 'mcq' ? 'qna' : activeTab;

  return (
    <div className="max-w-lg mx-auto pb-8 p-2.5 sm:p-3 selection:bg-red-500/30">
      <button 
        onClick={handleBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 mb-4 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>विषय सूची पर वापस</span>
      </button>
      
      <div className="bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-3xl p-4 sm:p-5 mb-4 shadow-sm flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
            बिहार बोर्ड वर्ग 10
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
            {currentChapter?.section_name || (subjectId === 'hindi' ? (
              selectedCh <= 12 ? 'हिंदी गोधूलि (गद्य खंड)' :
              selectedCh <= 24 ? 'हिंदी गोधूलि (काव्य खंड)' :
              'हिंदी वर्णिका'
            ) : (subject.subject_name_hindi || subject.subject_name))}
          </h2>
        </div>
        <div className="text-xs text-amber-100 bg-black/30 border border-white/20 px-3 py-1.5 rounded-xl shrink-0 font-medium">
          कुल अध्याय: <strong className="text-white">{chapters.length}</strong>
        </div>
      </div>

      {/* Chapters Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1 scrollbar-none">
        {chapters.map((ch: any, index: number) => (
          <button
            key={ch.id || `chapter-${ch.chapter_no}-${index}`}
            onClick={() => handleSelectChapter(ch.chapter_no)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
              Number(selectedCh) === Number(ch.chapter_no) 
                ? 'bg-red-700 text-white shadow-md' 
                : 'bg-white text-stone-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>अध्याय {ch.chapter_no}</span>
            {!isMathSubject && Number(ch.chapter_no) > 1 && !isPaid && (
              <span className="text-[11px] text-stone-500" title="Locked">🔒</span>
            )}
          </button>
        ))}
      </div>

      {currentChapter ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-xs font-bold text-red-700">अध्याय क्रमांक {currentChapter.chapter_no}</span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">{currentChapter.chapter_name_hindi}</h3>
            </div>
            {currentChapter.chapter_name && (
              <span className="text-xs text-stone-500 italic">({currentChapter.chapter_name})</span>
            )}
          </div>

          {/* Navigation Tabs: Math shows ONLY Exercise Solutions + Objective (MCQs); other subjects show all 5 tabs */}
          {isMathSubject ? (
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100/90 p-1.5 gap-2">
              <button
                onClick={() => setActiveTab('qna')}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  effectiveTab === 'qna'
                    ? 'bg-gradient-to-r from-red-700 to-rose-600 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-white text-stone-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <BookMarked className="w-4 h-4 shrink-0" />
                <span>प्रश्नावली हल (NCERT Solution)</span>
              </button>

              <button
                onClick={() => setActiveTab('mcq')}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  effectiveTab === 'mcq'
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-white text-stone-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>वस्तुनिष्ठ प्रश्न (Objective)</span>
              </button>
            </div>
          ) : (
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/80 p-1.5 gap-1.5">
              {/* Tab 1: पाठ परिचय */}
              <button 
                onClick={() => setActiveTab('intro')} 
                className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'intro' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ring-1 ring-amber-400' 
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> 
                <span>पाठ परिचय</span>
              </button>

              {/* Tab 2: विस्तृत नोट्स */}
              <button 
                onClick={() => setActiveTab('notes')} 
                className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'notes' 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm ring-1 ring-indigo-400' 
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> 
                <span>विस्तृत नोट्स</span>
              </button>

              {/* Tab 3: टॉपर टिप्स */}
              <button 
                onClick={() => setActiveTab('tips')} 
                className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'tips' 
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-sm ring-1 ring-amber-300' 
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> 
                <span>टॉपर टिप्स</span>
              </button>

              {/* Tab 4: NCERT प्रश्न-उत्तर */}
              <button 
                onClick={() => setActiveTab('qna')} 
                className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'qna' 
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm ring-1 ring-rose-400' 
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> 
                <span>NCERT प्रश्न</span>
              </button>

              {/* Tab 5: 50 MCQs */}
              <button 
                onClick={() => setActiveTab('mcq')} 
                className={`px-3 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'mcq' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm ring-1 ring-blue-400' 
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> 
                <span>50 MCQs</span>
              </button>
            </div>
          )}

          {/* Render Active Tab using Modern ChapterContentRenderer */}
          <div className="p-2.5 sm:p-5 bg-slate-50/50 min-h-[400px]">
            <ChapterContentRenderer 
              activeTab={effectiveTab}
              currentChapter={currentChapter}
              isMathSubject={isMathSubject}
              onStartPaidTest={() => setShowPaidTest(true)}
            />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-stone-500 text-xs">
          यह अध्याय अभी उपलब्ध नहीं है।
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showPaidTest && (
        <PaidTestModal 
          onClose={() => setShowPaidTest(false)} 
          onOpenVip={() => setShowPaywall(true)} 
          isVIP={isVIP}
          testTitle={`${subject.subject_name_hindi} • अध्याय ${currentChapter.chapter_no}: ${currentChapter.chapter_name_hindi}`}
          testSubtitle={`${currentChapter.mcq?.length || 50} प्रश्न • ${Math.max(10, currentChapter.mcq?.length || 50)} मिनट समय • OMR टेस्ट मोड (BSEB फुल सिलेबस)`}
          questions={currentChapter.mcq && currentChapter.mcq.length > 0 ? currentChapter.mcq.map((m: any, idx: number) => ({
            id: m.id || idx + 1,
            subject: subject.subject_name_hindi,
            chapter: currentChapter.chapter_name_hindi,
            question: m.question,
            options: m.options,
            correct_answer: typeof m.correct_answer === 'number' ? m.correct_answer : (typeof m.correctIndex === 'number' ? m.correctIndex : 0),
            explanation: m.explanation || ''
          })) : undefined}
        />
      )}
    </div>
  );
}

