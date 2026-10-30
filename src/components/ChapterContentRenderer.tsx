import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Check, 
  Lightbulb,
  Copy,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { speakHindiText, stopHindiSpeech } from '../utils/speechHelper';
import { useAuth } from '../context/AuthContext';
import {
  getMathChapterExercises,
  cleanMathAndMarkdownText,
} from '../data/mathNcertExercisesData';

interface ChapterContentRendererProps {
  activeTab: 'intro' | 'notes' | 'tips' | 'qna' | 'mcq';
  currentChapter: any;
  isMathSubject?: boolean;
  onStartPaidTest: () => void;
}

export const ChapterContentRenderer: React.FC<ChapterContentRendererProps> = ({
  activeTab,
  currentChapter,
  isMathSubject = false,
  onStartPaidTest
}) => {
  const { isAdmin } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);

  // Reset selected exercise & MCQ answers when switching chapters
  useEffect(() => {
    setSelectedExerciseIndex(0);
    setSelectedAnswers({});
  }, [currentChapter?.chapter_no]);

  // Stop speech when switching chapters or tabs
  useEffect(() => {
    stopHindiSpeech();
    setIsPlayingAudio(false);
    return () => {
      stopHindiSpeech();
    };
  }, [activeTab, currentChapter, selectedExerciseIndex]);

  const mathChapterExercises = isMathSubject
    ? getMathChapterExercises(Number(currentChapter?.chapter_no) || 1)
    : undefined;

  const exercisesList = mathChapterExercises?.exercises || [];
  const activeExercise =
    exercisesList[selectedExerciseIndex] || exercisesList[0] || null;

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      stopHindiSpeech();
      setIsPlayingAudio(false);
      return;
    }

    let textToRead = '';
    if (isMathSubject && activeTab === 'qna' && activeExercise) {
      textToRead = `${activeExercise.exerciseTitle}. ${activeExercise.questions
        .map((q) => `${q.qNo}: ${q.question}. हल: ${q.solution.join(' ')} ${q.answer}`)
        .join('. ')}`;
    } else if (activeTab === 'intro') {
      textToRead = cleanMathAndMarkdownText(currentChapter?.intro_hindi || currentChapter?.chapter_name_hindi || '');
    } else if (activeTab === 'notes') {
      textToRead = cleanMathAndMarkdownText(currentChapter?.notes_hindi || '');
    } else if (activeTab === 'tips') {
      textToRead = cleanMathAndMarkdownText(
        Array.isArray(currentChapter?.tips) ? currentChapter.tips.join('. ') : (currentChapter?.topper_tips || currentChapter?.tips || '')
      );
    } else if (activeTab === 'qna') {
      const qaList = currentChapter?.subjective_qa || currentChapter?.important_qna || [];
      textToRead = Array.isArray(qaList) 
        ? qaList.map((q: any) => `प्रश्न: ${cleanMathAndMarkdownText(q.question)}. उत्तर: ${cleanMathAndMarkdownText(q.answer)}`).join('. ') 
        : '';
    }

    if (!textToRead.trim()) {
      textToRead = 'इस खंड में अभी कोई पाठ्य सामग्री उपलब्ध नहीं है।';
    }

    setIsPlayingAudio(true);
    speakHindiText(
      textToRead,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopyQA = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to highlight terms in quotes or specific keywords after sanitizing raw LaTeX/Markdown
  const highlightKeywords = (str: any) => {
    const safeStr = cleanMathAndMarkdownText(str);
    const parts = safeStr.split(/(['"][^'"]+['"])/g);
    return parts.map((part, i) => {
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        return (
          <span key={`hl-${i}`} className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-md mx-0.5 border border-rose-200/60">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  // Helper to format general notes text with styled headers, bullet points and highlights
  const renderFormattedNotes = (rawText: string) => {
    if (!rawText) return null;

    const sanitizedText = cleanMathAndMarkdownText(rawText);
    const lines = String(sanitizedText).split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: string[] = [];

    const flushCurrentBlock = (key: string) => {
      if (currentBlock.length > 0) {
        const text = currentBlock.join('\n').trim();
        if (text) {
          elements.push(
            <div key={key} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all leading-relaxed text-slate-800 text-[14.5px] font-normal">
              {String(text || '').split('\n').map((l, lIdx) => {
                const trimmedLine = l.trim();
                if (!trimmedLine) return null;
                // Bullet lines
                if (trimmedLine.startsWith('▶') || trimmedLine.startsWith('•') || trimmedLine.startsWith('●') || trimmedLine.startsWith('-')) {
                  const cleanLine = trimmedLine.replace(/^[▶•●\-*]+\s*/, '');
                  return (
                    <div key={`bullet-${lIdx}`} className="flex items-start gap-2.5 my-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                      <span className="text-slate-800 leading-relaxed font-medium">
                        {highlightKeywords(cleanLine)}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={`p-${lIdx}`} className="mb-2 last:mb-0">
                    {highlightKeywords(trimmedLine)}
                  </p>
                );
              })}
            </div>
          );
        }
        currentBlock = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = cleanMathAndMarkdownText(line.trim());

      // Section Banner: 【 ... 】
      if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
        flushCurrentBlock(`flush-before-${idx}`);
        const title = trimmed.replace(/[【】]/g, '');
        elements.push(
          <div key={`section-hdr-${idx}`} className="mt-4 mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 text-white shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200 block">महत्वपूर्ण खंड</span>
              <h3 className="font-black text-sm sm:text-base text-white tracking-wide">{title}</h3>
            </div>
          </div>
        );
        return;
      }

      // Major Subheading (e.g. १. जाति प्रथा का मुख्य दोष: or 1. or क.)
      const isMajorSubheading = /^[१२३४५६७८९०0-9]+[.)]\s+/.test(trimmed) && trimmed.includes(':');
      if (isMajorSubheading) {
        flushCurrentBlock(`flush-sub-${idx}`);
        elements.push(
          <div key={`subhdr-${idx}`} className="mt-4 mb-2 p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-transparent border-l-4 border-indigo-600 rounded-r-xl flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
              {trimmed.charAt(0)}
            </span>
            <h4 className="font-extrabold text-indigo-950 text-sm sm:text-[15px]">
              {trimmed.replace(/^[१२३४५६७८९०0-9]+[.)]\s*/, '')}
            </h4>
          </div>
        );
        return;
      }

      currentBlock.push(trimmed);
    });

    flushCurrentBlock('flush-final');
    return elements;
  };

  // Helper specifically for Chapter Intro & Author context
  const renderIntroContent = (rawText: string) => {
    if (!rawText) return null;

    const sanitizedText = cleanMathAndMarkdownText(rawText);
    const lines = String(sanitizedText).split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraphs: string[] = [];

    const flushParagraphs = (key: string) => {
      if (currentParagraphs.length > 0) {
        const joinedText = currentParagraphs.join('\n').trim();
        if (joinedText) {
          elements.push(
            <div key={key} className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-xs hover:border-slate-300 transition-all leading-relaxed text-slate-800 text-[15px] sm:text-base font-normal space-y-3.5">
              {joinedText.split('\n').map((para, pIdx) => {
                const trimmedPara = para.trim();
                if (!trimmedPara) return null;
                if (trimmedPara.startsWith('●') || trimmedPara.startsWith('•') || trimmedPara.startsWith('-')) {
                  const cleanText = trimmedPara.replace(/^[●•\-*]+\s*/, '');
                  const colonSplit = cleanText.split(/:\s*(.*)/);
                  const label = colonSplit.length > 1 ? colonSplit[0] : '';
                  const rest = colonSplit.length > 1 ? colonSplit[1] : cleanText;

                  return (
                    <div key={`intro-bullet-${pIdx}`} className="flex items-start gap-3 my-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-2 shrink-0"></span>
                      <div className="flex-1">
                        {label ? (
                          <span className="font-black text-stone-900 text-sm sm:text-[15px] block sm:inline sm:mr-2">
                            {label}:
                          </span>
                        ) : null}
                        <span className="text-stone-800 font-medium text-sm sm:text-[15px] leading-relaxed">
                          {highlightKeywords(rest)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return (
                  <p key={`intro-p-${pIdx}`} className="mb-3 last:mb-0 leading-relaxed text-slate-800 text-[15px] sm:text-base font-normal">
                    {highlightKeywords(trimmedPara)}
                  </p>
                );
              })}
            </div>
          );
        }
        currentParagraphs = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = cleanMathAndMarkdownText(line.trim());

      if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
        flushParagraphs(`flush-before-${idx}`);
        const title = trimmed.replace(/[【】]/g, '');
        elements.push(
          <div key={`intro-banner-${idx}`} className="my-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 text-white shadow-md flex items-center gap-4 border-2 border-amber-300">
            <div className="p-3.5 rounded-2xl bg-white/20 text-white shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-black tracking-widest text-amber-200 block">
                BSEB फुल सिलेबस • आधिकारिक पाठ्यक्रम परिचय
              </span>
              <h3 className="font-black text-base sm:text-xl text-white tracking-wide mt-0.5">
                {title}
              </h3>
            </div>
          </div>
        );
        return;
      }

      const isIntroHeading = 
        trimmed === 'लेखक परिचय:' || 
        trimmed === 'लेखक परिचय' ||
        trimmed === 'पाठ का सारांश एवं मूल संवेदना:' || 
        trimmed === 'पाठ का सारांश एवं मूल संवेदना' ||
        trimmed === 'पाठ का ऐतिहासिक संदर्भ:' ||
        trimmed === 'पाठ का मूल संदेश:';

      if (isIntroHeading || (trimmed.endsWith(':') && trimmed.length < 40 && !trimmed.startsWith('●') && !trimmed.startsWith('-'))) {
        flushParagraphs(`flush-before-heading-${idx}`);
        const headingText = trimmed.replace(/:$/, '');
        
        let iconBg = 'bg-rose-600 text-white';
        let borderColor = 'border-rose-600';
        let gradientBg = 'from-rose-100/80 via-orange-50/50 to-transparent';

        if (headingText.includes('लेखक') || headingText.includes('संदर्भ')) {
          iconBg = 'bg-indigo-700 text-white';
          borderColor = 'border-indigo-600';
          gradientBg = 'from-indigo-100/80 via-blue-50/50 to-transparent';
        } else if (headingText.includes('सारांश') || headingText.includes('संवेदना') || headingText.includes('संदेश')) {
          iconBg = 'bg-amber-600 text-stone-950';
          borderColor = 'border-amber-500';
          gradientBg = 'from-amber-100/80 via-orange-50/50 to-transparent';
        }

        elements.push(
          <div key={`intro-heading-${idx}`} className={`mt-6 mb-3 p-4 sm:p-5 bg-gradient-to-r ${gradientBg} border-l-6 ${borderColor} rounded-r-3xl shadow-xs flex items-center gap-4`}>
            <div className={`p-3 rounded-2xl ${iconBg} shadow-sm shrink-0`}>
              {headingText.includes('लेखक') ? <BookOpen className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-stone-600 block">
                अध्याय मुख्य बिंदु (Key Section)
              </span>
              <h4 className="font-black text-stone-950 text-lg sm:text-xl tracking-tight mt-0.5">
                {headingText}
              </h4>
            </div>
          </div>
        );
        return;
      }

      currentParagraphs.push(trimmed);
    });

    flushParagraphs('flush-final-intro');
    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Official Disha/Topper Style Notes Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 rounded-2xl shadow-md p-3 text-white flex items-center justify-between border-2 border-amber-400">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white text-red-700 flex items-center justify-center font-black shadow-inner text-sm uppercase">
            PB
          </div>
          <div>
            <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Class 10th BSEB फुल सिलेबस
            </span>
            <h4 className="font-black text-sm sm:text-base tracking-tight text-white mt-0.5">
              {isMathSubject ? 'NCERT गणित — संपूर्ण प्रश्नावली हल' : 'PADHEGA BIHAR — HINDI FULL NOTES'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/20">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-300 bg-stone-900 shrink-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-amber-300">RK</span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-amber-200 block font-bold leading-none">BY - DIRECTOR</span>
            <span className="text-xs font-black text-white tracking-wide">Raj Kumar Chaurasia</span>
          </div>
        </div>
      </div>

      {/* Audio Read-Aloud Floating Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center ${isPlayingAudio ? 'animate-pulse bg-white text-red-700' : 'text-white'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs sm:text-sm">ऑडियो नोट्स शिक्षक (Voice Teacher)</h5>
            <p className="text-[11px] text-amber-100">
              {isPlayingAudio ? 'ऑडियो बज रहा है... ध्यान से सुनें' : 'बटन दबाकर इस प्रश्नावली / पाठ को बोलकर सुनें'}
            </p>
          </div>
        </div>

        <button
          onClick={handleReadAloud}
          className={`px-4 py-2 rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 ${
            isPlayingAudio 
              ? 'bg-white text-red-700 hover:bg-amber-50 animate-bounce' 
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4" /> बंद करें (Stop)
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" /> ऑडियो सुनें (Play)
            </>
          )}
        </button>
      </div>

      {/* 1. पाठ परिचय (INTRO) */}
      {activeTab === 'intro' && !isMathSubject && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-50 to-rose-50 border border-amber-300/80 rounded-3xl flex items-start gap-3.5 shadow-xs">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-500 text-white rounded-2xl shadow-sm shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                  पाठ परिचय एवं लेखक संदर्भ
                </span>
                <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  BSEB अनिवार्य
                </span>
              </div>
              <h4 className="text-stone-950 font-black text-sm sm:text-base">
                {cleanMathAndMarkdownText(currentChapter.chapter_name_hindi || 'अध्याय का संक्षिप्त परिचय')}
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                बोर्ड परीक्षा में इस पाठ के मुख्य बिंदुओं और मूल उद्देश्य से प्रश्न अवश्य पूछे जाते हैं।
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {currentChapter.intro_hindi ? (
              renderIntroContent(currentChapter.intro_hindi)
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय का पाठ परिचय जल्द ही उपलब्ध होगा।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. विस्तृत नोट्स (NOTES) */}
      {activeTab === 'notes' && !isMathSubject && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-50 to-purple-50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-indigo-950 text-sm sm:text-base">संपूर्ण विस्तृत अध्याय नोट्स</h4>
                <p className="text-xs text-indigo-700/80">
                  एनसीईआरटी (NCERT) मानक पाठ्यक्रम एवं टॉपर विश्लेषण पर आधारित
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex bg-white text-indigo-900 font-bold text-xs px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
              Revision Ready
            </span>
          </div>

          <div className="space-y-3.5">
            {currentChapter.notes_hindi ? (
              renderFormattedNotes(currentChapter.notes_hindi)
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय के विस्तृत नोट्स उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VVI टॉपर टिप्स (TIPS) */}
      {activeTab === 'tips' && !isMathSubject && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/25 via-yellow-100/60 to-amber-50 border-2 border-amber-400/80 rounded-3xl flex items-start gap-3.5 shadow-sm">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 text-stone-950 rounded-2xl shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  TOPPER SECRETS
                </span>
                <span className="text-[11px] text-amber-900 font-bold">100/100 Target</span>
              </div>
              <h4 className="text-stone-950 font-black text-sm sm:text-base">
                बिहार बोर्ड VVI टॉपर परीक्षा टिप्स & मार्क्स बूस्टर
              </h4>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                इन मुख्य बिंदुओं और उत्तर लिखने की विधियों को याद रखकर आप परीक्षा में पूरे अंक ला सकते हैं।
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentChapter.topper_tips ? (
              cleanMathAndMarkdownText(currentChapter.topper_tips)
                .split('\n')
                .filter((l: string) => l.trim().length > 0)
                .map((line: string, idx: number) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('【')) {
                    return (
                      <div key={`tip-hdr-${idx}`} className="p-3 bg-amber-100/80 border border-amber-300 rounded-2xl text-amber-950 font-black text-xs sm:text-sm text-center">
                        {trimmed.replace(/[【】]/g, '')}
                      </div>
                    );
                  }

                  const hasAnswer = trimmed.includes('उत्तर:') || trimmed.includes('उत्तर :');
                  let qPart = trimmed;
                  let aPart = '';
                  if (hasAnswer) {
                    const split = trimmed.split(/उत्तर\s*:\s*/);
                    qPart = split[0];
                    aPart = split[1] || '';
                  }

                  return (
                    <div key={`tip-item-${idx}`} className="p-4 bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs hover:border-amber-400 transition-all space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-xl bg-amber-400 text-stone-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-stone-900 font-bold text-sm leading-snug">
                            {qPart}
                          </p>
                        </div>
                      </div>

                      {hasAnswer && (
                        <div className="ml-8 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start gap-2">
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0">
                            सटीक उत्तर
                          </span>
                          <span className="leading-relaxed">{aPart}</span>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                इस अध्याय के VVI टॉपर टिप्स जल्द ही उपलब्ध होंगे।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4A. MATHEMATICS EXERCISE-BY-EXERCISE NOTEBOOK / WRITTEN PAGE SOLUTIONS */}
      {activeTab === 'qna' && isMathSubject && (
        <div className="space-y-4 animate-fade-in">
          {/* Exercise Selector Cards (प्रश्नावली चुनें) */}
          <div className="bg-white rounded-2xl border-2 border-red-200 p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-700" />
                <span className="text-xs sm:text-sm font-black text-stone-900">
                  NCERT प्रश्नावली चुनें (दबाकर प्रश्नावली खोलें):
                </span>
              </div>
              <span className="text-[11px] font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-md">
                कुल {exercisesList.length} प्रश्नावली
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exercisesList.map((ex, idx) => {
                const isSelected = idx === selectedExerciseIndex;
                return (
                  <button
                    key={ex.exerciseId}
                    onClick={() => setSelectedExerciseIndex(idx)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-700 text-white border-red-800 shadow-sm'
                        : 'bg-amber-50/50 text-stone-900 border-amber-200 hover:bg-amber-100/60 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs sm:text-sm">
                        {ex.exerciseTitle}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-white/20 text-amber-200'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        हल देखें
                      </span>
                    </div>
                    <p
                      className={`text-[10px] mt-1 line-clamp-1 font-medium ${
                        isSelected ? 'text-amber-100' : 'text-stone-600'
                      }`}
                    >
                      {ex.exerciseSubtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REALISTIC WRITTEN NOTEBOOK / REGISTER PAGE VIEW */}
          {activeExercise ? (
            <div className="rounded-2xl overflow-hidden border-2 border-stone-300 shadow-md bg-[#fffef8]">
              {/* Top Notebook Page Header (Red Double Rule + Page/Date Box) */}
              <div className="bg-[#fffdf5] border-b-4 border-double border-rose-500 px-4 py-3.5 sm:px-6 sm:py-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wide block">
                    अध्याय {currentChapter.chapter_no} • {cleanMathAndMarkdownText(currentChapter.chapter_name_hindi)}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-stone-950 mt-0.5">
                    {activeExercise.exerciseTitle} (NCERT संपूर्ण हल)
                  </h4>
                  <p className="text-xs font-semibold text-stone-700 mt-0.5">
                    {activeExercise.exerciseSubtitle}
                  </p>
                </div>

                {/* Classic Notebook Corner Page / Date Box */}
                <div className="border-2 border-rose-400 rounded-lg px-2.5 py-1 text-right bg-white/90 shrink-0">
                  <div className="text-[10px] font-bold text-rose-700 border-b border-rose-300 pb-0.5">
                    पृष्ठ संख्या : {selectedExerciseIndex + 1}/{exercisesList.length}
                  </div>
                  <div className="text-[10px] font-extrabold text-stone-800 pt-0.5">
                    कक्षा 10 गणित
                  </div>
                </div>
              </div>

              {/* Notebook Ruled Sheet Body */}
              <div
                className="divide-y-2 divide-rose-200/80"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(148, 163, 184, 0.25) 31px, rgba(148, 163, 184, 0.25) 32px)',
                }}
              >
                {activeExercise.questions.map((item, qIdx) => (
                  <div
                    key={`${activeExercise.exerciseId}-q-${qIdx}`}
                    className="flex items-stretch"
                  >
                    {/* Left Notebook Margin (Vertical Red Double Line) */}
                    <div className="w-16 sm:w-20 shrink-0 border-r-4 border-double border-rose-400/80 bg-rose-50/20 px-1.5 py-4 flex flex-col items-center justify-between select-none">
                      <span className="text-xs sm:text-sm font-black text-rose-800 text-center leading-tight">
                        {cleanMathAndMarkdownText(item.qNo)}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyQA(
                            `${item.qNo}: ${item.question}\nहल:\n${item.solution.join('\n')}\n${item.answer}`,
                            qIdx
                          )
                        }
                        title="हल कॉपी करें"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
                      >
                        {copiedIndex === qIdx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Right Main Written Area */}
                    <div className="flex-1 p-3.5 sm:p-5 space-y-3">
                      {/* Question Written in Crisp Black Ink */}
                      <div className="pb-2 border-b border-dashed border-stone-300">
                        <p className="text-stone-950 font-extrabold text-[15px] sm:text-base leading-7">
                          {cleanMathAndMarkdownText(item.question)}
                        </p>
                      </div>

                      {/* Step-by-Step Solution Written in Royal Blue Pen Ink */}
                      <div className="space-y-1.5">
                        <div className="inline-block font-black text-xs sm:text-sm text-blue-900 underline decoration-blue-600 decoration-2 underline-offset-4 mb-1">
                          हल (Solution) :
                        </div>
                        <div className="space-y-1.5 pl-1">
                          {item.solution.map((step, sIdx) => (
                            <p
                              key={`step-${sIdx}`}
                              className="text-blue-950 font-semibold text-[14.5px] sm:text-[15.5px] leading-8 tracking-normal"
                            >
                              {cleanMathAndMarkdownText(step)}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Boxed Final Answer (अतः उत्तर) */}
                      <div className="pt-1">
                        <div className="inline-block bg-emerald-50/95 border-2 border-emerald-700/70 rounded-xl px-3.5 py-2 text-emerald-950 font-black text-xs sm:text-sm leading-relaxed shadow-2xs">
                          <span className="text-emerald-800 mr-1.5">उत्तर :</span>
                          <span>{cleanMathAndMarkdownText(item.answer)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Page Navigation Bar (Previous / Next Exercise) */}
              <div className="bg-[#fffdf5] border-t-2 border-rose-300 p-3 sm:px-5 flex items-center justify-between gap-2">
                <button
                  disabled={selectedExerciseIndex === 0}
                  onClick={() =>
                    setSelectedExerciseIndex((prev) => Math.max(0, prev - 1))
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                    selectedExerciseIndex === 0
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 cursor-pointer shadow-2xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछली प्रश्नावली</span>
                </button>

                <span className="text-xs font-extrabold text-stone-700">
                  {activeExercise.exerciseTitle}
                </span>

                <button
                  disabled={selectedExerciseIndex >= exercisesList.length - 1}
                  onClick={() =>
                    setSelectedExerciseIndex((prev) =>
                      Math.min(exercisesList.length - 1, prev + 1)
                    )
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                    selectedExerciseIndex >= exercisesList.length - 1
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-red-700 text-white hover:bg-red-800 cursor-pointer shadow-xs'
                  }`}
                >
                  <span>अगली प्रश्नावली</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 4B. NCERT एवं महत्वपूर्ण प्रश्नोत्तर (QNA for non-Math subjects) */}
      {activeTab === 'qna' && !isMathSubject && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-gradient-to-r from-rose-700 via-red-600 to-indigo-700 text-white rounded-3xl shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl text-white shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-200 block">
                  NCERT अभ्यास & मॉडल उत्तर
                </span>
                <h4 className="font-black text-sm sm:text-base text-white">
                  अध्याय के संपूर्ण परीक्षा उपयोगी प्रश्न-उत्तर
                </h4>
              </div>
            </div>
            <span className="bg-white/25 text-white font-black text-xs px-3 py-1 rounded-full shrink-0">
              {currentChapter.subjective_qa?.length || 0} प्रश्न
            </span>
          </div>

          <div className="space-y-4">
            {currentChapter.subjective_qa && currentChapter.subjective_qa.length > 0 ? (
              currentChapter.subjective_qa.map((qa: any, idx: number) => {
                const cleanQ = cleanMathAndMarkdownText(qa.question);
                const cleanA = cleanMathAndMarkdownText(qa.answer);
                const isLong = qa.type?.includes('दीर्घ') || cleanQ.length > 70;
                
                return (
                  <div 
                    key={`qna-card-${idx}`} 
                    className="overflow-hidden rounded-3xl border-2 border-indigo-100 bg-white shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                            <span>प्रश्न {idx + 1}</span>
                          </span>
                          
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                            isLong 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          }`}>
                            {cleanMathAndMarkdownText(qa.type || 'महत्वपूर्ण प्रश्न')} • {isLong ? '5 अंक' : '2 अंक'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyQA(`प्र. ${cleanQ}\n\nउ. ${cleanA}`, idx)}
                          title="प्रश्न-उत्तर कॉपी करें"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-300">कॉपी हो गया!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px] hidden sm:inline">कॉपी</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h5 className="font-extrabold text-white text-[15px] sm:text-base leading-snug tracking-wide">
                        {cleanQ}
                      </h5>
                    </div>

                    <div className="p-4 sm:p-5 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 border-t-2 border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>उत्तर (आदर्श उत्तर)</span>
                        </span>
                        <span className="text-[11px] text-emerald-800 font-bold">
                          बोर्ड परीक्षा मानक
                        </span>
                      </div>

                      <div className="border-l-4 border-emerald-500 pl-3.5 sm:pl-4 py-1">
                        <p className="text-slate-800 font-medium text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
                          {highlightKeywords(cleanA)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
                इस अध्याय के प्रश्न-उत्तर अभी उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. वस्तुनिष्ठ प्रश्न (50 MCQS) */}
      {activeTab === 'mcq' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  परीक्षा हॉल मोड
                </span>
                <h4 className="font-black text-sm sm:text-base text-white mt-0.5">
                  50 MCQ महा-मॉक टेस्ट (OMR टाइमर मोड)
                </h4>
                <p className="text-xs text-blue-200">
                  50 मिनट का समय • निगेटिव मार्किंग विश्लेषण • तुरंत रिपोर्ट कार्ड
                </p>
              </div>
            </div>
            <button
              onClick={onStartPaidTest}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 text-xs font-black self-start sm:self-auto shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>टाइमर टेस्ट शुरू करें</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">
                कुल वस्तुनिष्ठ प्रश्न:
              </span>
              <span className="bg-rose-100 text-rose-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {currentChapter.mcq?.length || 0} MCQs
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              उत्तर देखने के लिए विकल्प पर क्लिक करें
            </span>
          </div>

          <div className="space-y-3.5">
            {currentChapter.mcq && currentChapter.mcq.length > 0 ? (
              currentChapter.mcq.map((m: any, idx: number) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const selectedOption = selectedAnswers[idx];

                return (
                  <div 
                    key={`mcq-item-${idx}`} 
                    className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <p className="font-extrabold text-slate-900 text-[14.5px] sm:text-base leading-snug">
                        {cleanMathAndMarkdownText(m.question)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {m.options?.map((opt: string, oIdx: number) => {
                        let optStyle = 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer';
                        const optionLetter = String.fromCharCode(65 + oIdx);
                        const isCorrectOption = (typeof m.correct_answer === 'number' ? m.correct_answer : m.correctIndex) === oIdx;

                        if (isAnswered) {
                          if (isCorrectOption) {
                            optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs';
                          } else if (selectedOption === oIdx) {
                            optStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                          } else {
                            optStyle = 'border-slate-200 bg-slate-100/50 text-slate-400 opacity-60 cursor-not-allowed';
                          }
                        }

                        return (
                          <div 
                            key={`opt-${idx}-${oIdx}`} 
                            onClick={() => {
                              if (!isAnswered) {
                                setSelectedAnswers(prev => ({ ...prev, [idx]: oIdx }));
                              }
                            }}
                            className={`p-3 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 ${optStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isAnswered && isCorrectOption 
                                ? 'bg-emerald-600 text-white'
                                : isAnswered && selectedOption === oIdx
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700'
                            }`}>
                              {optionLetter}
                            </span>
                            <span className="flex-1 leading-snug">{cleanMathAndMarkdownText(opt)}</span>
                            {isAnswered && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs sm:text-sm text-stone-900 animate-fade-in flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-400 text-stone-950 shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-amber-900 block mb-0.5">
                            सही उत्तर व्याख्या (Explanation):
                          </span>
                          <p className="leading-relaxed font-medium text-stone-800">
                            {cleanMathAndMarkdownText(m.explanation || `सही उत्तर विकल्प [${String.fromCharCode(65 + (typeof m.correct_answer === 'number' ? m.correct_answer : m.correctIndex))}] है।`)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
                इस अध्याय के MCQs अभी उपलब्ध नहीं हैं।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
