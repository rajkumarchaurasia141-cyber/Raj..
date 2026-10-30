import React, { useRef, useState } from 'react';
import { 
  X, 
  Crown, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  BookText, 
  Share2, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  ExternalLink, 
  Hourglass, 
  Clock, 
  PhoneCall, 
  Radio, 
  Trophy,
  Mail,
  Camera,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppLogo } from './AppLogo';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenVip: () => void;
  onOpenGmailAuth?: () => void;
}

export function AppDrawer({ isOpen, onClose, onNavigate, onOpenVip, onOpenGmailAuth }: AppDrawerProps) {
  const { user, isAdmin, isVIP, vipDetails, logout } = useAuth();
  const { appConfig, updateSettings } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleDpSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (JPG, PNG) फाइल चुनें।');
      return;
    }

    setUploadStatus('अपलोड हो रहा है...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 512;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h *= MAX / w; w = MAX; }
        } else {
          if (h > MAX) { w *= MAX / h; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          try {
            await updateSettings({
              ...appConfig,
              appLogoUrl: dataUrl
            });
            setUploadStatus('✅ डीपी अपडेट हो गई!');
            setTimeout(() => setUploadStatus(''), 3000);
          } catch (err) {
            console.error(err);
            setUploadStatus('अपलोड विफल!');
            setTimeout(() => setUploadStatus(''), 3000);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in overflow-hidden">
      {/* Hidden File Input for DP Selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleDpSelect} 
        className="hidden" 
      />

      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Content - Native Android Style (82% width, rounded-r-3xl, elevation shadow) */}
      <div className="relative w-[82%] max-w-[320px] bg-white text-stone-800 h-full shadow-2xl flex flex-col z-10 animate-slide-in rounded-r-3xl overflow-hidden border-r border-slate-200/80">
        {/* Header with User Info */}
        <div className="bg-gradient-to-br from-red-700 via-red-800 to-stone-900 text-white p-5 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <AppLogo className="w-14 h-14 ring-2 ring-amber-400 shadow-lg" />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center shadow-lg hover:bg-amber-300 transition-transform active:scale-95 cursor-pointer border border-stone-900"
                  title="अपनी असली फोटो / डीपी 1-क्लिक में बदलें"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-white truncate leading-tight flex items-center gap-1.5">
                <span>{isAdmin ? 'राजकुमार चौरसिया' : user?.name || 'अतिथि विद्यार्थी'}</span>
              </h3>
              <p className="text-xs text-stone-300 truncate">
                {user?.email || 'BSEB GURU • टॉपर बैच'}
              </p>
              
              {/* VIP / Admin Status Badge */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                {isAdmin ? (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-stone-950 fill-current" />
                    सुपर एडमिन (Admin)
                  </span>
                ) : isVIP ? (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-stone-950 fill-stone-950" />
                    VIP एक्टिव ({vipDetails?.daysRemaining || 0} दिन शेष)
                  </span>
                ) : vipDetails?.isExpired ? (
                  <span className="bg-rose-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    VIP समाप्त (रिन्यू करें)
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {user?.email ? 'साधारण (मुफ़्त) खाता' : 'डायरेक्ट स्टडी मोड'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Direct Photo Upload Banner */}
          {isAdmin && (
            <div className="mt-3 pt-2.5 border-t border-white/15">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>📸 असली फोटो / डीपी अपलोड करें</span>
              </button>
              {uploadStatus && (
                <div className="text-[11px] text-center font-bold text-amber-300 mt-1 animate-pulse">
                  {uploadStatus}
                </div>
              )}
            </div>
          )}

          {/* Quick Gmail Auth button if not identified or if wants to switch */}
          {!isAdmin && onOpenGmailAuth && (
            <button
              onClick={() => {
                onClose();
                onOpenGmailAuth();
              }}
              className="mt-3 w-full py-1.5 px-3 bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>{user?.email ? 'जीमेल बदलें' : 'जीमेल से पहचानें (Profile)'}</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-slate-100 text-sm">
          <div className="space-y-1 pb-3">
            <button
              onClick={() => { onNavigate('home'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>होम स्क्रीन (Home)</span>
            </button>

            <button
              onClick={() => { onNavigate('daily_test'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                🎯
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>🎯 दैनिक टेस्ट (Daily Test)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-black">NEW</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal">Class 10th लाइव प्रश्नोत्तरी</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('course'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>सभी विषय (Class 10th)</span>
            </button>

            <button
              onClick={() => { onNavigate('live'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <span>🔴 लाइव क्लास (Live Classes)</span>
            </button>

            <button
              onClick={() => { onNavigate('ai_studio'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-purple-50 hover:text-purple-700 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>🤖 AI Teacher Video Studio</span>
                  <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-black">NEW</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal">Generate AI video & voice lecture</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('cartoon_studio'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                🎨
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>🎨 Cartoon 2D Class</span>
                  <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-black">Kids</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal">Animated 2D Teacher & Board</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('crash_course'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-800 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-xs">
                ⚡
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>⚡ Crash Course (Class 10th)</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-black">FAST</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal">चैप्टर नोट्स व 30 VVI टेस्ट</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('pyqs'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
                📄
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>📄 पिछले वर्ष के प्रश्न पत्र (PYQ)</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-black">PDF</span>
                </div>
                <p className="text-[10px] text-stone-500 font-normal">Board Exam PYQs with Solution</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('chat'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-bold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>बिहार गुरु (AI Assistant)</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-black">9-10th</span>
                </div>
                <div className="text-[10px] text-stone-400 font-normal">Hindi, English, Science, SST</div>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('leaderboard'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span>🏆 टॉपर लीडरबोर्ड (Leaderboard)</span>
            </button>

            <button
              onClick={() => { onNavigate('routine'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>क्लास टाइम टेबल / रूटीन</span>
            </button>

            <button
              onClick={() => { onNavigate('ncert'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BookText className="w-4 h-4" />
              </div>
              <span>NCERT पुस्तकें व समाधान</span>
            </button>
          </div>

          <div className="space-y-1 py-3">
            <button
              onClick={() => { onOpenVip(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold transition-colors cursor-pointer text-left border border-amber-200"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-900 flex items-center justify-center shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="leading-tight">टॉपर VIP क्रैश कोर्स (मात्र ₹299)</div>
                <div className="text-[11px] text-amber-700 font-normal">पूरा कोर्स, PDF नोट्स व टेस्ट</div>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('social'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span>सोशल मीडिया & हेल्पलाइन</span>
            </button>
          </div>

          {isAdmin && (
            <div className="pt-3">
              <button
                onClick={() => { onNavigate('admin_daily_test'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold transition-colors cursor-pointer text-left border border-amber-200"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                  📝
                </div>
                <div>
                  <div className="text-xs font-black">दैनिक टेस्ट मैनेजर (Daily Test)</div>
                  <div className="text-[10px] text-amber-700">/admin/daily-test (प्रश्न डालें)</div>
                </div>
              </button>

              <button
                onClick={() => { onNavigate('admin'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-900 text-white font-bold transition-colors cursor-pointer text-left shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>एडमिन कंट्रोल पैनल</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-stone-600">
          <button 
            onClick={() => { onNavigate('social'); onClose(); }}
            className="flex items-center gap-1.5 hover:text-red-700 font-semibold cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>हेल्पलाइन: {appConfig.whatsappNumber || appConfig.helplineNumber || '9241511070'}</span>
          </button>
          {user?.email ? (
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                onClose();
                if (onOpenGmailAuth) onOpenGmailAuth();
              }}
              className="flex items-center gap-1.5 text-red-700 hover:text-red-900 font-bold cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>जीमेल पहचान</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
