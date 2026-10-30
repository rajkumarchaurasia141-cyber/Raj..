import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Bookmark,
  Grid3X3,
  Filter,
  BarChart3,
  Flame,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { PAID_TEST_50_QUESTIONS, TestQuestion } from '../data/paidTestQuestions';

export type { TestQuestion };

export interface GenericTestQuestion {
  id: number | string;
  subject?: string;
  chapter?: string;
  question: string;
  options: string[] | [string, string, string, string];
  correct_answer: number; // 0, 1, 2, 3
  explanation?: string;
}

interface PaidTestModalProps {
  onClose: () => void;
  onOpenVip?: () => void;
  isVIP?: boolean;
  testTitle?: string;
  testSubtitle?: string;
  questions?: GenericTestQuestion[];
}

export function PaidTestModal({ 
  onClose, 
  onOpenVip, 
  isVIP = true,
  testTitle = 'बिहार बोर्ड 10वीं फुल सिलेबस महा-मॉक टेस्ट',
  testSubtitle = '50 प्रश्न • 50 मिनट समय • OMR मोड • BSEB फुल सिलेबस स्पेशल',
  questions 
}: PaidTestModalProps) {
  const activeQuestions: GenericTestQuestion[] = useMemo(() => {
    const raw = (questions && questions.length > 0) ? questions : PAID_TEST_50_QUESTIONS;
    return raw.map((q: any) => ({
      ...q,
      correct_answer: typeof q.correct_answer === 'number' 
        ? q.correct_answer 
        : (typeof q.correctIndex === 'number' ? q.correctIndex : 0)
    }));
  }, [questions]);

  const TOTAL_QUESTIONS = activeQuestions.length; // usually 50
  const TOTAL_TIME_SECONDS = Math.max(10, TOTAL_QUESTIONS) * 60; // 1 min per question

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [showGrid, setShowGrid] = useState(false);
  const [filterReview, setFilterReview] = useState<'all' | 'wrong' | 'correct' | 'unattempted'>('all');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer logic
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const handleSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleClear = () => {
    if (submitted) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const toggleMarkReview = () => {
    if (submitted) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  // Score calculations
  const calculateScore = () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    activeQuestions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correct_answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    return { correct, wrong, unattempted };
  };

  const { correct, wrong, unattempted } = calculateScore();
  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const percentage = Math.round((correct / TOTAL_QUESTIONS) * 100);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeTakenSeconds = TOTAL_TIME_SECONDS - timeLeft;
  const takenMin = Math.floor(timeTakenSeconds / 60);
  const takenSec = timeTakenSeconds % 60;

  // Subject breakdown for result
  const subjectBreakdown = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    activeQuestions.forEach((q, idx) => {
      const sub = q.subject || 'सामान्य';
      if (!map[sub]) {
        map[sub] = { total: 0, correct: 0 };
      }
      map[sub].total++;
      if (selectedAnswers[idx] === q.correct_answer) {
        map[sub].correct++;
      }
    });
    return map;
  }, [selectedAnswers, activeQuestions]);

  // Filter questions for review
  const filteredQuestions = useMemo(() => {
    return activeQuestions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
      const ans = selectedAnswers[idx];
      if (filterReview === 'all') return true;
      if (filterReview === 'correct') return ans === q.correct_answer;
      if (filterReview === 'wrong') return ans !== undefined && ans !== q.correct_answer;
      if (filterReview === 'unattempted') return ans === undefined;
      return true;
    });
  }, [filterReview, selectedAnswers, activeQuestions]);

  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setSubmitted(false);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setShowGrid(false);
    setShowConfirmSubmit(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-stone-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                  {testTitle}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  {TOTAL_QUESTIONS} MCQs
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                {testSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer Clock */}
            {!submitted && (
              <div
                className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  timeLeft < 300
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/20 text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </span>
              </div>
            )}

            {/* Question Palette Grid Toggle */}
            {!submitted && (
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showGrid
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title="सभी 50 प्रश्न ग्रिड देखें"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">प्रश्नावली (1-50)</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!submitted && answeredCount > 0) {
                  if (confirm('क्या आप टेस्ट से बाहर निकलना चाहते हैं? आपकी प्रगति सुरक्षित नहीं होगी।')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Palette Overlay / Drawer */}
        {showGrid && !submitted && (
          <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 max-h-56 overflow-y-auto shrink-0 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
                <span>प्रश्न ग्रिड (सीधे किसी भी प्रश्न पर जाएँ):</span>
              </span>
              <button
                onClick={() => setShowGrid(false)}
                className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
              >
                ग्रिड बंद करें ✕
              </button>
            </div>

            {/* Color legend */}
            <div className="flex items-center gap-3 text-[10px] font-semibold text-stone-600 mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> उत्तर दिया ({answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> रिव्यू ({markedCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300"></span> शेष ({TOTAL_QUESTIONS - answeredCount})
              </span>
            </div>

            {/* 1 to 50 Grid Matrix */}
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {activeQuestions.map((q, idx) => {
                const isAns = selectedAnswers[idx] !== undefined;
                const isMarked = markedForReview[idx];
                const isCur = currentIdx === idx;

                let btnClass = 'bg-white text-stone-700 border-slate-200 hover:border-slate-400';
                if (isCur) {
                  btnClass = 'ring-2 ring-blue-700 font-black';
                }
                if (isAns) {
                  btnClass += ' bg-blue-600 text-white border-blue-600';
                } else if (isMarked) {
                  btnClass += ' bg-amber-100 text-amber-900 border-amber-400 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowGrid(false);
                    }}
                    className={`h-7 sm:h-8 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4">
          {!submitted ? (
            <>
              {/* Question Progress & Subject Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-extrabold">
                    {currentQ.subject}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {currentQ.chapter}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-mono text-sm">
                    प्रश्न {currentIdx + 1} / {TOTAL_QUESTIONS}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>

              {/* Status summary pill */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-stone-600">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  हल किए: <strong className="text-stone-900">{answeredCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  मार्क: <strong className="text-stone-900">{markedCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  शेष प्रश्न: <strong className="text-rose-600">{TOTAL_QUESTIONS - answeredCount}</strong>
                </span>
              </div>

              {/* Question Statement */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    Q{currentIdx + 1}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-sm ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-stone-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-300 text-slate-500 group-hover:border-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav / Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-stone-700 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>पिछला</span>
                  </button>

                  <button
                    onClick={toggleMarkReview}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      markedForReview[currentIdx]
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'border-slate-200 text-stone-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentIdx] ? 'रिमूव मार्क' : 'रिव्यू हेतु मार्क'}</span>
                  </button>

                  {selectedAnswers[currentIdx] !== undefined && (
                    <button
                      onClick={handleClear}
                      className="px-2.5 py-2.5 rounded-xl text-stone-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                      title="उत्तर मिटाएं"
                    >
                      मिटाएं
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {currentIdx < TOTAL_QUESTIONS - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>अगला प्रश्न</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>टेस्ट सबमिट करें</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    सबमिट
                  </button>
                </div>
              </div>

              {/* Submit confirmation dialog */}
              {showConfirmSubmit && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-fade-in">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold text-sm">क्या आप टेस्ट सबमिट करना चाहते हैं?</h5>
                      <p className="text-xs text-amber-800 mt-0.5">
                        आपने <strong>{TOTAL_QUESTIONS}</strong> में से <strong>{answeredCount}</strong> प्रश्नों के उत्तर दिए हैं तथा <strong>{TOTAL_QUESTIONS - answeredCount}</strong> प्रश्न शेष हैं।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowConfirmSubmit(false)}
                      className="px-4 py-1.5 rounded-xl bg-white border border-amber-300 text-stone-700 text-xs font-bold cursor-pointer"
                    >
                      नहीं, वापस जाएं
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmSubmit(false);
                        setSubmitted(true);
                      }}
                      className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      हाँ, सबमिट करें
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* =================== RESULTS & EXPLANATIONS SCREEN =================== */
            <div className="space-y-6 animate-fade-in py-2">
              
              {/* Score card banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-stone-950 text-white text-center relative overflow-hidden shadow-xl">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-300 text-xs font-bold">
                    <Award className="w-4 h-4" />
                    <span>बिहार बोर्ड 10वीं 50 MCQ टेस्ट परिणाम</span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                      {correct}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-blue-200">
                      / {TOTAL_QUESTIONS}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-amber-300">
                      {correct >= 45
                        ? '🏆 उत्कृष्ट! स्टेट टॉपर स्तर का प्रदर्शन!'
                        : correct >= 38
                        ? '⭐ प्रथम श्रेणी (First Division with Distinction)!'
                        : correct >= 30
                        ? '👍 द्वितीय श्रेणी - अच्छा प्रयास!'
                        : '📚 नियमित अभ्यास व रिवीजन की आवश्यकता है'}
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">
                      आपने {takenMin} मिनट {takenSec} सेकंड में {TOTAL_QUESTIONS} प्रश्नों का टेस्ट पूरा किया।
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-xs text-emerald-800 font-bold">सही उत्तर</div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">{correct}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">+{correct} अंक</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-xs text-rose-800 font-bold">गलत उत्तर</div>
                  <div className="text-2xl font-black text-rose-700 mt-0.5">{wrong}</div>
                  <div className="text-[10px] text-rose-600 font-medium">सुधार आवश्यक</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-stone-600 font-bold">अनुत्तरित (छूटे)</div>
                  <div className="text-2xl font-black text-stone-700 mt-0.5">{unattempted}</div>
                  <div className="text-[10px] text-stone-500 font-medium">प्रयास नहीं किया</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs text-blue-800 font-bold">सटीकता (Accuracy)</div>
                  <div className="text-2xl font-black text-blue-700 mt-0.5">
                    {answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">कुल प्राप्तांक: {percentage}%</div>
                </div>
              </div>

              {/* Subject-wise breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    विषयवार प्रदर्शन (Subject-wise Analysis)
                  </span>
                  <span className="text-stone-500 text-[11px]">5 मुख्य विषय</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(subjectBreakdown).map(([sub, stat]) => {
                    const subPercent = Math.round((stat.correct / stat.total) * 100);
                    return (
                      <div
                        key={sub}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                      >
                        <span className="font-bold text-stone-800">{sub}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">
                            {stat.correct} / {stat.total}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              subPercent >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : subPercent >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {subPercent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question Review Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-stone-900 flex items-center gap-2">
                    <span>प्रश्नोत्तर विस्तृत समीक्षा (Detailed Solutions):</span>
                  </h4>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 max-w-full">
                    <button
                      onClick={() => setFilterReview('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        filterReview === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                      }`}
                    >
                      सभी ({TOTAL_QUESTIONS})
                    </button>
                    <button
                      onClick={() => setFilterReview('wrong')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        filterReview === 'wrong'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      केवल गलत ({wrong})
                    </button>
                    <button
                      onClick={() => setFilterReview('correct')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        filterReview === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      केवल सही ({correct})
                    </button>
                    <button
                      onClick={() => setFilterReview('unattempted')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        filterReview === 'unattempted'
                          ? 'bg-stone-700 text-white'
                          : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                      }`}
                    >
                      छूटे हुए ({unattempted})
                    </button>
                  </div>
                </div>

                {/* Filtered list */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {filteredQuestions.map(({ q, idx }) => {
                    const userAns = selectedAnswers[idx];
                    const isCorrect = userAns === q.correct_answer;
                    const isUnattempted = userAns === undefined;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-xs space-y-2.5 ${
                          isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isUnattempted
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="font-mono font-black text-stone-500 mt-0.5">
                              #{idx + 1}.
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-stone-700 font-bold text-[10px]">
                                  {q.subject}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  {q.chapter}
                                </span>
                              </div>
                              <p className="font-bold text-stone-900 text-sm leading-snug">
                                {q.question}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCorrect ? (
                              <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                सही
                              </span>
                            ) : isUnattempted ? (
                              <span className="px-2 py-1 rounded-lg bg-slate-200 text-stone-700 font-bold text-[11px]">
                                छूटा हुआ
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                गलत
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Options summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isThisCorrect = oIdx === q.correct_answer;
                            const isThisUser = oIdx === userAns;

                            let optCls = 'bg-white border-slate-200 text-stone-600';
                            if (isThisCorrect) {
                              optCls = 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold';
                            } else if (isThisUser) {
                              optCls = 'bg-rose-100/70 border-rose-400 text-rose-950 font-bold';
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${optCls}`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[10px]">
                                    [{String.fromCharCode(65 + oIdx)}]
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isThisCorrect && (
                                  <span className="text-[10px] text-emerald-700 font-extrabold">✓ सही</span>
                                )}
                                {isThisUser && !isThisCorrect && (
                                  <span className="text-[10px] text-rose-700 font-extrabold">✗ आपका उत्तर</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-stone-800 space-y-0.5">
                          <strong className="text-amber-900 block">बोर्ड व्याख्या (Solution):</strong>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-stone-600" />
                  <span>दोबारा टेस्ट दें</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <span>पूर्ण करें व वापस जाएं</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
