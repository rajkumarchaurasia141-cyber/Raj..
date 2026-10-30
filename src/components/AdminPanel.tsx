import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, writeBatch, collection, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, isQuotaError, isFirestoreQuotaExceeded, setFirestoreQuotaExceeded } from '../utils/firestoreSafe';
import { 
  ShieldCheck, 
  UserPlus, 
  CheckCircle, 
  ArrowLeft, 
  UploadCloud, 
  Database, 
  BookOpen, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw,
  FileCode,
  Receipt,
  Users,
  Settings,
  GraduationCap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { MCQItem, QAItem } from '../types';
import { AdminPaymentRequests } from './AdminPaymentRequests';
import { AdminStudentsList } from './AdminStudentsList';
import { AdminPdfNotesManager } from './AdminPdfNotesManager';
import { AdminLiveClassesManager } from './AdminLiveClassesManager';
import { AdminDailyQuizManager } from './AdminDailyQuizManager';
import { AdminRoutineManager } from './AdminRoutineManager';
import { AdminQuotesManager } from './AdminQuotesManager';
import { triggerAutoContentNotification } from '../services/pushNotificationService';
import { AdminNotificationsManager } from './AdminNotificationsManager';
import { AdminSettingsManager } from './AdminSettingsManager';
import { AdminBannersManager } from './AdminBannersManager';
import { AdminAdminsManager } from './AdminAdminsManager';
import { AdminApkManager } from './AdminApkManager';
import { AdminMasterContentManager } from './AdminMasterContentManager';
import { AdminCoursesManager } from './AdminCoursesManager';
import { AdminLiveAttendanceManager } from './AdminLiveAttendanceManager';
import { AiTeacherStudioView } from './AiTeacherStudioView';
import { CartoonStudioView } from './CartoonStudioView';
import { AdminPyqManager } from './AdminPyqManager';
import { AdminCrashCourseManager } from './AdminCrashCourseManager';
import { AdminNewCrashCourseRecords } from './AdminNewCrashCourseRecords';
import { AdminDailyTestPage } from './AdminDailyTestPage';
import { Radio, Calendar, Bell, Layout, Smartphone, Eye, Zap, Download } from 'lucide-react';
import { calculateVipExpiry } from '../utils/vipHelper';
import { subscribeToAppDownloads } from '../services/downloadTracker';

const PRESET_SUBJECTS = [
  { id: 'sanskrit', name: 'Sanskrit', hindi: 'संस्कृत (पीयूषम्)' },
  { id: 'science', name: 'Science', hindi: 'विज्ञान (भौतिकी, रसायन, जीव)' },
  { id: 'hindi', name: 'Hindi', hindi: 'हिन्दी (गोधूलि भाग-2)' },
  { id: 'math', name: 'Mathematics', hindi: 'गणित (Maths)' },
  { id: 'social_science', name: 'Social Science', hindi: 'सामाजिक विज्ञान' }
];

export function AdminPanel({ onBack }: any) {
  const { refreshData } = useData();
  const [activeTab, setActiveTab] = useState<'requests' | 'daily_test' | 'daily_quizzes' | 'crash_course_records' | 'students' | 'vip' | 'content' | 'pdf_notes' | 'live_classes' | 'live_attendance' | 'routine' | 'quotes' | 'notifications' | 'settings' | 'banners' | 'admins' | 'apk' | 'sync' | 'master' | 'courses' | 'ai_studio' | 'cartoon_studio' | 'pyq_manager' | 'crash_course'>('requests');
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [pendingCrashCourseCount, setPendingCrashCourseCount] = useState<number>(0);
  const [totalAppDownloads, setTotalAppDownloads] = useState<number>(0);
  const [todayAppDownloads, setTodayAppDownloads] = useState<number>(0);

  // Real-time listener for App Download Tracker stats
  useEffect(() => {
    const unsubDownloads = subscribeToAppDownloads((stats) => {
      setTotalAppDownloads(stats.totalDownloads);
      setTodayAppDownloads(stats.todayDownloads);
    });
    return () => unsubDownloads();
  }, []);

  // Listener for crash course requests count
  useEffect(() => {
    const updateCcCount = (remoteDocs: any[]) => {
      let count = 0;
      const remoteIds = new Set<string>();
      remoteDocs.forEach((d) => {
        remoteIds.add(d.id);
        if (d.data()?.status === 'pending') count++;
      });

      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_crash_course_requests') || '[]');
        for (const loc of localItems) {
          if (!remoteIds.has(loc.id) && loc.status === 'pending') {
            count++;
          }
        }
      } catch {}

      setPendingCrashCourseCount(count);
    };

    try {
      const unsub = onSnapshot(collection(db, 'crash_course_requests'), (snapshot) => {
        updateCcCount(snapshot.docs);
      }, () => {
        updateCcCount([]);
      });
      return () => unsub();
    } catch {
      updateCcCount([]);
    }
  }, []);

  useEffect(() => {
    const updateCount = (remoteDocs: any[]) => {
      let count = 0;
      const remoteIds = new Set<string>();
      remoteDocs.forEach((d) => {
        remoteIds.add(d.id);
        if (d.data()?.status === 'pending') count++;
      });

      try {
        const localItems = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        for (const loc of localItems) {
          if (!remoteIds.has(loc.id) && loc.status === 'pending') {
            count++;
          }
        }
      } catch {}

      setPendingRequestsCount(count);
    };

    try {
      const unsub = onSnapshot(collection(db, 'payment_requests'), (snapshot) => {
        updateCount(snapshot.docs);
      }, (err) => {
        console.warn("Payment requests notice:", err?.message || String(err));
        updateCount([]);
      });
      return () => unsub();
    } catch (e: any) {
      console.warn("Admin payment snapshot error:", e?.message || String(e));
      updateCount([]);
    }
  }, []);
  
  // VIP State
  const [email, setEmail] = useState('');
  const [vipPlan, setVipPlan] = useState<'1month' | '1year'>('1year');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Content Upload State
  const [cMsg, setCMsg] = useState('');
  const [cLoading, setCLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  // Form Data
  const [subjectId, setSubjectId] = useState('sanskrit');
  const [subjectName, setSubjectName] = useState('Sanskrit');
  const [subjectNameHindi, setSubjectNameHindi] = useState('संस्कृत (पीयूषम्)');
  const [chapterNo, setChapterNo] = useState('');
  const [chapterNameHindi, setChapterNameHindi] = useState('');
  const [chapterNameEng, setChapterNameEng] = useState('');
  
  // Rich Sections
  const [introHindi, setIntroHindi] = useState('');
  const [notesHindi, setNotesHindi] = useState('');
  const [topperTips, setTopperTips] = useState('');

  // Structured QnA and MCQ
  const [qaMode, setQaMode] = useState<'visual' | 'json'>('visual');
  const [qaList, setQaList] = useState<QAItem[]>([
    { type: 'लघु उत्तरीय', question: '', answer: '' }
  ]);
  const [qaJson, setQaJson] = useState('[]');

  const [mcqMode, setMcqMode] = useState<'visual' | 'json'>('visual');
  const [mcqList, setMcqList] = useState<MCQItem[]>([
    { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
  ]);
  const [mcqJson, setMcqJson] = useState('[]');

  // Change preset subject
  const handleSelectPresetSubject = (p: typeof PRESET_SUBJECTS[0]) => {
    setSubjectId(p.id);
    setSubjectName(p.name);
    setSubjectNameHindi(p.hindi);
  };

  // Add VIP
  const handleAddVIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const expiry = calculateVipExpiry(vipPlan);

      const vipData = {
        email: cleanEmail,
        isVip: true,
        plan: vipPlan,
        planDuration: expiry.planDurationText,
        planPrice: vipPlan === '1month' ? 99 : 299,
        validFrom: expiry.validFrom,
        expiresAt: expiry.expiresAt,
        addedAt: new Date().toISOString()
      };

      // Save locally immediately
      try {
        const localVips = JSON.parse(localStorage.getItem('bseb_vip_users') || '{}');
        localVips[cleanEmail] = vipData;
        localStorage.setItem('bseb_vip_users', JSON.stringify(localVips));
      } catch {}

      await safeSetDoc(doc(db, 'vip_users', cleanEmail), vipData, { merge: true }, 5000, true);

      const expiryDateFormatted = new Date(expiry.expiresAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      setMsg(`${cleanEmail} को VIP बैच (${expiry.planDurationText}) सफलतापूर्वक अनलॉक कर दिया गया है! (वैधता: ${expiryDateFormatted} तक)`);
      setEmail('');
    } catch (e: any) {
      setMsg('VIP जोड़ने में त्रुटि: ' + e.message);
    }
    setLoading(false);
  };

  // Pre-fill Sample Template
  const handleLoadSampleTemplate = () => {
    setChapterNo('1');
    setChapterNameHindi('मङ्गलम्');
    setChapterNameEng('Mangalam');
    setIntroHindi(`【 पाठ परिचय 】
प्रस्तुत पाठ 'मङ्गलम्' उपनिषद के विभिन्न अध्यायों से संकलित है। इस पाठ में महर्षि वेदव्यास द्वारा चार उपनिषदों से पाँच पवित्र मंत्र लिए गए हैं। इसमें सत्य, आत्मा और परमात्मा के गूढ़ स्वरूप का वर्णन है।`);
    
    setNotesHindi(`【 मन्त्र एवं विस्तृत व्याख्या 】
१. हिरण्मयेन पात्रेण सत्यस्यापिहितं मुखम्।
तत्त्वं पूषन्नपावृणु सत्यधर्माय दृष्टये॥
अर्थ: हे सूर्यदेव! सत्य का मुख सोने जैसे ज्योतिर्मय पात्र से ढँका हुआ है। सत्य धर्म के दर्शन के लिए उस आवरण को हटा दीजिए।`);

    setTopperTips(`【 🏆 VVI टॉपर परीक्षा टिप्स 】
१. 'सत्यमेव जयते' मुण्डकोपनिषद् से संकलित है।
२. उपनिषदों की कुल संख्या 108 है।
३. मङ्गलम् पाठ के रचनाकार महर्षि वेदव्यास हैं।`);

    setQaList([
      {
        type: 'लघु उत्तरीय',
        question: 'मङ्गलम् पाठ के आधार पर सत्य की क्या महत्ता है?',
        answer: 'सत्य की ही सदा विजय होती है, असत्य की नहीं। सत्य के मार्ग से ही देवलोक का मार्ग खुलता है।'
      }
    ]);

    setMcqList([
      {
        question: 'मङ्गलम् पाठ में कुल कितने मन्त्र हैं?',
        options: ['4', '5', '6', '8'],
        correct_answer: 1,
        explanation: 'मङ्गलम् पाठ में 4 उपनिषदों से कुल 5 मन्त्र संकलित हैं।'
      }
    ]);
  };

  // Q&A List actions
  const addQaItem = () => {
    setQaList([...qaList, { type: 'लघु उत्तरीय', question: '', answer: '' }]);
  };
  const removeQaItem = (idx: number) => {
    setQaList(qaList.filter((_, i) => i !== idx));
  };
  const updateQaItem = (idx: number, field: keyof QAItem, val: string) => {
    const updated = [...qaList];
    updated[idx] = { ...updated[idx], [field]: val };
    setQaList(updated);
  };

  // MCQ List actions
  const addMcqItem = () => {
    setMcqList([...mcqList, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]);
  };
  const removeMcqItem = (idx: number) => {
    setMcqList(mcqList.filter((_, i) => i !== idx));
  };
  const updateMcqQuestion = (idx: number, val: string) => {
    const updated = [...mcqList];
    updated[idx].question = val;
    setMcqList(updated);
  };
  const updateMcqOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...mcqList];
    const newOptions = [...updated[qIdx].options];
    newOptions[optIdx] = val;
    updated[qIdx].options = newOptions;
    setMcqList(updated);
  };
  const updateMcqCorrect = (qIdx: number, correctIdx: number) => {
    const updated = [...mcqList];
    updated[qIdx].correct_answer = correctIdx;
    setMcqList(updated);
  };
  const updateMcqExplanation = (qIdx: number, val: string) => {
    const updated = [...mcqList];
    updated[qIdx].explanation = val;
    setMcqList(updated);
  };

  // Save Content to Firestore
  const handleUploadContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterNo) {
      setCMsg('कृपया अध्याय संख्या दर्ज करें।');
      return;
    }
    setCLoading(true);
    setCMsg('');

    try {
      const subId = subjectId.trim().toLowerCase();
      // Ensure subject document exists
      await safeSetDoc(doc(db, 'subjects', subId), {
        subject_name: subjectName,
        subject_name_hindi: subjectNameHindi
      }, { merge: true }, 3000, true);

      let finalMcq = mcqList.filter(m => m.question.trim().length > 0);
      let finalQa = qaList.filter(q => q.question.trim().length > 0);

      if (mcqMode === 'json') {
        try { finalMcq = JSON.parse(mcqJson); } catch (e) {}
      }
      if (qaMode === 'json') {
        try { finalQa = JSON.parse(qaJson); } catch (e) {}
      }

      const chNo = Number(chapterNo);
      const chapterRef = doc(db, 'subjects', subId, 'chapters', `ch${chNo}`);
      
      const newChapter = {
        chapter_no: chNo,
        chapter_name: chapterNameEng,
        chapter_name_hindi: chapterNameHindi,
        intro_hindi: introHindi,
        notes_hindi: notesHindi,
        topper_tips: topperTips,
        mcq: finalMcq,
        subjective_qa: finalQa,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage cache for instant display across the app (0 DB read)
      try {
        const cached = localStorage.getItem('bseb_admin_chapters_cache');
        const parsed = cached ? JSON.parse(cached) : {};
        if (!parsed[subId]) {
          parsed[subId] = {
            id: subId,
            subject_name: subjectName || subId,
            subject_name_hindi: subjectNameHindi || subId,
            chapters: []
          };
        }
        const existingIdx = parsed[subId].chapters.findIndex((c: any) => Number(c.chapter_no) === chNo);
        if (existingIdx >= 0) {
          parsed[subId].chapters[existingIdx] = newChapter;
        } else {
          parsed[subId].chapters.push(newChapter);
          parsed[subId].chapters.sort((a: any, b: any) => a.chapter_no - b.chapter_no);
        }
        localStorage.setItem('bseb_admin_chapters_cache', JSON.stringify(parsed));
      } catch (err) {
        console.warn("Failed to cache admin chapter locally:", err);
      }

      const ok = await safeSetDoc(chapterRef, newChapter, { merge: true }, 3000, true);

      if (ok) {
        setCMsg(`अध्याय ${chNo} (${chapterNameHindi || subjectNameHindi}) सफलतापूर्वक Firestore में सेव हो गया!`);
      } else {
        setCMsg(`सूचना: आज की दैनिक Firestore कोटा लिमिट पूरी होने के कारण यह अध्याय स्थानीय रूप से सुरक्षित है।`);
      }

      // Automatically trigger Smart Push Notification for new Chapter publish
      triggerAutoContentNotification({
        contentType: 'chapter',
        contentId: `chapter_${subId}_ch${chNo}`,
        subjectName: subjectNameHindi || subjectName || subId,
        title: `अध्याय ${chNo}: ${chapterNameHindi || chapterNameEng || 'नया पाठ'}`,
        url: `/?tab=explorer&subject=${encodeURIComponent(subId)}&chapter=${chNo}`
      }).catch(() => {});

      await refreshData();
    } catch (e: any) {
      if (isQuotaError(e)) {
        setFirestoreQuotaExceeded(true);
        setCMsg('सूचना: आज की मुफ़्त Firestore राइट लिमिट (20,000 Writes) पूरी हो चुकी है। यह अध्याय स्थानीय रूप से सुरक्षित है और कल क्लाउड पर सिंक होगा।');
      } else {
        setCMsg('अपलोड में त्रुटि: ' + e.message);
      }
    }
    setCLoading(false);
  };

  // Sync All Default Curriculum to Firestore
  const handleSyncAllDefaultToFirestore = async () => {
    if (isFirestoreQuotaExceeded()) {
      setSyncMsg('सूचना: आज की Google Cloud Firestore दैनिक मुफ़्त राइट लिमिट (20,000 writes/दिन) पूरी हो चुकी है। चिंता न करें! आपके ऐप में सभी विषय (संस्कृत, विज्ञान, हिन्दी, गणित) का 100% सिलेबस, NCERT नोट्स, Q&A और 50 MCQs पहले से ही इन-बिल्ट रूप से उपलब्ध हैं। यूज़र्स बिना किसी रुकावट के पढ़ाई जारी रख सकते हैं। यह कोटा रात को 12 बजे अपने आप रीसेट हो जाएगा।');
      return;
    }

    if (!confirm('क्या आप सभी इन-बिल्ट अध्यायों (संस्कृत, विज्ञान, हिन्दी, गणित) को सीधे Firestore डेटाबेस में अपलोड/सिंक करना चाहते हैं?')) {
      return;
    }
    setSyncLoading(true);
    setSyncMsg('');
    try {
      for (const [sId, subObj] of Object.entries(defaultSubjectsData)) {
        await safeSetDoc(doc(db, 'subjects', sId), {
          subject_name: subObj.subject_name,
          subject_name_hindi: subObj.subject_name_hindi
        }, { merge: true });

        for (const ch of subObj.chapters) {
          const chRef = doc(db, 'subjects', sId, 'chapters', `ch${ch.chapter_no}`);
          const payload = {
            chapter_no: ch.chapter_no,
            chapter_name: ch.chapter_name,
            chapter_name_hindi: ch.chapter_name_hindi,
            intro_hindi: ch.intro_hindi || '',
            notes_hindi: ch.notes_hindi || '',
            topper_tips: ch.topper_tips || '',
            mcq: ch.mcq || [],
            subjective_qa: ch.subjective_qa || [],
            updatedAt: new Date().toISOString()
          };
          const written = await safeSetDoc(chRef, payload, { merge: true });
          if (!written) {
            setSyncMsg('सूचना: आज की Google Firestore फ्री दैनिक राइट लिमिट (20,000 Writes) पूरी हो चुकी है। सभी नोट्स और 50 MCQs ऐप में इन-बिल्ट पहले से लोड हैं। कोटा कल अपने आप रीसेट हो जाएगा।');
            setSyncLoading(false);
            return;
          }
        }
      }

      setSyncMsg('सफलता! सभी विषयों के सम्पूर्ण NCERT नोट्स, पाठ परिचय, टॉपर टिप्स, Q&A और 50 MCQs Firestore डेटाबेस में सिंक हो गए हैं।');
      await refreshData();
    } catch (e: any) {
      if (isQuotaError(e)) {
        setFirestoreQuotaExceeded(true);
        setSyncMsg('सूचना: आज की Google Firestore फ्री दैनिक राइट लिमिट (20,000 Writes) पूरी हो चुकी है। सभी नोट्स और 50 MCQs ऐप में इन-बिल्ट पहले से लोड हैं और छात्र सामान्य रूप से पढ़ सकते हैं। यह कोटा रात को 12 बजे अपने आप रीसेट हो जाएगा।');
      } else {
        setSyncMsg('सिंक करने में त्रुटि: ' + e.message);
      }
    }
    setSyncLoading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2.5 sm:p-4 md:p-6 mt-2 sm:mt-4 pb-28 selection:bg-amber-500/30 overflow-x-hidden">
      <button onClick={onBack} className="text-amber-500 mb-4 sm:mb-6 flex items-center gap-2 font-medium hover:text-amber-400 transition-colors cursor-pointer text-sm">
        <ArrowLeft className="w-4 h-4 shrink-0" /> मुख्य पोर्टल पर वापस जाएँ
      </button>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                सुपर एडमिन नियंत्रण
              </span>
              <h2 className="text-2xl font-black text-white mt-1">एडमिन कंट्रोल पैनल</h2>
              <p className="text-stone-400 text-xs mt-0.5">पाठ परिचय, नोट्स, टॉपर टिप्स, Q&A एवं VIP प्रबंधन</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('apk')}
              className="text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 px-3.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="देखें कितने लोगों ने ऐप डाउनलोड किया है"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>📊 कुल ऐप डाउनलोड: {totalAppDownloads}</span>
              {todayAppDownloads > 0 && (
                <span className="bg-stone-950 text-emerald-400 px-1.5 py-0.5 rounded-md text-[10px] font-black">
                  आज +{todayAppDownloads}
                </span>
              )}
            </button>

            <button
              onClick={handleLoadSampleTemplate}
              className="text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl transition-colors border border-stone-700 flex items-center gap-1.5 cursor-pointer w-fit"
              title="सैंपल डेटा फॉर्म में लोड करें"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              सैंपल NCERT टेम्पलेट भरें
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation for Tabs */}
        <div className="block sm:hidden mb-6 relative z-30">
          <label className="block text-xs font-black text-amber-500 uppercase tracking-wider mb-2">
            कंट्रोल सेक्शन चुनें (Select Control Section):
          </label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-4 text-white text-sm font-black focus:border-amber-500 focus:outline-none shadow-xl cursor-pointer"
          >
            <option value="requests">📥 पेमेंट रिक्वेस्ट (फुल कोर्स) {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}</option>
            <option value="apk">📊 ऐप डाउनलोड ट्रैकर & लिंक ({totalAppDownloads}) ★ LIVE</option>
            <option value="daily_test">📝 डेली टेस्ट (/admin/daily-test) ★ NEW</option>
            <option value="crash_course_records">⚡ न्यू क्रैश कोर्स रिकॉर्ड {pendingCrashCourseCount > 0 ? `(${pendingCrashCourseCount})` : ''}</option>
            <option value="students">👥 पंजीकृत छात्र</option>
            <option value="pdf_notes">📄 Paid PDF नोट्स</option>
            <option value="courses">🎓 कोर्स प्रबंधक (Add Course)</option>
            <option value="live_classes">🔴 YouTube लाइव क्लास</option>
            <option value="ai_studio">🤖 AI Teacher Video Studio</option>
            <option value="cartoon_studio">🎨 Cartoon 2D Class Studio</option>
            <option value="crash_course">🚀 क्रैश कोर्स प्रबंधक (Crash Course)</option>
            <option value="pyq_manager">📄 PYQ प्रश्न पत्र (Add PDF)</option>
            <option value="daily_quizzes">🏆 डेली क्विज़ & टेस्ट</option>
            <option value="routine">📅 क्लास रूटीन</option>
            <option value="quotes">💡 सुविचार / कोट्स</option>
            <option value="notifications">🔔 पुश नोटिफिकेशन्स</option>
            <option value="content">📤 नया चैप्टर अपलोड / एडिट</option>
            <option value="vip">👑 VIP विद्यार्थी जोड़ें</option>
            <option value="banners">🖼️ होम बैनर (Widgets)</option>
            <option value="settings">⚙️ ऐप सेटिंग्स & मूल्य</option>
            <option value="admins">🔒 एडमिन आईडी मैनेज</option>
            <option value="sync">🔄 क्लाउड सिंक (1-क्लिक)</option>
            <option value="master">🛠️ मास्टर डेटा & टेक्स्ट एडिटर</option>
          </select>
        </div>

        {/* Tab Controls (Hidden on mobile for better UX, scrollbar-enabled on desktop) */}
        <div className="hidden sm:flex border-b border-stone-800 mb-8 relative z-10 gap-2 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap relative ${
              activeTab === 'requests' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Receipt className="w-4 h-4 text-amber-500" /> 
            <span>पेमेंट रिक्वेस्ट</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('apk')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap relative ${
              activeTab === 'apk' ? 'border-b-2 border-emerald-400 text-emerald-400' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>📊 ऐप डाउनलोड ट्रैकर</span>
            <span className="bg-emerald-500 text-stone-950 text-[10px] font-black px-2 py-0.2 rounded-full">
              {totalAppDownloads}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('daily_test')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap relative ${
              activeTab === 'daily_test' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="text-base">📝</span>
            <span>डेली टेस्ट (/admin/daily-test)</span>
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              NEW
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('crash_course_records')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap relative ${
              activeTab === 'crash_course_records' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-400 fill-current" /> 
            <span>न्यू क्रैश कोर्स रिकॉर्ड</span>
            {pendingCrashCourseCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingCrashCourseCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('students')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'students' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" /> पंजीकृत छात्र
          </button>
          <button 
            onClick={() => setActiveTab('pdf_notes')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pdf_notes' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Paid PDF नोट्स
          </button>
          <button 
            onClick={() => setActiveTab('courses')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'courses' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" /> 🎓 कोर्स प्रबंधक (Add Course)
          </button>
          <button 
            onClick={() => setActiveTab('live_classes')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'live_classes' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-4 h-4 text-red-500 animate-pulse" /> 🔴 YouTube लाइव क्लास
          </button>
          <button 
            onClick={() => setActiveTab('ai_studio')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_studio' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> 🤖 AI Teacher Studio
          </button>
          <button 
            onClick={() => setActiveTab('cartoon_studio')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cartoon_studio' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-400" /> 🎨 Cartoon 2D Class
          </button>
          <button 
            onClick={() => setActiveTab('crash_course')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'crash_course' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 🚀 क्रैश कोर्स
          </button>
          <button 
            onClick={() => setActiveTab('pyq_manager')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pyq_manager' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 text-red-400" /> 📄 PYQ प्रश्न पत्र
          </button>
          <button 
            onClick={() => setActiveTab('live_attendance')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'live_attendance' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" /> 👥 लाइव अटेंडेंस & वॉच-टाइम
          </button>
          <button 
            onClick={() => setActiveTab('daily_quizzes')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'daily_quizzes' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 🏆 डेली क्विज़ & टेस्ट
          </button>
          <button 
            onClick={() => setActiveTab('routine')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'routine' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-red-400" /> 📅 क्लास रूटीन
          </button>
          <button 
            onClick={() => setActiveTab('quotes')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'quotes' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 💡 सुविचार / कोट्स
          </button>
          <button 
            onClick={() => setActiveTab('notifications')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bell className="w-4 h-4 text-red-500 animate-bounce" /> 🔔 पुश नोटिफिकेशन्स
          </button>
          <button 
            onClick={() => setActiveTab('content')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'content' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> नया चैप्टर अपलोड / एडिट
          </button>
          <button 
            onClick={() => setActiveTab('vip')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'vip' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" /> VIP विद्यार्थी जोड़ें
          </button>
          <button 
            onClick={() => setActiveTab('banners')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'banners' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layout className="w-4 h-4 text-red-400" /> 🖼️ होम बैनर (Widgets)
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" /> ⚙️ ऐप सेटिंग्स & मूल्य
          </button>
          <button 
            onClick={() => setActiveTab('admins')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'admins' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 🔒 एडमिन आईडी मैनेज
          </button>
          <button 
            onClick={() => setActiveTab('apk')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'apk' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" /> 📲 वेब ऐप (PWA) & Ads ({totalAppDownloads})
          </button>
          <button 
            onClick={() => setActiveTab('sync')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sync' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> क्लाउड सिंक (1-क्लिक)
          </button>
          <button 
            onClick={() => setActiveTab('master')} 
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'master' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400" /> 🛠️ मास्टर डेटा & टेक्स्ट एडिटर
          </button>
        </div>


        {/* Master Content & Text Editor Tab */}
        {activeTab === 'master' && (
          <div className="relative z-10">
            <AdminMasterContentManager />
          </div>
        )}

        {/* Payment Requests (Screenshots) Tab */}
        {activeTab === 'requests' && <AdminPaymentRequests />}

        {/* Daily Test (Zero Backend / LocalStorage) Tab */}
        {activeTab === 'daily_test' && (
          <div className="relative z-10">
            <AdminDailyTestPage 
              onBack={() => setActiveTab('requests')}
              onNavigateToStudent={() => { window.location.href = '/daily-test'; }}
            />
          </div>
        )}

        {/* New Crash Course Records Tab */}
        {activeTab === 'crash_course_records' && (
          <div className="relative z-10">
            <AdminNewCrashCourseRecords />
          </div>
        )}

        {/* Paid PDF Notes Tab */}
        {activeTab === 'pdf_notes' && (
          <div className="relative z-10">
            <AdminPdfNotesManager />
          </div>
        )}

        {/* Live Classes Tab */}
        {activeTab === 'live_classes' && (
          <div className="relative z-10">
            <AdminLiveClassesManager />
          </div>
        )}

        {/* Live Attendance & Watch Time Tab */}
        {activeTab === 'live_attendance' && (
          <div className="relative z-10">
            <AdminLiveAttendanceManager />
          </div>
        )}

        {/* Daily Quizzes Tab */}
        {activeTab === 'daily_quizzes' && (
          <div className="relative z-10">
            <AdminDailyQuizManager />
          </div>
        )}

        {/* Routine Tab */}
        {activeTab === 'routine' && (
          <div className="relative z-10">
            <AdminRoutineManager />
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="relative z-10">
            <AdminQuotesManager />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="relative z-10">
            <AdminNotificationsManager />
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="relative z-10">
            <AdminBannersManager />
          </div>
        )}

        {/* Courses Manager Tab */}
        {activeTab === 'courses' && (
          <div className="relative z-10">
            <AdminCoursesManager />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="relative z-10">
            <AdminSettingsManager />
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="relative z-10">
            <AdminAdminsManager />
          </div>
        )}

        {/* APK / AAB Manager Tab */}
        {activeTab === 'apk' && (
          <div className="relative z-10">
            <AdminApkManager />
          </div>
        )}

        {/* Registered Students Tab */}
        {activeTab === 'students' && <AdminStudentsList />}

        {/* Content Upload Tab */}
        {activeTab === 'content' && (
          <form onSubmit={handleUploadContent} className="space-y-6 relative z-10">
            {/* Quick Subject Selectors */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                त्वरित विषय चयन (Quick Subject Pick)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SUBJECTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPresetSubject(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      subjectId === p.id 
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30' 
                        : 'bg-stone-950 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {p.hindi}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Subject ID (जैसे sanskrit)</label>
                <input 
                  type="text" 
                  value={subjectId} 
                  onChange={e => setSubjectId(e.target.value)} 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">विषय नाम (English)</label>
                <input 
                  type="text" 
                  value={subjectName} 
                  onChange={e => setSubjectName(e.target.value)} 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">विषय नाम (हिन्दी में)</label>
                <input 
                  type="text" 
                  value={subjectNameHindi} 
                  onChange={e => setSubjectNameHindi(e.target.value)} 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none" 
                  required 
                />
              </div>
            </div>

            {/* Chapter Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  अध्याय संख्या (Chapter No.)
                </label>
                <input 
                  type="number" 
                  placeholder="उदा. 1, 2, 3..." 
                  value={chapterNo} 
                  onChange={e => setChapterNo(e.target.value)} 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none font-bold" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  अध्याय का नाम (हिन्दी में)
                </label>
                <input 
                  type="text" 
                  placeholder="उदा. मङ्गलम् / रासायनिक अभिक्रियाएँ..." 
                  value={chapterNameHindi} 
                  onChange={e => setChapterNameHindi(e.target.value)} 
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none" 
                  required 
                />
              </div>
            </div>

            {/* Section 1: पाठ परिचय */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80">
              <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                १. पाठ परिचय (Chapter Introduction / Background)
              </label>
              <p className="text-xs text-stone-400 mb-3">
                पाठ का संदर्भ, रचयिता/लेखक का नाम, मूल ग्रंथ, और पाठ का उद्देश्य यहाँ विस्तार से लिखें।
              </p>
              <textarea 
                value={introHindi} 
                onChange={e => setIntroHindi(e.target.value)} 
                rows={5} 
                placeholder="【 पाठ परिचय 】&#10;प्रस्तुत पाठ... उपनिषद/गद्य से संकलित है..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed" 
              />
            </div>

            {/* Section 2: विस्तृत नोट्स */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80">
              <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                २. विस्तृत नोट्स एवं मुख्य बिन्दु (Detailed Notes & Shlokas / Concepts)
              </label>
              <p className="text-xs text-stone-400 mb-3">
                श्लोकों का संस्कृत मूल + सरल हिन्दी अर्थ + वैज्ञानिक सिद्धांत या ऐतिहासिक व्याख्या।
              </p>
              <textarea 
                value={notesHindi} 
                onChange={e => setNotesHindi(e.target.value)} 
                rows={8} 
                placeholder="【 मन्त्र एवं विस्तृत व्याख्या 】&#10;१. श्लोक / परिभाषा...&#10;अर्थ:...&#10;व्याख्या:..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed" 
              />
            </div>

            {/* Section 3: VVI टॉपर टिप्स */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80">
              <label className="block text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                ३. VVI टॉपर परीक्षा टिप्स (Topper Exam Secrets & BSEB Key Points)
              </label>
              <p className="text-xs text-stone-400 mb-3">
                बिहार बोर्ड परीक्षा में १००% आने वाले महत्वपूर्ण बिंदु, गलतियों से बचने के उपाय और याद रखने की ट्रिक्स।
              </p>
              <textarea 
                value={topperTips} 
                onChange={e => setTopperTips(e.target.value)} 
                rows={5} 
                placeholder="【 🏆 VVI टॉपर परीक्षा टिप्स 】&#10;१. इस पाठ से वस्तुनिष्ठ में यह प्रश्न 100% पूछा जाता है...&#10;२. दीर्घ उत्तरीय में यह सूत्र अवश्य लिखें..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed" 
              />
            </div>

            {/* Section 4: NCERT प्रश्न-उत्तर */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  ४. NCERT अभ्यास एवं महत्वपूर्ण प्रश्न-उत्तर (Subjective Q&A)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQaMode(qaMode === 'visual' ? 'json' : 'visual')}
                    className="text-xs bg-stone-800 text-stone-300 hover:text-white px-2.5 py-1 rounded-lg border border-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {qaMode === 'visual' ? 'JSON मोड' : 'विजुअल मोड'}
                  </button>
                  {qaMode === 'visual' && (
                    <button
                      type="button"
                      onClick={addQaItem}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> प्रश्न जोड़ें
                    </button>
                  )}
                </div>
              </div>

              {qaMode === 'visual' ? (
                <div className="space-y-4">
                  {qaList.map((qa, idx) => (
                    <div key={`qa-${idx}`} className="bg-stone-900 p-4 rounded-xl border border-stone-800 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">प्रश्न #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={qa.type || 'लघु उत्तरीय'}
                            onChange={e => updateQaItem(idx, 'type', e.target.value)}
                            className="bg-stone-950 text-stone-300 text-xs border border-stone-800 rounded-lg px-2 py-1"
                          >
                            <option value="लघु उत्तरीय">लघु उत्तरीय</option>
                            <option value="दीर्घ उत्तरीय">दीर्घ उत्तरीय</option>
                            <option value="NCERT">NCERT</option>
                          </select>
                          {qaList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQaItem(idx)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              title="हटाएँ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="प्रश्न लिखें (उदा. मङ्गलम् पाठ का मुख्य उद्देश्य क्या है?)"
                        value={qa.question}
                        onChange={e => updateQaItem(idx, 'question', e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />

                      <textarea
                        placeholder="उत्तर यहाँ लिखें..."
                        value={qa.answer}
                        onChange={e => updateQaItem(idx, 'answer', e.target.value)}
                        rows={3}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={qaJson}
                  onChange={e => setQaJson(e.target.value)}
                  rows={8}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  placeholder='[{"type":"लघु उत्तरीय","question":"...","answer":"..."}]'
                />
              )}
            </div>

            {/* Section 5: वस्तुनिष्ठ प्रश्न (50 MCQs) */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ५. वस्तुनिष्ठ प्रश्न (50 VVI MCQs)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMcqMode(mcqMode === 'visual' ? 'json' : 'visual')}
                    className="text-xs bg-stone-800 text-stone-300 hover:text-white px-2.5 py-1 rounded-lg border border-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {mcqMode === 'visual' ? 'JSON मोड' : 'विजुअल मोड'}
                  </button>
                  {mcqMode === 'visual' && (
                    <button
                      type="button"
                      onClick={addMcqItem}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> MCQ जोड़ें
                    </button>
                  )}
                </div>
              </div>

              {mcqMode === 'visual' ? (
                <div className="space-y-4">
                  {mcqList.map((m, qIdx) => (
                    <div key={`mcq-form-${qIdx}`} className="bg-stone-900 p-4 rounded-xl border border-stone-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">MCQ #{qIdx + 1}</span>
                        {mcqList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMcqItem(qIdx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="प्रश्न लिखें..."
                        value={m.question}
                        onChange={e => updateMcqQuestion(qIdx, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.options.map((opt, oIdx) => (
                          <div key={`opt-input-${qIdx}-${oIdx}`} className="flex items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={m.correct_answer === oIdx}
                              onChange={() => updateMcqCorrect(qIdx, oIdx)}
                              className="accent-amber-500 cursor-pointer"
                              title="सही विकल्प चुनें"
                            />
                            <span className="text-xs font-bold text-stone-400 font-mono w-4">
                              {String.fromCharCode(65 + oIdx)}:
                            </span>
                            <input
                              type="text"
                              placeholder={`विकल्प ${String.fromCharCode(65 + oIdx)}`}
                              value={opt}
                              onChange={e => updateMcqOption(qIdx, oIdx, e.target.value)}
                              className="w-full bg-transparent text-white text-xs focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="व्याख्या / स्पष्टीकरण (वैकल्पिक)..."
                        value={m.explanation || ''}
                        onChange={e => updateMcqExplanation(qIdx, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-300 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={mcqJson}
                  onChange={e => setMcqJson(e.target.value)}
                  rows={8}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  placeholder='[{"question":"...","options":["A","B","C","D"],"correct_answer":0,"explanation":"..."}]'
                />
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={cLoading || !chapterNo}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-900/20 cursor-pointer text-base"
            >
              {cLoading ? 'डेटाबेस में सुरक्षित हो रहा है...' : (
                <>
                  <Database className="w-5 h-5" />
                  <span>यह पूरा अध्याय डेटाबेस (Firestore) में सेव करें</span>
                </>
              )}
            </button>

            {cMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{cMsg}</p>
              </div>
            )}
          </form>
        )}

        {/* VIP Tab */}
        {activeTab === 'vip' && (
          <form onSubmit={handleAddVIP} className="space-y-6 relative z-10 max-w-xl">
            <div className="bg-stone-950/60 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-300 mb-2">
                  छात्र का जीमेल (Gmail Address) दर्ज करें:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="उदा. student@gmail.com"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  VIP सदस्यता प्लान चुनें:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setVipPlan('1month')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      vipPlan === '1month'
                        ? 'bg-amber-950/50 border-amber-500 text-white shadow-md'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-sm">1 माह प्लान</div>
                    <div className="text-xl font-black text-amber-400 mt-1">₹99</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">30 दिनों का फुल एक्सेस</div>
                  </div>

                  <div
                    onClick={() => setVipPlan('1year')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                      vipPlan === '1year'
                        ? 'bg-amber-950/50 border-amber-500 text-white shadow-md'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-sm">क्रैश कोर्स प्लान (Best)</div>
                    <div className="text-xl font-black text-amber-400 mt-1">₹299</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">संपूर्ण क्रैश कोर्स व नोट्स एक्सेस</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500">
                अनलॉक करने के बाद यह छात्र कक्षा 10 के सभी अध्यायों, नोट्स और टेस्ट सीरीज को चुने गए प्लान के अनुसार एक्सेस कर पाएगा।
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? 'प्रक्रिया चल रही है...' : <><UserPlus className="w-5 h-5" /> छात्र को VIP एक्सेस दें</>}
            </button>

            {msg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{msg}</p>
              </div>
            )}
          </form>
        )}

        {/* Sync Tab */}
        {activeTab === 'sync' && (
          <div className="space-y-6 relative z-10 max-w-2xl">
            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500" />
                क्लाउड डेटाबेस में इन-बिल्ट सिलेबस अपलोड करें
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                इस बटन पर क्लिक करते ही आपके ऐप के सभी तैयार चैप्टर्स (संस्कृत के मङ्गलम्, पाटलिपुत्रवैभवम्, अलसकथा; विज्ञान के रासायनिक समीकरण; हिन्दी के श्रम विभाजन; तथा गणित के वास्तविक संख्याएँ) उनके विस्तृत पाठ परिचय, टॉपर टिप्स, Q&A और 50 MCQs के साथ सीधे आपके <strong>Firebase Firestore</strong> डेटाबेस में स्थायी रूप से सेव हो जाएँगे।
              </p>

              <button
                onClick={handleSyncAllDefaultToFirestore}
                disabled={syncLoading}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 px-5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg shadow-amber-900/20 cursor-pointer"
              >
                {syncLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    डेटाबेस में सिंक हो रहा है...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    क्लाउड में सिंक करें (Push to Cloud)
                  </>
                )}
              </button>
            </div>

            {syncMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{syncMsg}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai_studio' && (
          <div className="relative z-10">
            <AiTeacherStudioView onBack={() => {}} />
          </div>
        )}

        {activeTab === 'cartoon_studio' && (
          <div className="relative z-10">
            <CartoonStudioView onBack={() => {}} />
          </div>
        )}

        {activeTab === 'crash_course' && (
          <div className="relative z-10">
            <AdminCrashCourseManager />
          </div>
        )}

        {activeTab === 'pyq_manager' && (
          <div className="relative z-10">
            <AdminPyqManager />
          </div>
        )}
      </div>
    </div>
  );
}
