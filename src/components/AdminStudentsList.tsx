import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Copy, 
  Check, 
  Sparkles,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  Clock,
  Trash2
} from 'lucide-react';

interface StudentUser {
  id: string; // Document ID (usually uid)
  uid: string;
  name: string;
  email: string;
  isPaid?: boolean;
  createdAt?: any;
  lastLogin?: any;
}

export function AdminStudentsList() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'free'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Manual Add Student Modal / Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualIsPaid, setManualIsPaid] = useState(false);

  // Real-time listener on the 'users' collection
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      setQuotaExceeded(false);
      const list: StudentUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          name: data.name || 'Unknown student',
          email: data.email || '',
          isPaid: data.isPaid === true,
          createdAt: data.createdAt,
          lastLogin: data.lastLogin
        });
      });

      // Sort
      list.sort((a, b) => {
        const tA = a.createdAt?.toDate?.()?.getTime() || 0;
        const tB = b.createdAt?.toDate?.()?.getTime() || 0;
        return tB - tA;
      });

      setStudents(list);
      setLoading(false);
    }, (err) => {
      console.warn("Could not load real-time users collection:", err);
      if (isQuotaError(err)) setQuotaExceeded(true);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Sync function not needed with onSnapshot
  const fetchStudents = async () => {
    // onSnapshot already handles updates
  };

  const handleCopy = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Toggle paid status in real-time
  const handleTogglePaidStatus = async (student: StudentUser) => {
    const nextStatus = !student.isPaid;
    setProcessingId(student.id);
    setActionMsg(null);

    try {
      // 1. Update users collection
      const userRef = doc(db, 'users', student.id);
      await safeSetDoc(userRef, {
        isPaid: nextStatus,
        isActive: nextStatus // Maintain isActive compatibility
      }, { merge: true }, 5000, true);

      // Also set in legacy vip_users collection to maintain wide-ranging backward compatibility
      try {
        const cleanEmail = student.email.trim().toLowerCase();
        if (cleanEmail) {
          if (nextStatus) {
            await safeSetDoc(doc(db, 'vip_users', cleanEmail), {
              isVip: true,
              plan: '1year',
              planDuration: 'Board Crash Course',
              planPrice: 299,
              studentName: student.name,
              validFrom: new Date().toISOString(),
              addedAt: new Date().toISOString(),
              activatedByAdmin: true
            }, { merge: true }, 5000, true);
          } else {
            await safeDeleteDoc(doc(db, 'vip_users', cleanEmail));
          }
        }
      } catch (err) {
        console.warn('Legacy VIP user sync failed:', err);
      }

      setActionMsg(`सफलता! छात्र ${student.name} का एक्सेस ${nextStatus ? 'चालू' : 'बंद'} कर दिया गया है।`);
    } catch (err: any) {
      console.error("Failed to toggle isPaid status:", err);
      alert("एक्सेस बदलने में त्रुटि: " + (err?.message || "पुनः प्रयास करें"));
    } finally {
      setProcessingId(null);
    }
  };

  // Delete student record
  const handleDeleteStudent = async (student: StudentUser) => {
    if (!confirm(`क्या आप ${student.name} (${student.email}) का पूरा रिकॉर्ड हटाना चाहते हैं?`)) return;
    setProcessingId(student.id);
    try {
      await safeDeleteDoc(doc(db, 'users', student.id));
      
      // Also delete from legacy vip_users if matching
      try {
        const cleanEmail = student.email.trim().toLowerCase();
        if (cleanEmail) {
          await safeDeleteDoc(doc(db, 'vip_users', cleanEmail));
        }
      } catch {}

      setActionMsg(`छात्र ${student.name} का रिकॉर्ड डिलीट कर दिया गया है।`);
    } catch (err: any) {
      alert("हटाने में त्रुटि: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle manual additions
  const handleManualAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim()) {
      alert('कृपया छात्र का नाम और ईमेल आईडी दर्ज करें।');
      return;
    }

    const cleanEmail = manualEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      alert('कृपया वैध ईमेल आईडी (Gmail ID) दर्ज करें।');
      return;
    }

    setLoading(true);
    const generatedUid = `manual_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      const userRef = doc(db, 'users', generatedUid);
      await safeSetDoc(userRef, {
        uid: generatedUid,
        name: manualName.trim(),
        email: cleanEmail,
        isPaid: manualIsPaid,
        isActive: manualIsPaid,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true }, 5000, true);

      // Set legacy vip_users as well if isPaid is true
      if (manualIsPaid) {
        try {
          await safeSetDoc(doc(db, 'vip_users', cleanEmail), {
            isVip: true,
            plan: '1year',
            planDuration: 'Board Crash Course',
            planPrice: 299,
            studentName: manualName.trim(),
            validFrom: new Date().toISOString(),
            addedAt: new Date().toISOString(),
            activatedByAdmin: true
          }, { merge: true }, 5000, true);
        } catch {}
      }

      setActionMsg(`सफलता! छात्र ${manualName} को जोड़ दिया गया है और कोर्स ${manualIsPaid ? 'अनलॉक' : 'लॉक'} है।`);
      setManualName('');
      setManualEmail('');
      setManualIsPaid(false);
      setShowManualForm(false);
    } catch (err: any) {
      alert("छात्र जोड़ने में त्रुटि: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and Search calculations
  const filteredStudents = students.filter(student => {
    // 1. Paid / Free Filter
    if (filterType === 'paid' && !student.isPaid) return false;
    if (filterType === 'free' && student.isPaid) return false;

    // 2. Search Text Match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(q);
      const matchEmail = student.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const paidCount = students.filter(s => s.isPaid).length;
  const freeCount = students.length - paidCount;

  return (
    <div className="space-y-5 relative z-10 text-stone-900">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-stone-950 text-lg">छात्र सूची</h3>
        <button 
          onClick={fetchStudents} 
          disabled={loading}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? 'सिंक हो रहा है...' : 'डेटा सिंक करें'}
        </button>
      </div>
      
      {quotaExceeded && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2 animate-fade-in shadow-md">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <h4 className="font-black text-sm text-amber-950">फ़ायरबेस दैनिक लिमिट समाप्त (Firebase Free Read Quota Exceeded)</h4>
              <p className="text-xs font-semibold text-amber-800 leading-relaxed mt-0.5">
                आपके फ़ायरबेस डेटाबेस की मुफ्त दैनिक रीड लिमिट (Free Daily Read Quota) समाप्त हो गई है। इसके कारण पंजीकृत छात्रों की सूची तथा अन्य विवरण अभी क्लाउड से लोड नहीं हो पा रहे हैं और सूची खाली दिख रही है। यह लिमिट कल दोपहर/रात भारतीय समयानुसार स्वतः रीसेट हो जाएगी।
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

      {/* Overview stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            कुल छात्र (Total)
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">{students.length}</div>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            एक्टिव छात्र (Paid)
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{paidCount}</div>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          <div className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            फ्री छात्र (Free)
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-600">{freeCount}</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-2 text-xs font-bold animate-fade-in">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-stone-500 hover:text-stone-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control bar: Filters, Search, Add Manual Student */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        
        {/* Filter Tab buttons */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            सभी छात्र ({students.length})
          </button>
          
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'paid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Paid ({paidCount})
          </button>

          <button
            onClick={() => setFilterType('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'free' ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            Free ({freeCount})
          </button>
        </div>

        {/* Search Input & Action Button */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="छात्र का नाम या जीमेल खोजें..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 font-bold"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            onClick={() => setShowManualForm(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 shadow-xs"
            style={{ minHeight: '44px' }}
          >
            <Plus className="w-4 h-4" />
            <span>छात्र जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Manual Student Addition Dialog Form */}
      {showManualForm && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleManualAddStudent}
            className="bg-white border border-stone-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative text-stone-900"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-600" />
                <span>नया छात्र जोड़ें (Manual Register)</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowManualForm(false)} 
                className="text-stone-400 hover:text-stone-800 cursor-pointer p-1 rounded-full hover:bg-stone-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-stone-600 mb-1">
                  छात्र का पूरा नाम (Full Name): *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="उदा. राहुल कुमार"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-red-600 font-bold"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-600 mb-1">
                  जीमेल आईडी (Gmail ID): *
                </label>
                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={e => setManualEmail(e.target.value)}
                  placeholder="उदा. rahul@gmail.com"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-red-600 font-bold"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  id="manual_is_paid"
                  checked={manualIsPaid}
                  onChange={e => setManualIsPaid(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="manual_is_paid" className="text-xs font-black text-stone-800 cursor-pointer select-none">
                  क्रैश कोर्स तुरंत अनलॉक करें (Paid Active)?
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              छात्र सहेजें और जोड़ें
            </button>
          </form>
        </div>
      )}

      {/* Render list of students */}
      {loading ? (
        <div className="p-10 text-center text-stone-500 text-xs font-bold">
          छात्रों की सूची लोड की जा रही है...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 p-10 rounded-2xl text-center space-y-1">
          <Users className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-stone-900 text-xs font-bold">कोई छात्र नहीं मिला</p>
          <p className="text-stone-500 text-[10px]">सर्च क्वेरी बदलें या नया छात्र जोड़ें।</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-wider border-b border-stone-200">
                <th className="p-3">छात्र विवरण</th>
                <th className="p-3 text-center">पंजीकरण तिथि</th>
                <th className="p-3 text-center">क्रैश कोर्स स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-xs font-bold">
              {filteredStudents.map((student) => {
                const isPaid = student.isPaid === true;
                const isProcessing = processingId === student.id;

                return (
                  <tr key={student.id} className="hover:bg-stone-50/50">
                    {/* Student Name and Email */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center font-black text-xs shrink-0 border border-stone-200">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-900 truncate max-w-[160px] leading-tight">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                            <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate max-w-[140px] font-mono">{student.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(student.email)}
                              className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              title="ईमेल कॉपी करें"
                            >
                              {copiedEmail === student.email ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="p-3 text-center text-[10px] text-stone-500">
                      <span className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {student.createdAt?.toDate?.()?.toLocaleDateString('hi-IN') || 'हाल ही में'}
                      </span>
                    </td>

                    {/* Paid Status & Manual Toggle Switch */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {isPaid ? '✓ PAID' : '✕ FREE'}
                        </span>

                        {/* Custom visual elegant toggle switch */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleTogglePaidStatus(student)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isPaid ? 'bg-emerald-600' : 'bg-stone-200'
                          }`}
                          style={{ minHeight: '20px', minWidth: '36px' }}
                          title={isPaid ? "एक्सेस रद्द (Lock) करें" : "कोर्स अनलॉक करें"}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              isPaid ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Delete action button */}
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDeleteStudent(student)}
                        className="p-2 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        style={{ minWidth: '36px', minHeight: '36px' }}
                        title="रिकॉर्ड हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
