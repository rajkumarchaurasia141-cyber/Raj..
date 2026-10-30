import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Settings,
  History,
  Users,
  RefreshCw,
  Play,
  Layers,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  PushNotificationConfig,
  PushNotificationLog,
  DailyReminderSlot,
  DEFAULT_PUSH_CONFIG,
  getDevicePushState,
  subscribeDeviceToPush,
  fetchPushConfigAndStats,
  savePushConfigFromAdmin,
  sendAdminManualPushNotification,
  sendAdminSelfTestNotification,
  triggerDailySlotTest,
  showLocalSwNotification
} from '../services/pushNotificationService';

const DEEP_LINK_PRESETS = [
  { label: '🏠 होम स्क्रीन (/)', url: '/', actionType: 'none' },
  { label: '📝 आज का डेली टेस्ट (/daily-test)', url: '/daily-test', actionType: 'daily_test' },
  { label: '🔴 लाइव वीडियो क्लास (/?tab=live)', url: '/?tab=live', actionType: 'live' },
  { label: '📄 PDF नोट्स लाइब्रेरी (/?tab=downloads)', url: '/?tab=downloads', actionType: 'courses' },
  { label: '🎯 30 VVI MCQ टेस्ट (/?tab=crash_course)', url: '/?tab=crash_course', actionType: 'courses' },
  { label: '📐 गणित (Mathematics) नोट्स', url: '/?tab=explorer&subject=math', actionType: 'courses' },
  { label: '🔬 विज्ञान (Science) नोट्स', url: '/?tab=explorer&subject=science', actionType: 'courses' },
  { label: '🌍 सामाजिक विज्ञान (SST) नोट्स', url: '/?tab=explorer&subject=social_science', actionType: 'courses' },
  { label: '📖 हिंदी (Hindi) नोट्स', url: '/?tab=explorer&subject=hindi', actionType: 'courses' },
  { label: '🕉️ संस्कृत (Sanskrit) नोट्स', url: '/?tab=explorer&subject=sanskrit', actionType: 'courses' },
  { label: '🔤 English नोट्स', url: '/?tab=explorer&subject=english', actionType: 'courses' }
];

export function AdminNotificationsManager() {
  const { notifications, addNotification, deleteNotification } = useData();
  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'send' | 'daily' | 'auto' | 'history'>('send');

  // Manual Send Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState<'all' | 'Class 10' | 'Class 9'>('all');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState('/daily-test');
  const [customClickUrl, setCustomClickUrl] = useState('/daily-test');
  const [actionType, setActionType] = useState<'live' | 'vip' | 'courses' | 'daily_test' | 'none'>('daily_test');

  // Config & Stats State
  const [config, setConfig] = useState<PushNotificationConfig>(DEFAULT_PUSH_CONFIG);
  const [logs, setLogs] = useState<PushNotificationLog[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    adminSubscribers: 0,
    class10Count: 0,
    class9Count: 0
  });
  const [pendingDigestCount, setPendingDigestCount] = useState(0);
  const [deviceState, setDeviceState] = useState(getDevicePushState());

  // Loading & Feedback State
  const [loadingData, setLoadingData] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingAdmin, setTestingAdmin] = useState(false);
  const [testingSlotId, setTestingSlotId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPushConfigAndStats();
      setConfig(data.config || DEFAULT_PUSH_CONFIG);
      setLogs(data.logs || []);
      setStats(data.stats);
      setPendingDigestCount(data.pendingDigestCount || 0);
      setDeviceState(getDevicePushState());
    } catch (err) {
      console.warn('Load push stats error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Subscribe Admin Device in 1-Click
  const handleSubscribeAdminDevice = async () => {
    setTestingAdmin(true);
    setFeedback(null);
    try {
      const res = await subscribeDeviceToPush({
        studentName: user?.name || 'Admin (BSEB GURU)',
        studentEmail: user?.email || 'admin@bsebguru.com',
        studentClass: 'Class 10',
        isAdmin: true
      });
      setDeviceState(getDevicePushState());
      await loadDashboardData();
      setFeedback({
        type: res.ok ? 'success' : 'error',
        text: res.message
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'एडमिन डिवाइस सब्सक्राइब करने में त्रुटि'
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  // 9. Send Test Notification to Myself (Admin)
  const handleSendTestToMyself = async () => {
    setTestingAdmin(true);
    setFeedback(null);
    try {
      // Ensure admin device is subscribed first if permission isn't granted
      const current = getDevicePushState();
      if (!current.subscribed || current.permission !== 'granted') {
        await subscribeDeviceToPush({
          studentName: user?.name || 'Admin (BSEB GURU)',
          studentEmail: user?.email || 'admin@bsebguru.com',
          studentClass: 'Class 10',
          isAdmin: true
        });
        setDeviceState(getDevicePushState());
      }

      const result = await sendAdminSelfTestNotification(user?.email);

      // Also trigger local SW notification for immediate visual confirmation on current device
      await showLocalSwNotification(
        'BSEB GURU 🔔 एडमिन टेस्ट सफल!',
        'बधाई हो! आपका Smart Push Notification System 100% सही काम कर रहा है।',
        '/daily-test'
      );

      await loadDashboardData();
      setFeedback({
        type: 'success',
        text: `${result.message} (Sent: ${result.sentCount}, Failed: ${result.failedCount})`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'टेस्ट नोटिफिकेशन भेजने में समस्या आई।'
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  // 1-4. Send Manual Notification Now
  const handleSendManualPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFeedback({
        type: 'error',
        text: 'कृपया नोटिफिकेशन का शीर्षक (Title) और संदेश (Message) दोनों दर्ज करें।'
      });
      return;
    }

    setSendingPush(true);
    setFeedback(null);

    try {
      const finalUrl = customClickUrl.trim() || selectedPresetUrl || '/';

      // 1) Save to In-App Notification Feed (Firestore + DataContext)
      await addNotification({
        title: title.trim(),
        description: description.trim(),
        timeLabel: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        isNew: true,
        actionType: actionType === 'daily_test' ? 'courses' : actionType,
        clickUrl: finalUrl,
        createdAt: new Date().toISOString()
      } as any);

      // 2) Dispatch Real Web Push Notification to all subscribed devices
      const pushRes = await sendAdminManualPushNotification({
        title: title.trim(),
        body: description.trim(),
        url: finalUrl,
        targetClass,
        category: 'manual'
      });

      setTitle('');
      setDescription('');
      await loadDashboardData();

      setFeedback({
        type: 'success',
        text: `🚀 नोटिफिकेशन सफलतापूर्वक भेजा गया! (पुश डिलीवरी: ${pushRes.sentCount} डिवाइस, विफल: ${pushRes.failedCount}, अमान्य टोकन साफ किए: ${pushRes.cleanedInvalidCount})`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: 'त्रुटि: ' + (err?.message || String(err))
      });
    } finally {
      setSendingPush(false);
    }
  };

  // Save Config Changes (Daily Reminders & Auto Content toggles)
  const handleSaveConfig = async (updatedConfig: PushNotificationConfig) => {
    setSavingConfig(true);
    setFeedback(null);
    try {
      setConfig(updatedConfig);
      const ok = await savePushConfigFromAdmin(updatedConfig);
      setFeedback({
        type: ok ? 'success' : 'error',
        text: ok
          ? '✅ स्मार्ट नोटिफिकेशन सेटिंग्स और समय सारणी सफलतापूर्वक सुरक्षित कर ली गई है!'
          : 'सेटिंग्स सेव करने में त्रुटि हुई।'
      });
      await loadDashboardData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'सेटिंग्स सेव नहीं हो सकीं।'
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUpdateSlot = (slotId: string, patch: Partial<DailyReminderSlot>) => {
    const updatedSlots = config.dailySlots.map((slot) =>
      slot.id === slotId ? { ...slot, ...patch } : slot
    );
    setConfig({
      ...config,
      dailySlots: updatedSlots
    });
  };

  const handleTestDailySlotNow = async (slotId: string) => {
    setTestingSlotId(slotId);
    setFeedback(null);
    try {
      // Save current slot edits first
      await savePushConfigFromAdmin(config);
      const res = await triggerDailySlotTest(slotId);
      const matchedSlot = config.dailySlots.find((s) => s.id === slotId);
      if (matchedSlot) {
        await showLocalSwNotification(
          matchedSlot.title,
          matchedSlot.body || matchedSlot.defaultMessage || '',
          matchedSlot.url || matchedSlot.targetUrl || '/'
        );
      }
      await loadDashboardData();
      setFeedback({
        type: res.ok ? 'success' : 'error',
        text: res.ok
          ? `✅ "${matchedSlot?.label}" रिमाइंडर तुरंत भेजा गया! (Sent: ${res.sentCount})`
          : res.message
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'स्लॉट टेस्ट भेजने में त्रुटि।'
      });
    } finally {
      setTestingSlotId(null);
    }
  };

  const handleFlushBatchDigest = async () => {
    setSendingPush(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/notifications/flush-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      await loadDashboardData();
      setFeedback({
        type: 'success',
        text: data.flushed
          ? `✅ बैच डाइजेस्ट नोटिफिकेशन सफलतापूर्वक भेज दिया गया! (Sent: ${data.sentCount || 0})`
          : data.message || 'कोई पेंडिंग बैच आइटम नहीं था।'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'बैच डाइजेस्ट भेजने में त्रुटि।'
      });
    } finally {
      setSendingPush(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Hero & Live Stats Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 rounded-3xl p-5 text-white shadow-xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  BSEB GURU Smart Push Notification System
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ₹0 Free Web Push + VAPID
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                5 दैनिक स्मार्ट स्टडी रिमाइंडर (Asia/Kolkata) • ऑटोमैटिक न्यू कंटेंट अलर्ट • रियल-टाइम ब्रॉडकास्ट
              </p>
            </div>
          </div>

          {/* 9. Send Test Notification to Myself (Admin) Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {(!deviceState.subscribed || deviceState.permission !== 'granted') && (
              <button
                type="button"
                disabled={testingAdmin}
                onClick={handleSubscribeAdminDevice}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>इस डिवाइस को जोड़ें</span>
              </button>
            )}

            <button
              type="button"
              disabled={testingAdmin}
              onClick={handleSendTestToMyself}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              <Smartphone className="w-4 h-4" />
              <span>{testingAdmin ? 'भेजा जा रहा है...' : '🧪 मुझे टेस्ट नोटिफिकेशन भेजें (Admin)'}</span>
            </button>

            <button
              type="button"
              onClick={loadDashboardData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subscriber Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-stone-300 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>सक्रिय सब्सक्राइबर</span>
            </div>
            <div className="text-xl font-black text-white mt-0.5">{stats.activeSubscribers}</div>
            <div className="text-[10px] text-emerald-300 font-semibold">
              कुल पंजीकृत: {stats.totalSubscribers} डिवाइस
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-stone-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>कक्षा अनुसार छात्र</span>
            </div>
            <div className="text-sm font-black text-white mt-1">
              10वीं: {stats.class10Count} • 9वीं: {stats.class9Count}
            </div>
            <div className="text-[10px] text-amber-200 font-semibold mt-0.5">
              एडमिन डिवाइस: {stats.adminSubscribers}
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-stone-300 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>दैनिक स्टडी रिमाइंडर</span>
            </div>
            <div className="text-sm font-black text-white mt-1">
              {config.dailyRemindersEnabled ? '✅ चालू (5 बार/दिन)' : '⏸️ बंद है'}
            </div>
            <div className="text-[10px] text-stone-300 font-semibold mt-0.5">
              Timezone: Asia/Kolkata (IST)
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] text-stone-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>ऑटो कंटेंट अलर्ट</span>
            </div>
            <div className="text-sm font-black text-white mt-1">
              {config.autoContentNotificationsEnabled ? '✅ चालू (Auto Push)' : '⏸️ बंद है'}
            </div>
            <div className="text-[10px] text-stone-300 font-semibold mt-0.5">
              {config.batchDigestMode ? `Batch Mode (${pendingDigestCount} pending)` : 'Instant Push Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] font-black underline cursor-pointer shrink-0"
          >
            बंद करें
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('send')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'send'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>1. अभी नोटिफिकेशन भेजें</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('daily')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'daily'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>2. दैनिक 5 रिमाइंडर समय</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('auto')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'auto'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>3. ऑटो कंटेंट सेटिंग्स</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>4. हिस्ट्री व डिलीवरी लॉग्स ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: SEND MANUAL NOTIFICATION NOW */}
      {activeSubTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Manual Push Composer */}
          <form
            onSubmit={handleSendManualPush}
            className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-red-600" />
                  <span>कस्टम पुश नोटिफिकेशन भेजें (Send Notification Now)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  सभी सब्सक्राइब किए गए छात्रों या किसी विशेष कक्षा को तुरंत रियल-टाइम पुश नोटिफिकेशन भेजें।
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-stone-600">
                ⚡ 1-क्लिक तैयार टेम्पलेट (Quick Templates):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: '📝 नया डेली टेस्ट लाइव',
                    t: 'BSEB GURU 📝 आज का नया डेली टेस्ट शुरू हो गया है!',
                    d: 'आज का नया Daily Test अपलोड हो चुका है। अभी टेस्ट दें और अपनी तैयारी जांचें!',
                    url: '/daily-test',
                    act: 'daily_test' as const
                  },
                  {
                    label: '🔴 लाइव क्लास शुरू',
                    t: 'BSEB GURU 🔴 लाइव क्लास शुरू हो गई है!',
                    d: 'सभी छात्र तुरंत लाइव क्लास ज्वाइन करें और महत्वपूर्ण प्रश्न समझें।',
                    url: '/?tab=live',
                    act: 'live' as const
                  },
                  {
                    label: '📄 नए PDF नोट्स अपलोड',
                    t: 'BSEB GURU 📚 नए बोर्ड परीक्षा नोट्स उपलब्ध!',
                    d: 'नया महत्वपूर्ण अध्याय और PDF नोट्स अपलोड कर दिया गया है। अभी खोलकर पढ़ें।',
                    url: '/?tab=downloads',
                    act: 'courses' as const
                  }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTitle(tpl.t);
                      setDescription(tpl.d);
                      setSelectedPresetUrl(tpl.url);
                      setCustomClickUrl(tpl.url);
                      setActionType(tpl.act);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-stone-800 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-stone-800">
                नोटिफिकेशन शीर्षक (Custom Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा: BSEB GURU 📚 विज्ञान अध्याय 2 के नए नोट्स अपलोड!"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-stone-800">
                संदेश विवरण (Custom Message) *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="उदा: आज का नया नोट्स और डेली टेस्ट अपलोड हो चुका है। अभी खोलकर अभ्यास करें।"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Class Selection */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-800">
                  किन छात्रों को भेजें? (Target Class)
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-600"
                >
                  <option value="all">सभी सब्सक्राइब छात्र (All Students)</option>
                  <option value="Class 10">केवल कक्षा 10वीं (Class 10 Matric)</option>
                  <option value="Class 9">केवल कक्षा 9वीं (Class 9)</option>
                </select>
              </div>

              {/* Deep Link Selector */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-800">
                  क्लिक करने पर कौन-सा पेज खुले? (Click Link)
                </label>
                <select
                  value={selectedPresetUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPresetUrl(val);
                    setCustomClickUrl(val);
                    const matched = DEEP_LINK_PRESETS.find((p) => p.url === val);
                    if (matched) {
                      setActionType(matched.actionType as any);
                    }
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-600"
                >
                  {DEEP_LINK_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 flex items-center justify-between">
                <span>कस्टम डीप-लिंक URL (Custom Click Path):</span>
                <span className="font-mono text-[10px] text-stone-500">उदा: /daily-test या /?tab=live</span>
              </label>
              <input
                type="text"
                value={customClickUrl}
                onChange={(e) => setCustomClickUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={sendingPush}
              className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black py-3 rounded-xl shadow-md transition cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingPush
                  ? 'पुश नोटिफिकेशन भेजा जा रहा है...'
                  : '🚀 अभी सभी छात्रों को पुश नोटिफिकेशन भेजें'}
              </span>
            </button>
          </form>

          {/* Active In-App Announcements List */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="font-black text-stone-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>इन-ऐप सूचनाएं ({notifications.length})</span>
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {notifications.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-start justify-between gap-2.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-stone-900 text-xs">{item.title}</h4>
                      {item.isNew && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span>🕒 {item.timeLabel}</span>
                      {item.clickUrl && (
                        <span className="font-mono text-red-700 truncate">🔗 {item.clickUrl}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('क्या आप इस इन-ऐप सूचना को हटाना चाहते हैं?')) {
                        deleteNotification(item.id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-stone-500 hover:text-red-600 border border-stone-200 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY 5 SMART STUDY REMINDERS (ASIA/KOLKATA) */}
      {activeSubTab === 'daily' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>दैनिक 5 स्मार्ट स्टडी रिमाइंडर (Daily Smart Study Notifications)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                भारतीय समय (Asia/Kolkata - IST) के अनुसार प्रतिदिन अधिकतम 5 अध्ययन रिमाइंडर स्वचालित रूप से भेजे जाते हैं। आप किसी भी स्लॉट का समय या संदेश बदल सकते हैं।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  checked={config.dailyRemindersEnabled}
                  onChange={(e) =>
                    handleSaveConfig({
                      ...config,
                      dailyRemindersEnabled: e.target.checked
                    })
                  }
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <span className="text-xs font-black text-stone-900">
                  {config.dailyRemindersEnabled ? 'दैनिक रिमाइंडर चालू हैं' : 'दैनिक रिमाइंडर बंद हैं'}
                </span>
              </label>

              <button
                type="button"
                disabled={savingConfig}
                onClick={() => handleSaveConfig(config)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {savingConfig ? 'सेव हो रहा है...' : '💾 सभी बदलाव सेव करें'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.dailySlots.map((slot, index) => (
              <div
                key={slot.id}
                className={`rounded-2xl border p-4 space-y-3 transition ${
                  slot.enabled
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-stone-50 border-stone-200 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-700 text-white font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-black text-stone-900 text-xs sm:text-sm">
                      {slot.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={testingSlotId === slot.id}
                      onClick={() => handleTestDailySlotNow(slot.id)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                      title="इस स्लॉट का नोटिफिकेशन अभी टेस्ट करें"
                    >
                      <Play className="w-3 h-3" />
                      <span>{testingSlotId === slot.id ? 'भेज रहे...' : 'अभी टेस्ट भेजें'}</span>
                    </button>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) => handleUpdateSlot(slot.id, { enabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>{slot.enabled ? 'चालू' : 'बंद'}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      समय (IST 24-Hour):
                    </label>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => handleUpdateSlot(slot.id, { time: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-black text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      क्लिक लिंक (Target URL):
                    </label>
                    <input
                      type="text"
                      value={slot.url}
                      onChange={(e) => handleUpdateSlot(slot.id, { url: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    शीर्षक (Notification Title):
                  </label>
                  <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => handleUpdateSlot(slot.id, { title: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    मुख्य संदेश (Default Message — प्रतिदिन रोटेट भी होता है):
                  </label>
                  <textarea
                    rows={2}
                    value={slot.body}
                    onChange={(e) => handleUpdateSlot(slot.id, { body: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATIC CONTENT PUBLISH NOTIFICATIONS & BATCH DIGEST */}
      {activeSubTab === 'auto' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>नया कंटेंट अपलोड होने पर ऑटोमैटिक नोटिफिकेशन (Auto Content Push)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                जब भी आप नया PDF नोट्स, डेली टेस्ट, क्विज़, नया अध्याय या नया वीडियो पब्लिश करेंगे, छात्रों को अपने आप नोटिफिकेशन चला जाएगा।
              </p>
            </div>

            <button
              type="button"
              disabled={savingConfig}
              onClick={() => handleSaveConfig(config)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer shrink-0"
            >
              {savingConfig ? 'सेव हो रहा है...' : '💾 सेटिंग्स सेव करें'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Master Toggle */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-stone-900 text-xs sm:text-sm">
                  ऑटोमैटिक कंटेंट नोटिफिकेशन (Master Switch)
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  नया कंटेंट पब्लिश होते ही सब्सक्राइब छात्रों को पुश अलर्ट भेजें
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoContentNotificationsEnabled}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    autoContentNotificationsEnabled: e.target.checked
                  })
                }
                className="w-5 h-5 accent-emerald-600 cursor-pointer shrink-0"
              />
            </div>

            {/* Batch Digest Mode Toggle */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>बैच डाइजेस्ट मोड (Anti-Spam Batch Mode)</span>
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  कम समय में कई नोट्स/टेस्ट अपलोड करने पर एक संयुक्त नोटिफिकेशन भेजें
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.batchDigestMode}
                onChange={(e) =>
                  handleSaveConfig({
                    ...config,
                    batchDigestMode: e.target.checked
                  })
                }
                className="w-5 h-5 accent-amber-600 cursor-pointer shrink-0"
              />
            </div>
          </div>

          {pendingDigestCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-amber-950">
                📦 वर्तमान में {pendingDigestCount} नए अपलोड बैच कतार (Digest Queue) में हैं।
              </span>
              <button
                type="button"
                disabled={sendingPush}
                onClick={handleFlushBatchDigest}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                अभी संयुक्त नोटिफिकेशन भेजें
              </button>
            </div>
          )}

          {/* Individual Content Type Toggles */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider">
              किन-किन अपलोड्स पर ऑटो नोटिफिकेशन जाए?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  key: 'autoNotifyOnNotes' as const,
                  title: '📄 नए PDF नोट्स / गेस पेपर',
                  desc: '"BSEB GURU में नया नोट्स अपलोड हुआ है — [विषय] अब पढ़ें।"'
                },
                {
                  key: 'autoNotifyOnDailyTest' as const,
                  title: '📝 नया डेली टेस्ट (Daily Test)',
                  desc: '"आज का Daily Test शुरू हो गया है — अभी भाग लें।"'
                },
                {
                  key: 'autoNotifyOnTest' as const,
                  title: '🎯 नया 30 VVI MCQ / क्विज़ टेस्ट',
                  desc: '"नया टेस्ट उपलब्ध है — अपनी तैयारी अभी जांचें।"'
                },
                {
                  key: 'autoNotifyOnChapter' as const,
                  title: '📖 नया विषय या अध्याय (Chapter)',
                  desc: '"नया अध्याय जोड़ा गया है — अभी अध्ययन शुरू करें।"'
                },
                {
                  key: 'autoNotifyOnVideo' as const,
                  title: '🎥 नई लाइव या रिकॉर्डेड वीडियो क्लास',
                  desc: '"BSEB GURU में नई वीडियो क्लास जोड़ी गई है — अभी देखें।"'
                }
              ].map((item) => (
                <label
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white transition flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="font-extrabold text-stone-900 text-xs">{item.title}</div>
                    <p className="text-[11px] text-stone-500 leading-snug">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(config[item.key])}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [item.key]: e.target.checked
                      })
                    }
                    className="w-4 h-4 accent-red-600 rounded mt-0.5 cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SENT NOTIFICATION HISTORY, DELIVERY STATUS & ERROR LOGS */}
      {activeSubTab === 'history' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-red-600" />
                <span>भेजे गए पुश नोटिफिकेशन हिस्ट्री व डिलीवरी लॉग्स</span>
              </h3>
              <p className="text-xs text-stone-500">
                प्रत्येक पुश नोटिफिकेशन का डिलीवरी स्टेटस, सफल/असफल काउंट और एक्सपायर्ड टोकन क्लीनअप रिपोर्ट।
              </p>
            </div>
            <button
              type="button"
              onClick={loadDashboardData}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ताज़ा करें</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs font-bold">
              अभी तक कोई पुश नोटिफिकेशन लॉग दर्ज नहीं हुआ है। ऊपर "मुझे टेस्ट नोटिफिकेशन भेजें" पर क्लिक करके अभी परीक्षण करें!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            log.category === 'daily_reminder'
                              ? 'bg-purple-100 text-purple-800'
                              : log.category === 'auto_content'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.category === 'admin_test'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.category}
                        </span>
                        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                          {log.title}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-600">{log.body}</p>
                    </div>

                    <div className="text-right text-[11px] text-stone-500 font-semibold shrink-0">
                      <div>{new Date(log.createdAt).toLocaleString('hi-IN')}</div>
                      <div className="font-mono text-[10px] text-stone-600">
                        Target: {log.targetClass || 'all'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/70 text-[11px]">
                    <div className="flex items-center gap-3 flex-wrap font-bold">
                      <span className="text-emerald-700">
                        ✅ Sent: {log.sentCount}
                      </span>
                      <span className="text-red-600">
                        ❌ Failed: {log.failedCount}
                      </span>
                      <span className="text-amber-700">
                        🧹 Cleaned Invalid Tokens: {log.cleanedInvalidCount || 0}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-stone-600 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>{log.url}</span>
                    </span>
                  </div>

                  {log.errors && log.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-[10px] font-mono text-red-800 space-y-0.5">
                      <div className="font-bold">Error Logs:</div>
                      {log.errors.map((errStr, i) => (
                        <div key={i} className="truncate">
                          • {errStr}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
