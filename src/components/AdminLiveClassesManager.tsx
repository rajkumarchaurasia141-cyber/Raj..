import React, { useState, useMemo, useRef } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Youtube,
  CheckCircle,
  AlertCircle,
  Radio,
  Calendar,
  PlaySquare,
  Clock,
  Edit3,
  Play,
  Square,
  Users
} from 'lucide-react';
import { useData, isAiStudioLectureItem } from '../context/DataContext';
import { LiveClass, LiveWatchRecord, LiveStreamStatus } from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { subscribeClassAttendance, DEFAULT_BATCH_STUDENTS } from '../services/attendanceTracker';
import {
  extractYouTubeVideoId,
  extractYouTubePlaylistId,
  isValidYouTubeUrlOrId,
  getYouTubeThumbnailUrl
} from '../utils/youtubeHelper';
import { triggerAutoContentNotification } from '../services/pushNotificationService';

const BIHAR_BOARD_SUBJECTS = [
  { value: 'गणित', label: '📐 गणित (Mathematics)' },
  { value: 'विज्ञान', label: '🔬 विज्ञान (Science)' },
  { value: 'सामाजिक विज्ञान', label: '🏛️ सामाजिक विज्ञान (Social Science)' },
  { value: 'हिन्दी', label: '📖 हिन्दी (Hindi)' },
  { value: 'संस्कृत', label: '🪔 संस्कृत (Sanskrit)' },
  { value: 'अंग्रेजी', label: '🔤 अंग्रेजी (English)' },
  { value: 'VVI & Trick Classes', label: '🔥 VVI & Trick Classes' },
  { value: 'सामान्य', label: '🎯 सामान्य / सभी विषय' }
];

export function AdminLiveClassesManager() {
  const { liveClasses: rawLiveClasses, addLiveClass, updateLiveClass, deleteLiveClass } = useData();
  const liveClasses = useMemo(
    () => (rawLiveClasses || []).filter((c) => !isAiStudioLectureItem(c)),
    [rawLiveClasses]
  );

  // Simple Original Form State: YouTube Link, Title, Subject, Mode (Live / Recorded / Schedule)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('गणित');
  const [classMode, setClassMode] = useState<'live' | 'recorded' | 'scheduled'>('live');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [scheduledAt, setScheduledAt] = useState('आज शाम 7:00 बजे');

  // Filter for existing classes list
  const [adminSubjectFilter, setAdminSubjectFilter] = useState<string>('all');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Attendance Modal state
  const [attendanceModalClass, setAttendanceModalClass] = useState<LiveClass | null>(null);
  const [activeRecords, setActiveRecords] = useState<LiveWatchRecord[]>([]);

  const formTopRef = useRef<HTMLFormElement>(null);

  const ytValidation = useMemo(() => {
    return isValidYouTubeUrlOrId(youtubeUrl);
  }, [youtubeUrl]);

  const autoPreviewThumb = useMemo(() => {
    return getYouTubeThumbnailUrl(youtubeUrl);
  }, [youtubeUrl]);

  React.useEffect(() => {
    if (!attendanceModalClass) {
      setActiveRecords([]);
      return;
    }
    const unsub = subscribeClassAttendance(attendanceModalClass.id, (records) => {
      setActiveRecords(records);
    });
    return () => unsub();
  }, [attendanceModalClass]);

  const handleScheduleChange = (dateVal: string, timeVal: string) => {
    setScheduledDate(dateVal);
    setScheduledTime(timeVal);
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const [hStr, mStr] = timeVal.split(':');
      let h = parseInt(hStr, 10);
      const m = mStr || '00';
      const ampm = h >= 12 ? 'शाम' : 'सुबह';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;

      let prefix = '';
      if (dateVal === today) prefix = 'आज';
      else if (dateVal === tomorrow) prefix = 'कल';
      else prefix = dateVal;

      setScheduledAt(`${prefix} ${ampm} ${h}:${m} बजे`);
    } catch {
      setScheduledAt(`${dateVal} ${timeVal}`);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setYoutubeUrl('');
    setTitle('');
    setSubjectName('गणित');
    setClassMode('live');
  };

  const handleEditClass = (cls: LiveClass) => {
    setEditingId(cls.id);
    setYoutubeUrl(cls.youtubeUrl || cls.playbackUrl || '');
    setTitle(cls.title || '');
    setSubjectName(cls.subjectName || 'गणित');
    if (cls.publishType === 'scheduled' || cls.streamStatus === 'scheduled') {
      setClassMode('scheduled');
      setScheduledAt(cls.scheduledAt || 'आज शाम 7:00 बजे');
    } else if (cls.isLive || cls.streamStatus === 'live') {
      setClassMode('live');
    } else {
      setClassMode('recorded');
    }
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLink = youtubeUrl.trim();

    if (!rawLink) {
      setErrorMsg('कृपया YouTube वीडियो का लिंक डालें।');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('कृपया वीडियो का टाइटल (Title) लिखें।');
      return;
    }

    const check = isValidYouTubeUrlOrId(rawLink);
    if (!check.valid) {
      setErrorMsg('कृपया सही YouTube वीडियो लिंक (जैसे youtu.be/... या youtube.com/watch?v=...) डालें।');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const ytId = extractYouTubeVideoId(rawLink);
      const ytPlaylistId = extractYouTubePlaylistId(rawLink);

      let normalizedUrl = rawLink;
      if (ytId && ytPlaylistId) {
        normalizedUrl = `https://www.youtube.com/watch?v=${ytId}&list=${ytPlaylistId}`;
      } else if (ytId) {
        normalizedUrl = `https://www.youtube.com/watch?v=${ytId}`;
      } else if (ytPlaylistId) {
        normalizedUrl = `https://www.youtube.com/playlist?list=${ytPlaylistId}`;
      }

      // Thumbnail automatically comes from YouTube server
      const autoThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';

      let finalScheduledDateTime = new Date().toISOString();
      if (classMode === 'scheduled') {
        const parsedDt = new Date(`${scheduledDate}T${scheduledTime}:00`);
        if (!isNaN(parsedDt.getTime())) {
          finalScheduledDateTime = parsedDt.toISOString();
        }
      }

      const isLiveNow = classMode === 'live';
      const isScheduled = classMode === 'scheduled';
      const effectiveStreamStatus: LiveStreamStatus = isScheduled
        ? 'scheduled'
        : isLiveNow
        ? 'live'
        : 'ended';

      const payload: Omit<LiveClass, 'id'> = {
        title: title.trim(),
        youtubeUrl: normalizedUrl,
        playbackUrl: normalizedUrl,
        thumbnailUrl: autoThumb,
        videoSourceType: 'youtube',
        contentType: isLiveNow ? 'live' : 'recorded',
        category: isLiveNow || isScheduled ? 'Live' : 'Classes',
        subjectName,
        ...(ytPlaylistId ? { youtubePlaylistId: ytPlaylistId } : {}),
        isPlaylist: Boolean(ytPlaylistId),
        teacherName: 'राज सर',
        scheduledAt: isScheduled
          ? scheduledAt.trim() || 'शेड्यूल्ड क्लास'
          : isLiveNow
          ? '🔴 अभी लाइव'
          : 'रिकॉर्डेड क्लास',
        isLive: isLiveNow,
        streamStatus: effectiveStreamStatus,
        publicationStatus: 'published',
        isVip: false,
        publishType: isScheduled ? 'scheduled' : 'instant',
        scheduledDateTime: finalScheduledDateTime,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        isUploaded: true
      };

      if (editingId) {
        await updateLiveClass(editingId, payload);
        setSuccessMsg(`✅ "${title.trim()}" अपडेट हो गया है और ऐप के लाइव सेक्शन में दिख रहा है!`);
      } else {
        await addLiveClass({
          ...payload,
          viewsCount: 1,
          likesCount: 0
        });
        triggerAutoContentNotification({
          contentType: 'video',
          contentId: `vid_${ytId || ytPlaylistId || Date.now()}`,
          subjectName,
          title: title.trim(),
          url: `/?tab=live`
        }).catch(() => {});

        setSuccessMsg('✅ YouTube वीडियो सीधे ऐप के लाइव सेक्शन में जोड़ दिया गया है!');
      }

      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLiveStatus = async (cls: LiveClass) => {
    const currentlyLive = cls.isLive || cls.streamStatus === 'live';
    const nextLive = !currentlyLive;
    await updateLiveClass(cls.id, {
      isLive: nextLive,
      streamStatus: nextLive ? 'live' : 'ended',
      contentType: nextLive ? 'live' : 'recorded',
      category: nextLive ? 'Live' : 'Classes',
      publishType: 'instant',
      publicationStatus: 'published',
      scheduledAt: nextLive ? '🔴 अभी लाइव' : 'रिकॉर्डेड क्लास'
    });
    setSuccessMsg(
      nextLive
        ? `🔴 "${cls.title}" अब लाइव (LIVE) कर दिया गया है!`
        : `📼 "${cls.title}" को रिकॉर्डेड वीडियो में बदल दिया गया है।`
    );
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (id: string, classTitle: string) => {
    if (window.confirm(`क्या आप "${classTitle}" को लाइव सेक्शन से हटाना चाहते हैं?`)) {
      await deleteLiveClass(id);
    }
  };

  const filteredClasses = liveClasses
    .filter((c) => {
      if (adminSubjectFilter !== 'all' && c.subjectName !== adminSubjectFilter) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.publishedAt || 0).getTime() -
        new Date(a.createdAt || a.publishedAt || 0).getTime()
    );

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 text-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
            <Youtube className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              YouTube लाइव & वीडियो क्लास (Admin)
            </h3>
            <p className="text-xs text-stone-400">
              केवल YouTube लिंक डालें, टाइटल लिखें और विषय चुनें — वीडियो सीधे YouTube सर्वर से आपके ऐप में चलेगा।
            </p>
          </div>
        </div>
        <div className="bg-stone-900 border border-stone-800 px-3.5 py-2 rounded-2xl text-xs font-bold text-stone-300">
          कुल वीडियो: <span className="text-amber-400 font-black">{liveClasses.length}</span>
        </div>
      </div>

      {/* Simple Original Form */}
      <form
        ref={formTopRef}
        onSubmit={handleSaveOrUpdate}
        className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>क्लास एडिट करें</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-amber-400" />
                <span>नया YouTube वीडियो / लाइव क्लास डालें</span>
              </>
            )}
          </h4>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1 rounded-xl font-bold cursor-pointer"
            >
              ✕ रद्द करें
            </button>
          )}
        </div>

        {/* 1. YouTube Link Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>1. YouTube वीडियो लिंक डालें (YouTube Link) *</span>
          </label>
          <input
            type="text"
            required
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/... या https://www.youtube.com/watch?v=..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
          />
          {youtubeUrl.trim() && (
            <div className="pt-1 flex items-center gap-3">
              {ytValidation.valid ? (
                <div className="flex items-center gap-2.5 bg-stone-900 border border-stone-800 p-2 rounded-xl">
                  {autoPreviewThumb && (
                    <img
                      src={autoPreviewThumb}
                      alt="YouTube Thumbnail"
                      className="w-20 aspect-video rounded-lg object-cover border border-stone-700 shrink-0"
                    />
                  )}
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✓ YouTube सर्वर से वीडियो और थंबनेल अपने-आप कनेक्ट हो गया
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-red-400 font-bold">
                  ⚠️ कृपया सही YouTube लिंक पेस्ट करें।
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2. Video Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-200 block">
            2. क्लास / वीडियो का टाइटल लिखें (Title) *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा: Class 10th गणित — त्रिकोणमिति VVI क्लास"
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* 3. Subject Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-200 block">
            3. कौन सा विषय है सेलेक्ट करें (Subject) *
          </label>
          <select
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
          >
            {BIHAR_BOARD_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Mode: Instant Live / Instant Recorded / Schedule */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-stone-200 block">
            4. क्लास कैसे डालना है चुनें (तुरंत लाइव / रिकॉर्डेड या शेड्यूल):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setClassMode('live')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                classMode === 'live'
                  ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Radio className={`w-4 h-4 shrink-0 ${classMode === 'live' ? 'text-red-500 animate-pulse' : 'text-stone-400'}`} />
              <div>
                <div className="text-xs font-black text-white">🔴 तुरंत लाइव (Live)</div>
                <div className="text-[10px] text-stone-400">अभी लाइव सेक्शन में चलेगा</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setClassMode('recorded')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                classMode === 'recorded'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Video className={`w-4 h-4 shrink-0 ${classMode === 'recorded' ? 'text-emerald-400' : 'text-stone-400'}`} />
              <div>
                <div className="text-xs font-black text-white">📼 तुरंत रिकॉर्डेड (Recorded)</div>
                <div className="text-[10px] text-stone-400">सामान्य YouTube वीडियो की तरह</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setClassMode('scheduled')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                classMode === 'scheduled'
                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${classMode === 'scheduled' ? 'text-amber-400' : 'text-stone-400'}`} />
              <div>
                <div className="text-xs font-black text-white">⏰ शेड्यूल करें (Schedule)</div>
                <div className="text-[10px] text-stone-400">तारीख और समय सेट करें</div>
              </div>
            </button>
          </div>

          {classMode === 'scheduled' && (
            <div className="mt-2 p-3.5 bg-stone-900 border border-amber-500/30 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">शेड्यूल तारीख (Date)</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleScheduleChange(e.target.value, scheduledTime)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">शेड्यूल समय (Time)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => handleScheduleChange(scheduledDate, e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
        >
          <Youtube className="w-5 h-5" />
          <span>
            {loading
              ? 'ऐप में जोड़ा जा रहा है...'
              : editingId
              ? 'बदलाव सेव करें (Update Class)'
              : 'ऐप के लाइव सेक्शन में डालें (Add to App)'}
          </span>
        </button>
      </form>

      {/* Added Videos List */}
      <div className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-red-500" />
            <span>ऐप के लाइव सेक्शन में मौजूद सभी वीडियो ({filteredClasses.length})</span>
          </h4>

          <select
            value={adminSubjectFilter}
            onChange={(e) => setAdminSubjectFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 font-bold"
          >
            <option value="all">सभी विषय ({liveClasses.length})</option>
            {BIHAR_BOARD_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              अभी कोई वीडियो नहीं जोड़ा गया है। ऊपर YouTube लिंक डालकर जोड़ें।
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const ytThumb = getYouTubeThumbnailUrl(cls.youtubeUrl);
              const thumbSrc = ytThumb || cls.thumbnailUrl;
              const isCurrentlyLive = cls.isLive || cls.streamStatus === 'live';

              return (
                <div
                  key={cls.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Auto YouTube Thumbnail */}
                    <div className="relative w-32 sm:w-36 aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0">
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={cls.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-900">
                          <Youtube className="w-6 h-6 text-red-500" />
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5">
                        {isCurrentlyLive ? (
                          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                          </span>
                        ) : cls.streamStatus === 'scheduled' ? (
                          <span className="bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            SCHEDULED
                          </span>
                        ) : (
                          <span className="bg-black/80 text-stone-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            RECORDED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-stone-800 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {cls.subjectName}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {cls.scheduledAt}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                        {cls.title}
                      </h5>
                    </div>
                  </div>

                  {/* Simple Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLiveStatus(cls)}
                      className={`text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${
                        isCurrentlyLive
                          ? 'bg-stone-800 text-red-400 border border-red-500/40'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {isCurrentlyLive ? (
                        <>
                          <Square className="w-3 h-3 fill-red-400" />
                          <span>लाइव रोकें</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>लाइव करें</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttendanceModalClass(cls)}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>छात्र</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditClass(cls)}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-2 rounded-xl border border-stone-700 cursor-pointer"
                      title="एडिट करें"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cls.id, cls.title)}
                      className="bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 p-2 rounded-xl border border-stone-700 cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Class Attendance Modal */}
      {attendanceModalClass && (
        <ClassAttendanceModal
          isOpen={!!attendanceModalClass}
          onClose={() => setAttendanceModalClass(null)}
          classTitle={attendanceModalClass.title}
          isLive={attendanceModalClass.isLive}
          activeRecords={activeRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          isAdmin={true}
        />
      )}
    </div>
  );
}
