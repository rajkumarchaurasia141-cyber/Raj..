import React, { useState, useEffect, useRef } from 'react';
import { Video, Play, Pause, RotateCcw, Volume2, Users, Radio, Sparkles, ArrowLeft, Trash2, CheckCircle2, Calendar, Lock, Unlock } from 'lucide-react';
import { useData } from '../context/DataContext';

interface AiTeacherStudioViewProps {
  onBack: () => void;
}

interface AiVideoItem {
  id: string;
  title: string;
  teacher: 'male' | 'female';
  type: 'live' | 'recorded';
  subjectName: string;
  isVip: boolean;
  scheduledAt: string;
  script: string;
  createdAt: string;
}

export function AiTeacherStudioView({ onBack }: AiTeacherStudioViewProps) {
  const { addLiveClass } = useData();
  const [activeTab, setActiveTab] = useState<'admin' | 'player'>('admin');
  
  // Admin form state
  const [title, setTitle] = useState('वास्तविक संख्याएँ (Real Numbers) - Class 10th Math');
  const [teacher, setTeacher] = useState<'male' | 'female'>('male');
  const [type, setType] = useState<'live' | 'recorded'>('live');
  const [subjectName, setSubjectName] = useState('गणित (Maths)');
  const [isVip, setIsVip] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('आज शाम 7:00 बजे');
  const [script, setScript] = useState('【 प्रश्न 】: यूक्लिड विभाजन एल्गोरिथ्म से HCF कैसे निकालते हैं?\n【 उत्तर 】: a = bq + r, जहाँ 0 ≤ r < b होता है।\nमुख्य बिंदु: म.स. और ल.स. का गुणनफल = दोनों संख्याओं का गुणनफल होता है।');
  const [msg, setMsg] = useState('');

  // Saved videos list
  const [videos, setVideos] = useState<AiVideoItem[]>([
    {
      id: '1',
      title: 'वास्तविक संख्याएँ (Real Numbers) - Class 10th Math',
      teacher: 'male',
      type: 'live',
      subjectName: 'गणित (Maths)',
      isVip: false,
      scheduledAt: 'आज शाम 7:00 बजे',
      script: '【 प्रश्न 】: यूक्लिड विभाजन एल्गोरिथ्म से HCF कैसे निकालते हैं?\n【 उत्तर 】: a = bq + r, जहाँ 0 ≤ r < b होता है।\nमुख्य बिंदु: म.स. और ल.स. का गुणनफल = दोनों संख्याओं का गुणनफल होता है।',
      createdAt: '2026-10-03'
    }
  ]);

  // Active playing video
  const [currentVideo, setCurrentVideo] = useState<AiVideoItem>(videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [watchCount, setWatchCount] = useState(1842);
  const [typedLength, setTypedLength] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Timer & Typing animation while playing
  useEffect(() => {
    let interval: any;
    let typeInterval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        if (Math.random() > 0.5) {
          setWatchCount(prev => prev + Math.floor(Math.random() * 7) - 3);
        }
      }, 1000);

      typeInterval = setInterval(() => {
        setTypedLength(prev => {
          if (prev >= currentVideo.script.length) return prev;
          return prev + 3; // type 3 chars at a time
        });
      }, 80);
    }
    return () => {
      clearInterval(interval);
      clearInterval(typeInterval);
    };
  }, [isPlaying, currentVideo.script]);

  // Handle Text-to-Speech playback with gender voice pitch
  const handlePlaySpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    setTypedLength(0);

    const utterance = new SpeechSynthesisUtterance(currentVideo.script);
    utterance.lang = 'hi-IN'; // Hindi voice
    utterance.rate = 0.95;
    // Male (Raj Sir) -> lower pitch, Female (KK Mam) -> higher pitch
    utterance.pitch = currentVideo.teacher === 'female' ? 1.3 : 0.85;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateAndPublish = async () => {
    if (!title.trim() || !script.trim()) {
      setMsg('कृपया शीर्षक और स्क्रिप्ट दोनों भरें!');
      return;
    }

    const newVideo: AiVideoItem = {
      id: Date.now().toString(),
      title,
      teacher,
      type,
      subjectName,
      isVip,
      scheduledAt,
      script,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newVideo, ...videos];
    setVideos(updated);
    setCurrentVideo(newVideo);
    setMsg('✅ AI वीडियो सफलतापूर्वक जनरेट हो गया!');
    setTimeout(() => setMsg(''), 4000);
    setActiveTab('player');
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    if (currentVideo.id === id && updated.length > 0) {
      setCurrentVideo(updated[0]);
    }
  };

  const teacherName = currentVideo.teacher === 'male' ? 'Raj Sir' : 'KK Mam';
  const teacherTitle = currentVideo.teacher === 'male' ? 'Raj Sir • M.Sc B.Ed • AI Math Expert' : 'KK Mam • M.Sc Ph.D • AI Science Expert';
  const teacherAvatar = currentVideo.teacher === 'male' 
    ? 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png' 
    : 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png';

  // Helper to colorize text on digital board (Questions in red, Answers in blue, key points in amber)
  const renderColoredScript = (text: string) => {
    const activeText = text.substring(0, isPlaying ? typedLength : text.length);
    const lines = activeText.split('\n');

    return lines.map((line, lIdx) => {
      let textColor = 'text-emerald-100';
      if (line.includes('【 प्रश्न') || line.includes('प्रश्न:')) {
        textColor = 'text-rose-400 font-black'; // Questions in red
      } else if (line.includes('【 उत्तर') || line.includes('उत्तर:')) {
        textColor = 'text-blue-400 font-bold'; // Answers in blue
      } else if (line.includes('मुख्य बिंदु') || line.includes('★') || line.includes('ट्रिक')) {
        textColor = 'text-amber-300 font-bold'; // Key points in amber
      }

      return (
        <div key={`board-line-${lIdx}`} className={`py-0.5 leading-relaxed ${textColor}`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-5 pb-24 animate-fade-in font-sans">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>होम पर वापस जाएं</span>
      </button>

      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
          <span>🤖 AI Teacher Video Studio & Smart Board</span>
          <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
        </h2>
        <p className="text-xs text-stone-500">बिहार बोर्ड 10वीं • डिजिटल स्मार्ट बोर्ड लेक्चर जनरेटर & लाइव पब्लिशर</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-stone-200/80 p-1.5 rounded-2xl">
        <button 
          onClick={() => { setActiveTab('admin'); window.speechSynthesis?.cancel(); setIsPlaying(false); }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'admin' 
              ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
              : 'text-stone-700 hover:bg-white/50'
          }`}
        >
          <span>👨‍🏫 Studio Admin (शेड्यूल & पब्लिश)</span>
        </button>

        <button 
          onClick={() => setActiveTab('player')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'player' 
              ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
              : 'text-stone-700 hover:bg-white/50'
          }`}
        >
          <span>🖥️ Smart Board Preview</span>
        </button>
      </div>

      {/* ADMIN TAB */}
      {activeTab === 'admin' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xl border border-stone-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Chapter / Lecture Title (शीर्षक)</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
              placeholder="Ex: वास्तविक संख्याएँ - VVI MCQ & Theory"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Teacher (शिक्षक)</label>
              <select 
                value={teacher} 
                onChange={e => setTeacher(e.target.value as any)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
              >
                <option value="male">👨‍🏫 Raj Sir (Male Voice)</option>
                <option value="female">👩‍🏫 KK Mam (Female Voice)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Type (प्रकार)</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
              >
                <option value="live">🔴 Live Class (लाइव)</option>
                <option value="recorded">▶️ Recorded Class (रिकॉर्डेड)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Access (फ्री / पेड)</label>
              <select 
                value={isVip ? 'vip' : 'free'} 
                onChange={e => setIsVip(e.target.value === 'vip')}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
              >
                <option value="free">🎁 Free (सभी के लिए मुफ्त)</option>
                <option value="vip">🔒 VIP Paid (केवल क्रैश कोर्स)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Subject (विषय)</label>
              <select 
                value={subjectName} 
                onChange={e => setSubjectName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
              >
                <option value="गणित (Maths)">गणित (Maths)</option>
                <option value="विज्ञान (Science)">विज्ञान (Science)</option>
                <option value="हिन्दी (Hindi)">हिन्दी (Hindi)</option>
                <option value="संस्कृत (Sanskrit)">संस्कृत (Sanskrit)</option>
                <option value="सामाजिक विज्ञान">सामाजिक विज्ञान</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Schedule Time (शेड्यूल समय)</label>
              <input 
                value={scheduledAt} 
                onChange={e => setScheduledAt(e.target.value)} 
                className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50"
                placeholder="Ex: आज शाम 7:00 बजे"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Script / Lecture Content (जो डिजिटल बोर्ड पर टाइप होगा और शिक्षक बोलेगा):
            </label>
            <textarea 
              rows={6} 
              value={script} 
              onChange={e => setScript(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-stone-50 leading-relaxed font-mono"
              placeholder="【 प्रश्न 】: ... &#10;【 उत्तर 】: ... &#10;मुख्य बिंदु: ..."
            ></textarea>
            <p className="text-[11px] text-stone-500 mt-1">
              💡 टिप: <b>【 प्रश्न 】</b> लिखने पर लाल रंग, <b>【 उत्तर 】</b> लिखने पर नीला रंग तथा <b>मुख्य बिंदु</b> लिखने पर सुनहरा रंग डिजिटल बोर्ड पर दिखेगा।
            </p>
          </div>

          <button 
            onClick={handleGenerateAndPublish}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white p-4 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>✅ AI वीडियो जनरेट करें & लाइव सेक्शन में पब्लिश करें</span>
          </button>

          {msg && (
            <p className="text-center font-bold text-emerald-600 text-xs animate-bounce">{msg}</p>
          )}

          {/* Generated Videos List */}
          <div className="pt-4 border-t border-stone-200 space-y-2">
            <h4 className="font-black text-xs text-stone-800 uppercase tracking-wider">Generated & Published AI Lectures ({videos.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {videos.map(v => (
                <div 
                  key={v.id}
                  onClick={() => { setCurrentVideo(v); setActiveTab('player'); }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentVideo.id === v.id ? 'bg-purple-50 border-purple-400 shadow-xs' : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                      ▶
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-stone-900 truncate">{v.title}</h5>
                      <p className="text-[10px] text-stone-500 flex items-center gap-2">
                        <span>{v.teacher === 'male' ? 'Raj Sir' : 'KK Mam'}</span>
                        <span>•</span>
                        <span className="text-purple-700 font-semibold">{v.subjectName}</span>
                        <span>•</span>
                        <span>{v.scheduledAt}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={(e) => handleDeleteVideo(v.id, e)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAYER / DIGITAL SMART BOARD TAB */}
      {activeTab === 'player' && (
        <div className="bg-[#0b1d16] rounded-3xl overflow-hidden text-white border-4 border-emerald-900 shadow-2xl">
          {/* Top Smart Board Status Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950 text-[11px] font-black tracking-wider border-b border-emerald-800/80">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              {currentVideo.type === 'live' ? '🔴 LIVE SMART CLASS' : '▶ RECORDED LECTURE'}
            </span>
            <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              📚 {currentVideo.subjectName} • {currentVideo.scheduledAt}
            </span>
            <span className="text-emerald-300 font-semibold">
              👁️ {watchCount.toLocaleString()} watching • ⏱️ {duration}s
            </span>
          </div>

          {/* Main Smart Board Stage */}
          <div className="flex flex-col sm:flex-row h-auto sm:h-[420px]">
            {/* Teacher Sidebar */}
            <div className="w-full sm:w-[32%] bg-gradient-to-b from-[#112a20] to-[#081510] flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-emerald-900 text-center">
              <div className="relative">
                <img 
                  src={teacherAvatar} 
                  alt={teacherName} 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 transition-all object-cover bg-white ${
                    isPlaying ? 'border-emerald-400 ring-4 ring-emerald-400/30 scale-105 animate-pulse' : 'border-amber-500'
                  }`}
                />
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#111] ${
                  isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'
                }`}></div>
              </div>

              <h3 className="font-black text-sm text-white mt-3">{teacherName}</h3>
              <p className="text-[10px] text-emerald-300">{teacherTitle}</p>

              {/* Speaking Voice Wave */}
              <div className={`mt-3 px-3 py-1.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1.5 ${
                isPlaying ? 'bg-emerald-500 text-stone-950 animate-bounce' : 'bg-stone-800 text-stone-400'
              }`}>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlaying ? `${teacherName} बोल रहे हैं...` : 'स्टार्ट करने के लिए प्ले दबाएं'}</span>
              </div>
            </div>

            {/* Digital Smart Board Screen (Green/Navy Board with typing text) */}
            <div className="flex-1 bg-[#0f281e] p-5 flex flex-col justify-between relative overflow-hidden font-mono border-l-2 border-emerald-800">
              {/* Board Header Frame */}
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-emerald-300 font-bold ml-2">Smart Digital Whiteboard • BSEB 10th</span>
                </div>
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 font-sans font-bold">
                  {currentVideo.isVip ? '🔒 VIP Paid' : '🎁 Free Lecture'}
                </span>
              </div>

              {/* Smart Board Text Typing Area */}
              <div className="bg-[#081611]/90 border border-emerald-800/80 rounded-2xl p-4 flex-1 overflow-y-auto shadow-inner space-y-2">
                <div className="text-amber-300 font-bold text-xs border-b border-emerald-900/50 pb-1 mb-2 font-sans">
                  📌 {currentVideo.title}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed tracking-wide">
                  {renderColoredScript(currentVideo.script)}
                </div>
              </div>

              {/* Controls Footer */}
              <div className="pt-3 flex items-center justify-between border-t border-emerald-800/60 mt-3 font-sans">
                <button
                  onClick={handlePlaySpeech}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isPlaying 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'आवाज़ रोकें (Pause)' : `▶ ${teacherName} की आवाज़ सुनें (Play)`}</span>
                </button>

                <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>डिजिटल बोर्ड ऑडियो इंजन</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
