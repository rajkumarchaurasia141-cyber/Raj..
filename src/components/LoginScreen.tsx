import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppLogo } from './AppLogo';
import {
  recordAppDownload,
  syncUserIdentityWithDownload
} from '../services/downloadTracker';
import {
  Smartphone,
  Download,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Check
} from 'lucide-react';

export function LoginScreen({ onBack }: { onBack?: () => void } = {}) {
  const { login } = useAuth();
  const { appConfig } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Direct APK / PWA install handling - NO popup modal
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    return typeof window !== 'undefined' ? (window as any).__deferredPrompt : null;
  });
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [isTriggeringInstall, setIsTriggeringInstall] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)
    ) {
      setIsAppInstalled(true);
      recordAppDownload({ method: 'standalone_launch' });
    }

    // Capture prompt if available globally
    if (typeof window !== 'undefined' && (window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt);
    }

    const readyHandler = () => {
      if (typeof window !== 'undefined' && (window as any).__deferredPrompt) {
        setDeferredPrompt((window as any).__deferredPrompt);
      }
    };

    const beforeInstallHandler = (e: any) => {
      e.preventDefault();
      (window as any).__deferredPrompt = e;
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__deferredPrompt = null;
      }
      setInstallStatus('installed');
      recordAppDownload({ method: 'pwa_prompt' });
    };

    window.addEventListener('app-install-ready', readyHandler);
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('app-install-ready', readyHandler);
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsTriggeringInstall(true);

    // Record Install APK button click in Admin Download Tracker
    recordAppDownload({
      method: 'apk_direct',
      studentName: name.trim() || undefined,
      studentEmail: email.trim().toLowerCase() || undefined
    });

    // 1. Direct prompt check (phone native install dialog)
    const prompt = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPrompt : null);

    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setIsAppInstalled(true);
          setInstallStatus('installed');
          recordAppDownload({
            method: 'pwa_prompt',
            studentName: name.trim() || undefined,
            studentEmail: email.trim().toLowerCase() || undefined
          });
        } else {
          setInstallStatus('cancelled');
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        (window as any).__deferredPrompt = null;
      }
      setIsTriggeringInstall(false);
      return;
    }

    // 2. Check if already installed
    if (
      isAppInstalled ||
      (typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone))
    ) {
      setIsAppInstalled(true);
      setInstallStatus('already_installed');
      setIsTriggeringInstall(false);
      return;
    }

    // 3. If student is viewing inside WhatsApp / Facebook in-app browser on Android
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const isInAppBrowser =
      typeof navigator !== 'undefined' && /WhatsApp|FBAN|FBAV|Instagram|Line/i.test(navigator.userAgent);

    if (isAndroid && isInAppBrowser) {
      const fullUrl = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${fullUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      setIsTriggeringInstall(false);
      return;
    }

    // 4. If prompt is not yet ready, show an inline clean note (NO intrusive popup screens)
    setInstallStatus('browser_hint');
    setIsTriggeringInstall(false);

    // Auto-clear hint after 8 seconds
    setTimeout(() => {
      setInstallStatus((prev) => (prev === 'browser_hint' ? null : prev));
    }, 8000);
  };

  const validateGmail = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name (कृपया अपना नाम दर्ज करें).');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your Gmail address (कृपया अपनी ईमेल दर्ज करें).');
      return;
    }

    if (!validateGmail(email)) {
      setError('Please enter a valid Gmail address (उदा. student@gmail.com).');
      return;
    }

    setLoading(true);
    setWelcomeName(name.trim());

    try {
      await login(name.trim(), email.trim().toLowerCase());
      await syncUserIdentityWithDownload(name.trim(), email.trim().toLowerCase());
    } catch (err: any) {
      console.warn('Login attempt note:', err);
      setError('लॉगिन करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const cleanInputEmail = email.trim().toLowerCase();
  const isAdminEmail =
    cleanInputEmail === 'rajkumarchaurasia143@gmail.com' || cleanInputEmail === 'rajkumarchaurasia141@gmail.com';

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);
    const low = val.trim().toLowerCase();
    if ((low === 'rajkumarchaurasia141@gmail.com' || low === 'rajkumarchaurasia143@gmail.com') && !name.trim()) {
      setName('राजकुमार चौरसिया');
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#FFFDF0] via-[#FDF8E4] to-[#FAF3D1] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 font-sans relative selection:bg-amber-200 rounded-3xl">
      
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-64 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Card Container */}
      <div className="w-full max-w-[420px] mx-auto relative z-10 space-y-4">
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 font-bold text-xs border border-amber-200 shadow-xs transition-all cursor-pointer"
            >
              <span>← होम स्क्रीन पर वापस जाएँ</span>
            </button>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
              प्रोफाइल लॉगिन
            </span>
          </div>
        )}
        
        {/* Main White Card with Soft Shadow and Clean Rounded Corners */}
        <div className="bg-white rounded-3xl sm:rounded-[32px] p-7 sm:p-9 shadow-[0_12px_40px_-10px_rgba(202,138,4,0.12),0_4px_16px_-4px_rgba(0,0,0,0.04)] border border-amber-100/70 text-center relative overflow-hidden transition-all">
          
          {/* Top Illustration: Premium Graduation Cap with Golden Tassel & Diploma + Official Logo */}
          <div className="relative mb-6 flex flex-col items-center justify-center">
            
            {/* Soft Sunburst Halo behind Illustration */}
            <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-100 via-yellow-100 to-amber-50 blur-xl -z-0 pointer-events-none opacity-80" />

            {/* Educational Illustration Container */}
            <div className="relative z-10 flex items-center justify-center">
              
              {/* Educational Graduation Cap & Diploma SVG */}
              <div className="w-48 h-32 flex items-center justify-center filter drop-shadow-md">
                <img 
                  src="/assets/graduation_cap_illustration.svg" 
                  alt="Graduation Cap and Diploma" 
                  className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 hover:scale-105"
                  loading="eager"
                />
              </div>

              {/* Official App Logo Overlay Badge */}
              <div className="absolute -bottom-2 right-6 sm:right-8 bg-white p-1 rounded-2xl shadow-lg ring-2 ring-amber-400/80">
                <AppLogo className="w-10 h-10 rounded-xl" />
              </div>
            </div>

            {/* School / Board Badge Pill */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-900 tracking-wide">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>BSEB बिहार बोर्ड 10th स्पेशल</span>
            </div>
          </div>

          {/* Heading: Bold Black Text, Centered */}
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Student Login
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              अपनी पढ़ाई शुरू करने के लिए अपना नाम और ईमेल दर्ज करें
            </p>
          </div>

          {/* Personalized Welcome Banner if user entered their name */}
          {welcomeName && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs font-semibold text-amber-950 flex items-center gap-2 text-left animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>नमस्ते <strong className="font-bold text-amber-900">{welcomeName}</strong>! आपका स्वागत है।</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 text-left animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Detection Indicator */}
          {isAdminEmail && (
            <div className="mb-4 p-2.5 bg-yellow-50 border border-yellow-300 rounded-2xl text-[11px] font-bold text-yellow-900 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                ⭐ <strong className="text-yellow-950">एडमिन मोड पहचाना गया</strong>
              </span>
              <span className="text-[10px] bg-yellow-200 px-2 py-0.5 rounded-full text-yellow-900">
                Super Admin
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            
            {/* Input Field 1: Full Name */}
            <div className="space-y-1.5">
              <label 
                htmlFor="student-name"
                className="block text-xs font-bold text-slate-800 tracking-wide"
              >
                Full Name <span className="text-amber-600">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Enter Your Full Name"
                autoComplete="name"
                required
                className="w-full px-4 py-3 bg-[#FAF9F5] border border-stone-200 focus:border-amber-400 focus:bg-white rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-inner"
              />
            </div>

            {/* Input Field 2: Gmail Address */}
            <div className="space-y-1.5">
              <label 
                htmlFor="student-email"
                className="block text-xs font-bold text-slate-800 tracking-wide"
              >
                Gmail Address <span className="text-amber-600">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter Your Gmail Address"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-[#FAF9F5] border border-stone-200 focus:border-amber-400 focus:bg-white rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-inner"
              />
            </div>

            {/* Primary Button: Pale Yellow background, rounded corners, bold black text */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-[#FDF0A6] hover:bg-[#FDE789] active:bg-[#FBD968] text-slate-950 font-bold text-base rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </div>
          </form>

          {/* Small Golden Text Link: "Need Help?" */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline decoration-amber-300 underline-offset-4 cursor-pointer hover:underline transition-colors"
            >
              Need Help?
            </button>
          </div>

          {/* Thin Horizontal Divider near bottom */}
          <div className="my-5 border-t border-slate-100 relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] uppercase font-bold text-slate-300 tracking-widest">
              BSEB 10th
            </span>
          </div>

          {/* Educational Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500 text-left">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>हस्तलिखित नोट्स</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50-50 वस्तुनिष्ठ MCQs</span>
            </div>
          </div>
        </div>

        {/* APK / App Direct Install Section (Direct phone install - NO popup screens) */}
        <div className="bg-white/90 backdrop-blur-sm border border-amber-200/90 rounded-2xl p-3.5 text-slate-900 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-300 to-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm">
                <Download className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>फोन में ऐप इंस्टॉल करें</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">APK / WebApp</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isAppInstalled ? 'ऐप फोन में इंस्टॉल है ✅' : 'सीधे 1-क्लिक में फोन में इंस्टॉल करें'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isTriggeringInstall}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {isTriggeringInstall ? (
                <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : isAppInstalled ? (
                <Check className="w-3.5 h-3.5 text-emerald-900 font-bold" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>{isAppInstalled ? 'इंस्टॉल है' : 'Install APK'}</span>
            </button>
          </div>

          {/* Inline Feedback Notification - Clean & Non-Intrusive (No popup modal) */}
          {installStatus === 'installed' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center gap-2 animate-fade-in text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🎉 बधाई! ऐप आपके फोन में सफलतापूर्वक इंस्टॉल हो गया है।</span>
            </div>
          )}

          {installStatus === 'already_installed' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✅ BSEB GURU ऐप पहले से आपके फोन के होम स्क्रीन पर मौजूद है!</span>
            </div>
          )}

          {installStatus === 'browser_hint' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900 flex items-start gap-2 animate-fade-in text-left">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>सीधे इंस्टॉल के लिए:</strong> ब्राउज़र के ऊपर दाहिने कोने में बने <strong>⋮ (3 डॉट्स)</strong> पर क्लिक करके <strong>"Install app"</strong> या <strong>"Add to Home screen"</strong> चुनें।
              </div>
            </div>
          )}
        </div>

        {/* Direct WhatsApp Support */}
        <div className="text-center pt-1">
          <a
            href="https://wa.me/919241511070?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%20%E0%A4%B8%E0%A4%B0%2C%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20BSEB%20%E0%A4%AA%E0%A5%8B%E0%A4%B0%E0%A5%8D%E0%A4%9F%E0%A4%B2%20Student%20Login%20%E0%A4%AE%E0%A5%87%E0%A4%82%20%E0%A4%B8%E0%A4%B9%E0%A4%BE%E0%A4%AF%E0%A4%A4%E0%A4%BE%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%8F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp सहायता: 9241511070</span>
          </a>
        </div>

      </div>

      {/* Need Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 text-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Need Help? (सहायता)</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed text-left">
              <p>
                <strong>1. लॉगिन कैसे करें?</strong><br />
                अपना पूरा नाम (Full Name) और Gmail ID दर्ज करें। पासवर्ड की आवश्यकता नहीं है।
              </p>
              <p>
                <strong>2. कोर्स अनलॉक नहीं हुआ?</strong><br />
                यदि क्रैश कोर्स पेमेंट के बाद 5 मिनट में अनलॉक न हो, तो नीचे दिए गए WhatsApp पर पेमेंट स्क्रीनशॉट भेजें।
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919241511070?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%20%E0%A4%B8%E0%A4%B0%2C%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20Student%20Login%20%E0%A4%B8%E0%A4%B9%E0%A4%BE%E0%A4%AF%E0%A4%A4%E0%A4%BE%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%8F"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp पर संपर्क करें (9241511070)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
