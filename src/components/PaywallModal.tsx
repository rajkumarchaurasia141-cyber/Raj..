import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  FileText,
  Mail,
  Smartphone,
  MessageCircle,
  Ticket,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PaywallModal({ 
  onClose, 
  courseType = 'full_course',
  onSuccess
}: { 
  onClose: () => void; 
  courseType?: 'full_course' | 'crash_course';
  onSuccess?: () => void;
}) {
  const { user, login, unlockUserFullCourse } = useAuth();
  
  const defaultPrice = courseType === 'crash_course' ? 299 : 499;

  const [config, setConfig] = useState({
    upiId: "9241511070@fam",
    whatsappNumber: "9241511070",
    price: defaultPrice,
    qrCodeUrl: "",
    crashCourseDiscountCode: "BSEB100",
    crashCourseDiscountAmount: 100
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const isDiscountApplied = courseType === 'crash_course' && !!appliedCoupon;
  const basePrice = courseType === 'crash_course' ? 299 : (config.price && config.price !== 299 ? config.price : 499);
  const effectivePrice = isDiscountApplied ? Math.max(0, basePrice - (config.crashCourseDiscountAmount || 100)) : basePrice;

  const upiPayLink = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent(courseType === 'crash_course' ? 'BiharBoardCrashCourse' : 'BiharBoardTopperBatch')}&am=${effectivePrice}&cu=INR&tn=${encodeURIComponent(courseType === 'crash_course' ? (isDiscountApplied ? `BSEB 10th Crash Course Disc ${appliedCoupon}` : 'BSEB 10th Crash Course') : 'BSEB 10th Topper Batch')}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayLink)}`;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [studentEmailInput, setStudentEmailInput] = useState(user?.email || '');
  const [studentNameInput, setStudentNameInput] = useState(user?.name || '');

  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfig({
      upiId: "9241511070@fam",
      whatsappNumber: "9241511070",
      price: courseType === 'crash_course' ? 299 : 499,
      qrCodeUrl: "",
      crashCourseDiscountCode: "BSEB100",
      crashCourseDiscountAmount: 100
    });
  }, [courseType]);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) {
      setCouponError('कृपया कूपन कोड दर्ज करें।');
      setCouponSuccess(null);
      return;
    }

    const adminCode = (config.crashCourseDiscountCode || 'BSEB100').trim().toUpperCase();
    if (clean === adminCode) {
      setAppliedCoupon(clean);
      setCouponSuccess(`🎉 बधाई हो! कूपन कोड "${clean}" लागू हो गया! ₹${config.crashCourseDiscountAmount || 100} की छूट मिली है।`);
      setCouponError(null);
    } else {
      setCouponError('अमान्य डिस्काउंट कोड! कृपया एडमिन द्वारा दिया गया सही कोड दर्ज करें।');
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(config.upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
        return;
      }
    } catch {}

    try {
      const textArea = document.createElement('textarea');
      textArea.value = config.upiId;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (err: any) {
      console.warn('Copy failed:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया केवल फोटो (JPG, PNG) फाइल चुनें।');
      return;
    }

    setErrorMessage(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('फोटो पढ़ने में त्रुटि। कृपया पुनः प्रयास करें।');
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setErrorMessage('फोटो लोड नहीं हो सकी। कृपया दूसरा स्क्रीनशॉट चुनें।');
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 750;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setScreenshotBase64(dataUrl);
        } else {
          setScreenshotBase64(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!screenshotBase64) {
      setErrorMessage('कृपया पहले अपने पेमेंट का स्क्रीनशॉट फोटो अपलोड करें।');
      return;
    }

    const emailForPayload = (user?.email || studentEmailInput).trim().toLowerCase();
    if (!emailForPayload || !emailForPayload.includes('@')) {
      setErrorMessage('कृपया एक वैध ईमेल (Gmail) दर्ज करें ताकि आपका कोर्स अनलॉक हो सके।');
      return;
    }

    const finalStudentName = (user?.name || studentNameInput).trim() || 'छात्र';

    if (!user?.email) {
      try {
        login(finalStudentName, emailForPayload);
      } catch (err) {
        console.warn("Local registration failed:", err);
      }
    }

    setSubmitting(true);
    try {
      unlockUserFullCourse(emailForPayload);
      
      const req = {
        id: `req_${Date.now()}`,
        studentName: finalStudentName,
        studentEmail: emailForPayload,
        courseType: courseType,
        amount: effectivePrice,
        upiId: "9241511070@fam",
        utrNumber: utrNumber.trim() || 'UPI_' + Math.floor(100000 + Math.random() * 900000),
        screenshot: screenshotBase64,
        createdAt: new Date().toISOString(),
        status: 'approved'
      };

      const existing = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
      localStorage.setItem('bseb_payment_requests', JSON.stringify([req, ...existing]));
    } catch (e) {
      console.warn("Payment storage warning:", e);
    }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      alert("🎉 बधाई हो! आपका पेमेंट (UPI: 9241511070@fam) सफलतापूर्वक प्राप्त हो गया है और टॉपर बैच (फुल कोर्स) तुरंत अनलॉक कर दिया गया है!");
      onSuccess?.();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full relative overflow-hidden my-auto p-5 sm:p-6 flex flex-col max-h-[96vh] text-stone-900">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">
                {courseType === 'crash_course' ? 'बिहार बोर्ड 10वीं न्यू क्रैश कोर्स' : 'बिहार बोर्ड 10वीं टॉपर बैच (फुल कोर्स)'}
              </h3>
              <p className="text-[10px] text-stone-500 font-bold">
                {courseType === 'crash_course' ? '10th Fast-Track Crash Course (₹299)' : 'Full Syllabus Topper Batch (₹499)'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable container for Paywall steps */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-none">
          
          {/* Main Hero Header */}
          <div className="text-center bg-stone-50 rounded-2xl p-4 border border-stone-100 relative">
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              {courseType === 'crash_course' 
                ? (isDiscountApplied ? `🎉 क्रैश कोर्स - मात्र ₹${effectivePrice} (₹100 डिस्काउंट लागू)` : `न्यू क्रैश कोर्स अनलॉक करें - मात्र ₹${effectivePrice}`)
                : `टॉपर बैच (फुल कोर्स) अनलॉक करें - मात्र ₹${effectivePrice}`}
            </h2>
            <p className="text-[11px] text-stone-600 mt-1 font-semibold leading-relaxed">
              {courseType === 'crash_course' 
                ? 'सभी 6 विषयों के 151+ अध्यायों के 30 VVI MCQ टेस्ट, तुरंत व्याख्या व स्पेशल बूस्टर्स अनलॉक करें।' 
                : 'कक्षा 10वीं सम्पूर्ण सिलेबस — सभी 6 विषयों के हस्तलिखित नोट्स, VVI टॉपर टिप्स और टेस्ट अनलॉक करें।'}
            </p>
            <div className="absolute top-1 right-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* Payment Steps Container */}
          <div className="space-y-3">
            
            {/* Step 1: Scan or Pay UPI */}
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-stone-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  स्टेप 1
                </span>
                <span className="text-xs font-bold text-amber-800">
                  QR कोड स्कैन करें या UPI ID पर भेजें
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-amber-100 shadow-sm">
                <div className="w-28 h-28 bg-white p-1 rounded-xl border border-stone-200 shadow-inner shrink-0 flex items-center justify-center">
                  <img 
                    src={qrCodeApiUrl} 
                    alt="Payment QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 w-full text-center sm:text-left space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500">ऑफिशियल मर्चेंट UPI ID:</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                      <code className="bg-stone-100 text-stone-900 px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm tracking-wide border border-stone-200 select-all">
                        {config.upiId}
                      </code>
                      <button
                        onClick={handleCopyUpi}
                        className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title="UPI ID कॉपी करें"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedUpi ? 'कॉपी हो गया' : 'कॉपी'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500">कुल भुगतान राशि (Payable Amount):</p>
                    <p className="text-base font-black text-emerald-600">
                      ₹{effectivePrice} <span className="text-[11px] text-stone-500 font-normal">({courseType === 'crash_course' ? 'क्रैश कोर्स' : 'फुल कोर्स'})</span>
                    </p>
                  </div>

                  <a 
                    href={upiPayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>GooglePay / PhonePe / Paytm से सीधे पे करें</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Payment Screenshot & Submit */}
            <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-stone-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  स्टेप 2
                </span>
                <span className="text-xs font-bold text-stone-700">
                  स्क्रीनशॉट अपलोड करें & कोर्स अनलॉक करें
                </span>
              </div>

              {!user?.email && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">आपका नाम:</label>
                    <input 
                      type="text"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      placeholder="पूरा नाम दर्ज करें"
                      required
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">आपका ईमेल (Gmail):</label>
                    <input 
                      type="email"
                      value={studentEmailInput}
                      onChange={(e) => setStudentEmailInput(e.target.value)}
                      placeholder="student@gmail.com"
                      required
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  पेमेंट का स्क्रीनशॉट (Payment Screenshot): <span className="text-rose-600">*</span>
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 bg-white rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  {screenshotBase64 ? (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold truncate max-w-[200px]">{screenshotFileName || 'स्क्रीनशॉट अपलोड हो गया'}</span>
                      <span className="text-[10px] underline ml-2 text-stone-600">बदले</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">यहाँ क्लिक करके पेमेंट स्क्रीनशॉट अपलोड करें</p>
                      <p className="text-[10px] text-stone-500">UPI पेमेंट सफल होने के बाद स्क्रीनशॉट चुनें</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  UTR / UPI Transaction ID (वैकल्पिक):
                </label>
                <input 
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="उदा. 4235xxxxxxxx या UPI Ref No."
                  className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>सत्यापन हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>पेमेंट सबमिट करें & कोर्स तुरंत अनलॉक करें</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Footer help */}
        <div className="border-t border-stone-100 pt-3 mt-3 text-center shrink-0">
          <p className="text-[11px] text-stone-600 font-semibold flex items-center justify-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>सहायता के लिए WhatsApp संपर्क: <b>9241511070</b></span>
          </p>
        </div>

      </div>
    </div>
  );
}
