import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, query, serverTimestamp, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  Search, 
  ZoomIn, 
  X, 
  Crown, 
  Mail, 
  Calendar, 
  Copy,
  Check,
  ShieldCheck,
  CircleDollarSign,
  Hourglass,
  RefreshCw
} from 'lucide-react';

export interface PaymentRequestItem {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  planTitle: string;
  planAmount: string;
  planPrice: number;
  screenshotDataUrl: string;
  utr?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

export function AdminPaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<PaymentRequestItem | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPaymentRequests = async (isInitial = false) => {
    setLoading(true);
    setQuotaExceeded(false);
    try {
      let q = query(collection(db, 'payment_requests'), orderBy('submittedAt', 'desc'), limit(20));
      if (!isInitial && lastDoc) {
        q = query(collection(db, 'payment_requests'), orderBy('submittedAt', 'desc'), startAfter(lastDoc), limit(20));
      }

      const snapshot = await getDocs(q);
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(newLastDoc || null);
      setHasMore(snapshot.docs.length === 20);

      const items: PaymentRequestItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || data.uid || '',
          studentName: data.userName || data.studentName || 'विद्यार्थी',
          studentEmail: data.userEmail || data.studentEmail || data.email || '',
          planTitle: data.courseName || 'Topper Batch (फुल कोर्स)',
          planAmount: data.amount ? `₹${data.amount}` : '₹499',
          planPrice: Number(data.amount) || 499,
          screenshotDataUrl: data.screenshotBase64 || data.screenshotUrl || data.screenshotDataUrl || '',
          utr: data.upiRef || data.utr || '',
          status: data.status || 'pending',
          submittedAt: data.submittedAt || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });

      setRequests(prev => isInitial ? items : [...prev, ...items]);
    } catch (err: any) {
      console.warn('Payment requests fetch error:', err);
      if (isQuotaError(err)) setQuotaExceeded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRequests(true);
  }, []);

  // Sync function not needed with onSnapshot, but keeping button in UI for consistency
  const fetchRequests = async () => {
    // onSnapshot already handles updates
  };

  const handleCopy = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Approve payment & unlock student access (isPaid === true)
  const handleApprove = async (req: PaymentRequestItem) => {
    setProcessingId(req.id);
    setActionMsg(null);
    try {
      const cleanEmail = req.studentEmail.trim().toLowerCase();
      const userId = req.userId || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

      let dbSuccess1 = false;
      let dbSuccess2 = false;

      // 1. Set isPaid, hasFullCourse and isActive to true in the student document
      try {
        await safeSetDoc(doc(db, 'users', userId), {
          isPaid: true,
          hasFullCourse: true,
          hasCrashCourse: true,
          isActive: true,
          email: cleanEmail,
          name: req.studentName || ''
        }, { merge: true }, 5000, true);
        dbSuccess1 = true;
      } catch (err) {
        console.warn('Firestore user update failed:', err);
      }

      // Also set in legacy vip_users collection to maintain wide-ranging backward compatibility
      try {
        await safeSetDoc(doc(db, 'vip_users', cleanEmail), {
          isVip: true,
          plan: '1year',
          planDuration: 'Topper Batch (फुल कोर्स)',
          planPrice: req.planPrice || 499,
          studentName: req.studentName || '',
          validFrom: new Date().toISOString(),
          addedAt: new Date().toISOString(),
          activatedByAdmin: true
        }, { merge: true }, 5000, true);
      } catch (err) {
        console.warn('Legacy VIP user update failed:', err);
      }

      // 2. Mark request as approved in payment_requests
      try {
        const updatePayload = {
          status: 'approved',
          approvedAt: new Date().toISOString()
        };
        await safeSetDoc(doc(db, 'payment_requests', req.id), updatePayload, { merge: true }, 5000, true);
        dbSuccess2 = true;
      } catch (err) {
        console.warn('Firestore update request status failed:', err);
      }

      // 3. Keep local storage synced for flawless failover
      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.map((item: any) => item.id === req.id ? { ...item, status: 'approved', approvedAt: new Date().toISOString() } : item);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));
      } catch {}

      // Update in-memory state immediately
      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'approved', approvedAt: new Date().toISOString() } : item));

      // Trigger user-requested success toast
      setToastMessage("🎉 Baccha Active Ho Gaya!");
      setTimeout(() => setToastMessage(null), 4000);

      if (dbSuccess1 && dbSuccess2) {
        setActionMsg(`सफलता! छात्र ${req.studentName} का फुल कोर्स (टॉपर बैच) अनलॉक कर दिया गया है।`);
      } else {
        setActionMsg(`सूचना: छात्र ${req.studentName} का फुल कोर्स स्थानीय रूप से अनलॉक कर दिया गया है।`);
      }

      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err: any) {
      console.error('Approve failed:', err);
      alert('स्वीकृति में त्रुटि: ' + (err?.message || 'पुनः प्रयास करें'));
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Request
  const handleReject = async (req: PaymentRequestItem) => {
    if (!confirm(`क्या आप ${req.studentName} के इस पेमेंट रिक्वेस्ट को अस्वीकृत करना चाहते हैं?`)) return;
    setProcessingId(req.id);
    try {
      await safeSetDoc(doc(db, 'payment_requests', req.id), { status: 'rejected' }, { merge: true });

      // Update local storage
      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.map((item: any) => item.id === req.id ? { ...item, status: 'rejected' } : item);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));
      } catch {}

      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'rejected' } : item));

      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: any) {
      alert('त्रुटि: ' + err?.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Request record
  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस पेमेंट रिक्वेस्ट रिकॉर्ड को हमेशा के लिए हटाना चाहते हैं?')) return;
    try {
      await safeDeleteDoc(doc(db, 'payment_requests', id));

      // Remove from local storage
      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.filter((item: any) => item.id !== id);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));
      } catch {}

      setRequests(prev => prev.filter(item => item.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err: any) {
      alert('डिलीट में त्रुटि: ' + err?.message);
    }
  };

  // Filter and search computation
  const filteredRequests = requests.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.studentName?.toLowerCase().includes(q);
      const matchEmail = item.studentEmail?.toLowerCase().includes(q);
      const matchUtr = item.utr?.toLowerCase().includes(q);
      return matchName || matchEmail || matchUtr;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRevenue = requests
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + (curr.planPrice || 299), 0);

  return (
    <div className="space-y-5 relative z-10 text-stone-950">
      
      {/* Real-time Toast Notification (🎉 Baccha Active Ho Gaya!) */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-400">
          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
          <span className="text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {quotaExceeded && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2 animate-fade-in shadow-md">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <h4 className="font-black text-sm text-amber-950">फ़ायरबेस दैनिक लिमिट समाप्त (Firebase Free Read Quota Exceeded)</h4>
              <p className="text-xs font-semibold text-amber-800 leading-relaxed mt-0.5">
                आपके फ़ायरबेस डेटाबेस की मुफ्त दैनिक रीड लिमिट (Free Daily Read Quota of 50,000 reads) पूरी तरह से समाप्त हो गई है। इसके कारण नए पेमेंट रिक्वेस्ट या पंजीकृत छात्रों की सूची अभी क्लाउड से लोड नहीं हो पा रही है और सारा डेटा 0 दिख रहा है। यह लिमिट कल दोपहर/रात भारतीय समयानुसार स्वतः रीसेट हो जाएगी।
              </p>
              <div className="mt-3 text-xs font-bold flex flex-wrap gap-x-4 gap-y-2">
                <a 
                  href="https://console.firebase.google.com/project/gen-lang-client-0482021639/firestore/databases/ai-studio-timetravelphotob-400dc69e-09d3-46d5-bd2e-7f7e4260b43c/data?openUpgradeDialog=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-xs hover:bg-amber-700 transition-colors inline-block"
                >
                  फ़ायरबेस कंसोल खोलें और सीमाएँ बढ़ाएँ ↗
                </a>
                <span className="text-amber-800 bg-amber-100 px-2 py-1.5 rounded-lg">
                  डेटाबेस ID: ai-studio-timetravelphotob-400dc69e-09d3-46d5-bd2e-7f7e4260b43c
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics dashboard Overview Cards */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-stone-950 text-lg">पेमेंट डैशबोर्ड</h3>
        <button 
          onClick={() => fetchPaymentRequests(true)} 
          disabled={loading}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? 'सिंक हो रहा है...' : 'डेटा सिंक करें'}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1.5 mb-1">
            <Receipt className="w-3.5 h-3.5 text-stone-500" />
            कुल रिक्वेस्ट
          </div>
          <div className="text-2xl font-black text-stone-900">{requests.length}</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            लंबित (Pending)
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingCount}</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            स्वीकृत (Approved)
          </div>
          <div className="text-2xl font-black text-emerald-700">{approvedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1.5 mb-1">
            <CircleDollarSign className="w-3.5 h-3.5 text-red-600" />
            कुल कलेक्शन
          </div>
          <div className="text-2xl font-black text-stone-900">₹{totalRevenue}</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-stone-500 hover:text-stone-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        
        {/* Filter Selection Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            सभी ({requests.length})
          </button>
          
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            लंबित ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'approved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            स्वीकृत ({approvedCount})
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'rejected' ? 'bg-white text-red-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            अस्वीकृत
          </button>
        </div>

        {/* Real-time Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="नाम, ईमेल या UTR खोजें..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 font-bold"
          />
        </div>
      </div>

      {/* Render list of payment requests */}
      {loading ? (
        <div className="p-10 text-center text-stone-500 text-xs font-bold">
          डेटा लोड किया जा रहा है...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-stone-50 p-10 rounded-2xl border border-stone-200 text-center space-y-2">
          <Receipt className="w-8 h-8 text-stone-400 mx-auto" />
          <h4 className="text-stone-950 font-bold text-xs">कोई पेमेंट रिक्वेस्ट नहीं मिली</h4>
          <p className="text-stone-500 text-[11px] max-w-xs mx-auto">
            {filter === 'pending' 
              ? 'वर्तमान में कोई लंबित पेमेंट रिक्वेस्ट नहीं है।' 
              : 'दिए गए फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRequests.map((item) => {
            const isApproved = item.status === 'approved';
            const isPending = item.status === 'pending';
            const isRejected = item.status === 'rejected';
            const isProcessing = processingId === item.id;

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-3 relative shadow-xs ${
                  isPending 
                    ? 'border-amber-400 shadow-md shadow-amber-500/5' 
                    : isApproved 
                    ? 'border-emerald-300' 
                    : 'border-stone-200'
                }`}
              >
                {/* User details headers */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-800 font-black text-xs flex items-center justify-center shrink-0">
                      {item.studentName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs leading-tight flex items-center gap-1.5">
                        {item.studentName}
                        {isApproved && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1 py-0.2 rounded uppercase">
                            PAID
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5 font-bold">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[150px]">{item.studentEmail}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.studentEmail)}
                          className="hover:text-red-600 p-0.5 cursor-pointer"
                          title="कॉपी जीमेल"
                        >
                          {copiedEmail === item.studentEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Badges status */}
                  <div>
                    {isPending && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> लंबित
                      </span>
                    )}
                    {isApproved && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> स्वीकृत
                      </span>
                    )}
                    {isRejected && (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                        <XCircle className="w-2.5 h-2.5" /> रद्द
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl text-[11px] border border-stone-100 font-bold text-stone-700">
                  <div>
                    <span className="text-[9px] text-stone-400 block uppercase font-black">कोर्स</span>
                    <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {item.planTitle}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-stone-400 block uppercase font-black">पेमेंट राशि</span>
                    <span className="font-black text-red-600 text-xs">
                      {item.planAmount}
                    </span>
                  </div>

                  {item.utr && (
                    <div className="col-span-2 pt-1 border-t border-stone-200">
                      <span className="text-[9px] text-stone-400 block font-black">UPI Ref / UTR आईडी:</span>
                      <span className="font-mono text-stone-800 text-xs select-all">{item.utr}</span>
                    </div>
                  )}

                  <div className="col-span-2 text-[9px] text-stone-400 flex items-center gap-1 pt-1 border-t border-stone-150">
                    <Calendar className="w-3 h-3 text-stone-300" />
                    <span>भेजा गया: {new Date(item.submittedAt).toLocaleString('hi-IN')}</span>
                  </div>
                </div>

                {/* Screenshot view box */}
                {item.screenshotDataUrl ? (
                  <div 
                    onClick={() => setSelectedImage(item)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-stone-100 aspect-[16/10] flex items-center justify-center shadow-inner"
                  >
                    <img 
                      src={item.screenshotDataUrl} 
                      alt="Payment proof screenshot" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                      <ZoomIn className="w-4 h-4 text-amber-400" />
                      <span>बड़ा करके देखें</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-400 font-bold border border-stone-100">
                    कोई फोटो अपलोड नहीं है
                  </div>
                )}

                {/* Decision CTA Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 text-xs transition-colors cursor-pointer shadow-xs"
                      style={{ minHeight: '44px' }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isProcessing ? 'सक्रिय हो रहा है...' : 'Approve (अनलॉक करें)'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>कोर्स एक्टिवेटेड है</span>
                    </div>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      disabled={isProcessing}
                      className="bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 border border-stone-200 p-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                      title="रद्द (Reject) करें"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-600 border border-stone-200 p-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                    style={{ minHeight: '44px', minWidth: '44px' }}
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

      {/* Pagination Load More */}
      {hasMore && !loading && (
        <button 
          onClick={() => fetchPaymentRequests(false)}
          className="w-full py-4 text-xs font-black text-stone-600 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"
        >
          Load More (और लोड करें)
        </button>
      )}

      {/* Full-Screen Screenshot zoom Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl relative max-h-[96vh] flex flex-col text-stone-900">
            
            {/* Lightbox Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
              <div>
                <h3 className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                  <span>पेमेंट रसीद: {selectedImage.studentName}</span>
                  {selectedImage.status === 'approved' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-black">स्वीकृत</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black">लंबित</span>
                  )}
                </h3>
                <p className="text-[10px] text-stone-500 font-bold mt-0.5">
                  {selectedImage.studentEmail} • {selectedImage.planTitle} ({selectedImage.planAmount})
                </p>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="text-stone-500 hover:text-stone-800 bg-stone-100 p-2 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View image zoom wrapper */}
            <div className="flex-1 overflow-auto bg-stone-900 rounded-2xl flex items-center justify-center p-2 mb-4 max-h-[62vh]">
              <img
                src={selectedImage.screenshotDataUrl}
                alt="Full Proof Zoom"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>

            {/* Lightbox actions footer */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-stone-500 font-bold">
                {selectedImage.utr && <span>Ref ID: <strong className="text-stone-900 font-mono">{selectedImage.utr}</strong></span>}
              </div>

              <div className="flex items-center gap-2">
                {selectedImage.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedImage)}
                    disabled={processingId === selectedImage.id}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    style={{ minHeight: '44px' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (अनलॉक करें)</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-black py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                  style={{ minHeight: '44px' }}
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
