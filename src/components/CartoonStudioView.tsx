import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Save, ArrowLeft, Trash2, Video, Bot } from 'lucide-react';

interface CartoonStudioViewProps {
  onBack: () => void;
}

interface CartoonVideoItem {
  id: number;
  title: string;
  script: string;
  teacher: 'sir' | 'mam';
}

export function CartoonStudioView({ onBack }: CartoonStudioViewProps) {
  const [title, setTitle] = useState('न्यूटन के गति के नियम (Newton\'s Laws)');
  const [script, setScript] = useState('हेलो दोस्तों! आज हम साइंस का एक बहुत ही शानदार टॉपिक पढ़ने वाले हैं—न्यूटन के गति के नियम। प्रथम नियम जड़त्व का नियम कहलाता है।');
  const [teacher, setTeacher] = useState<'sir' | 'mam'>('sir');
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationText, setDurationText] = useState('0 sec');
  const [bubbleText, setBubbleText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [savedVideos, setSavedVideos] = useState<CartoonVideoItem[]>([]);
  const [statusText, setStatusText] = useState('▶️ Professional AI Teacher Class Start');

  const toonRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<any>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load saved cartoons from localStorage
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cartoonVideos') || '[]');
      setSavedVideos(items);
    } catch {}
  }, []);

  // Professional AI Teacher Avatar Drawing on Canvas with Speaking Mouth Animation
  const drawProfessionalTeacher = (state: { mouth: number; blink: number; handY: number; jump: number; isSir: boolean; speaking: boolean }) => {
    const canvas = toonRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 320, 420);
    
    // Studio Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 420);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad; 
    ctx.fillRect(0, 0, 320, 420);

    // Studio Lighting glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath(); ctx.arc(160, 150, 120, 0, Math.PI * 2); ctx.fill();

    let baseY = 210 + state.jump;
    let x = 160;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x, 375, 55, 12, 0, 0, Math.PI * 2); ctx.fill();

    // Professional Suit / Blazer
    ctx.fillStyle = state.isSir ? '#1e3a8a' : '#831843'; // Navy blue blazer for Sir, Elegant maroon for Mam
    ctx.beginPath(); 
    ctx.moveTo(x - 55, baseY + 15); 
    ctx.lineTo(x + 55, baseY + 15); 
    ctx.lineTo(x + 40, baseY + 105); 
    ctx.lineTo(x - 40, baseY + 105); 
    ctx.closePath(); 
    ctx.fill();

    // Inner White Shirt & Tie / Collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(x - 18, baseY + 15); ctx.lineTo(x + 18, baseY + 15); ctx.lineTo(x, baseY + 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = state.isSir ? '#b91c1c' : '#4f46e5'; // Tie
    ctx.beginPath(); ctx.moveTo(x - 5, baseY + 25); ctx.lineTo(x + 5, baseY + 25); ctx.lineTo(x + 2, baseY + 70); ctx.lineTo(x - 2, baseY + 70); ctx.closePath(); ctx.fill();

    // Hands / Gesture
    ctx.fillStyle = '#ffdbac';
    let handAnim = state.speaking ? Math.sin(Date.now() / 90) * 12 : 0;
    ctx.beginPath(); ctx.arc(x - 65 + handAnim, baseY + 50, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 65, baseY + 45 + state.handY / 8, 15, 0, Math.PI * 2); ctx.fill();

    // Head (Professional Portrait Style)
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath(); ctx.arc(x, baseY - 15, 52, 0, Math.PI * 2); ctx.fill();

    // Hair Style
    ctx.fillStyle = state.isSir ? '#111827' : '#3d1c02';
    if (state.isSir) { 
      ctx.beginPath(); ctx.arc(x, baseY - 35, 50, Math.PI, 0); ctx.fill();
      ctx.fillRect(x - 52, baseY - 50, 104, 25);
    } else { 
      ctx.beginPath(); ctx.arc(x, baseY - 40, 56, Math.PI, 0); ctx.fill(); 
      ctx.fillRect(x - 58, baseY - 45, 116, 30);
      ctx.fillRect(x - 60, baseY - 20, 20, 55);
      ctx.fillRect(x + 40, baseY - 20, 20, 55);
    }

    // Professional Smart Glasses
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3;
    ctx.strokeRect(x - 28, baseY - 28, 24, 18);
    ctx.strokeRect(x + 4, baseY - 28, 24, 18);
    ctx.beginPath(); ctx.moveTo(x - 4, baseY - 20); ctx.lineTo(x + 4, baseY - 20); ctx.stroke();

    // Eyes
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x - 16, baseY - 18, 10, 0, Math.PI * 2); ctx.arc(x + 16, baseY - 18, 10, 0, Math.PI * 2); ctx.fill();
    if (state.blink < 0.04) {
      ctx.fillStyle = 'black'; ctx.fillRect(x - 24, baseY - 20, 16, 3); ctx.fillRect(x + 8, baseY - 20, 16, 3);
    } else {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(x - 15, baseY - 18, 4, 0, Math.PI * 2); ctx.arc(x + 17, baseY - 18, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Speaking Animated Mouth (Moving Lips when speaking)
    ctx.fillStyle = '#991b1b';
    if (state.speaking && state.mouth > 0.2) {
      let openMouth = 8 + state.mouth * 16;
      ctx.beginPath(); ctx.ellipse(x, baseY + 6, 12, openMouth / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.ellipse(x, baseY + 8, 7, openMouth / 3, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, baseY + 6, 10, 0.1, Math.PI - 0.1); ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 2.5; ctx.stroke();
    }
  };

  const clearBoard = () => {
    const canvas = boardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clean digital smart board background
    ctx.fillStyle = '#091e11'; ctx.fillRect(0, 0, 520, 420);
    
    // Board header
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px sans-serif'; 
    ctx.fillText('🎓 PROFESSIONAL AI DIGITAL SMART BOARD', 20, 25);
  };

  useEffect(() => {
    clearBoard();
    drawProfessionalTeacher({ mouth: 0, blink: 0.5, handY: 50, jump: 0, isSir: teacher === 'sir', speaking: false });
  }, [teacher]);

  const handleStartCartoon = () => {
    if (!script.trim()) {
      alert('Pehle script likho!');
      return;
    }

    const isSir = teacher === 'sir';
    clearBoard();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(true);
    setStatusText('🔊 AI Teacher is Lecturing...');
    setShowBubble(true);

    const words = script.split(' ');
    const sentences = script.match(/[^.!?।]+[.!?।]+|[^.!?]+$/g) || [script];

    const boardCanvas = boardRef.current;
    const bCtx = boardCanvas?.getContext('2d');

    setDurationText(Math.ceil(words.length / 2.2) + ' sec');

    let wordIdx = 0;
    let chunk = 0;
    let stateObj = { mouth: 0, blink: 0.5, handY: 50, jump: 0, isSir, speaking: true };

    const speakNext = () => {
      if (chunk >= sentences.length) {
        stateObj.speaking = false;
        drawProfessionalTeacher(stateObj);
        setIsPlaying(false);
        setStatusText('✅ Class Completed - Play Again');
        setShowBubble(false);
        if (animRef.current) clearInterval(animRef.current);
        return;
      }

      const utter = new SpeechSynthesisUtterance(sentences[chunk]);
      utter.lang = /[ऀ-ॿ]/.test(sentences[chunk]) ? 'hi-IN' : 'en-IN';
      utter.rate = 0.95; 
      utter.pitch = isSir ? 0.85 : 1.3;

      utter.onboundary = () => {
        const w = words[wordIdx] || '';
        if (w) {
          const lower = sentences[chunk].toLowerCase();
          if (lower.includes('dekho') || lower.includes('ye') || lower.includes('yaha')) {
            stateObj.handY = 80;
            setBubbleText('👉 Focus on Board!');
          } else if (lower.includes('suno') || lower.includes('samjho')) {
            stateObj.handY = 10;
            setBubbleText('👂 Listen Carefully!');
          } else {
            setBubbleText(w);
          }

          if (bCtx) {
            const x = 25 + (wordIdx % 6) * 78;
            const y = 60 + Math.floor(wordIdx / 6) * 42;
            bCtx.fillStyle = '#86efac';
            bCtx.font = '18px monospace';
            bCtx.fillText(w, x, y);

            // Contextual Reaction / Diagram illustrations on board
            if (w.toLowerCase().includes('h2o') || w.toLowerCase().includes('formula')) {
              bCtx.fillStyle = '#38bdf8'; bCtx.font = 'bold 30px sans-serif'; bCtx.fillText('H₂O (Water)', 180, 240);
            }
            if (w.toLowerCase().includes('newton') || w.toLowerCase().includes('नियम')) {
              bCtx.fillStyle = '#f43f5e'; bCtx.font = 'bold 24px sans-serif'; bCtx.fillText('F = m × a (Force)', 150, 280);
            }
            if (w.toLowerCase().includes('science') || w.toLowerCase().includes('विज्ञान')) {
              bCtx.fillStyle = '#fbbf24'; bCtx.font = 'bold 22px sans-serif'; bCtx.fillText('⚛️ Physics & Chemistry', 120, 330);
            }
          }
        }
        wordIdx++;
      };

      utter.onend = () => {
        chunk++;
        speakNext();
      };

      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(utter);
      }
    };

    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      stateObj.mouth = Math.random();
      stateObj.jump = stateObj.speaking ? Math.sin(Date.now() / 180) * 3 : 0;
      drawProfessionalTeacher(stateObj);
    }, 70);

    speakNext();
  };

  const handleSave = () => {
    const newItem: CartoonVideoItem = {
      id: Date.now(),
      title,
      script,
      teacher
    };
    const updated = [...savedVideos, newItem];
    setSavedVideos(updated);
    try {
      localStorage.setItem('cartoonVideos', JSON.stringify(updated));
    } catch {}
    alert('✅ Saved successfully');
  };

  const handleDelete = (id: number) => {
    const updated = savedVideos.filter(v => v.id !== id);
    setSavedVideos(updated);
    try {
      localStorage.setItem('cartoonVideos', JSON.stringify(updated));
    } catch {}
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
          <span>🎓 Professional AI Virtual Teacher Studio</span>
          <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
        </h2>
        <p className="text-xs text-stone-500">प्रфессионаल प्रोफेसर अवतार, लिप-सिंक माउथ एनिमेशन और डिजिटल स्मार्ट बोर्ड</p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xl border border-stone-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Lecture Title</label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-stone-50"
            placeholder="Ex: न्यूटन के गति के नियम"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Lecture Script (जो टीचर बोलेगा और बोर्ड पर लिखेगा)</label>
          <textarea 
            rows={4} 
            value={script} 
            onChange={e => setScript(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-stone-50 leading-relaxed"
            placeholder="Script likho..."
          ></textarea>
        </div>

        <div className="flex gap-2">
          <select 
            value={teacher} 
            onChange={e => setTeacher(e.target.value as any)}
            className="flex-1 px-3.5 py-3 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-stone-50"
          >
            <option value="sir">👨‍🏫 Professional Sir (Blazer & Tie)</option>
            <option value="mam">👩‍🏫 Professional Mam (Elegant Suit)</option>
          </select>
          <button 
            onClick={handleSave}
            className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save</span>
          </button>
        </div>

        <button 
          onClick={handleStartCartoon}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{statusText}</span>
        </button>

        {/* Professional Studio Stage */}
        <div className="bg-[#111] rounded-3xl overflow-hidden border-2 border-stone-800 shadow-2xl flex flex-col sm:flex-row h-auto sm:h-[420px]">
          {/* Professional Teacher Avatar Canvas */}
          <div className="w-full sm:w-[38%] bg-gradient-to-b from-[#1e293b] to-[#0f172a] relative flex items-center justify-center">
            <canvas ref={toonRef} width={320} height={420} className="w-full h-full object-contain" />
            {showBubble && (
              <div className="absolute top-3 left-3 right-3 bg-white/95 text-stone-900 px-3 py-2 rounded-xl font-bold text-xs shadow-xl backdrop-blur-xs animate-bounce border border-blue-400">
                {bubbleText}
              </div>
            )}
          </div>

          {/* Digital Board Canvas */}
          <div className="flex-1 bg-[#091e11] relative flex items-center justify-center">
            <canvas ref={boardRef} width={520} height={420} className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="text-center text-xs text-stone-500 font-bold">
          ⏱️ Duration: <span id="dur" className="text-stone-800">{durationText}</span> • AI Speech & Lip-Sync Active
        </div>

        {/* Saved Videos List */}
        {savedVideos.length > 0 && (
          <div className="pt-4 border-t border-stone-200 space-y-2">
            <h4 className="font-black text-xs text-stone-800 uppercase tracking-wider">Saved Professional Lectures ({savedVideos.length})</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {savedVideos.map(item => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setTitle(item.title);
                    setScript(item.script);
                    setTeacher(item.teacher);
                  }}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      🎓
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-stone-900 truncate">{item.title}</h5>
                      <p className="text-[10px] text-stone-500">
                        {item.teacher === 'sir' ? 'Professional Sir' : 'Professional Mam'} • {item.script.slice(0, 35)}...
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
