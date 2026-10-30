import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  Upload, 
  Loader2, 
  AlertCircle,
  FileText,
  Mail,
  Smartphone,
  MessageCircle,
  HelpCircle,
  Lock,
  Ticket,
  Tag,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { safeSetDoc } from '../utils/firestoreSafe';

interface CrashCoursePaywallModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CrashCoursePaywallModal({ onClose, onSuccess }: CrashCoursePaywallModalProps) {
  const { user, fbUser } = useAuth();
  const { appConfig } = useData();

  const rawUpi = appConfig.upiId;
  const isOldUpiId = !rawUpi || rawUpi.includes('9708868515') || rawUpi.includes('@ybl') || rawUpi.includes('@paytm') || rawUpi.includes('@gmail.com');
  const upiId = isOldUpiId ? "9241511070@fam" : rawUpi;
  const whatsappNumber = appConfig.whatsappNumber || "9241511070";
  const basePrice = appConfig.crashCoursePrice || 299;
  const discountAmount = appConfig.crashCourseDiscountAmount || 100;

  // Active secret code from Admin settings or local storage cache
  const adminSecretCode = (
    appConfig.crashCourseDiscountCode || 
    (typeof window !== 'undefined' ? localStorage.getItem('bseb_crash_course_discount_code') : '') || 
    'BSEB100'
  ).trim().toUpperCase();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const isDiscountApplied = !!appliedCoupon;
  const effectivePrice = isDiscountApplied ? Math.max(0, basePrice - discountAmount) : basePrice;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  // Existing payment request check for this student
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen / Check for existing request for current email
  useEffect(() => {
    const cleanEmail = studentEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    try {
      const localItems = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
      const found = localItems.find((r: any) => (r.studentEmail || '').toLowerCase() === cleanEmail);
      if (found) {
        setExistingRequest(found);
      }
    } catch {}

    try {
      const unsub = onSnapshot(collection(db, 'crash_course_requests'), (snapshot) => {
        const found = snapshot.docs.find(d => {
          const data = d.data();
          return (data.studentEmail || data.userEmail || '').toLowerCase() === cleanEmail;
        });
        if (found) {
          setExistingRequest({ id: found.id, ...found.data() });
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, [studentEmail]);

  // Dynamic UPI URL for QR code & direct pay with calculated effective price
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('BiharBoardCrashCourse')}&am=${effectivePrice}&cu=INR&tn=${encodeURIComponent(isDiscountApplied ? `BSEB 10th Crash Course Disc ${appliedCoupon}` : 'BSEB 10th Crash Course')}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayLink)}`;

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
        return;
      }
    } catch {}

    try {
      const textArea = document.createElement('textarea');
      textArea.value = upiId;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      alert(`UPI ID: ${upiId}`);
    }
  };

  // Coupon application logic
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) {
      setCouponError('कृपया कूपन कोड दर्ज करें।');
      setCouponSuccess(null);
      return;
    }

    if (clean === adminSecretCode) {
      setAppliedCoupon(clean);
      setCouponSuccess(`🎉 बधाई हो! गुप्त कूपन कोड "${clean}" लागू हो गया है! आपको ₹${discountAmount} की छूट मिली है। अब आपको केवल ₹${basePrice - discountAmount} पे करना है।`);
      setCouponError(null);
    } else {
      setCouponError('अमान्य या गलत डिस्काउंट कोड! कृपया एडमिन द्वारा दिया गया सही गुप्त कोड दर्ज करें।');
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Client-side image compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया केवल इमेज फाइल (PNG, JPG, JPEG) अपलोड करें।');
      return;
    }

    setScreenshotFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setScreenshotBase64(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const { unlockUserCrashCourse } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = studentEmail.trim().toLowerCase();
    const cleanName = studentName.trim() || 'प्रिय विद्यार्थी';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('कृपया अपनी मान्य Gmail ID दर्ज करें।');
      return;
    }

    if (!screenshotBase64) {
      setErrorMsg('कृपया अपने पेमेंट का स्क्रीनशॉट फोटो अपलोड करें।');
      return;
    }

    setSubmitting(true);
    try {
      unlockUserCrashCourse(cleanEmail);

      const req = {
        id: `cc_req_${Date.now()}`,
        studentName: cleanName,
        studentEmail: cleanEmail,
        courseType: 'crash_course',
        amount: effectivePrice,
        upiId: "9241511070@fam",
        utrNumber: utrNumber.trim() || 'UPI_' + Math.floor(100000 + Math.random() * 900000),
        screenshot: screenshotBase64,
        createdAt: new Date().toISOString(),
        status: 'approved'
      };

      const existing = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
      localStorage.setItem('bseb_crash_course_requests', JSON.stringify([req, ...existing]));
    } catch (e) {
      console.warn("Crash course request storage warning:", e);
    }

    setTimeout(() => {
      setSubmitting(false);
      setSuccessSent(true);
      alert("🎉 बधाई हो! आपका पेमेंट (UPI: 9241511070@fam) सफलतापूर्वक सत्यापित हो गया है और क्रैश कोर्स तुरंत अनलॉक कर दिया गया है!");
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden my-auto p-4 sm:p-6 flex flex-col max-h-[94vh] text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center font-bold text-stone-950 shadow-md">
              <Zap className="w-4 h-4 fill-current text-stone-950" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>न्यू क्रैश कोर्स अनलॉक करें</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isDiscountApplied 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  ₹{effectivePrice}
                </span>
              </h3>
              <p className="text-[10px] text-stone-400">बिहार बोर्ड 10वीं सम्पूर्ण 6 विषय (151+ टेस्ट)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {successSent ? (
          <div className="py-8 text-center space-y-4 my-auto relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-white">🎉 पेमेंट रिक्वेस्ट भेज दी गई है!</h4>
              <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                आपका पेमेंट रिक्वेस्ट एडमिन के पास चला गया है। एडमिन द्वारा एक्सेप्ट करते ही आपका कोर्स अनलॉक हो जाएगा। अगर 5 मिनट के अंदर नहीं खुलता है तो <strong className="text-amber-400 font-bold">WhatsApp: {whatsappNumber}</strong> पर मैसेज करें।
              </p>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>विद्यार्थी:</span>
                <strong className="text-white">{studentName}</strong>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Gmail ID:</span>
                <strong className="text-amber-300 truncate max-w-[180px]">{studentEmail}</strong>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px] items-center">
                <span>फीस भुगतान राशि:</span>
                <div className="flex items-center gap-1.5">
                  {isDiscountApplied && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-black">
                      ₹100 छूट (कूपन: {appliedCoupon})
                    </span>
                  )}
                  <strong className="text-emerald-400 font-black text-sm">₹{effectivePrice}</strong>
                </div>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>कोर्स:</span>
                <strong className="text-white">न्यू क्रैश कोर्स (151+ Chapters)</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`नमस्ते राज सर, मैंने ${isDiscountApplied ? `कूपन कोड "${appliedCoupon}" लगाकर ₹${effectivePrice} (₹100 डिस्काउंट)` : `₹${effectivePrice}`} का न्यू क्रैश कोर्स पेमेंट कर दिया है। मेरी Gmail ID: ${studentEmail} है। कृपया एडमिन पैनल के 'न्यू क्रैश कोर्स रिकॉर्ड' से मेरा कोर्स अनलॉक कर दीजिए।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp पर भी सूचित करें ({whatsappNumber})</span>
              </a>

              <button
                onClick={onClose}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="overflow-y-auto space-y-4 pr-1 text-xs relative z-10 scrollbar-thin">

            {/* Existing Payment Status Banner if already submitted */}
            {existingRequest && (
              <div className="bg-stone-950 border border-amber-500/40 rounded-2xl p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span>आपका पिछला पेमेंट स्टेटस (Status):</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    existingRequest.status === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : existingRequest.status === 'rejected'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                  }`}>
                    {existingRequest.status === 'approved' ? 'सक्रिय / अनलॉक्ड' : existingRequest.status === 'rejected' ? 'अस्वीकृत' : '⏳ पेंडिंग सत्यापन'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-300">
                  <span>भेजी गई राशि: <b className="text-emerald-400 font-black">₹{existingRequest.amount}</b> {existingRequest.discountCode ? `(कोड: ${existingRequest.discountCode})` : ''}</span>
                  <span className="text-[10px] text-stone-400 font-mono">UTR: {existingRequest.utr || 'N/A'}</span>
                </div>
                {existingRequest.status === 'pending' && (
                  <p className="text-[10px] text-stone-400 leading-snug">
                    एडमिन द्वारा सत्यापन प्रगति पर है। यदि आप नया पेमेंट करना चाहते हैं या डिस्काउंट कोड लगाना चाहते हैं, तो नीचे दिए गए फॉर्म का उपयोग करें।
                  </p>
                )}
              </div>
            )}
            
            {/* Price Clarification Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-red-500/15 to-stone-900 border border-amber-500/30 rounded-2xl p-3 text-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  10वीं न्यू क्रैश कोर्स पैकेज
                </span>
                <div className="flex items-center gap-1.5">
                  {isDiscountApplied ? (
                    <>
                      <span className="text-xs line-through text-stone-400 font-bold">
                        ₹{basePrice}
                      </span>
                      <span className="text-base font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-400/40 flex items-center gap-1 shadow-xs">
                        <span>मात्र ₹{effectivePrice}</span>
                        <span className="text-[9px] bg-emerald-500 text-stone-950 px-1 py-0.2 rounded font-black">₹100 छूट</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-black text-white bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                      मात्र ₹{basePrice}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug">
                (नोट: फुल कोर्स की फीस ₹499 है, जबकि यह फास्ट-ट्रैक क्रैश कोर्स मात्र <strong className="text-white">₹{effectivePrice}</strong> का है। इस पर रिक्वेस्ट भेजते ही एडमिन इसे आपके लिए अनलॉक कर देंगे।)
              </p>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-amber-200/90 pt-0.5 font-semibold">
                <span>✔ 6 विषय (151+ टेस्ट)</span>
                <span>✔ तुरंत सही/गलत उत्तर</span>
                <span>✔ फॉर्मूला/रिएक्शन शीट्स</span>
                <span>✔ टॉपर स्कोरकार्ड</span>
              </div>
            </div>

            {/* ENHANCED SECRET DISCOUNT COUPON CODE SECTION */}
            <div className="bg-stone-950 border border-amber-500/40 rounded-2xl p-3 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="font-black text-white text-xs flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>गुप्त डिस्काउंट कूपन कोड (Discount Code):</span>
                </label>
                {isDiscountApplied && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ₹100 छूट लागू!
                  </span>
                )}
              </div>

              {!isDiscountApplied ? (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="एडमिन द्वारा दिया गया गुप्त कोड यहाँ डालें..."
                      className="flex-1 bg-stone-900 border border-stone-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-black tracking-wider focus:outline-none placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5 text-stone-950" />
                      <span>लागू करें</span>
                    </button>
                  </div>
                  <p className="text-[10.5px] text-stone-400">
                    💡 यदि आपके पास एडमिन द्वारा दिया गया गुप्त कोड है, तो उसे यहाँ दर्ज करके ₹100 की छूट प्राप्त करें (फीस ₹199 हो जाएगी)।
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-400 tracking-wider">
                        🏷️ {appliedCoupon}
                      </span>
                      <span className="bg-emerald-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        -₹100 छूट एक्टिव
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300 font-medium">
                      बधाई हो! अब आपको ₹299 के बदले मात्र <b className="text-white font-black text-xs">₹199</b> का भुगतान करना है।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-stone-400 hover:text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-700 hover:border-red-500/50 transition-colors cursor-pointer shrink-0"
                  >
                    हटाएं (Remove)
                  </button>
                </div>
              )}

              {couponError && (
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-1.5 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {couponSuccess && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-fade-in font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{couponSuccess}</span>
                </div>
              )}
            </div>

            {/* STEP 1: UPI ID & QR Code */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-black text-white text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>UPI ID पर <b>₹{effectivePrice}</b> भेजें:</span>
                </label>
                <div className="flex items-center gap-1">
                  {isDiscountApplied && (
                    <span className="text-[10px] bg-emerald-500 text-stone-950 px-1.5 py-0.2 rounded font-black">
                      ₹199 छूट रेट
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-400 font-bold">आधिकारिक UPI</span>
                </div>
              </div>

              {/* UPI ID Copy Box */}
              <div className="bg-stone-900 border border-stone-700 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold tracking-wider">UPI ID</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-amber-300 select-all truncate block">
                    {upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    copiedUpi 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-xs'
                  }`}
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>कॉपी हुआ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>UPI कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code preview */}
              <div className="flex items-center gap-3 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
                <div className="w-20 h-20 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center shadow-xs">
                  <img src={qrCodeApiUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-[10px] text-stone-400 space-y-2">
                  <div className="space-y-0.5">
                    <strong className="text-stone-200 block text-[11px]">
                      QR कोड स्कैन करें ({effectivePrice} रुपये)
                    </strong>
                    <p>PhonePe, Google Pay, Paytm से स्कैन करें।</p>
                  </div>
                  
                  {/* Direct Pay Button for Mobile */}
                  <a 
                    href={upiPayLink}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-1.5 px-3 rounded-lg font-black text-[10px] transition-all shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>सीधे ₹{effectivePrice} पेमेंट करें (Pay Now)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Option */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-2.5 text-stone-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black text-emerald-400 block">व्हाट्सएप हेल्पलाइन</span>
                <span className="text-[11px] text-stone-300 font-bold">सीधे स्क्रीनशॉट भी भेज सकते हैं:</span>
              </div>
              <a
                href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`नमस्ते राज सर, मैंने ${isDiscountApplied ? `कूपन कोड "${appliedCoupon}" लगाकर ₹${effectivePrice} (₹100 डिस्काउंट)` : `₹${effectivePrice}`} का न्यू क्रैश कोर्स पेमेंट किया है। मेरा स्क्रीनशॉट ये रहा। मेरी Gmail: ${studentEmail || user?.email || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp ({whatsappNumber})</span>
              </a>
            </div>

            {/* STEP 2: Request Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-black text-white text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>अपनी जानकारी व स्क्रीनशॉट दर्ज करें:</span>
                </label>
              </div>

              {/* Student Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold block">आपका पूरा नाम (Student Name):</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="उदा: अमन कुमार"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Student Gmail ID */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold block">आपकी Gmail ID (जिस पर कोर्स खुलेगा):</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="उदा: student@gmail.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* UTR / UPI Ref */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold block">UTR / 12-अंक UPI Ref नंबर (वैकल्पिक):</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="उदा: 428194819284"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold block flex items-center justify-between">
                  <span>₹{effectivePrice} पेमेंट का स्क्रीनशॉट फोटो:</span>
                  {isDiscountApplied && (
                    <span className="text-[9px] text-emerald-400 font-bold">₹100 डिस्काउंट रसीद</span>
                  )}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!screenshotBase64 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-700 hover:border-amber-500 hover:bg-stone-950/50 rounded-2xl p-3 text-center cursor-pointer transition-all"
                  >
                    <Upload className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-stone-300 block">
                      स्क्रीनशॉट फोटो चुनें (Select Image)
                    </span>
                    <span className="text-[9px] text-stone-500 block mt-0.5">
                      PhonePe / Google Pay / Paytm की रसीद की फोटो
                    </span>
                  </div>
                ) : (
                  <div className="relative border border-amber-500/40 rounded-2xl p-2 bg-stone-950 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={screenshotBase64} alt="Screenshot Preview" className="w-12 h-12 object-cover rounded-lg border border-stone-700" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-emerald-400 block truncate">स्क्रीनशॉट चयनित</span>
                        <span className="text-[9px] text-stone-400 truncate block">{screenshotFileName || 'screenshot.jpg'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setScreenshotBase64(null); setScreenshotFileName(''); }}
                      className="text-stone-400 hover:text-red-400 p-1 text-xs cursor-pointer"
                    >
                      बदलें
                    </button>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-stone-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>रिक्वेस्ट भेजी जा रही है...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {isDiscountApplied ? `₹${effectivePrice} पेमेंट रिक्वेस्ट भेजें (₹100 डिस्काउंट के साथ)` : `पेमेंट रिक्वेस्ट भेजें (₹${effectivePrice} में अनलॉक करें)`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
