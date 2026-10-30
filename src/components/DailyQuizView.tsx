import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, BookOpen, Award, FileText, BookMarked, Sparkles, ChevronRight, ArrowLeft, Play, Scale, Globe, TrendingUp } from 'lucide-react';
import { PaidTestModal, TestQuestion } from './PaidTestModal';
import { PAID_TEST_50_QUESTIONS } from '../data/paidTestQuestions';
import { MATH_PAID_50_QUESTIONS } from '../data/mathPaid50Questions';
import { GEOGRAPHY_PAID_50_QUESTIONS } from '../data/geographyPaid50Questions';
import { ECONOMICS_PAID_50_QUESTIONS } from '../data/economicsPaid50Questions';

interface DailyQuizViewProps {
  onOpenVip?: () => void;
  onSelectSubject?: (subjectId: string) => void;
  onOpenSubject?: (subjectId: string) => void;
}

export function DailyQuizView({ onOpenVip, onSelectSubject, onOpenSubject }: DailyQuizViewProps) {
  const { subjects } = useData();
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeChapterTest, setActiveChapterTest] = useState<{ chapterNo: number; chapterName: string; questions: TestQuestion[] } | null>(null);

  const subjectCards = [
    {
      id: 'science',
      name: 'विज्ञान (Science)',
      desc: 'भौतिकी, रसायन एवं जीवविज्ञान (संपूर्ण 16 अध्याय)',
      totalChapters: 16,
      color: 'from-emerald-600 to-teal-700',
      lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2
    },
    {
      id: 'hindi',
      name: 'हिंदी (Hindi)',
      desc: 'गोधूलि गद्य, पद्य एवं वर्णिका (संपूर्ण 29 अध्याय)',
      totalChapters: 29,
      color: 'from-amber-600 to-orange-700',
      lightBg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: BookOpen
    },
    {
      id: 'sanskrit',
      name: 'संस्कृत (Sanskrit)',
      desc: 'पीयूषम् भाग 2 एवं व्याकरण (संपूर्ण 14 अध्याय)',
      totalChapters: 14,
      color: 'from-rose-600 to-red-700',
      lightBg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: Award
    },
    {
      id: 'math',
      name: 'गणित (Mathematics)',
      desc: 'वास्तविक संख्याएँ, बहुपद, त्रिकोणमिति (15 अध्याय)',
      totalChapters: 15,
      color: 'from-blue-600 to-indigo-700',
      lightBg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: FileText
    },
    {
      id: 'history',
      name: 'इतिहास (History)',
      desc: 'यूरोप में राष्ट्रवाद, समाजवाद, भारत में राष्ट्रवाद (संपूर्ण 8 अध्याय - 50-50 MCQs)',
      totalChapters: 8,
      color: 'from-amber-700 to-red-800',
      lightBg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: BookOpen
    },
    {
      id: 'political_science',
      name: 'राजनीति शास्त्र (Democratic Politics)',
      desc: 'लोकतंत्र में सत्ता की साझेदारी, कार्यप्रणाली, प्रतिस्पर्धा, चुनौतियाँ (संपूर्ण 5 अध्याय - 50-50 MCQs)',
      totalChapters: 5,
      color: 'from-orange-600 to-amber-700',
      lightBg: 'bg-orange-50 border-orange-200 text-orange-900',
      icon: Scale
    },
    {
      id: 'geography',
      name: 'भूगोल (Geography)',
      desc: 'भारत : संसाधन एवं उपयोग, कृषि, निर्माण उद्योग, परिवहन, बिहार (संपूर्ण 6 अध्याय - 50-50 MCQs)',
      totalChapters: 6,
      color: 'from-emerald-700 to-teal-800',
      lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: Globe
    },
    {
      id: 'economics',
      name: 'अर्थशास्त्र (Economics)',
      desc: 'विकास का इतिहास, राज्य व राष्ट्र की आय, मुद्रा, संस्थाएं, वैश्वीकरण, उपभोक्ता (संपूर्ण 7 अध्याय - 50-50 MCQs)',
      totalChapters: 7,
      color: 'from-teal-700 to-emerald-900',
      lightBg: 'bg-teal-50 border-teal-200 text-teal-900',
      icon: TrendingUp
    },
    {
      id: 'sst',
      name: 'सामाजिक विज्ञान (Social Science)',
      desc: 'इतिहास, भूगोल, राजनीति विज्ञान, अर्थशास्त्र',
      totalChapters: 16,
      color: 'from-purple-600 to-indigo-800',
      lightBg: 'bg-purple-50 border-purple-200 text-purple-800',
      icon: BookMarked
    },
    {
      id: 'english',
      name: 'अंग्रेजी (English)',
      desc: 'Panorama Reader & English Grammar MCQs',
      totalChapters: 12,
      color: 'from-sky-600 to-cyan-700',
      lightBg: 'bg-sky-50 border-sky-200 text-sky-800',
      icon: Sparkles
    }
  ];

  const currentSubject = activeSubjectId ? (
    subjects[activeSubjectId] || 
    (activeSubjectId === 'math' ? (subjects['math'] || subjects['mathematics']) : null) ||
    (activeSubjectId === 'economics' ? (subjects['economics'] || subjects['arthashastra']) : null) ||
    (activeSubjectId === 'geography' ? (subjects['geography'] || subjects['bhugol']) : null) || 
    (activeSubjectId === 'political_science' ? (subjects['political_science'] || subjects['polscience'] || subjects['civics']) : null)
  ) : null;

  const handleStartSubjectMasterTest = () => {
    if (activeSubjectId === 'math') {
      setActiveChapterTest({
        chapterNo: 0,
        chapterName: 'गणित (Math) संपूर्ण 15 अध्यायों का 50 MCQ महा-मॉक टेस्ट',
        questions: MATH_PAID_50_QUESTIONS
      });
    } else if (activeSubjectId === 'geography') {
      setActiveChapterTest({
        chapterNo: 0,
        chapterName: 'भूगोल (Geography) संपूर्ण 6 अध्यायों का 50 MCQ महा-मॉक टेस्ट',
        questions: GEOGRAPHY_PAID_50_QUESTIONS
      });
    } else if (activeSubjectId === 'economics') {
      setActiveChapterTest({
        chapterNo: 0,
        chapterName: 'अर्थशास्त्र (Economics) संपूर्ण 7 अध्यायों का 50 MCQ महा-मॉक टेस्ट',
        questions: ECONOMICS_PAID_50_QUESTIONS
      });
    } else {
      let allQuestions: TestQuestion[] = [];
      (currentSubject?.chapters || []).forEach((ch: any) => {
        (ch.mcq || []).forEach((m: any, idx: number) => {
          const correctVal = typeof m.correctIndex === 'number' ? m.correctIndex : (typeof m.correct_answer === 'number' ? m.correct_answer : 0);
          allQuestions.push({
            id: m.id || `ch_${ch.chapter_no}_q_${idx}`,
            question: m.question || m.text || `प्रश्न ${idx + 1}`,
            options: m.options || m.choices || ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'],
            correctIndex: correctVal,
            correct_answer: correctVal,
            explanation: m.explanation || `अध्याय ${ch.chapter_no} का महत्वपूर्ण वस्तुनिष्ठ प्रश्न।`,
            subject: currentSubject?.subject_name_hindi || activeSubjectId || 'बिहार बोर्ड',
            chapter: ch.chapter_name_hindi || `अध्याय ${ch.chapter_no}`
          });
        });
      });
      if (allQuestions.length < 50) {
        allQuestions = PAID_TEST_50_QUESTIONS;
      }
      setActiveChapterTest({
        chapterNo: 0,
        chapterName: `${currentSubject?.subject_name_hindi || 'विषय'} संपूर्ण 50 MCQ महा-मॉक टेस्ट`,
        questions: allQuestions.slice(0, 50)
      });
    }
  };

  // Generate 50 MCQs for a given chapter
  const handleStartChapterTest = (chapter: any) => {
    let chapterQuestions: TestQuestion[] = [];
    
    // If chapter has mcq array
    if (chapter.mcq && Array.isArray(chapter.mcq) && chapter.mcq.length > 0) {
      chapterQuestions = chapter.mcq.map((m: any, idx: number) => {
        const correctVal = typeof m.correctIndex === 'number' ? m.correctIndex : (typeof m.correct_answer === 'number' ? m.correct_answer : 0);
        return {
          id: m.id || `ch_${chapter.chapter_no}_q_${idx}`,
          question: m.question || m.text || `प्रश्न ${idx + 1}`,
          options: m.options || m.choices || ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'],
          correctIndex: correctVal,
          correct_answer: correctVal,
          explanation: m.explanation || `अध्याय ${chapter.chapter_no} (${chapter.chapter_name_hindi}) का महत्वपूर्ण वस्तुनिष्ठ प्रश्न।`,
          subject: currentSubject?.subject_name_hindi || activeSubjectId || 'बिहार बोर्ड',
          chapter: chapter.chapter_name_hindi || `अध्याय ${chapter.chapter_no}`
        };
      });
    }

    // Ensure we have 50 questions by padding with subject questions from dedicated pools or PAID_TEST_50_QUESTIONS
    let fallbackPool: TestQuestion[] = [];
    if (activeSubjectId === 'math') {
      fallbackPool = MATH_PAID_50_QUESTIONS;
    } else if (activeSubjectId === 'geography') {
      fallbackPool = GEOGRAPHY_PAID_50_QUESTIONS;
    } else if (activeSubjectId === 'economics') {
      fallbackPool = ECONOMICS_PAID_50_QUESTIONS;
    } else {
      const subjectPool = PAID_TEST_50_QUESTIONS.filter(q => {
        const qSub = (q.subject || '').toLowerCase();
        const sId = (activeSubjectId || '').toLowerCase();
        if (sId.includes('science') && qSub.includes('विज्ञान')) return true;
        if (sId.includes('hindi') && qSub.includes('हिंदी')) return true;
        if (sId.includes('sanskrit') && qSub.includes('संस्कृत')) return true;
        if (sId.includes('math') && qSub.includes('गणित')) return true;
        if (sId.includes('history') && (qSub.includes('इतिहास') || qSub.includes('राष्ट्रवाद'))) return true;
        if ((sId.includes('pol') || sId.includes('civic')) && (qSub.includes('राजनीति') || qSub.includes('लोकतंत्र'))) return true;
        if (sId.includes('geography') && (qSub.includes('भूगोल') || qSub.includes('संसाधन') || qSub.includes('कृषि') || qSub.includes('आपदा'))) return true;
        if ((sId.includes('econ') || sId.includes('artha')) && (qSub.includes('अर्थशास्त्र') || qSub.includes('मुद्रा') || qSub.includes('आय'))) return true;
        return false;
      });
      fallbackPool = subjectPool.length > 0 ? subjectPool : PAID_TEST_50_QUESTIONS;
    }

    while (chapterQuestions.length < 50) {
      const needed = 50 - chapterQuestions.length;
      const sliceToAdd = fallbackPool.slice(0, needed).map((q, idx) => ({
        ...q,
        id: `pad_${chapter.chapter_no}_${chapterQuestions.length + idx}`,
        question: `[अध्याय ${chapter.chapter_no} - सेट] ${q.question}`
      }));
      chapterQuestions.push(...sliceToAdd);
    }

    // Limit/ensure exactly 50 questions
    chapterQuestions = chapterQuestions.slice(0, 50);

    setActiveChapterTest({
      chapterNo: chapter.chapter_no,
      chapterName: chapter.chapter_name_hindi || `अध्याय ${chapter.chapter_no}`,
      questions: chapterQuestions
    });
  };

  return (
    <div className="p-2.5 sm:p-3 w-full max-w-2xl mx-auto space-y-3 pb-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-900 text-white rounded-3xl p-5 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">बिहार बोर्ड 10वीं • 100% फ्री अभ्यास</div>
            <h1 className="text-lg font-black tracking-tight text-white">Chapter-Wise 50 MCQ Test Hub</h1>
            <p className="text-xs text-blue-200 mt-0.5">प्रत्येक अध्याय के 50 महत्वपूर्ण वस्तुनिष्ठ प्रश्न और OMR ऑनलाइन टेस्ट</p>
          </div>
        </div>
      </div>

      {/* Prominent Today's Daily Test Banner */}
      <div 
        onClick={() => {
          try { window.history.pushState({}, '', '/daily-test'); } catch (e) {}
          window.location.href = '/daily-test';
        }}
        className="bg-white border-2 border-[#D8B45A] hover:border-amber-500 rounded-2xl p-3 flex items-center justify-between shadow-xs cursor-pointer transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F8E8B5] border border-[#D8B45A] flex items-center justify-center text-lg shrink-0">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full uppercase">
                DAILY TEST
              </span>
              <span className="text-[9px] font-black text-[#D8B45A]">
                /daily-test
              </span>
            </div>
            <div className="text-xs font-black text-stone-900">
              आज का दैनिक टेस्ट (Daily Test) दें
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#F8E8B5] text-stone-900 text-[11px] font-black border border-[#D8B45A]">
          ओपन करें →
        </span>
      </div>

      {/* View 1: Subject Cards Grid */}
      {!activeSubjectId ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">
              विषय चुनें (सभी विषयों के सभी अध्याय उपलब्ध)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              ⚡ 0% डेटाबेस लोड (Fast & Free)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectCards.map((sub) => {
              const IconComponent = sub.icon;
              return (
                <div
                  key={sub.id}
                  onClick={() => setActiveSubjectId(sub.id)}
                  className="bg-white border border-stone-200/90 hover:border-amber-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sub.lightBg}`}>
                        {sub.totalChapters} अध्याय | 50 MCQs/Ch
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-stone-900 group-hover:text-blue-600 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {sub.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>अध्याय सूची देखें (View Chapters)</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Chapters List for Selected Subject */
        <div className="space-y-3 animate-fade-in">
          <button
            onClick={() => setActiveSubjectId(null)}
            className="text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-black shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>सभी विषयों की सूची पर वापस जाएं</span>
          </button>

          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">अध्याय-वार टेस्ट सीरीज</span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                {currentSubject?.subject_name_hindi || activeSubjectId}
              </h2>
            </div>
            <div className="text-xs bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl font-bold">
              कुल अध्याय: {currentSubject?.chapters?.length || 0}
            </div>
          </div>

          {/* Master 50 MCQ Full Subject Mock Test Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white rounded-2xl p-4 shadow-lg border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>सम्पूर्ण 50 MCQ मास्टर टेस्ट</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {activeSubjectId === 'math' && 'गणित संपूर्ण 15 अध्यायों का 50 MCQ महा-मॉक टेस्ट'}
                {activeSubjectId === 'geography' && 'भूगोल संपूर्ण 6 अध्यायों का 50 MCQ महा-मॉक टेस्ट'}
                {activeSubjectId === 'economics' && 'अर्थशास्त्र संपूर्ण 7 अध्यायों का 50 MCQ महा-मॉक टेस्ट'}
                {activeSubjectId === 'history' && 'इतिहास संपूर्ण 8 अध्यायों का 50 MCQ महा-मॉक टेस्ट'}
                {activeSubjectId === 'political_science' && 'राजनीति शास्त्र संपूर्ण 5 अध्यायों का 50 MCQ महा-मॉक टेस्ट'}
                {!['math', 'geography', 'economics', 'history', 'political_science'].includes(activeSubjectId || '') && `${currentSubject?.subject_name_hindi || 'विषय'} 50 MCQ महा-मॉक टेस्ट`}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">50 मिनट • 50 प्रश्न • OMR आधारित बिहार बोर्ड परीक्षा पैटर्न</p>
            </div>
            <button
              onClick={handleStartSubjectMasterTest}
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-amber-200"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>50 MCQ टेस्ट दें</span>
            </button>
          </div>

          <div className="space-y-2">
            {(currentSubject?.chapters || []).map((ch: any) => (
              <div
                key={ch.chapter_no}
                className="bg-white border border-stone-200/90 hover:border-blue-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-xs">
                    {ch.chapter_no}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-stone-400 block">अध्याय {ch.chapter_no}</span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                      {ch.chapter_name_hindi || `अध्याय ${ch.chapter_no}`}
                    </h4>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                      🎯 50 महत्वपूर्ण MCQs टेस्ट
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartChapterTest(ch)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>टेस्ट शुरू करें</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Modal for Chapter */}
      {activeChapterTest && (
        <PaidTestModal
          onClose={() => setActiveChapterTest(null)}
          onOpenVip={onOpenVip}
          isVIP={true}
          testTitle={`${currentSubject?.subject_name_hindi || activeSubjectId} • अध्याय ${activeChapterTest.chapterNo}`}
          testSubtitle={`${activeChapterTest.chapterName} • 50 वस्तुनिष्ठ प्रश्न • 100% फ्री अभ्यास`}
          questions={activeChapterTest.questions}
        />
      )}
    </div>
  );
}
