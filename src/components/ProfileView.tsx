import React, { useRef, useState } from 'react';
import { 
  User, 
  Crown, 
  Mail, 
  Calendar, 
  Hourglass, 
  Clock, 
  Phone, 
  Share2, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppLogo } from './AppLogo';
import { triggerAd } from '../utils/adManager';

interface ProfileViewProps {
  onOpenVip: () => void;
  onOpenRoutine: () => void;
  onOpenSocial: () => void;
  onOpenAdmin: () => void;
  onOpenCourse: () => void;
  onOpenGmailAuth?: () => void;
}

export function ProfileView({
  onOpenVip,
  onOpenRoutine,
  onOpenSocial,
  onOpenAdmin,
  onOpenCourse,
  onOpenGmailAuth
}: ProfileViewProps) {
  const { user, isVIP, isAdmin, vipDetails, logout } = useAuth();
  const { appConfig, updateSettings } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const daysLeft = vipDetails?.daysRemaining;

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

  return (
    <div className="max-w-lg mx-auto p-2.5 sm:p-3 space-y-3 pb-8">
      {/* Hidden File Input for DP */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleDpSelect} 
        className="hidden" 
      />

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
        {isAdmin ? (
          <div className="relative group shrink-0">
            <AppLogo className="w-16 h-16 ring-3 ring-amber-400 shadow-md" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center shadow-md hover:bg-amber-300 transition-transform active:scale-95 cursor-pointer border border-stone-900"
              title="अपनी असली फोटो / डीपी बदलें"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-stone-900 text-lg truncate">
              {isAdmin ? 'राजकुमार चौरसिया' : user?.name || 'अतिथि विद्यार्थी'}
            </h3>
            {isAdmin ? (
              <span className="bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full text-xs shadow-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 fill-current" />
                सुपर एडमिन
              </span>
            ) : isVIP ? (
              <span className="bg-amber-400 text-stone-950 p-1 rounded-full text-xs shadow-xs" title="VIP स्टूडेंट">
                <Crown className="w-3 h-3 fill-current" />
              </span>
            ) : null}
          </div>
          <p className="text-xs text-stone-500 font-mono truncate">
            {user?.email || 'जीमेल कनेक्ट नहीं है'}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              बिहार बोर्ड कक्षा 10वीं (BSEB फुल सिलेबस)
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Camera className="w-3 h-3" />
                डीपी बदलें
              </button>
            )}
          </div>
          {uploadStatus && (
            <div className="text-[11px] font-bold text-emerald-600 mt-1">
              {uploadStatus}
            </div>
          )}
        </div>
      </div>

      {/* Gmail Identification Card for Admin / Student Sync */}
      {onOpenGmailAuth && (
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-4 text-white border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">
                  {isAdmin ? 'एडमिन जीमेल सक्रिय है' : 'जीमेल से पहचान'}
                </h4>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {isAdmin 
                    ? `${user?.email || 'एडमिन'} से लॉग इन हैं` 
                    : 'VIP प्रोफाइल अपने जीमेल से सीधे पहचानें'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenGmailAuth}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              {isAdmin ? 'जीमेल बदलें' : 'पहचान करें'}
            </button>
          </div>
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="rounded-3xl p-5 border shadow-xs space-y-3 bg-gradient-to-br from-emerald-500/10 via-emerald-100/40 to-white border-emerald-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 text-stone-950">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">
                मुफ़्त शिक्षा अभियान मेंबरशिप
              </h4>
              <p className="text-[11px] text-stone-600">
                बोर्ड परीक्षा की तैयारी हेतु सम्पूर्ण स्टडी मैटेरियल पूर्ण रूप से अनलॉक है
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 text-xs flex items-center justify-between text-stone-600">
          <span className="flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5 text-emerald-600" />
            <span>वैधता: <strong>असीमित (फ्री स्टडी)</strong></span>
          </span>
          <span className="font-bold text-emerald-600">
            सक्रिय
          </span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        <button
          onClick={() => {
            triggerAd('profile_courses');
            onOpenCourse();
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">मेरे विषय & चैप्टर्स</div>
              <div className="text-[11px] text-stone-500">संस्कृत, विज्ञान, गणित, सामाजिक विज्ञान, हिंदी</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => {
            triggerAd('profile_routine');
            onOpenRoutine();
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">क्लास रूटीन & टाइम टेबल</div>
              <div className="text-[11px] text-stone-500">साप्ताहिक कक्षाओं का विवरण</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => {
            triggerAd('profile_social');
            onOpenSocial();
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">स्टडी ग्रुप्स (WhatsApp / Telegram)</div>
              <div className="text-[11px] text-stone-500">हजारों विद्यार्थियों के साथ जुड़ें</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              triggerAd('profile_admin');
              onOpenAdmin();
            }}
            className="w-full p-4 flex items-center justify-between bg-stone-900 text-white hover:bg-black transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">एडमिन मैनेजमेंट पैनल</div>
                <div className="text-[11px] text-amber-300">पेमेंट रिक्वेस्ट, छात्र लिस्ट & VIP अप्रूवल</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        )}
      </div>

      {/* Logout or Login with Gmail */}
      {user?.email ? (
        <button
          onClick={logout}
          className="w-full p-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>लॉगआउट करें / जीमेल बदलें</span>
        </button>
      ) : onOpenGmailAuth ? (
        <button
          onClick={onOpenGmailAuth}
          className="w-full p-3.5 rounded-2xl bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Mail className="w-4 h-4" />
          <span>जीमेल से पहचान / लॉगिन करें</span>
        </button>
      ) : null}
    </div>
  );
}
