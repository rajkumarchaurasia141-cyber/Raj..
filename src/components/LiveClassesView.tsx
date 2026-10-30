import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Crown,
  X,
  MessageCircle,
  ArrowLeft,
  Video,
  Gauge,
  Maximize,
  Minimize,
  Clock,
  Zap,
  CheckCircle2,
  Languages,
  Settings,
  Users,
  ExternalLink,
  RefreshCw,
  Search,
  MoreVertical,
  ThumbsUp,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  PictureInPicture2,
  RotateCcw,
  Pin,
  Filter,
  AlertTriangle,
  WifiOff,
  Loader2
} from 'lucide-react';
import { useData, isAiStudioLectureItem } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  LiveClass,
  LiveWatchRecord,
  UserVideoInteraction,
  VideoCategoryTab
} from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { SmartAiBoardPlayer } from './SmartAiBoardPlayer';
import {
  isValidYouTubeUrlOrId,
  getYouTubeEmbedUrl,
  getYouTubeDirectWatchUrl,
  getYouTubeThumbnailUrl
} from '../utils/youtubeHelper';
import {
  syncWatchHeartbeat,
  subscribeClassAttendance,
  getAttendanceDocId,
  formatWatchDuration,
  DEFAULT_BATCH_STUDENTS
} from '../services/attendanceTracker';
import { AdsterraBanner } from './AdsterraBanner';
import { triggerAd } from '../utils/adManager';

interface LiveClassesViewProps {
  onOpenVip: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const CATEGORY_CHIPS: {
  id: VideoCategoryTab | 'Saved' | 'Continue';
  label: string;
  hindi: string;
}[] = [
  { id: 'All', label: 'All', hindi: 'सभी (All)' },
  { id: 'Live', label: 'Live', hindi: '🔴 लाइव (Live)' },
  { id: 'Classes', label: 'Classes', hindi: '📚 क्लासेस (Classes)' },
  { id: 'Crash Course', label: 'Crash Course', hindi: '⚡ क्रैश कोर्स' },
  { id: 'Shorts', label: 'Shorts', hindi: '📱 शॉर्ट्स (Shorts)' },
  { id: 'Recently Added', label: 'Recently Added', hindi: '🆕 हाल ही में जोड़े गए' },
  { id: 'Continue', label: 'Continue Watching', hindi: '⏱️ देखना जारी रखें' },
  { id: 'Saved', label: 'Saved', hindi: '🔖 सेव किए गए' }
];

// Format seconds into MM:SS or HH:MM:SS
function formatTimeDisplay(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Format relative upload time in Hindi
function formatRelativeDate(isoDate?: string, fallbackLabel?: string): string {
  if (!isoDate) return fallbackLabel || 'हाल ही में';
  const time = new Date(isoDate).getTime();
  if (isNaN(time)) return fallbackLabel || 'हाल ही में';
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSec < 60) return 'अभी-अभी';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} घंटे पहले`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays} दिन पहले`;
  return new Date(isoDate).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format compact views count (e.g. 4.8K)
function formatViewsCount(count?: number): string {
  const num = typeof count === 'number' && count > 0 ? count : 1240;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

// Subject visual theme helper for resilient 16:9 poster thumbnails
function getSubjectPosterTheme(subjectName?: string | null) {
  const safeSubject = String(subjectName || '');
  if (safeSubject.includes('गणित')) {
    return {
      gradient: 'from-blue-950 via-indigo-900 to-slate-950',
      accent: 'bg-amber-400 text-slate-950',
      badge: '📐 BSEB 10th MATHS'
    };
  }
  if (safeSubject.includes('विज्ञान') && !safeSubject.includes('सामाजिक')) {
    return {
      gradient: 'from-emerald-950 via-teal-900 to-slate-950',
      accent: 'bg-emerald-400 text-slate-950',
      badge: '🔬 BSEB 10th SCIENCE'
    };
  }
  if (safeSubject.includes('सामाजिक')) {
    return {
      gradient: 'from-amber-950 via-orange-900 to-stone-950',
      accent: 'bg-amber-300 text-stone-950',
      badge: '🏛️ SOCIAL SCIENCE'
    };
  }
  if (safeSubject.includes('संस्कृत')) {
    return {
      gradient: 'from-rose-950 via-red-900 to-stone-950',
      accent: 'bg-yellow-400 text-stone-950',
      badge: '🪔 संस्कृत पीयूषम्'
    };
  }
  if (safeSubject.includes('हिन्दी')) {
    return {
      gradient: 'from-purple-950 via-fuchsia-900 to-stone-950',
      accent: 'bg-pink-300 text-stone-950',
      badge: '📖 गोधूलि & वर्णिका'
    };
  }
  if (safeSubject.includes('अंग्रेजी') || safeSubject.toLowerCase().includes('english')) {
    return {
      gradient: 'from-cyan-950 via-sky-900 to-slate-950',
      accent: 'bg-cyan-300 text-slate-950',
      badge: '🔤 PANORAMA ENGLISH'
    };
  }
  return {
    gradient: 'from-red-950 via-stone-900 to-black',
    accent: 'bg-amber-400 text-stone-950',
    badge: '🔥 VVI TOPPER CLASS'
  };
}

/**
 * Isolated Watch-Time Counter Badge:
 * Runs its own 1-second timer locally without ever triggering a re-render on `LiveClassesView` or the video player!
 */
const LiveWatchTimerBadge = React.memo(function LiveWatchTimerBadge({
  selectedClass,
  user,
  isVIP,
  isPaid,
  initialResumeSeconds,
  onSyncFinalProgress,
  hasNativeVideo
}: {
  selectedClass: LiveClass;
  user: any;
  isVIP: boolean;
  isPaid: boolean;
  initialResumeSeconds: number;
  onSyncFinalProgress: (videoId: string, progressSeconds: number, durationSeconds: number) => void;
  hasNativeVideo: boolean;
}) {
  const [watchSeconds, setWatchSeconds] = useState<number>(0);
  const syncCallbackRef = useRef(onSyncFinalProgress);
  syncCallbackRef.current = onSyncFinalProgress;

  useEffect(() => {
    setWatchSeconds(0);
    const studentKey =
      user?.email || (user as any)?.uid || 'student_' + Math.random().toString(36).substring(2, 8);
    const studentName = user?.name || (user?.email ? user.email.split('@')[0] : 'विद्यार्थी');
    const docId = getAttendanceDocId(selectedClass.id, studentKey);

    const record: LiveWatchRecord = {
      id: docId,
      classId: selectedClass.id,
      classTitle: selectedClass.title,
      isLive: Boolean(selectedClass.isLive || selectedClass.streamStatus === 'live'),
      studentId: studentKey,
      studentName,
      studentEmail: user?.email || '',
      isPaid: Boolean(isVIP || isPaid),
      joinedAt: new Date().toISOString(),
      lastHeartbeat: Date.now(),
      watchSeconds: 0,
      isOnline: true
    };

    syncWatchHeartbeat(record, false);
    let currentSeconds = 0;

    const secondTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      currentSeconds += 1;
      setWatchSeconds(currentSeconds);
      record.watchSeconds = currentSeconds;
    }, 1000);

    const syncTimer = setInterval(() => {
      syncWatchHeartbeat(record, false);
    }, 60000);

    return () => {
      clearInterval(secondTimer);
      clearInterval(syncTimer);
      record.watchSeconds = currentSeconds;
      syncWatchHeartbeat(record, true);

      if (currentSeconds >= 3 && !hasNativeVideo) {
        const estDuration = selectedClass.durationSeconds || 2700;
        syncCallbackRef.current(
          selectedClass.id,
          Math.min(initialResumeSeconds + currentSeconds, estDuration),
          estDuration
        );
      }
    };
  }, [selectedClass.id, user?.email, isVIP, isPaid, initialResumeSeconds, hasNativeVideo]);

  return (
    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
      आपका वॉच-टाइम: {formatWatchDuration(watchSeconds)}
    </span>
  );
});

/**
 * Isolated Scheduled Stream Countdown Screen:
 * Updates its countdown every second locally without re-rendering the parent feed or player!
 */
const ScheduledCountdownScreen = React.memo(function ScheduledCountdownScreen({
  selectedClass,
  isAdmin,
  onStartLiveNow,
  onCountdownFinished
}: {
  selectedClass: LiveClass;
  isAdmin: boolean;
  onStartLiveNow: () => void;
  onCountdownFinished: () => void;
}) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (selectedClass.scheduledDateTime) {
        const target = new Date(selectedClass.scheduledDateTime).getTime();
        if (!isNaN(target) && target <= current) {
          onCountdownFinished();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedClass.scheduledDateTime, onCountdownFinished]);

  const targetTime = selectedClass.scheduledDateTime
    ? new Date(selectedClass.scheduledDateTime).getTime()
    : 0;
  const diff = Math.max(0, targetTime - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="aspect-video w-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
      <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black px-3 py-1 rounded-full">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>लाइव स्ट्रीम शेड्यूल्ड है ({selectedClass.scheduledAt})</span>
      </div>
      <h3 className="text-sm sm:text-base font-black text-white max-w-md line-clamp-2">
        {selectedClass.title}
      </h3>
      <div className="grid grid-cols-3 gap-2.5 max-w-xs w-full">
        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
          <span className="block text-xl font-black text-amber-400">
            {String(hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-400">घंटे</span>
        </div>
        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
          <span className="block text-xl font-black text-amber-400">
            {String(minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-400">मिनट</span>
        </div>
        <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
          <span className="block text-xl font-black text-amber-400">
            {String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-400">सेकंड</span>
        </div>
      </div>
      {isAdmin && (
        <button
          type="button"
          onClick={onStartLiveNow}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>एडमिन: अभी तुरंत लाइव शुरू करें</span>
        </button>
      )}
    </div>
  );
});

/**
 * Pure, Stutter-Free YouTube Embedded Player (`StableYouTubePlayer`):
 * - Locks `stableEmbedUrl` per `classId` so parent updates never reload the iframe.
 * - Avoids noisy `infoDelivery` postMessage state-updates during playback so the browser's hardware video decoder runs without interruption.
 */
const StableYouTubePlayer = React.memo(function StableYouTubePlayer({
  classId,
  youtubeUrl,
  playlistId,
  title,
  isLive,
  initialStartSeconds,
  useNoCookie,
  playbackSpeed,
  isFullscreen,
  onToggleNoCookie
}: {
  classId: string;
  youtubeUrl: string;
  playlistId?: string;
  title: string;
  isLive: boolean;
  initialStartSeconds: number;
  useNoCookie: boolean;
  playbackSpeed: number;
  isFullscreen: boolean;
  onToggleNoCookie: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<{
    code: number | string;
    message: string;
  } | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Lock the embed URL ONLY to classId, youtubeUrl, playlistId, useNoCookie, and explicit retryCount.
  const stableEmbedUrl = useMemo(() => {
    const startSec = !isLive && initialStartSeconds > 10 ? initialStartSeconds : undefined;
    const base = getYouTubeEmbedUrl(youtubeUrl, {
      useNoCookie,
      autoplay: true,
      startSeconds: startSec,
      playlistId
    });
    if (retryCount > 0 && base.includes('?')) {
      return `${base}&retry=${retryCount}`;
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, youtubeUrl, playlistId, useNoCookie, retryCount]);

  // Reset player status when switching to a new video or explicit retry
  useEffect(() => {
    setIframeLoaded(false);
    setPlayerError(null);

    const validation = isValidYouTubeUrlOrId(youtubeUrl);
    if (!validation.valid && !playlistId) {
      setPlayerError({
        code: 'INVALID_URL',
        message: 'यह YouTube वीडियो लिंक अमान्य है। कृपया एडमिन पैनल में सही लिंक जांचें।'
      });
    }
  }, [classId, youtubeUrl, playlistId, useNoCookie, retryCount]);

  // Monitor network online/offline status without reloading the iframe automatically
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply playback speed via postMessage only when user explicitly changes speed
  useEffect(() => {
    if (!iframeLoaded || !iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [playbackSpeed]
        }),
        '*'
      );
    } catch {}
  }, [playbackSpeed, iframeLoaded]);

  return (
    <div
      className={`relative w-full bg-black overflow-hidden flex items-center justify-center transform-gpu ${
        isFullscreen ? 'flex-1 h-full' : 'aspect-video'
      }`}
    >
      {/* Initial Loading Spinner before iframe finishes loading */}
      {!iframeLoaded && !playerError && (
        <div className="absolute inset-0 z-10 bg-stone-950 flex flex-col items-center justify-center p-4 text-center space-y-2 pointer-events-none">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs font-bold text-stone-200">वीडियो प्लेयर लोड हो रहा है...</p>
        </div>
      )}

      {/* Offline Network Warning Banner */}
      {isOffline && (
        <div className="absolute top-3 left-3 z-20 bg-red-950/90 text-red-200 border border-red-500/50 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
          <span>इंटरनेट कनेक्शन बंद है। कनेक्शन आने पर वीडियो स्वतः चलेगा।</span>
        </div>
      )}

      {/* Player Error Overlay with Manual Retry */}
      {playerError ? (
        <div className="absolute inset-0 z-30 bg-stone-950/95 flex flex-col items-center justify-center p-5 text-center space-y-3 text-white">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="font-black text-sm sm:text-base max-w-md">
            वीडियो चलाने में रुकावट ({playerError.code})
          </h4>
          <p className="text-xs text-stone-300 max-w-md leading-relaxed">
            {playerError.message}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => {
                setPlayerError(null);
                setIframeLoaded(false);
                setRetryCount((c) => c + 1);
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>पुनः प्रयास करें (Retry)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlayerError(null);
                onToggleNoCookie();
              }}
              className="bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer"
            >
              {useNoCookie ? 'स्टैंडर्ड YouTube मोड आज़माएं' : 'प्राइवेसी मोड आज़माएं'}
            </button>

            <a
              href={getYouTubeDirectWatchUrl(youtubeUrl, playlistId)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
              <span>सीधे YouTube ऐप में खोलें</span>
            </a>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          key={`${classId}_${useNoCookie ? 'nocookie' : 'std'}_${retryCount}`}
          src={stableEmbedUrl}
          title={title}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIframeLoaded(true)}
        />
      )}
    </div>
  );
});

export function LiveClassesView({ onOpenVip }: LiveClassesViewProps) {
  const { liveClasses, appConfig, updateLiveClass } = useData();
  const { isVIP, isAdmin, user, isPaid } = useAuth();

  // Theme State (Clean Light Theme default, with optional Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bseb_live_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bseb_live_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Search (with 250ms debounce), Category & Subject Filter State
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<VideoCategoryTab | 'Saved' | 'Continue'>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(100);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Selected Video Player State
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const initialResumeSecondsRef = useRef<number>(0);

  const [lockedClassPrompt, setLockedClassPrompt] = useState<LiveClass | null>(null);
  const [menuOpenClass, setMenuOpenClass] = useState<LiveClass | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState<boolean>(false);

  // Broken image fallback tracker
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  // User Interactions (Likes, Saved/Watch Later, Resume Progress)
  const userKey = user?.email || (user as any)?.uid || 'guest_student';
  const interactionsStorageKey = `bseb_video_interactions_${userKey}`;

  const [interactions, setInteractions] = useState<Record<string, UserVideoInteraction>>(() => {
    try {
      const raw = localStorage.getItem(interactionsStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveInteraction = useCallback(
    (videoId: string, patch: Partial<UserVideoInteraction>) => {
      setInteractions((prev) => {
        const existing = prev[videoId] || { videoId, userId: userKey };
        const updatedItem: UserVideoInteraction = {
          ...existing,
          ...patch,
          videoId,
          userId: userKey,
          lastWatchedAt: new Date().toISOString()
        };
        const nextMap = { ...prev, [videoId]: updatedItem };
        try {
          localStorage.setItem(interactionsStorageKey, JSON.stringify(nextMap));
        } catch {}
        return nextMap;
      });
    },
    [interactionsStorageKey, userKey]
  );

  const handleSaveWatchProgress = useCallback(
    (videoId: string, progressSeconds: number, durationSeconds: number) => {
      saveInteraction(videoId, {
        watchProgressSeconds: progressSeconds,
        durationSeconds
      });
    },
    [saveInteraction]
  );

  // Attendance State
  const [activeAttendanceRecords, setActiveAttendanceRecords] = useState<LiveWatchRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [useNoCookie, setUseNoCookie] = useState<boolean>(false);
  const [countdownDoneIds, setCountdownDoneIds] = useState<Record<string, boolean>>({});

  const isClassScheduledFuture = useCallback(
    (cls: LiveClass) => {
      if (countdownDoneIds[cls.id]) return false;
      if (
        (cls.publishType === 'scheduled' || cls.streamStatus === 'scheduled') &&
        cls.scheduledDateTime
      ) {
        const target = new Date(cls.scheduledDateTime).getTime();
        return !isNaN(target) && target > Date.now();
      }
      return false;
    },
    [countdownDoneIds]
  );

  // Native HTML5 <video> & Container Refs
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [speedToast, setSpeedToast] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Native HTML5 video playback state
  const [isNativePlaying, setIsNativePlaying] = useState<boolean>(false);
  const [isNativeMuted, setIsNativeMuted] = useState<boolean>(false);
  const [nativeVolume, setNativeVolume] = useState<number>(1);
  const [nativeCurrentTime, setNativeCurrentTime] = useState<number>(0);
  const [nativeDuration, setNativeDuration] = useState<number>(0);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);
  const [pipSupported, setPipSupported] = useState<boolean>(false);

  useEffect(() => {
    setPipSupported(
      typeof document !== 'undefined' && Boolean((document as any).pictureInPictureEnabled)
    );
  }, []);

  // Auto-detect physical phone orientation without remounting the player
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      if (selectedClass) {
        if (isLandscape) {
          setIsFullscreen(true);
        } else if (
          !document.fullscreenElement &&
          !(document as any).webkitFullscreenElement
        ) {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [selectedClass?.id]);

  // Subscribe to class attendance only when a video is open
  useEffect(() => {
    if (!selectedClass) {
      setActiveAttendanceRecords([]);
      return;
    }
    const unsubAttendance = subscribeClassAttendance(selectedClass.id, (records) => {
      setActiveAttendanceRecords(records);
    });
    return () => {
      unsubAttendance();
    };
  }, [selectedClass?.id]);

  const userCanAccess = (cls: LiveClass) => {
    if (!cls.isVip) return true;
    return isVIP || isAdmin;
  };

  // Determine playback mode for a video item (Only Admin-added YouTube or direct video/HLS)
  const getPlaybackMode = useCallback(
    (cls: LiveClass): 'ai_board' | 'native_video' | 'youtube' => {
      const url = cls.playbackUrl || cls.youtubeUrl || '';
      if (
        cls.videoSourceType === 'video_file' ||
        cls.videoSourceType === 'hls_stream' ||
        url.match(/\.(mp4|webm|ogg|m3u8)$/i) ||
        url.startsWith('/uploads/') ||
        url.startsWith('data:video/')
      ) {
        return 'native_video';
      }
      return 'youtube';
    },
    []
  );

  // Open a video in the player page without triggering background Firestore writes that re-render the player
  const handleWatchClass = useCallback(
    (cls: LiveClass) => {
      triggerAd("live_video_click");
      if (!userCanAccess(cls)) {
        setLockedClassPrompt(cls);
        return;
      }

      const savedSec = Math.floor(interactions[cls.id]?.watchProgressSeconds || 0);
      initialResumeSecondsRef.current = savedSec;

      setPlaybackSpeed(1);
      setDescriptionExpanded(false);
      setIsFullscreen(window.innerWidth > window.innerHeight);
      setSelectedClass(cls);

      if (savedSec > 10 && !cls.isLive) {
        setSpeedToast(`⏱️ ${formatTimeDisplay(savedSec)} से देखना जारी रखा गया`);
        setTimeout(() => setSpeedToast(''), 3000);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [interactions, isVIP, isAdmin]
  );

  // Toggle Like on a video
  const handleToggleLike = (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLiked = Boolean(interactions[cls.id]?.liked);
    const nextLiked = !currentLiked;
    saveInteraction(cls.id, { liked: nextLiked });

    const baseLikes = cls.likesCount || 250;
    const nextLikesCount = Math.max(0, baseLikes + (nextLiked ? 1 : -1));
    updateLiveClass(cls.id, { likesCount: nextLikesCount }).catch(() => {});

    setSpeedToast(nextLiked ? '👍 वीडियो को लाइक किया गया!' : 'लाइक हटाया गया');
    setTimeout(() => setSpeedToast(''), 2000);
  };

  // Toggle Save / Watch Later on a video
  const handleToggleSave = (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentSaved = Boolean(interactions[cls.id]?.saved);
    const nextSaved = !currentSaved;
    saveInteraction(cls.id, { saved: nextSaved });

    setSpeedToast(
      nextSaved ? '🔖 "सेव किए गए (Watch Later)" में जोड़ा गया!' : 'सेव सूची से हटाया गया'
    );
    setTimeout(() => setSpeedToast(''), 2200);
  };

  // Native Share or Copy Link
  const handleShareVideo = async (cls: LiveClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = window.location.origin + '/?tab=live&video=' + encodeURIComponent(cls.id);
    const shareTitle = `${cls.title} | BSEB GURU Live`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${cls.teacherName} की यह महत्वपूर्ण क्लास देखें: ${cls.title}`,
          url: shareUrl
        });
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setSpeedToast('🔗 वीडियो का लिंक कॉपी हो गया! अब दोस्तों को शेयर करें।');
      setTimeout(() => setSpeedToast(''), 2500);
    } catch {
      setSpeedToast('शेयर लिंक तैयार है');
      setTimeout(() => setSpeedToast(''), 2000);
    }
  };

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {}, 3500);
  }, []);

  const toggleFullscreen = async () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    try {
      if (nextState) {
        resetControlsTimer();
        const el = playerContainerRef.current || document.documentElement;
        if (el?.requestFullscreen) {
          await el.requestFullscreen().catch(() => {});
        } else if ((el as any)?.webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          } else if ((document as any)?.webkitExitFullscreen) {
            await (document as any)?.webkitExitFullscreen().catch(() => {});
          }
        }
      }
    } catch {}
  };

  // Picture-in-Picture for native HTML5 <video>
  const handleTogglePiP = async () => {
    const videoEl = nativeVideoRef.current;
    if (!videoEl) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if ((videoEl as any).requestPictureInPicture) {
        await (videoEl as any).requestPictureInPicture();
      }
    } catch {
      setSpeedToast('Picture-in-Picture इस ब्राउज़र में उपलब्ध नहीं है');
      setTimeout(() => setSpeedToast(''), 2000);
    }
  };

  // Set Playback Speed on both Native <video> and YouTube Player
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = speed;
    }
    setSpeedToast(`⚡ प्लेबैक स्पीड ${speed}x सेट की गई`);
    setTimeout(() => setSpeedToast(''), 2000);
  };

  // All Admin-added YouTube / video classes
  const publishedClasses = useMemo(() => {
    return (liveClasses || [])
      .filter((cls) => {
        if (!cls || !cls.id || isAiStudioLectureItem(cls)) return false;
        return true;
      })
      .map((cls) => ({
        ...cls,
        title: String(cls.title || 'बिहार बोर्ड कक्षा 10वीं विशेष क्लास'),
        subjectName: String(cls.subjectName || 'सामान्य'),
        teacherName: String(cls.teacherName || 'राज सर'),
        youtubeUrl: String(cls.youtubeUrl || cls.playbackUrl || ''),
        scheduledAt: String(cls.scheduledAt || 'रिकॉर्डेड क्लास')
      }))
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt || b.publishedAt || 0).getTime() - new Date(a.createdAt || a.publishedAt || 0).getTime();
      });
  }, [liveClasses]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    publishedClasses.forEach((c) => {
      if (c.subjectName) set.add(c.subjectName);
    });
    return ['all', ...Array.from(set)];
  }, [publishedClasses]);

  const liveNowCount = useMemo(
    () => publishedClasses.filter((c) => c.isLive || c.streamStatus === 'live').length,
    [publishedClasses]
  );

  // Continue Watching list
  const continueWatchingList = useMemo(() => {
    return publishedClasses.filter((cls) => {
      const prog = interactions[cls.id]?.watchProgressSeconds || 0;
      return prog >= 10;
    });
  }, [publishedClasses, interactions]);

  // Auto-open video if URL has ?video=<id>
  useEffect(() => {
    if (typeof window === 'undefined' || publishedClasses.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const vidId = params.get('video');
      if (vidId && (!selectedClass || selectedClass.id !== vidId)) {
        const target = publishedClasses.find((c) => c.id === vidId);
        if (target && userCanAccess(target)) {
          setSelectedClass(target);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedClasses]);

  // Filtered Feed based on Category Chip, Subject, and Debounced Search Query
  const filteredFeed = useMemo(() => {
    const q = debouncedSearchQuery;
    let list = publishedClasses.filter((cls) => {
      if (q) {
        const hay = `${cls.title || ''} ${cls.description || ''} ${cls.subjectName || ''} ${
          cls.chapterName || ''
        } ${cls.teacherName || ''} ${cls.category || ''} ${cls.libraryCategory || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (selectedSubject !== 'all' && cls.subjectName !== selectedSubject) {
        return false;
      }

      const isCurrentlyLiveOrScheduled = Boolean(
        cls.isLive || cls.streamStatus === 'live' || cls.streamStatus === 'scheduled'
      );

      if (activeCategory === 'Live') {
        return isCurrentlyLiveOrScheduled || cls.category === 'Live' || cls.contentType === 'live';
      }
      if (activeCategory === 'Classes') {
        return (
          (!isCurrentlyLiveOrScheduled && (cls.category || 'Classes') === 'Classes') ||
          cls.contentType === 'recorded'
        );
      }
      if (activeCategory === 'Crash Course') {
        return cls.category === 'Crash Course' || cls.contentType === 'crash_course';
      }
      if (activeCategory === 'Shorts') {
        return cls.category === 'Shorts' || cls.contentType === 'short';
      }
      if (activeCategory === 'Saved') {
        return Boolean(interactions[cls.id]?.saved);
      }
      if (activeCategory === 'Continue') {
        return (interactions[cls.id]?.watchProgressSeconds || 0) >= 5;
      }
      return true;
    });

    if (activeCategory === 'Recently Added') {
      list = [...list].sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt || 0).getTime() -
          new Date(a.publishedAt || a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [publishedClasses, debouncedSearchQuery, selectedSubject, activeCategory, interactions]);

  // Related videos for the active player
  const relatedVideos = useMemo(() => {
    if (!selectedClass) return [];
    const others = publishedClasses.filter((c) => c.id !== selectedClass.id);
    const sameSubject = others.filter((c) => c.subjectName === selectedClass.subjectName);
    const rest = others.filter((c) => c.subjectName !== selectedClass.subjectName);
    return [...sameSubject, ...rest].slice(0, 8);
  }, [publishedClasses, selectedClass]);

  const whatsappNumber = appConfig.whatsappNumber || '9241511070';

  // Render 16:9 Thumbnail directly from YouTube server with fallback
  const renderThumbnail = (cls: LiveClass, compact = false) => {
    const ytThumb = getYouTubeThumbnailUrl(cls.youtubeUrl);
    const thumbSrc = ytThumb || cls.thumbnailUrl;
    const isFailed = failedThumbnails[cls.id];
    const isCurrentlyLive = Boolean(cls.isLive || cls.streamStatus === 'live');
    const isScheduled = isClassScheduledFuture(cls);
    const isShort = cls.category === 'Shorts' || cls.contentType === 'short';
    const progressSec = interactions[cls.id]?.watchProgressSeconds || 0;
    const totalSec = cls.durationSeconds || 2700;
    const progressPercent =
      progressSec > 5 ? Math.min(100, Math.round((progressSec / totalSec) * 100)) : 0;
    const posterTheme = getSubjectPosterTheme(cls.subjectName);

    return (
      <div
        className={`relative w-full aspect-video overflow-hidden bg-slate-900 select-none ${
          compact ? 'rounded-xl' : 'sm:rounded-2xl'
        }`}
      >
        {thumbSrc && !isFailed ? (
          <img
            src={thumbSrc}
            alt={cls.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailedThumbnails((prev) => ({ ...prev, [cls.id]: true }))}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${posterTheme.gradient} p-3.5 sm:p-5 flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between gap-2 relative z-10">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider ${posterTheme.accent}`}
              >
                {posterTheme.badge}
              </span>
              {cls.featured && (
                <span className="bg-white/15 backdrop-blur-xs text-amber-300 text-[9px] font-black px-2 py-0.5 rounded">
                  ⭐ FEATURED
                </span>
              )}
            </div>

            <div className="my-auto py-1 relative z-10">
              <h4
                className={`font-black text-white leading-snug line-clamp-2 drop-shadow ${
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                }`}
              >
                {cls.title}
              </h4>
            </div>

            <div className="flex items-center justify-between gap-2 relative z-10 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-[10px]">
                  {cls.teacherName?.charAt(0) || 'R'}
                </span>
                <span className="truncate max-w-[140px]">{cls.teacherName}</span>
              </div>
              {!compact && (
                <span className="text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                  {cls.subjectName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Center Subtle Play Affordance on Hover */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-black/65 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white opacity-90 group-hover:scale-110 transition-transform shadow-lg">
            {cls.isVip && !userCanAccess(cls) ? (
              <Lock className="w-5 h-5 text-amber-400" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Top-Left VIP / Free Pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          {cls.isVip ? (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Crown className="w-3 h-3" /> VIP
            </span>
          ) : (
            <span className="bg-emerald-600/95 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              FREE
            </span>
          )}
          {isShort && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              SHORTS
            </span>
          )}
        </div>

        {/* Bottom-Right Duration or LIVE Badge */}
        <div className="absolute bottom-2 right-2 z-10">
          {isScheduled ? (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Clock className="w-3 h-3" /> UPCOMING
            </span>
          ) : isCurrentlyLive ? (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
            </span>
          ) : (
            <span className="bg-black/85 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tight flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-white" /> VIDEO
            </span>
          )}
        </div>

        {/* Bottom Red Watch Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-10">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors pb-16 ${
        darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Floating Toast Notification */}
      {speedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-amber-300 border border-amber-500/40 font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <span>{speedToast}</span>
        </div>
      )}

      {/* ===================================================================
          1. STICKY TOP NAVIGATION BAR (Inside Live Section)
         =================================================================== */}
      <div
        className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          darkMode
            ? 'bg-[#0f0f0f]/95 border-stone-800 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
          {/* Left: App Brand Logo & Live Identity */}
          {selectedClass ? (
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              className={`min-h-[44px] px-2.5 rounded-xl flex items-center gap-2 font-black text-xs sm:text-sm cursor-pointer transition-colors ${
                darkMode ? 'hover:bg-stone-800 text-white' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5 text-red-600" />
              <span>वापस सभी वीडियो पर (All Videos)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-xs">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base sm:text-lg tracking-tight">
                    BSEB GURU
                  </span>
                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                    LIVE
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold block ${
                    darkMode ? 'text-stone-400' : 'text-slate-500'
                  }`}
                >
                  Bihar Board 10th Video Library
                </span>
              </div>
            </div>
          )}

          {/* Center / Expandable Search Input */}
          <div className={`flex-1 max-w-md mx-2 ${searchOpen ? 'block' : 'hidden md:block'}`}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedClass) setSelectedClass(null);
                }}
                placeholder="क्लास, विषय या शिक्षक का नाम खोजें..."
                className={`w-full pl-9 pr-8 py-2 rounded-full text-xs font-medium border focus:outline-none focus:border-red-600 transition-colors ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-400'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons: Mobile Search, Live Count, Theme, Saved */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`md:hidden min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center cursor-pointer ${
                darkMode ? 'hover:bg-stone-800 text-stone-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="खोजें (Search)"
            >
              <Search className="w-5 h-5" />
            </button>

            {liveNowCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null);
                  setActiveCategory('Live');
                }}
                className="hidden sm:flex items-center gap-1.5 bg-red-600/10 text-red-600 border border-red-600/30 px-2.5 py-1.5 rounded-full text-xs font-black cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{liveNowCount} LIVE</span>
              </button>
            )}

            {/* Light / Dark Mode Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                darkMode
                  ? 'hover:bg-stone-800 text-amber-400'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title={darkMode ? 'लाइट मोड (Light Mode)' : 'डार्क मोड (Dark Mode)'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Saved / Profile Quick Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedClass(null);
                setActiveCategory(activeCategory === 'Saved' ? 'All' : 'Saved');
              }}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="सेव किए गए वीडियो"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Category Chips Bar */}
        {!selectedClass && (
          <div
            className={`max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t ${
              darkMode ? 'border-stone-800/80' : 'border-slate-100'
            }`}
          >
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(chip.id);
                    setVisibleCount(100);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? darkMode
                        ? 'bg-white text-black font-black shadow-xs'
                        : 'bg-slate-900 text-white font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800/90 text-stone-200 hover:bg-stone-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {chip.hindi}
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-300 dark:bg-stone-700 mx-1 shrink-0" />

            {/* Subject Filter Chips */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {availableSubjects.map((subj) => {
                const active = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(subj);
                      setVisibleCount(100);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      active
                        ? 'bg-red-600 text-white font-black'
                        : darkMode
                        ? 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {subj === 'all' ? 'सभी विषय' : subj}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================
          2. DEDICATED VIDEO PLAYER PAGE (When a Video is Selected)
         =================================================================== */}
      {selectedClass ? (
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:p-5">
          {/* Left 2 Columns: Video Player + Info + Actions + Description */}
          <div className="lg:col-span-2 space-y-3">
            {/* Player Container */}
            <div
              ref={playerContainerRef}
              onClick={() => {
                if (isFullscreen) resetControlsTimer();
              }}
              className={
                isFullscreen
                  ? 'fixed inset-0 z-50 bg-black w-screen h-screen flex flex-col justify-center overflow-hidden'
                  : 'sticky top-14 z-20 lg:static bg-black w-full lg:rounded-2xl overflow-hidden shadow-xl'
              }
            >
              {/* Scheduled Countdown Screen if Scheduled in Future */}
              {isClassScheduledFuture(selectedClass) ? (
                <ScheduledCountdownScreen
                  selectedClass={selectedClass}
                  isAdmin={isAdmin}
                  onStartLiveNow={() => {
                    updateLiveClass(selectedClass.id, {
                      publishType: 'instant',
                      isLive: true,
                      streamStatus: 'live',
                      scheduledDateTime: new Date().toISOString()
                    });
                  }}
                  onCountdownFinished={() =>
                    setCountdownDoneIds((prev) => ({ ...prev, [selectedClass.id]: true }))
                  }
                />
              ) : getPlaybackMode(selectedClass) === 'ai_board' ? (
                /* 1. Smart AI Board Interactive Lecture Player (Stutter-Free Chunked TTS + Smooth Clock) */
                <div className="w-full bg-black flex items-center justify-center p-1 sm:p-2">
                  <SmartAiBoardPlayer classItem={selectedClass} />
                </div>
              ) : getPlaybackMode(selectedClass) === 'native_video' ? (
                /* 2. Native HTML5 <video> Player (for Uploaded MP4/WebM & HLS .m3u8 Streams) */
                <div
                  className={`relative w-full bg-black flex flex-col justify-center ${
                    isFullscreen ? 'flex-1 h-full' : 'aspect-video'
                  }`}
                >
                  <video
                    ref={nativeVideoRef}
                    src={selectedClass.playbackUrl || selectedClass.youtubeUrl}
                    poster={selectedClass.thumbnailUrl || undefined}
                    playsInline
                    autoPlay
                    onPlay={() => setIsNativePlaying(true)}
                    onPause={() => setIsNativePlaying(false)}
                    onLoadedMetadata={(e) => {
                      const vid = e.currentTarget;
                      setNativeDuration(vid.duration || selectedClass.durationSeconds || 0);
                      const savedPos = initialResumeSecondsRef.current;
                      if (savedPos > 5 && (!vid.duration || savedPos < vid.duration - 10)) {
                        vid.currentTime = savedPos;
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const vid = e.currentTarget;
                      setNativeCurrentTime(vid.currentTime);
                    }}
                    className="w-full h-full object-contain"
                  >
                    {selectedClass.captionsUrl && captionsEnabled && (
                      <track
                        kind="subtitles"
                        src={selectedClass.captionsUrl}
                        srcLang="hi"
                        label="हिन्दी"
                        default
                      />
                    )}
                  </video>

                  {/* Custom Video Control Bar Overlay */}
                  <div className="bg-gradient-to-t from-black/95 via-black/75 to-transparent p-2.5 sm:p-3 space-y-2 text-white">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span>{formatTimeDisplay(nativeCurrentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={nativeDuration || 100}
                        value={nativeCurrentTime}
                        onChange={(e) => {
                          const nextTime = Number(e.target.value);
                          setNativeCurrentTime(nextTime);
                          if (nativeVideoRef.current) {
                            nativeVideoRef.current.currentTime = nextTime;
                          }
                        }}
                        className="flex-1 h-1.5 accent-red-600 cursor-pointer"
                      />
                      <span>{formatTimeDisplay(nativeDuration)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const v = nativeVideoRef.current;
                            if (!v) return;
                            if (v.paused) v.play();
                            else v.pause();
                          }}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
                          title={isNativePlaying ? 'Pause' : 'Play'}
                        >
                          {isNativePlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const v = nativeVideoRef.current;
                            if (!v) return;
                            v.muted = !v.muted;
                            setIsNativeMuted(v.muted);
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                          title={isNativeMuted ? 'Unmute' : 'Mute'}
                        >
                          {isNativeMuted ? (
                            <VolumeX className="w-4 h-4 text-red-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isNativeMuted ? 0 : nativeVolume}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNativeVolume(val);
                            setIsNativeMuted(val === 0);
                            if (nativeVideoRef.current) {
                              nativeVideoRef.current.volume = val;
                              nativeVideoRef.current.muted = val === 0;
                            }
                          }}
                          className="w-16 sm:w-20 h-1 accent-white cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {selectedClass.captionsUrl && (
                          <button
                            type="button"
                            onClick={() => setCaptionsEnabled(!captionsEnabled)}
                            className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer ${
                              captionsEnabled
                                ? 'bg-red-600 text-white'
                                : 'bg-white/15 text-stone-300'
                            }`}
                            title="Subtitles / Captions"
                          >
                            CC
                          </button>
                        )}

                        {pipSupported && (
                          <button
                            type="button"
                            onClick={handleTogglePiP}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                            title="Picture-in-Picture (PiP)"
                          >
                            <PictureInPicture2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          title="Fullscreen"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                          ) : (
                            <Maximize className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. Stable Official YouTube Video Embed Player */
                <StableYouTubePlayer
                  classId={selectedClass.id}
                  youtubeUrl={selectedClass.youtubeUrl}
                  playlistId={selectedClass.youtubePlaylistId}
                  title={selectedClass.title}
                  isLive={Boolean(selectedClass.isLive || selectedClass.streamStatus === 'live')}
                  initialStartSeconds={initialResumeSecondsRef.current}
                  useNoCookie={useNoCookie}
                  playbackSpeed={playbackSpeed}
                  isFullscreen={isFullscreen}
                  onToggleNoCookie={() => setUseNoCookie((prev) => !prev)}
                />
              )}

              {/* Speed & Mode Helper Strip inside Player Card */}
              {!isFullscreen && getPlaybackMode(selectedClass) !== 'ai_board' && (
                <div className="bg-stone-950 text-stone-300 px-3 py-2 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] font-black text-amber-400 flex items-center gap-1 shrink-0">
                      <Gauge className="w-3.5 h-3.5" /> स्पीड:
                    </span>
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSetSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-black cursor-pointer transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getPlaybackMode(selectedClass) === 'youtube' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setUseNoCookie((prev) => !prev)}
                          className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded-lg border border-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          <span>{useNoCookie ? 'प्राइवेसी मोड' : 'स्टैंडर्ड मोड'}</span>
                        </button>
                        <a
                          href={getYouTubeDirectWatchUrl(
                            selectedClass.youtubeUrl,
                            selectedClass.youtubePlaylistId
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>YouTube</span>
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="bg-stone-800 hover:bg-stone-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize className="w-3 h-3" />
                      <span>फुल-स्क्रीन</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Metadata, Channel Bar, Engagement Action Buttons & Description */}
            <div className="px-3 sm:px-1 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(selectedClass.isLive || selectedClass.streamStatus === 'live') && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                    </span>
                  )}
                  <span className="bg-red-600/10 text-red-600 text-[11px] font-extrabold px-2 py-0.5 rounded">
                    #{selectedClass.subjectName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      darkMode ? 'bg-stone-800 text-stone-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedClass.category || 'Classes'}
                  </span>
                </div>

                <h1 className="text-base sm:text-lg font-black leading-snug">
                  {selectedClass.title}
                </h1>

                <div
                  className={`text-xs flex items-center gap-2 flex-wrap ${
                    darkMode ? 'text-stone-400' : 'text-slate-500'
                  }`}
                >
                  <span>{formatViewsCount(selectedClass.viewsCount)} views</span>
                  <span>•</span>
                  <span>
                    {formatRelativeDate(
                      selectedClass.publishedAt || selectedClass.createdAt,
                      selectedClass.scheduledAt
                    )}
                  </span>
                  <span>•</span>
                  <LiveWatchTimerBadge
                    selectedClass={selectedClass}
                    user={user}
                    isVIP={isVIP}
                    isPaid={isPaid}
                    initialResumeSeconds={initialResumeSecondsRef.current}
                    onSyncFinalProgress={handleSaveWatchProgress}
                    hasNativeVideo={getPlaybackMode(selectedClass) === 'native_video'}
                  />
                </div>
              </div>

              {/* Channel / Teacher Row + Live Attendance Trigger */}
              <div
                className={`flex items-center justify-between gap-3 py-2.5 border-y ${
                  darkMode ? 'border-stone-800' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                    {selectedClass.teacherName?.charAt(0) || 'R'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm truncate flex items-center gap-1">
                      <span>{selectedClass.teacherName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        darkMode ? 'text-stone-400' : 'text-slate-500'
                      }`}
                    >
                      BSEB GURU (Official Bihar Board Class 10 Faculty)
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {activeAttendanceRecords.filter((r) => r.isOnline).length || 1} लाइव छात्र
                  </span>
                </button>
              </div>

              {/* Horizontal Action Buttons Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    interactions[selectedClass.id]?.liked
                      ? 'bg-red-600 text-white font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{(selectedClass.likesCount || 250).toLocaleString('en-IN')}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleSave(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                    interactions[selectedClass.id]?.saved
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>
                    {interactions[selectedClass.id]?.saved ? 'सेव किया गया' : 'सेव करें'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleShareVideo(selectedClass, e)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>शेयर करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>स्पीड & सेटिंग्स</span>
                </button>
              </div>

              {/* Expandable Description Box */}
              <div
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className={`p-3.5 rounded-2xl text-xs cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-stone-900 hover:bg-stone-800/90 text-stone-200'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-black mb-1">
                  <span>📚 क्लास विवरण और महत्वपूर्ण नोट्स ({selectedClass.subjectName})</span>
                  <span className="flex items-center gap-1 text-red-600 text-[11px]">
                    {descriptionExpanded ? (
                      <>
                        कम दिखाएं <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        पूरा पढ़ें <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </div>
                <p
                  className={`whitespace-pre-line leading-relaxed ${
                    descriptionExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {selectedClass.description ||
                    `${selectedClass.teacherName} द्वारा बिहार बोर्ड कक्षा 10वीं (${selectedClass.subjectName}) की विशेष परीक्षा उपयोगी क्लास।`}
                </p>
              </div>

              {/* Banner Ad below Video Player */}
              <div className="py-2 flex justify-center">
                <AdsterraBanner />
              </div>
            </div>
          </div>

          {/* Right Column: Related Videos */}
          <div className="px-3 sm:px-1 lg:px-0 mt-4 lg:mt-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-red-600 fill-red-600" />
                <span>अगली संबंधित क्लासेस (Up Next)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {relatedVideos.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleWatchClass(rel)}
                  className={`group flex gap-3 p-2 rounded-2xl cursor-pointer transition-colors ${
                    darkMode ? 'hover:bg-stone-900' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="w-40 sm:w-44 shrink-0">{renderThumbnail(rel, true)}</div>
                  <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                        {rel.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-1 truncate ${
                          darkMode ? 'text-stone-400' : 'text-slate-500'
                        }`}
                      >
                        {rel.teacherName} • {rel.subjectName}
                      </p>
                    </div>
                    <div
                      className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                        darkMode ? 'text-stone-400' : 'text-slate-500'
                      }`}
                    >
                      <span>{formatViewsCount(rel.viewsCount)} views</span>
                      <span>•</span>
                      <span>
                        {formatRelativeDate(rel.publishedAt || rel.createdAt, rel.scheduledAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================
            3. MAIN VIDEO FEED (When Browsing the Live Section)
           =================================================================== */
        <div className="max-w-7xl mx-auto px-0 sm:px-4 pt-2 sm:pt-4 space-y-5">
          {/* Continue Watching Strip */}
          {activeCategory === 'All' &&
            selectedSubject === 'all' &&
            !debouncedSearchQuery &&
            continueWatchingList.length > 0 && (
              <div className="px-3 sm:px-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    <span>देखना जारी रखें (Continue Watching)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('Continue')}
                    className="text-[11px] font-bold text-red-600 cursor-pointer"
                  >
                    सभी देखें →
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {continueWatchingList.slice(0, 5).map((cw) => {
                    const sec = interactions[cw.id]?.watchProgressSeconds || 0;
                    return (
                      <div
                        key={`cw_${cw.id}`}
                        onClick={() => handleWatchClass(cw)}
                        className={`w-56 sm:w-64 shrink-0 rounded-2xl overflow-hidden border p-2 cursor-pointer group transition-all ${
                          darkMode
                            ? 'bg-stone-900 border-stone-800 hover:border-stone-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {renderThumbnail(cw, true)}
                        <div className="pt-2 px-1">
                          <h4 className="font-bold text-xs line-clamp-1">{cw.title}</h4>
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">
                            ⏱️ {formatTimeDisplay(sec)} से आगे देखें
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Video Feed Grid */}
          {filteredFeed.length === 0 ? (
            <div className="mx-3 sm:mx-0 p-8 sm:p-10 rounded-3xl border border-dashed border-slate-300 dark:border-stone-800 text-center space-y-3 my-6">
              <Video className="w-12 h-12 text-red-600 mx-auto opacity-80" />
              <h3 className="font-black text-base">इस श्रेणी में कोई वीडियो उपलब्ध नहीं है</h3>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedSubject('all');
                  setSearchQuery('');
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2.5 rounded-full text-xs cursor-pointer shadow-md"
              >
                सभी वीडियो दिखाएं (Reset Filters)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 sm:gap-6">
              {filteredFeed.slice(0, visibleCount).map((cls) => {
                const isSaved = Boolean(interactions[cls.id]?.saved);
                return (
                  <div
                    key={cls.id}
                    onClick={() => handleWatchClass(cls)}
                    className="group cursor-pointer flex flex-col"
                  >
                    {/* 16:9 Thumbnail */}
                    {renderThumbnail(cls, false)}

                    {/* Below Thumbnail: Avatar + Title/Metadata + 3-Dot Menu */}
                    <div className="flex items-start gap-3 px-3 sm:px-1 pt-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {cls.teacherName?.charAt(0) || 'R'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                          {cls.title}
                        </h3>
                        <div
                          className={`text-xs mt-1 flex items-center gap-1.5 flex-wrap leading-tight ${
                            darkMode ? 'text-stone-400' : 'text-slate-600'
                          }`}
                        >
                          <span className="font-medium">{cls.teacherName}</span>
                          <span>•</span>
                          <span className="font-semibold text-red-600 dark:text-amber-400">
                            {cls.subjectName}
                          </span>
                          <span>•</span>
                          <span>{formatViewsCount(cls.viewsCount)} views</span>
                          <span>•</span>
                          <span>
                            {formatRelativeDate(cls.publishedAt || cls.createdAt, cls.scheduledAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenClass(cls);
                        }}
                        className={`min-h-[44px] min-w-[44px] -mr-2 -mt-1 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                          darkMode
                            ? 'hover:bg-stone-800 text-stone-300'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="विकल्प (More Options)"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {isSaved && (
                      <div className="px-3 sm:px-1 pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Bookmark className="w-3 h-3 fill-current" /> Watch Later में सेव है
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Pagination Button */}
          {filteredFeed.length > visibleCount && (
            <div className="pt-4 pb-2 flex justify-center px-3">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className={`px-6 py-3 rounded-full text-xs font-black cursor-pointer border transition-all shadow-xs ${
                  darkMode
                    ? 'bg-stone-900 hover:bg-stone-800 text-white border-stone-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                और वीडियो लोड करें ({filteredFeed.length - visibleCount} बाकी हैं)
              </button>
            </div>
          )}

          {/* Banner Ad at bottom of Live Classes Feed */}
          <div className="px-3 pt-2 flex justify-center">
            <AdsterraBanner />
          </div>
        </div>
      )}

      {/* ===================================================================
          4. THREE-DOT (⋮) BOTTOM SHEET / ACTION MENU FOR EACH VIDEO
         =================================================================== */}
      {menuOpenClass && (
        <div
          onClick={() => setMenuOpenClass(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-4 space-y-2 shadow-2xl ${
              darkMode
                ? 'bg-stone-900 text-white border border-stone-800'
                : 'bg-white text-slate-900'
            }`}
          >
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-stone-700 rounded-full mx-auto mb-2 sm:hidden" />
            <div className="pb-2 border-b border-slate-200 dark:border-stone-800">
              <h4 className="font-black text-xs sm:text-sm line-clamp-1">{menuOpenClass.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                {menuOpenClass.teacherName} • {menuOpenClass.subjectName} •{' '}
                {menuOpenClass.duration || '45:20'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleWatchClass(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Play className="w-4 h-4 text-red-600" />
              <span>अभी वीडियो चलाएं (Play Now)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleToggleSave(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>
                {interactions[menuOpenClass.id]?.saved
                  ? 'सेव सूची (Watch Later) से हटाएं'
                  : 'बाद में देखने के लिए सेव करें (Save to Watch Later)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleToggleLike(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>
                {interactions[menuOpenClass.id]?.liked
                  ? 'लाइक हटाएं (Unlike)'
                  : 'वीडियो लाइक करें (Like)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleShareVideo(menuOpenClass);
                setMenuOpenClass(null);
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>दोस्तों के साथ शेयर करें (Share)</span>
            </button>

            {(interactions[menuOpenClass.id]?.watchProgressSeconds || 0) > 0 && (
              <button
                type="button"
                onClick={() => {
                  saveInteraction(menuOpenClass.id, {
                    watchProgressSeconds: 0,
                    completed: false
                  });
                  setSpeedToast('वॉच हिस्ट्री प्रोग्रेस रीसेट कर दी गई');
                  setTimeout(() => setSpeedToast(''), 2000);
                  setMenuOpenClass(null);
                }}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>शुरू से देखें (Reset Watch Progress)</span>
              </button>
            )}

            {/* Admin Quick Moderation inside 3-dot Menu */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-500 px-3">
                  Admin Quick Controls
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextLive = !menuOpenClass.isLive;
                    updateLiveClass(menuOpenClass.id, {
                      isLive: nextLive,
                      streamStatus: nextLive ? 'live' : 'ended',
                      category: nextLive ? 'Live' : 'Classes'
                    });
                    setMenuOpenClass(null);
                  }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-red-500 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>
                    {menuOpenClass.isLive
                      ? '⏹️ लाइव स्ट्रीम समाप्त करें (End Live)'
                      : '🔴 अभी लाइव स्ट्रीम शुरू करें (Go Live)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateLiveClass(menuOpenClass.id, { featured: !menuOpenClass.featured });
                    setMenuOpenClass(null);
                  }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-amber-500 hover:bg-slate-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Pin className="w-4 h-4" />
                  <span>
                    {menuOpenClass.featured ? 'फीचर्ड से हटाएं' : '⭐ फीचर्ड में पिन करें'}
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpenClass(null)}
              className="w-full min-h-[44px] mt-1 rounded-xl bg-slate-100 dark:bg-stone-800 font-black text-xs cursor-pointer"
            >
              बंद करें (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          5. VIP LOCKED CLASS PROMPT MODAL
         =================================================================== */}
      {lockedClassPrompt && (
        <div
          onClick={() => setLockedClassPrompt(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-center text-white shadow-2xl space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black">यह प्रीमियम (VIP) क्लास है!</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              <b>"{lockedClassPrompt.title}"</b> केवल पेड VIP बैच के छात्रों के लिए उपलब्ध है।
            </p>
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLockedClassPrompt(null);
                  onOpenVip();
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black py-3 rounded-xl text-xs cursor-pointer shadow-lg"
              >
                👑 अभी VIP बैच जॉइन करें (₹299)
              </button>
              <a
                href={`https://wa.me/91${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `नमस्ते सर! मुझे "${lockedClassPrompt.title}" VIP क्लास अनलॉक करनी है।`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp सहायता ({whatsappNumber})</span>
              </a>
              <button
                type="button"
                onClick={() => setLockedClassPrompt(null)}
                className="w-full bg-stone-800 text-stone-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                वापस जाएँ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          6. VIDEO SETTINGS / VOICE TRANSLATION & SPEED MODAL
         =================================================================== */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-sm">वीडियो सेटिंग्स, स्पीड & भाषा (Audio/CC)</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <h5 className="font-black text-xs text-white">
                  ⚡ स्मूथ एचडी प्लेबैक (Zero-Stutter Engine)
                </h5>
                <p className="text-[10px] text-stone-400">
                  बिना रुके लगातार वीडियो और बोर्ड लेक्चर चलाने के लिए ऑप्टिमाइज़्ड
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                ✓ सक्रिय
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400">
                प्लेबैक स्पीड (Playback Speed):
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSetSpeed(spd)}
                    className={`py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-stone-300 space-y-1.5">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4" /> ऑडियो ट्रैक और सबटाइटल (Captions):
              </div>
              <p className="text-[11px] leading-relaxed">
                प्लेयर में <b>CC</b> या <b>⚙️ Settings</b> आइकन दबाकर आप हिंदी/अंग्रेजी ऑडियो ट्रैक और सबटाइटल बदल सकते हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              बंद करें (Done)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          7. CLASS ATTENDANCE & LIVE WATCH TIME MODAL
         =================================================================== */}
      {selectedClass && (
        <ClassAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          classTitle={selectedClass.title}
          isLive={Boolean(selectedClass.isLive || selectedClass.streamStatus === 'live')}
          activeRecords={activeAttendanceRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          currentStudentId={user?.email || (user as any)?.uid || 'student'}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
