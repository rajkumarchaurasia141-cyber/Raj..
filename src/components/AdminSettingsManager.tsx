import React, { useState, useRef } from 'react';
import { Settings, Phone, QrCode, Youtube, Instagram, MessageCircle, Send, CheckCircle2, AlertCircle, Save, Upload, Image as ImageIcon, RotateCcw, Ticket, Percent, Sparkles, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { safeSetDoc } from '../utils/firestoreSafe';
import { AppLogo } from './AppLogo';

export function AdminSettingsManager() {
  const { appConfig, updateSettings } = useData();

  const [helplineNumber, setHelplineNumber] = useState(
    (appConfig.helplineNumber === '9507464117' ? '9241511070' : appConfig.helplineNumber) || '9241511070'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    (appConfig.whatsappNumber === '9507464117' ? '9241511070' : appConfig.whatsappNumber) || '9241511070'
  );
  const rawUpiAdmin = appConfig.upiId;
  const isOldUpiAdmin = !rawUpiAdmin || rawUpiAdmin.includes('9708868515') || rawUpiAdmin.includes('@ybl') || rawUpiAdmin.includes('@paytm') || rawUpiAdmin.includes('@gmail.com');
  const [upiId, setUpiId] = useState(isOldUpiAdmin ? '9241511070@fam' : rawUpiAdmin);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(appConfig.qrCodeDataUrl || '');
  const [appLogoUrl, setAppLogoUrl] = useState(appConfig.appLogoUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(appConfig.youtubeUrl);
  const [instagramUrl, setInstagramUrl] = useState(appConfig.instagramUrl);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(appConfig.whatsappGroupUrl);
  const [telegramUrl, setTelegramUrl] = useState(appConfig.telegramUrl);
  const [price1Month, setPrice1Month] = useState((appConfig.price1Month === 99 || !appConfig.price1Month ? 299 : appConfig.price1Month).toString());
  const [price1Year, setPrice1Year] = useState((appConfig.price1Year === 299 || !appConfig.price1Year ? 499 : appConfig.price1Year).toString());
  const [crashCourseDiscountCode, setCrashCourseDiscountCode] = useState(
    appConfig.crashCourseDiscountCode || 'BSEB100'
  );
  const [crashCourseDiscountAmount, setCrashCourseDiscountAmount] = useState(
    (appConfig.crashCourseDiscountAmount || 100).toString()
  );

  const qrInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया केवल इमेज (JPG, PNG) फाइल चुनें।');
      return;
    }

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
          const newLogoData = canvas.toDataURL('image/png', 0.95);
          setAppLogoUrl(newLogoData);
          try {
            await updateSettings({
              ...appConfig,
              appLogoUrl: newLogoData
            });
            setSuccessMsg('✅ बधाई हो! आपकी ओरिजिनल फोटो/डीपी तुरंत सेव हो गई है और पूरे ऐप में सेट हो चुकी है!');
            setTimeout(() => setSuccessMsg(''), 4000);
          } catch (err) {
            console.error(err);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया केवल इमेज (JPG, PNG) फाइल चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
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
          setQrCodeDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const mPrice = parseInt(price1Month);
    const yPrice = parseInt(price1Year);

    if (isNaN(mPrice) || isNaN(yPrice)) {
      setErrorMsg('कृपया मूल्य में सही संख्या (Number) दर्ज करें।');
      return;
    }

    const discAmount = parseInt(crashCourseDiscountAmount) || 100;
    const cleanDiscCode = crashCourseDiscountCode.trim().toUpperCase() || 'BSEB100';

    try {
      // 1. Update general settings config
      await updateSettings({
        helplineNumber: helplineNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        upiId: upiId.trim(),
        qrCodeDataUrl: qrCodeDataUrl.trim(),
        appLogoUrl: appLogoUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        whatsappGroupUrl: whatsappGroupUrl.trim(),
        telegramUrl: telegramUrl.trim(),
        price1Month: mPrice,
        price1Year: yPrice,
        crashCoursePrice: mPrice,
        crashCourseDiscountCode: cleanDiscCode,
        crashCourseDiscountAmount: discAmount
      });

      // Local storage cache for instant discount code retrieval
      try {
        localStorage.setItem('bseb_crash_course_discount_code', cleanDiscCode);
        localStorage.setItem('bseb_crash_course_discount_amount', discAmount.toString());
      } catch {}

      // 2. Synchronize configuration to Firestore "app_settings/payment_config"
      const paymentConfigRef = doc(db, 'app_settings', 'payment_config');
      await safeSetDoc(paymentConfigRef, {
        upiId: upiId.trim(),
        whatsappNumber: whatsappNumber.trim(),
        price: yPrice || 299,
        qrCodeUrl: qrCodeDataUrl.trim(),
        appLogoUrl: appLogoUrl.trim(),
        helplineNumber: helplineNumber.trim(),
        crashCoursePrice: mPrice,
        crashCourseDiscountCode: cleanDiscCode,
        crashCourseDiscountAmount: discAmount
      }, { merge: true }, 5000, true);

      setSuccessMsg(`बधाई हो! डिस्काउंट कोड (${cleanDiscCode}), UPI ID (${upiId.trim()}), WhatsApp नंबर और सभी सेटिंग्स सफलतापूर्वक हमेशा के लिए सेव हो गई हैं!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error("Save settings error:", err);
      setErrorMsg('सेटिंग्स सेव करने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-stone-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            UPI व QR सेटिंग्स & क्रैश कोर्स मूल्य (Admin Settings)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप अपना QR कोड स्कैनर अपलोड कर सकते हैं, मोबाइल नंबर, UPI ID और क्रैश कोर्स की कीमतें बदल सकते हैं।</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Contact & Payment Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" />
            1. हेल्पलाइन नंबर, WhatsApp एवं पेमेंट (UPI ID & QR Scanner)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-500" /> कॉलिंग हेल्पलाइन नंबर
              </label>
              <input
                type="text"
                required
                value={helplineNumber}
                onChange={(e) => setHelplineNumber(e.target.value)}
                placeholder="उदा: 9241511070"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500">कॉल सहायता के लिए</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp मोबाइल नंबर
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="उदा: 9241511070"
                className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-500"
                style={{ minHeight: '44px' }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold">पेमेंट स्क्रीनशॉट के लिए</span>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/91${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-600 hover:underline font-bold"
                  >
                    चैट टेस्ट ↗
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-800 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-red-600" /> पेमेंट UPI ID / नंबर
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="उदा: 9241511070@fam"
                className="w-full bg-red-50/40 border border-red-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-red-500 font-mono"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-red-700 font-bold">PhonePe/GPay/Paytm</span>
            </div>
          </div>

          {/* QR Code Scanner Upload */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              अपना UPI QR कोड स्कैनर (QR Code Scanner Image) अपलोड करें:
            </label>
            <input 
              type="file" 
              ref={qrInputRef}
              accept="image/*" 
              onChange={handleQrUpload} 
              className="hidden" 
            />

            {!qrCodeDataUrl ? (
              <div 
                onClick={() => qrInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 rounded-2xl p-5 text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-stone-800 block">QR कोड स्कैनर फोटो चुनें</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">छात्र इस स्कैनर पर सीधे स्कैन करके पेमेंट कर पाएंगे</span>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-slate-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  <img src={qrCodeDataUrl} alt="UPI QR Code Scanner" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> QR स्कैनर सफलतापूर्वक अपलोड है
                  </div>
                  <p className="text-[11px] text-stone-500">
                    छात्र अब क्रैश कोर्स खरीदते समय इस QR कोड को स्कैन करके सीधे भुगतान कर सकेंगे।
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold text-[11px] hover:bg-black transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      स्कैनर बदलें
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrCodeDataUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-[11px] hover:bg-rose-200 transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      हटाएँ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* App Logo & DP Manager */}
          <div className="space-y-2 pt-4 border-t border-slate-200/80">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                ऐप का आधिकारिक लोगो एवं डीपी (App Official Logo & DP):
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                {appLogoUrl ? 'कस्टम डीपी एक्टिव' : 'डिफ़ॉल्ट लोगो एक्टिव'}
              </span>
            </label>
            <input 
              type="file" 
              ref={logoInputRef}
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="hidden" 
            />

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-stone-900 border-2 border-amber-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                  {appLogoUrl ? (
                    <img src={appLogoUrl} alt="App DP" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AppLogo className="w-full h-full rounded-full" />
                  )}
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                  {appLogoUrl ? 'कस्टम डीपी फोटो सेव है' : 'आधिकारिक "पढ़ेगा BR" लोगो'}
                </div>
                <p className="text-[11px] text-stone-500">
                  यह फोटो पूरे ऐप के हेडर, साइड मेनू, लॉगिन स्क्रीन और डाउनलोड पेज पर दिखाई देगी।
                </p>
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs hover:from-red-700 hover:to-amber-700 transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                    style={{ minHeight: '38px' }}
                  >
                    <Upload className="w-4 h-4" />
                    📸 अपनी असली फोटो चुनें (सेम टू सेम DP सेट करें)
                  </button>
                  {appLogoUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAppLogoUrl('');
                        await updateSettings({
                          ...appConfig,
                          appLogoUrl: ''
                        });
                        setSuccessMsg('डिफ़ॉल्ट लोगो रीसेट कर दिया गया!');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-stone-800 font-bold text-[11px] hover:bg-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                      style={{ minHeight: '38px' }}
                      title="डिफ़ॉल्ट लोगो वापस लाएँ"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      डिफ़ॉल्ट लोगो पर रीसेट करें
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Course Pricing Settings */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            2. क्रैश कोर्स सदस्यता मूल्य (Pricing Management)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">न्यू क्रैश कोर्स मूल्य (₹)</label>
              <input
                type="number"
                required
                value={price1Month}
                onChange={(e) => setPrice1Month(e.target.value)}
                placeholder="299"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 block font-bold">डिफ़ॉल्ट ₹299 सेट करें।</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">टॉपर बैच (फुल कोर्स) मूल्य (₹) *</label>
              <input
                type="number"
                required
                value={price1Year}
                onChange={(e) => setPrice1Year(e.target.value)}
                placeholder="499"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 block font-bold">डिफ़ॉल्ट ₹499 सेट करें। यही कीमत छात्रों को पॉपअप में दिखेगी।</span>
            </div>
          </div>
        </div>

        {/* Secret Crash Course Discount Coupon Code Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-400/80 rounded-3xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                  <Lock className="w-3 h-3" />
                  केवल एडमिन को ज्ञात (Admin Only)
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  ₹100 विशेष छूट
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-600" />
                <span>क्रैश कोर्स गुप्त डिस्काउंट कूपन कोड (₹100 डिस्काउंट सिस्टम)</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                यह कोड केवल आप जानते हैं। जब आप किसी विशेष छात्र को यह कोड देंगे और वह पेमेंट के समय यह कोड डालेगा, तो उसे ₹100 की छूट मिलेगी और उसे <b>₹299 के बदले मात्र ₹199</b> पे करना पड़ेगा। आप इस कोड को कभी भी यहाँ से बदल सकते हैं।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-800 flex items-center justify-between">
                <span>सक्रिय गुप्त डिस्काउंट कोड (Secret Code) *</span>
                <span className="text-[10px] text-amber-700 font-bold">छात्र इसे दर्ज करेगा</span>
              </label>
              <input
                type="text"
                required
                value={crashCourseDiscountCode}
                onChange={(e) => setCrashCourseDiscountCode(e.target.value.toUpperCase())}
                placeholder="BSEB100"
                className="w-full bg-white border-2 border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-black tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 block">
                उदा: <b>BSEB100</b>, <b>RAJ100</b>, <b>TOPPER100</b> (बड़े अक्षरों में)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-800 flex items-center justify-between">
                <span>छूट राशि (Discount in ₹)</span>
                <span className="text-[10px] text-emerald-700 font-bold">₹100 छूट</span>
              </label>
              <input
                type="number"
                required
                value={crashCourseDiscountAmount}
                onChange={(e) => setCrashCourseDiscountAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-black focus:outline-none focus:border-amber-500 shadow-xs"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 block">
                डिफ़ॉल्ट ₹100 छूट। (299 - 100 = ₹199)
              </span>
            </div>
          </div>

          {/* Live Discount Calculator Preview */}
          <div className="bg-white/90 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 font-black">
                <Percent className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-black text-stone-900 block">
                  लाइव मूल्य पूर्वावलोकन (Live Pricing Calculation):
                </span>
                <p className="text-[11px] text-stone-600">
                  सामान्य फीस: <span className="line-through text-stone-400">₹{price1Month || 299}</span> • कोड लागू होने पर: <b className="text-emerald-700 font-black text-xs">₹{Math.max(0, (parseInt(price1Month) || 299) - (parseInt(crashCourseDiscountAmount) || 100))}</b>
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-emerald-800 font-bold block">छात्र को अंतिम भुगतान</span>
              <span className="text-base font-black text-emerald-700">
                ₹{Math.max(0, (parseInt(price1Month) || 299) - (parseInt(crashCourseDiscountAmount) || 100))}
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            3. सोशल मीडिया अकाउंट लिंक्स (Social Media Links)
          </h4>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube चैनल URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/@Vidyaagent2.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram प्रोफाइल URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/unbroken_raj_01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-pink-500 font-mono text-[11px]"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp ग्रुप URL
                </label>
                <input
                  type="url"
                  value={whatsappGroupUrl}
                  onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                  placeholder="https://wa.me/919241511070"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" /> Telegram चैनल URL
                </label>
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-stone-900 hover:bg-stone-950 text-amber-400 font-black py-3.5 rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          style={{ minHeight: '44px' }}
        >
          <Save className="w-4 h-4 text-amber-400" /> सभी सेटिंग्स सेव करें (Save Settings)
        </button>
      </form>
    </div>
  );
}
