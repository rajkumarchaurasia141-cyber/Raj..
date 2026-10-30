import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Crown, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  Flame, 
  ArrowRight,
  GraduationCap,
  Video,
  FileText,
  Clock,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroCarouselBannerProps {
  onOpenVip: () => void;
  onExploreCourses: () => void;
  onSelectSubject?: (subjectId: string) => void;
}

export function HeroCarouselBanner({ onOpenVip, onExploreCourses, onSelectSubject }: HeroCarouselBannerProps) {
  const { isVIP } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_COUNT = 4;
  const SLIDE_DURATION = 4000; // 4 seconds per slide

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT);
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    setProgress(0);
  }, []);

  // Continuous auto-slide effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT);
      setProgress(0);
    }, SLIDE_DURATION);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + (100 / (SLIDE_DURATION / 40))));
    }, 40);

    return () => {
      clearInterval(slideTimer);
      clearInterval(progressTimer);
    };
  }, [currentSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-red-900/40 select-none bg-stone-950 text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Slider Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-stone-900/80 z-30">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-300 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Slides Track (Strict 16:9 full height & width) */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* ============================================================== */}
        {/* SLIDE 0: SPECIAL CRASH COURSE BANNER (₹299)                    */}
        {/* ============================================================== */}
        <div className="w-full h-full shrink-0 relative bg-gradient-to-br from-stone-950 via-amber-950 to-red-950 p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-red-600/30 rounded-full blur-2xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-stone-950 text-[10px] shadow-sm border border-amber-300">
                ⚡
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white">BSEB GURU</span>
                <span className="text-[9px] bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded font-black">क्रैश कोर्स</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/50 px-2 py-0.5 rounded-full text-yellow-300 text-[9px] sm:text-[10px] font-black animate-pulse">
              <Flame className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span>सीमित समय • मात्र ₹299</span>
            </div>
          </div>

          {/* Center Main Info (Horizontal Layout) */}
          <div className="relative z-10 flex items-center justify-between gap-2 my-auto">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-[9px] sm:text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>मिशन 450+ टॉपर मार्क्स</span>
              </div>
              <h2 className="text-sm sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                बिहार बोर्ड 10वीं क्रैश कोर्स
              </h2>
              <p className="text-[9px] sm:text-xs text-stone-300 line-clamp-1">
                सभी 6 विषयों के हस्तलिखित नोट्स, 100% VVI प्रश्न और डेली टेस्ट।
              </p>
            </div>

            {/* Price Badge */}
            <div className="bg-black/50 border border-amber-400/60 rounded-xl p-1.5 sm:p-2 text-right shrink-0">
              <div className="text-[8px] sm:text-[9px] font-extrabold text-amber-400 uppercase">FEE</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-stone-400 line-through">₹999</span>
                <span className="text-lg sm:text-2xl font-black text-yellow-300">₹299</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="relative z-10 flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
            <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] text-emerald-400 font-bold truncate">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
              <span className="truncate">100% बोर्ड परीक्षा में सीधे लड़ने वाले प्रश्न</span>
            </div>

            <button
              onClick={onOpenVip}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-stone-950 font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
            >
              <span>ज्वाइन करें (₹299)</span>
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SLIDE 1: ALL IN ONE COURSE POSTER                              */}
        {/* ============================================================== */}
        <div className="w-full h-full shrink-0 relative bg-gradient-to-br from-stone-950 via-red-950 to-neutral-950 p-2.5 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-red-600/25 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white">पढ़ेगा BR</span>
              <span className="text-[9px] bg-red-600/40 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">10th BSEB</span>
            </div>
            <div className="bg-red-700 text-white px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-black flex items-center gap-1">
              <span>RAJ SIR</span>
              <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex items-center justify-between gap-2 my-auto">
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-sm sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                ALL IN ONE COURSE
              </h2>
              <p className="text-[9px] sm:text-xs text-amber-300 font-bold">
                सभी 5 विषय एक साथ • अब पढ़ाई होगी और भी आसान !
              </p>
              <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-stone-300 pt-0.5">
                <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">📚 बुक्स</span>
                <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">📝 नोट्स</span>
                <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">🔴 लाइव</span>
                <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded">🎯 टेस्ट</span>
              </div>
            </div>

            <div className="bg-black/50 border border-amber-400/60 rounded-xl p-1.5 sm:p-2 text-right shrink-0">
              <div className="text-[8px] text-amber-400 font-bold">ALL SUBJECTS</div>
              <div className="text-base sm:text-2xl font-black text-yellow-300 leading-none mt-0.5">₹499</div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="relative z-10 flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
            <span className="text-[8px] sm:text-[10px] text-amber-300 font-bold">
              100% बोर्ड पैटर्न • सही दिशा सही तैयारी
            </span>

            <button
              onClick={onOpenVip}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
            >
              <span>अभी ज्वाइन करें</span>
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SLIDE 2: संस्कृत FULL COURSE — ALL IN ONE BOOK (16:9 PERFECT)   */}
        {/* ============================================================== */}
        <div className="w-full h-full shrink-0 relative bg-gradient-to-br from-red-950 via-stone-950 to-neutral-950 p-2 sm:p-3 md:p-4 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-10 -left-10 w-36 h-36 bg-red-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Left: 3D Book Graphic Mockup (Sized for 16:9) */}
          <div className="h-full shrink-0 flex items-center justify-center py-1">
            <div className="h-full aspect-[3/4] max-h-full rounded-lg sm:rounded-xl bg-gradient-to-tr from-stone-900 via-red-950 to-red-900 border-2 border-amber-400/90 shadow-2xl p-1.5 sm:p-2.5 flex flex-col justify-between overflow-hidden relative">
              {/* Book Spine */}
              <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-2.5 bg-gradient-to-r from-red-950 to-stone-900 border-r border-amber-500/40" />

              {/* Book Top */}
              <div className="pl-1.5 flex items-center justify-between">
                <div className="text-[7px] sm:text-[9px] font-black text-amber-400">पढ़ेगा BR</div>
                <div className="bg-red-600 text-white text-[6px] sm:text-[8px] font-black px-1 rounded-full border border-amber-300">
                  CLASS 10
                </div>
              </div>

              {/* Book Center Calligraphy */}
              <div className="pl-1.5 text-center my-auto">
                <div className="text-base sm:text-2xl font-black text-white tracking-wider drop-shadow-md">
                  संस्कृत
                </div>
                <div className="inline-block bg-yellow-400 text-stone-950 font-black text-[7px] sm:text-[9px] px-1 rounded-xs tracking-wider uppercase mt-0.5">
                  FULL COURSE
                </div>
                <div className="block bg-red-600 text-white font-extrabold text-[6px] sm:text-[8px] px-1 rounded-xs tracking-wider uppercase mt-0.5">
                  ALL IN ONE BOOK
                </div>
              </div>

              {/* Book Bottom */}
              <div className="pl-1.5 pt-0.5 border-t border-amber-500/30 flex items-center justify-between">
                <span className="text-[6px] sm:text-[8px] text-stone-300 font-bold">BSEB परीक्षा</span>
                <span className="text-[7px] sm:text-[9px] font-black text-amber-300 bg-black/60 px-1 rounded border border-amber-500/40">
                  RAJ SIR
                </span>
              </div>
            </div>
          </div>

          {/* Right: Course Features & Actions */}
          <div className="flex-1 h-full flex flex-col justify-between py-1 min-w-0">
            {/* Top Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-red-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase border border-amber-400/40">
                स्पेशल बुक एडिशन
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-amber-300 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>सम्पूर्ण 14 पाठ (700 MCQs)</span>
              </span>
            </div>

            {/* Heading & Subtitle */}
            <div>
              <h3 className="text-xs sm:text-base md:text-lg font-black text-white tracking-tight leading-tight truncate">
                संस्कृत फुल कोर्स - ALL IN ONE BOOK
              </h3>
              <p className="text-[8px] sm:text-[11px] text-stone-300 font-medium line-clamp-1">
                मंगलम् से लेकर शास्त्रकाराः तक 14 पाठों के हिंदी अनुवाद, व्याकरण व अभ्यास।
              </p>
            </div>

            {/* Compact Features Checklist */}
            <div className="grid grid-cols-2 gap-1 text-[8px] sm:text-[10px] text-stone-200">
              <div className="flex items-center gap-1 truncate">
                <span className="text-red-500 font-black">✔</span>
                <span className="truncate"><strong>सम्पूर्ण नोट्स</strong> — सरल हिंदी</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-amber-400 font-black">✔</span>
                <span className="truncate"><strong>Topper's Tips</strong> — मुख्य बिंदु</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-sky-400 font-black">✔</span>
                <span className="truncate"><strong>10 वर्ष PYQs</strong> — बोर्ड प्रश्न</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-emerald-400 font-black">✔</span>
                <span className="truncate"><strong>700 MCQs</strong> — OMR टेस्ट</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => {
                  if (onSelectSubject) onSelectSubject('sanskrit');
                  else onExploreCourses();
                }}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-[9px] sm:text-xs rounded-lg shadow transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
              >
                <BookOpen className="w-3 h-3" />
                <span>संस्कृत पढ़ें (Free)</span>
              </button>

              <button
                onClick={onOpenVip}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-black/70 hover:bg-stone-900 text-amber-300 font-black text-[9px] sm:text-xs rounded-lg border border-amber-400/50 shadow-sm transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>VIP अनलॉक (₹499)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SLIDE 3: हिंदी FULL COURSE — ALL IN ONE BOOK (16:9 PERFECT)     */}
        {/* ============================================================== */}
        <div className="w-full h-full shrink-0 relative bg-gradient-to-br from-stone-950 via-red-950 to-neutral-950 p-2 sm:p-3 md:p-4 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Left: 3D Book Graphic Mockup */}
          <div className="h-full shrink-0 flex items-center justify-center py-1">
            <div className="h-full aspect-[3/4] max-h-full rounded-lg sm:rounded-xl bg-gradient-to-tr from-stone-900 via-red-950 to-neutral-900 border-2 border-amber-400/90 shadow-2xl p-1.5 sm:p-2.5 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-2.5 bg-gradient-to-r from-red-950 to-stone-900 border-r border-amber-500/40" />

              <div className="pl-1.5 flex items-center justify-between">
                <div className="text-[7px] sm:text-[9px] font-black text-amber-400">पढ़ेगा BR</div>
                <div className="bg-red-600 text-white text-[6px] sm:text-[8px] font-black px-1 rounded-full border border-amber-300">
                  CLASS 10
                </div>
              </div>

              <div className="pl-1.5 text-center my-auto">
                <div className="text-base sm:text-2xl font-black text-white tracking-wider drop-shadow-md">
                  हिंदी
                </div>
                <div className="inline-block bg-yellow-400 text-stone-950 font-black text-[7px] sm:text-[9px] px-1 rounded-xs tracking-wider uppercase mt-0.5">
                  FULL COURSE
                </div>
                <div className="block bg-red-600 text-white font-extrabold text-[6px] sm:text-[8px] px-1 rounded-xs tracking-wider uppercase mt-0.5">
                  ALL IN ONE BOOK
                </div>
              </div>

              <div className="pl-1.5 pt-0.5 border-t border-amber-500/30 flex items-center justify-between">
                <span className="text-[6px] sm:text-[8px] text-stone-300 font-bold">गोधूलि & वर्णिका</span>
                <span className="text-[7px] sm:text-[9px] font-black text-amber-300 bg-black/60 px-1 rounded border border-amber-500/40">
                  RAJ SIR
                </span>
              </div>
            </div>
          </div>

          {/* Right: Course Features & Actions */}
          <div className="flex-1 h-full flex flex-col justify-between py-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-red-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase border border-amber-400/40">
                गोधूलि + वर्णिका
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-amber-300 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>सम्पूर्ण 24 पाठ (गद्य + पद्य)</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs sm:text-base md:text-lg font-black text-white tracking-tight leading-tight truncate">
                हिंदी फुल कोर्स - ALL IN ONE BOOK
              </h3>
              <p className="text-[8px] sm:text-[11px] text-stone-300 font-medium line-clamp-1">
                श्रम विभाजन, भारत से हम क्या सीखें, मंगम्मा आदि सभी पाठों के नोट्स व समाधान।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[8px] sm:text-[10px] text-stone-200">
              <div className="flex items-center gap-1 truncate">
                <span className="text-red-500 font-black">✔</span>
                <span className="truncate"><strong>सम्पूर्ण नोट्स</strong> — लेखक परिचय</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-amber-400 font-black">✔</span>
                <span className="truncate"><strong>Topper's Tips</strong> — सटीक व्याख्या</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-sky-400 font-black">✔</span>
                <span className="truncate"><strong>10 वर्ष PYQs</strong> — बोर्ड प्रश्न</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-emerald-400 font-black">✔</span>
                <span className="truncate"><strong>1200+ MCQs</strong> — OMR टेस्ट</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => {
                  if (onSelectSubject) onSelectSubject('hindi');
                  else onExploreCourses();
                }}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-[9px] sm:text-xs rounded-lg shadow transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
              >
                <BookOpen className="w-3 h-3" />
                <span>हिंदी पढ़ें (Free)</span>
              </button>

              <button
                onClick={onOpenVip}
                className="px-2 py-1 sm:px-3 sm:py-1.5 bg-black/70 hover:bg-stone-900 text-amber-300 font-black text-[9px] sm:text-xs rounded-lg border border-amber-400/50 shadow-sm transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>VIP अनलॉक (₹499)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Navigation Arrows (Compact translucent circular buttons) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white border border-stone-700/60 flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-all z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white border border-stone-700/60 flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-all z-20"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>

      {/* Bottom Floating Slide Dot Indicators */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-800/80">
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
              setProgress(0);
            }}
            className={`transition-all rounded-full cursor-pointer ${
              currentSlide === idx 
                ? 'w-5 h-1.5 bg-gradient-to-r from-amber-400 to-red-500' 
                : 'w-1.5 h-1.5 bg-stone-500 hover:bg-stone-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
