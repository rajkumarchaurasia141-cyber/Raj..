import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Maximize, Sparkles, Bot, Volume2, VolumeX } from 'lucide-react';
import { LiveClass } from '../types';

interface SmartAiBoardPlayerProps {
  classItem: LiveClass;
}

interface SpeechChunk {
  text: string;
  startChar: number;
  endChar: number;
}

export const SmartAiBoardPlayer = React.memo(function SmartAiBoardPlayer({
  classItem
}: SmartAiBoardPlayerProps) {
  // Build clean, structured teaching script for the board
  const scriptText = useMemo(() => {
    const desc = classItem.description?.trim() || '';
    const isGeneric =
      desc.length < 25 ||
      desc.includes('महत्वपूर्ण लाइव क्लास') ||
      desc.includes('परीक्षा उपयोगी क्लास');

    if (!isGeneric) {
      return `नमस्कार प्यारे विद्यार्थियों! बिहार बोर्ड कक्षा दसवीं की इस विशेष लाइव क्लास में आपका स्वागत है।\nआज का विषय है: ${classItem.subjectName} — ${classItem.title}।\n${desc}\nप्यारे बच्चों, इन सभी महत्वपूर्ण बिंदुओं और सूत्रों को अपनी कॉपी में अवश्य नोट कर लें। बोर्ड परीक्षा में यहाँ से सीधे प्रश्न पूछे जाते हैं।`;
    }

    return `नमस्कार प्यारे विद्यार्थियों! बिहार बोर्ड कक्षा 10वीं की इस विशेष स्मार्ट क्लास में आपका स्वागत है।\nआज हम ${classItem.subjectName} के अंतर्गत "${classItem.title}" का विस्तार से अध्ययन करेंगे।\n【 मुख्य परीक्षा बिंदु 】 : बिहार बोर्ड मैट्रिक परीक्षा में इस अध्याय से वस्तुनिष्ठ (MCQ) और लघु उत्तरीय प्रश्न हर वर्ष पूछे जाते हैं।\n【 महत्वपूर्ण ट्रिक 】 : प्रश्नों को हल करते समय मुख्य सूत्र और परिभाषाओं को साफ-साफ लिखें, इससे पूरे अंक मिलते हैं।\n★ बोर्ड टॉपर टिप: पिछले 5 वर्षों के प्रश्न पत्रों का नियमित अभ्यास करें और समय प्रबंधन पर विशेष ध्यान दें।`;
  }, [classItem.id, classItem.title, classItem.subjectName, classItem.description]);

  // Split script into short sentence chunks (<= 110 chars) so Chrome/Android Web Speech API
  // NEVER hits the 14-second utterance cutoff or pauses mid-lecture.
  const speechChunks = useMemo<SpeechChunk[]>(() => {
    const rawParts = scriptText.split(/(?<=[।?!.\n])\s+/);
    const chunks: SpeechChunk[] = [];
    let cursor = 0;

    for (const part of rawParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // If a single sentence is still very long, split by comma or length
      if (trimmed.length > 120) {
        const subParts = trimmed.split(/(?<=[,;،])\s+/);
        for (const sub of subParts) {
          const s = sub.trim();
          if (!s) continue;
          const idx = scriptText.indexOf(s, cursor);
          const startChar = idx >= 0 ? idx : cursor;
          const endChar = startChar + s.length;
          chunks.push({ text: s, startChar, endChar });
          cursor = endChar;
        }
      } else {
        const idx = scriptText.indexOf(trimmed, cursor);
        const startChar = idx >= 0 ? idx : cursor;
        const endChar = startChar + trimmed.length;
        chunks.push({ text: trimmed, startChar, endChar });
        cursor = endChar;
      }
    }

    if (chunks.length === 0) {
      chunks.push({ text: scriptText, startChar: 0, endChar: scriptText.length });
    }
    return chunks;
  }, [scriptText]);

  // Calculate realistic lecture duration based on character length
  const totalEstimatedTime = useMemo(() => {
    const wordsCount = scriptText.split(/\s+/).length;
    return Math.max(45, Math.ceil(wordsCount / 2.1));
  }, [scriptText]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [spokenCharIndex, setSpokenCharIndex] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef<boolean>(true);
  const isMutedRef = useRef<boolean>(false);
  const playbackRateRef = useRef<number>(1);
  const currentChunkIndexRef = useRef<number>(0);
  const durationFloatRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(Date.now());
  const speechSessionIdRef = useRef<number>(0);

  isPlayingRef.current = isPlaying;
  isMutedRef.current = isMuted;
  playbackRateRef.current = playbackRate;

  // Pick a Hindi voice if available on the device
  const getHindiVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
      voices.find((v) => v.lang.startsWith('hi')) ||
      voices.find((v) => v.lang.includes('IN')) ||
      null
    );
  };

  // Speak chunks sequentially without ever stopping visual playback if TTS hiccups
  const speakChunkAt = (chunkIdx: number, sessionId: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!isPlayingRef.current || isMutedRef.current) return;
    if (sessionId !== speechSessionIdRef.current) return;
    if (chunkIdx < 0 || chunkIdx >= speechChunks.length) return;

    currentChunkIndexRef.current = chunkIdx;
    const chunk = speechChunks[chunkIdx];

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = 'hi-IN';
      const hiVoice = getHindiVoice();
      if (hiVoice) utterance.voice = hiVoice;
      utterance.rate = Math.min(1.5, Math.max(0.8, 0.95 * playbackRateRef.current));
      utterance.pitch = 1.0;

      utterance.onboundary = (event) => {
        if (sessionId !== speechSessionIdRef.current || !isPlayingRef.current) return;
        if (typeof event.charIndex === 'number') {
          const targetIdx = Math.min(scriptText.length, chunk.startChar + event.charIndex);
          // Monotonically advance spokenCharIndex so text never jumps backward
          setSpokenCharIndex((prev) => Math.max(prev, targetIdx));
        }
      };

      utterance.onend = () => {
        if (sessionId !== speechSessionIdRef.current || !isPlayingRef.current) return;
        setSpokenCharIndex((prev) => Math.max(prev, chunk.endChar));
        const nextIdx = chunkIdx + 1;
        if (nextIdx < speechChunks.length) {
          speakChunkAt(nextIdx, sessionId);
        }
      };

      utterance.onerror = () => {
        // Never pause the video on mobile TTS error; smoothly advance to next chunk
        if (sessionId !== speechSessionIdRef.current || !isPlayingRef.current) return;
        const nextIdx = chunkIdx + 1;
        if (nextIdx < speechChunks.length) {
          setTimeout(() => {
            if (sessionId === speechSessionIdRef.current && isPlayingRef.current) {
              speakChunkAt(nextIdx, sessionId);
            }
          }, 150);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore Web Speech API exceptions on unsupported WebViews
    }
  };

  // Find which chunk corresponds to a character index
  const findChunkIndexForChar = (charIdx: number): number => {
    for (let i = 0; i < speechChunks.length; i++) {
      if (charIdx < speechChunks[i].endChar) {
        return i;
      }
    }
    return Math.max(0, speechChunks.length - 1);
  };

  // Start playback when classItem changes
  useEffect(() => {
    durationFloatRef.current = 0;
    lastTickTimeRef.current = Date.now();
    setDuration(0);
    setSpokenCharIndex(0);
    setIsPlaying(true);
    isPlayingRef.current = true;

    const newSession = speechSessionIdRef.current + 1;
    speechSessionIdRef.current = newSession;

    const startTimer = setTimeout(() => {
      speakChunkAt(0, newSession);
    }, 120);

    return () => {
      clearTimeout(startTimer);
      speechSessionIdRef.current += 1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classItem.id, scriptText]);

  // Smooth 200ms authoritative playback clock + Chrome speechSynthesis keep-alive
  useEffect(() => {
    if (!isPlaying) return;

    lastTickTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = ((now - lastTickTimeRef.current) / 1000) * playbackRateRef.current;
      lastTickTimeRef.current = now;

      const nextFloat = Math.min(totalEstimatedTime, durationFloatRef.current + deltaSec);
      durationFloatRef.current = nextFloat;
      const nextWholeSec = Math.floor(nextFloat);

      setDuration(nextWholeSec);

      // Smoothly advance board text in lockstep with elapsed time so it never freezes even if TTS is muted/unavailable
      const timeBasedCharIdx = Math.min(
        scriptText.length,
        Math.floor((nextFloat / totalEstimatedTime) * scriptText.length)
      );
      setSpokenCharIndex((prev) => Math.max(prev, timeBasedCharIdx));

      // Keep Chrome/Android WebView speechSynthesis alive if it accidentally paused
      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        !isMutedRef.current &&
        window.speechSynthesis.paused
      ) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }

      if (nextFloat >= totalEstimatedTime) {
        setSpokenCharIndex(scriptText.length);
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, totalEstimatedTime, scriptText.length]);

  // Seek to a specific time in seconds
  const seekToSeconds = (targetSec: number) => {
    const clampedSec = Math.max(0, Math.min(totalEstimatedTime, targetSec));
    durationFloatRef.current = clampedSec;
    lastTickTimeRef.current = Date.now();
    setDuration(Math.floor(clampedSec));

    const targetChar = Math.floor((clampedSec / totalEstimatedTime) * scriptText.length);
    setSpokenCharIndex(targetChar);

    const newSession = speechSessionIdRef.current + 1;
    speechSessionIdRef.current = newSession;

    if (isPlayingRef.current && !isMutedRef.current && clampedSec < totalEstimatedTime) {
      const chunkIdx = findChunkIndexForChar(targetChar);
      speakChunkAt(chunkIdx, newSession);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 550);

    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      speechSessionIdRef.current += 1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    } else {
      // If finished, restart from 0
      if (durationFloatRef.current >= totalEstimatedTime - 1) {
        durationFloatRef.current = 0;
        setDuration(0);
        setSpokenCharIndex(0);
      }
      lastTickTimeRef.current = Date.now();
      setIsPlaying(true);
      isPlayingRef.current = true;

      const newSession = speechSessionIdRef.current + 1;
      speechSessionIdRef.current = newSession;
      const resumeChar =
        durationFloatRef.current >= totalEstimatedTime - 1
          ? 0
          : Math.floor((durationFloatRef.current / totalEstimatedTime) * scriptText.length);
      const chunkIdx = findChunkIndexForChar(resumeChar);
      speakChunkAt(chunkIdx, newSession);
    }
  };

  const handleSkipForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    seekToSeconds(durationFloatRef.current + 10);
  };

  const handleSkipBackward = (e: React.MouseEvent) => {
    e.stopPropagation();
    seekToSeconds(durationFloatRef.current - 10);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    const newSession = speechSessionIdRef.current + 1;
    speechSessionIdRef.current = newSession;

    if (nextMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    } else if (isPlayingRef.current) {
      const chunkIdx = findChunkIndexForChar(spokenCharIndex);
      speakChunkAt(chunkIdx, newSession);
    }
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.25, 1.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length] || 1;
    setPlaybackRate(nextSpeed);
    playbackRateRef.current = nextSpeed;

    if (isPlayingRef.current && !isMutedRef.current) {
      const newSession = speechSessionIdRef.current + 1;
      speechSessionIdRef.current = newSession;
      const chunkIdx = findChunkIndexForChar(spokenCharIndex);
      speakChunkAt(chunkIdx, newSession);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!boardContainerRef.current) return;
    if (!document.fullscreenElement) {
      boardContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remSec = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
  };

  // Show at least the first sentence immediately so the board is never blank at 0:00
  const visibleCharCount = Math.max(48, spokenCharIndex);
  const displayedText = scriptText.slice(0, visibleCharCount);
  const paragraphs = displayedText.split('\n').filter((p) => p.trim() !== '');

  const teacherName = classItem.teacherName || 'राज सर (AI Teacher)';
  const teacherAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    teacherName
  )}&backgroundColor=b6e3f4`;

  return (
    <div
      ref={boardContainerRef}
      onClick={togglePlayPause}
      className="relative w-full aspect-video bg-gradient-to-br from-[#0c2618] via-[#0f311f] to-[#081c11] rounded-2xl overflow-hidden border-4 border-amber-800/80 shadow-2xl flex flex-col justify-between select-none cursor-pointer group transform-gpu"
    >
      {/* Top Bar inside Smart Board */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/50 backdrop-blur-xs border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          {classItem.isLive ? (
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              LIVE CLASS
            </span>
          ) : (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
              RECORDED LECTURE
            </span>
          )}
          <span className="text-amber-300 text-xs font-bold flex items-center gap-1 truncate max-w-[200px] sm:max-w-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{classItem.title}</span>
          </span>
        </div>
        <span className="text-[10px] text-emerald-300 font-mono font-bold">HD Smooth</span>
      </div>

      {/* Center Digital Board Teaching Area with Clean Paginated Text */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-7 pb-14 text-center relative z-10 overflow-y-auto">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#133820_1px,transparent_1px),linear-gradient(to_bottom,#133820_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-30"></div>

        <div className="max-w-2xl mx-auto space-y-2.5 relative z-10 w-full">
          {paragraphs.slice(-3).map((para, idx, arr) => (
            <div
              key={`board-para-${idx}`}
              className={`leading-relaxed font-sans transition-colors duration-200 ${
                idx === arr.length - 1
                  ? 'text-sm sm:text-base md:text-lg font-bold text-emerald-100 bg-black/35 p-3 rounded-xl border border-emerald-500/30 shadow-md'
                  : 'text-xs sm:text-sm text-emerald-300/80 font-medium'
              }`}
            >
              {para}
              {idx === arr.length - 1 && isPlaying && (
                <span className="inline-block w-1.5 h-4 bg-amber-400 ml-1 animate-pulse align-middle"></span>
              )}
            </div>
          ))}
        </div>

        {/* Center Play/Pause Flash Animation on Click */}
        {showCenterIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-30">
            <div className="w-16 h-16 rounded-full bg-stone-900/90 text-white flex items-center justify-center shadow-2xl">
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </div>
          </div>
        )}

        {/* AI Teacher Avatar Box in Corner */}
        <div className="absolute bottom-12 right-3 z-25 bg-stone-900/95 text-white px-3 py-1.5 rounded-xl shadow-2xl hidden sm:flex items-center gap-2 border border-emerald-500/60 pointer-events-none">
          <div className="relative">
            <img
              src={teacherAvatar}
              alt={teacherName}
              className={`w-9 h-9 rounded-lg object-cover bg-white border ${
                isPlaying ? 'border-emerald-400' : 'border-amber-400'
              }`}
            />
            {isPlaying && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-stone-900 animate-ping"></div>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-[11px] font-black leading-none text-white">
              <Bot className="w-3 h-3 text-emerald-400" />
              <span>{teacherName}</span>
            </div>
            <p className="text-[9px] text-emerald-300 font-semibold mt-0.5">
              {isPlaying ? '🎙️ बोर्ड पर पढ़ा रहे हैं...' : '⏸️ रुके हुए हैं'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3.5 py-2 space-y-1.5 text-white"
      >
        {/* Interactive Progress Scrubber */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekToSeconds(ratio * totalEstimatedTime);
          }}
          className="w-full bg-stone-700/80 h-2 rounded-full overflow-hidden cursor-pointer relative group/bar"
          title="आगे/पीछे करने के लिए क्लिक करें"
        >
          <div
            className="bg-red-600 h-full transition-all duration-150 relative"
            style={{ width: `${Math.min(100, (duration / totalEstimatedTime) * 100)}%` }}
          />
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleSkipBackward}
              className="px-1.5 py-1 hover:bg-white/20 rounded-md text-stone-200 transition-colors cursor-pointer text-[10px] font-bold"
              title="10 सेकंड पीछे करें"
            >
              ⏪ 10s
            </button>

            <button
              type="button"
              onClick={handleSkipForward}
              className="px-1.5 py-1 hover:bg-white/20 rounded-md text-stone-200 transition-colors cursor-pointer text-[10px] font-bold"
              title="10 सेकंड आगे करें"
            >
              10s ⏩
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 hover:bg-white/20 rounded-md text-stone-200 transition-colors cursor-pointer"
              title={isMuted ? 'आवाज़ चालू करें' : 'आवाज़ बंद करें'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            <div className="flex items-center gap-1 font-mono text-[11px] text-stone-200">
              <span className="font-bold">{formatTime(duration)}</span>
              <span>/</span>
              <span>{formatTime(totalEstimatedTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCycleSpeed}
              className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-amber-300 font-black text-[10px] cursor-pointer"
              title="प्लेबैक स्पीड बदलें"
            >
              {playbackRate}x
            </button>
            <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">
              🎓 {classItem.subjectName}
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/25 rounded-lg text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
