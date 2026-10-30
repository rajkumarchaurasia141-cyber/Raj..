import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  Search, 
  ZoomIn, 
  X, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  ShieldCheck, 
  CircleDollarSign, 
  Hourglass, 
  RefreshCw,
  MessageCircle,
  Lock,
  Unlock,
  AlertCircle,
  Ticket,
  Save,
  Tag
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CrashCoursePaymentRequestItem } from '../types';

export function AdminNewCrashCourseRecords() {
  const { appConfig, updateSettings } = useData();
  const [requests, setRequests] = useState<CrashCoursePaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<CrashCoursePaymentRequestItem | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Secret Code Editing Modal
  const [showCodeEditModal, setShowCodeEditModal] = useState(false);
  const [editingCode, setEditingCode] = useState(appConfig.crashCourseDiscountCode || 'BSEB100');
  const [editingDiscountAmount, setEditingDiscountAmount] = useState((appConfig.crashCourseDiscountAmount || 100).toString());
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    if (appConfig.crashCourseDiscountCode) {
      setEditingCode(appConfig.crashCourseDiscountCode);
    }
    if (appConfig.crashCourseDiscountAmount) {
      setEditingDiscountAmount(appConfig.crashCourseDiscountAmount.toString());
    }
  }, [appConfig.crashCourseDiscountCode, appConfig.crashCourseDiscountAmount]);

  const whatsappNumber = "9241511070";

  // Real-time synchronization
  useEffect(() => {
    setLoading(true);

    const updateFromSnapshot = (docs: any[]) => {
      const itemsMap = new Map<string, CrashCoursePaymentRequestItem>();

      docs.forEach((d) => {
        const data = d.data();
        const amt = Number(data.amount) || 299;
        itemsMap.set(d.id, {
          id: d.id,
          userId: data.userId || data.uid || '',
          studentName: data.studentName || data.userName || 'विद्यार्थी',
          studentEmail: (data.studentEmail || data.userEmail || data.email || '').trim().toLowerCase(),
          courseName: data.courseName || 'न्यू क्रैश कोर्स (Class 10th)',
          amount: amt,
          originalPrice: data.originalPrice || 299,
          discountAmount: data.discountAmount || (amt === 199 ? 100 : 0),
          discountCode: data.discountCode || (amt === 199 ? (data.couponCode || 'BSEB100') : undefined),
          screenshotDataUrl: data.screenshotDataUrl || data.screenshotBase64 || data.screenshotUrl || '',
          utr: data.utr || data.upiRef || '',
          status: data.status || 'pending',
          submittedAt: data.submittedAt || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          approvedAt: data.approvedAt
        });
      });

      // Merge local storage items for offline / quota robustness
      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
        localItems.forEach((loc: any) => {
          if (!itemsMap.has(loc.id)) {
            const locAmt = Number(loc.amount) || 299;
            itemsMap.set(loc.id, {
              id: loc.id,
              userId: loc.userId || '',
              studentName: loc.studentName || loc.userName || 'विद्यार्थी',
              studentEmail: (loc.studentEmail || loc.userEmail || '').trim().toLowerCase(),
              courseName: loc.courseName || 'न्यू क्रैश कोर्स (Class 10th)',
              amount: locAmt,
              originalPrice: loc.originalPrice || 299,
              discountAmount: loc.discountAmount || (locAmt === 199 ? 100 : 0),
              discountCode: loc.discountCode || (locAmt === 199 ? (loc.couponCode || 'BSEB100') : undefined),
              screenshotDataUrl: loc.screenshotDataUrl || loc.screenshotBase64 || '',
              utr: loc.utr || loc.upiRef || '',
              status: loc.status || 'pending',
              submittedAt: loc.submittedAt || new Date().toISOString(),
              approvedAt: loc.approvedAt
            });
          }
        });
      } catch {}

      const list = Array.from(itemsMap.values()).sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setRequests(list);
      setLoading(false);
    };

    try {
      // 1. Subscribe to crash_course_requests
      const unsub = onSnapshot(collection(db, 'crash_course_requests'), (snapshot) => {
        updateFromSnapshot(snapshot.docs);
      }, (err) => {
        console.warn("Crash course requests snapshot notice:", err?.message);
        // Fallback to local storage
        try {
          const localItems = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
          setRequests(localItems);
        } catch {}
        setLoading(false);
      });

      return () => unsub();
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSaveCouponCode = async () => {
    if (!editingCode.trim()) return;
    setSavingCode(true);
    const cleanCode = editingCode.trim().toUpperCase();
    const cleanAmount = parseInt(editingDiscountAmount) || 100;
    try {
      await updateSettings({
        ...appConfig,
        crashCourseDiscountCode: cleanCode,
        crashCourseDiscountAmount: cleanAmount
      });
      try {
        localStorage.setItem('bseb_crash_course_discount_code', cleanCode);
        localStorage.setItem('bseb_crash_course_discount_amount', cleanAmount.toString());
      } catch {}
      setToastMessage(`✅ गुप्त कूपन कोड "${cleanCode}" (-₹${cleanAmount} छूट) सफलतापूर्वक अपडेट हो गया!`);
      setShowCodeEditModal(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      alert("कोड सेव करने में समस्या: " + (e?.message || String(e)));
    } finally {
      setSavingCode(false);
    }
  };

  // UNLOCK Crash Course for student
  const handleApprove = async (req: CrashCoursePaymentRequestItem) => {
    setProcessingId(req.id);
    setActionMsg(null);
    try {
      const cleanEmail = req.studentEmail.trim().toLowerCase();
      const userId = req.userId || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const nowIso = new Date().toISOString();

      // 1. Set hasCrashCourse: true in users/{userId}
      try {
        await safeSetDoc(doc(db, 'users', userId), {
          hasCrashCourse: true,
          isCrashCoursePaid: true,
          email: cleanEmail,
          name: req.studentName || ''
        }, { merge: true }, 5000, true);
      } catch (e) {
        console.warn("User update notice:", e);
      }

      // 2. Set in crash_course_access/{cleanEmail} collection
      try {
        await safeSetDoc(doc(db, 'crash_course_access', cleanEmail), {
          unlocked: true,
          isPaid: true,
          course: 'new_crash_course',
          amount: 299,
          studentName: req.studentName || '',
          email: cleanEmail,
          unlockedAt: nowIso
        }, { merge: true }, 5000, true);
      } catch (e) {
        console.warn("Crash course access record notice:", e);
      }

      // 3. Mark request status as approved in crash_course_requests
      try {
        await safeSetDoc(doc(db, 'crash_course_requests', req.id), {
          status: 'approved',
          approvedAt: nowIso
        }, { merge: true }, 5000, true);
      } catch (e) {
        console.warn("Crash course request doc update notice:", e);
      }

      // 4. Also sync status in payment_requests
      try {
        await safeSetDoc(doc(db, 'payment_requests', req.id), {
          status: 'approved',
          approvedAt: nowIso
        }, { merge: true }, 5000, true);
      } catch {}

      // 5. Update local storage cache for instant offline / local unlock
      try {
        localStorage.setItem(`bseb_crash_course_unlocked_${cleanEmail}`, 'true');
        const localList = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
        const updatedLocal = localList.map((item: any) => 
          item.id === req.id ? { ...item, status: 'approved', approvedAt: nowIso } : item
        );
        localStorage.setItem('bseb_crash_course_requests', JSON.stringify(updatedLocal));
      } catch {}

      // Update in-memory state
      setRequests(prev => prev.map(item => 
        item.id === req.id ? { ...item, status: 'approved', approvedAt: nowIso } : item
      ));

      setToastMessage(`🎉 छात्र ${req.studentName} का न्यू क्रैश कोर्स (₹299) सफलतापूर्वक अनलॉक हो गया!`);
      setTimeout(() => setToastMessage(null), 4000);

      setActionMsg(`सफलता! ${req.studentName} (${cleanEmail}) का क्रैश कोर्स अनलॉक कर दिया गया है।`);
      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'approved', approvedAt: nowIso } : null);
      }
    } catch (err: any) {
      alert('अनलॉक करने में त्रुटि: ' + (err?.message || 'पुनः प्रयास करें'));
    } finally {
      setProcessingId(null);
    }
  };

  // LOCK (Revoke) Crash Course if needed
  const handleLockRevoke = async (req: CrashCoursePaymentRequestItem) => {
    if (!confirm(`क्या आप ${req.studentName} का क्रैश कोर्स पुनः लॉक करना चाहते हैं?`)) return;
    setProcessingId(req.id);
    try {
      const cleanEmail = req.studentEmail.trim().toLowerCase();
      const userId = req.userId || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

      await safeSetDoc(doc(db, 'crash_course_access', cleanEmail), { unlocked: false }, { merge: true });
      await safeSetDoc(doc(db, 'users', userId), { hasCrashCourse: false, isCrashCoursePaid: false }, { merge: true });
      await safeSetDoc(doc(db, 'crash_course_requests', req.id), { status: 'pending' }, { merge: true });

      try {
        localStorage.setItem(`bseb_crash_course_unlocked_${cleanEmail}`, 'false');
      } catch {}

      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'pending' } : item));
      setActionMsg(`छात्र ${req.studentName} का क्रैश कोर्स लॉक कर दिया गया है।`);
    } catch (err: any) {
      alert('त्रुटि: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Request
  const handleReject = async (req: CrashCoursePaymentRequestItem) => {
    if (!confirm(`क्या आप ${req.studentName} के इस पेमेंट अनुरोध को अस्वीकृत (Reject) करना चाहते हैं?`)) return;
    setProcessingId(req.id);
    try {
      await safeSetDoc(doc(db, 'crash_course_requests', req.id), { status: 'rejected' }, { merge: true });
      await safeSetDoc(doc(db, 'payment_requests', req.id), { status: 'rejected' }, { merge: true });

      try {
        const localList = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
        const updatedLocal = localList.map((item: any) => item.id === req.id ? { ...item, status: 'rejected' } : item);
        localStorage.setItem('bseb_crash_course_requests', JSON.stringify(updatedLocal));
      } catch {}

      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'rejected' } : item));
      setActionMsg(`अनुरोध अस्वीकृत कर दिया गया।`);
      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: any) {
      alert('रिजेक्ट करने में त्रुटि: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Request
  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस रिकॉर्ड को हमेशा के लिए हटाना चाहते हैं?')) return;
    try {
      await safeDeleteDoc(doc(db, 'crash_course_requests', id));
      await safeDeleteDoc(doc(db, 'payment_requests', id));

      try {
        const localList = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
        localStorage.setItem('bseb_crash_course_requests', JSON.stringify(localList.filter((i: any) => i.id !== id)));
      } catch {}

      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
      setActionMsg('रिकॉर्ड हटा दिया गया।');
    } catch (err: any) {
      alert('डिलीट करने में त्रुटि: ' + err.message);
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter(req => {
    if (filter === 'pending' && req.status !== 'pending') return false;
    if (filter === 'approved' && req.status !== 'approved') return false;
    if (filter === 'rejected' && req.status !== 'rejected') return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = req.studentName.toLowerCase().includes(q);
      const matchEmail = req.studentEmail.toLowerCase().includes(q);
      const matchUtr = (req.utr || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchUtr;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalAmountReceived = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (Number(r.amount) || 299), 0);

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2500);
        return;
      }
    } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2500);
    } catch {}
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span className="font-black text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-amber-400/40">
        <div className="absolute top-0 right-0 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center font-black text-amber-300 shadow-md shrink-0">
              <Zap className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black/40 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-yellow-300/30">
                  स्पेशल एडमिन रिकॉर्ड
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-300/30">
                  क्रैश कोर्स फीस: ₹299
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                न्यू क्रैश कोर्स रिकॉर्ड (New Crash Course Records)
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                यहाँ केवल ₹299 क्रैश कोर्स वाले छात्रों के पेमेंट अनुरोध आएंगे। यहाँ से अनलॉक करने पर उनका क्रैश कोर्स खुलेगा।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/91${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
              title="WhatsApp पर जुड़ें"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp ({whatsappNumber})</span>
            </a>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-white/15">
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-200 font-bold block uppercase">कुल अनुरोध</span>
            <span className="text-xl font-black text-white">{requests.length}</span>
          </div>
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-yellow-300 font-bold block uppercase flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-yellow-300" /> पेंडिंग अनलॉक
            </span>
            <span className="text-xl font-black text-yellow-300">{pendingCount}</span>
          </div>
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-emerald-300 font-bold block uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" /> सक्रिय (अनलॉक्ड)
            </span>
            <span className="text-xl font-black text-emerald-300">{approvedCount}</span>
          </div>
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-200 font-bold block uppercase flex items-center gap-1">
              <CircleDollarSign className="w-3 h-3 text-amber-300" /> कुल फीस संग्रह
            </span>
            <span className="text-xl font-black text-white">₹{totalAmountReceived.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Active Secret Discount Code Quick Control Strip */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0 border border-amber-500/30 shadow-xs">
            <Ticket className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white">सक्रिय ₹100 डिस्काउंट कूपन कोड:</span>
              <span className="font-mono text-xs font-black bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-md tracking-wider shadow-xs">
                {appConfig.crashCourseDiscountCode || 'BSEB100'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-400" /> ₹{appConfig.crashCourseDiscountAmount || 100} छूट (छात्र को देय: ₹199)
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              यह कोड केवल आप जानते हैं। जब आप किसी बच्चे को यह कोड देंगे तो उसे ₹299 के बदले मात्र <b>₹199</b> का भुगतान करना पड़ेगा।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCode(appConfig.crashCourseDiscountCode || 'BSEB100');
            setEditingDiscountAmount((appConfig.crashCourseDiscountAmount || 100).toString());
            setShowCodeEditModal(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Lock className="w-3.5 h-3.5 text-stone-950" />
          <span>कोड बदलें (Change Secret Code)</span>
        </button>
      </div>

      {/* Code Edit Modal */}
      {showCodeEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Ticket className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm font-black text-white">डिस्काउंट कूपन कोड बदलें</h4>
              </div>
              <button
                onClick={() => setShowCodeEditModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-bold block">नया गुप्त कूपन कोड (Coupon Code):</label>
                <input
                  type="text"
                  required
                  value={editingCode}
                  onChange={(e) => setEditingCode(e.target.value.toUpperCase())}
                  placeholder="BSEB100"
                  className="w-full bg-stone-950 border-2 border-amber-400/80 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-mono font-black uppercase tracking-wider focus:outline-none"
                />
                <span className="text-[10px] text-stone-500">उदा: BSEB100, RAJ100, SPECIAL100</span>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-bold block">छूट राशि (Discount Amount in ₹):</label>
                <input
                  type="number"
                  required
                  value={editingDiscountAmount}
                  onChange={(e) => setEditingDiscountAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-500">डिफ़ॉल्ट ₹100 छूट (छात्र को देय: ₹199)</span>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="flex justify-between">
                  <span>सामान्य क्रैश कोर्स फीस:</span>
                  <span className="text-white font-bold">₹299</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>कूपन छूट:</span>
                  <span className="font-bold">-₹{editingDiscountAmount || 100}</span>
                </div>
                <div className="flex justify-between text-white font-black border-t border-stone-800 pt-1 text-xs">
                  <span>छात्र द्वारा भुगतान राशि:</span>
                  <span className="text-emerald-400 font-mono">₹{Math.max(0, 299 - (parseInt(editingDiscountAmount) || 100))}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCodeEditModal(false)}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveCouponCode}
                disabled={savingCode}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-stone-950" />
                <span>{savingCode ? 'सेव हो रहा है...' : 'कोड सेव करें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-amber-500 text-stone-950 shadow-sm' 
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            सभी ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'pending' 
                ? 'bg-yellow-400 text-stone-950 shadow-sm' 
                : 'bg-stone-800 text-yellow-400 hover:bg-stone-700'
            }`}
          >
            <span>पेंडिंग ({pendingCount})</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filter === 'approved' 
                ? 'bg-emerald-500 text-stone-950 shadow-sm' 
                : 'bg-stone-800 text-emerald-400 hover:bg-stone-700'
            }`}
          >
            अनलॉक्ड ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filter === 'rejected' 
                ? 'bg-red-500 text-white shadow-sm' 
                : 'bg-stone-800 text-red-400 hover:bg-stone-700'
            }`}
          >
            अस्वीकृत ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="छात्र का नाम, Gmail या UTR खोजें..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-sm font-bold">क्रैश कोर्स रिकॉर्ड लोड हो रहे हैं...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">कोई क्रैश कोर्स रिकॉर्ड नहीं मिला</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {search 
                ? `"${search}" से संबंधित कोई रिकॉर्ड नहीं मिला।` 
                : filter === 'pending' 
                  ? 'कोई पेंडिंग क्रैश कोर्स रिक्वेस्ट नहीं है। सभी छात्रों के कोर्स अपडेटेड हैं।' 
                  : 'छात्र जब क्रैश कोर्स का ₹299 भुगतान करके रिक्वेस्ट भेजेंगे, वे सीधे यहाँ दिखाई देंगे।'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`bg-stone-900 border rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending 
                    ? 'border-yellow-500/50 shadow-md hover:border-yellow-400 bg-stone-900/90' 
                    : isApproved
                      ? 'border-stone-800 hover:border-emerald-500/40 bg-stone-900/60'
                      : 'border-stone-800/60 opacity-75'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Screenshot Thumbnail with zoom */}
                  {req.screenshotDataUrl ? (
                    <div 
                      onClick={() => setSelectedImage(req)}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 relative group cursor-pointer bg-stone-950"
                      title="स्क्रीनशॉट बड़ा करके देखें"
                    >
                      <img 
                        src={req.screenshotDataUrl} 
                        alt="Payment Screenshot" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-800 border border-stone-700 flex flex-col items-center justify-center text-stone-500 shrink-0 text-[10px]">
                      <span>No Slip</span>
                    </div>
                  )}

                  {/* Student Details */}
                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm sm:text-base text-white truncate">
                        {req.studentName}
                      </h4>

                      {/* Status Badges */}
                      {isPending && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          req.amount === 199 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>पेंडिंग सत्यापन (₹{req.amount})</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>सक्रिय / अनलॉक्ड</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>अस्वीकृत</span>
                        </span>
                      )}

                      {(req.discountCode || req.amount === 199) && (
                        <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Ticket className="w-3 h-3 text-emerald-400" />
                          <span>🏷️ कोड लागू: {req.discountCode || 'BSEB100'} (-₹{req.discountAmount || 100} छूट)</span>
                        </span>
                      )}
                    </div>

                    {/* Email and Copy */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-300">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono truncate select-all">{req.studentEmail}</span>
                      <button
                        onClick={() => handleCopy(req.studentEmail)}
                        className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
                        title="Gmail कॉपी करें"
                      >
                        {copiedEmail === req.studentEmail ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* UTR and Date */}
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 flex-wrap pt-0.5">
                      <span className="bg-stone-950 px-2 py-0.5 rounded border border-stone-800 font-mono text-amber-300">
                        UTR: {req.utr || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.submittedAt).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`font-black ${req.amount === 199 ? 'text-emerald-400 font-mono' : 'text-amber-300'}`}>
                        फीस: ₹{req.amount} {req.amount === 199 ? '(₹100 छूट)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap shrink-0 border-t md:border-t-0 border-stone-800 pt-3 md:pt-0">
                  {/* UNLOCK / APPROVE Button */}
                  {isPending && (
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={processingId === req.id}
                      className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{processingId === req.id ? 'अनलॉक हो रहा है...' : '🔓 क्रैश कोर्स अनलॉक करें'}</span>
                    </button>
                  )}

                  {/* Contact on WhatsApp */}
                  <a
                    href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`नमस्ते ${req.studentName}, आपके ₹299 क्रैश कोर्स पेमेंट रिक्वेस्ट के संबंध में...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-stone-800 hover:bg-emerald-900/30 text-emerald-500 border border-stone-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
                    title="WhatsApp पर बात करें"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </a>

                  {/* Re-Lock Button if approved */}
                  {isApproved && (
                    <button
                      onClick={() => handleLockRevoke(req)}
                      disabled={processingId === req.id}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="कोर्स दोबारा लॉक करें"
                    >
                      <Lock className="w-3.5 h-3.5 text-yellow-400" />
                      <span>पुनः लॉक करें</span>
                    </button>
                  )}

                  {/* Reject Button */}
                  {isPending && (
                    <button
                      onClick={() => handleReject(req)}
                      disabled={processingId === req.id}
                      className="px-3 py-2 bg-stone-800 hover:bg-red-950/60 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl border border-stone-700 transition-all flex items-center gap-1 cursor-pointer"
                      title="रिजेक्ट करें"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>रिजेक्ट</span>
                    </button>
                  )}

                  {/* WhatsApp contact */}
                  <a
                    href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`नमस्ते ${req.studentName}, आपके ₹299 के 10वीं क्रैश कोर्स रिक्वेस्ट के संबंध में... (Gmail: ${req.studentEmail})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900 rounded-xl transition-all cursor-pointer"
                    title="WhatsApp पर संदेश भेजें"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Zoom screenshot */}
                  {req.screenshotDataUrl && (
                    <button
                      onClick={() => setSelectedImage(req)}
                      className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all cursor-pointer"
                      title="रसीद ज़ूम करें"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="p-2 bg-stone-800 hover:bg-red-900 text-stone-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                    title="डिलीट करें"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-white">{selectedImage.studentName}</h4>
                <p className="text-[11px] text-stone-400 font-mono">{selectedImage.studentEmail} • UTR: {selectedImage.utr || 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center hover:bg-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img 
                src={selectedImage.screenshotDataUrl} 
                alt="Full Payment Slip" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-stone-800"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-stone-800 flex items-center justify-between gap-3 bg-stone-950">
              <span className="text-xs font-bold text-emerald-400">
                फीस: ₹{selectedImage.amount}
              </span>
              <div className="flex items-center gap-2">
                {selectedImage.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedImage);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>🔓 क्रैश कोर्स अनलॉक करें</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
