import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Copy,
  CheckCircle2,
  Share2,
  Sparkles,
  PlusSquare,
  Globe,
  Download,
  Users,
  Calendar,
  TrendingUp,
  Search,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  SlidersHorizontal,
  Monitor,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  subscribeToAppDownloads,
  DownloadStatsSummary,
  updateAdminDownloadBaseOffset,
  deleteDownloadRecord,
  recordAppDownload
} from '../services/downloadTracker';

export function AdminApkManager() {
  const { appConfig } = useData();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [stats, setStats] = useState<DownloadStatsSummary>({
    totalDownloads: 0,
    recordedCount: 0,
    baseOffset: 0,
    todayDownloads: 0,
    weekDownloads: 0,
    androidCount: 0,
    iosCount: 0,
    desktopCount: 0,
    pwaInstalledCount: 0,
    records: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Android' | 'iPhone/iOS' | 'PC'>('all');
  const [showOffsetEditor, setShowOffsetEditor] = useState(false);
  const [offsetInput, setOffsetInput] = useState('0');
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAppDownloads((updated) => {
      setStats(updated);
      setOffsetInput(String(updated.baseOffset || 0));
    });
    return () => unsubscribe();
  }, []);

  const currentDomain =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app';

  const adCampaignUrl = currentDomain;
  const whatsappTrackUrl = `${currentDomain}/?source=whatsapp`;
  const youtubeTrackUrl = `${currentDomain}/?source=youtube`;
  const instaTrackUrl = `${currentDomain}/?source=instagram`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // Fallback
    }
  };

  const shareOnWhatsApp = (url: string) => {
    const text = encodeURIComponent(
      `🔥 बिहार बोर्ड 10th (BSEB) की संपूर्ण तैयारी के लिए ऑफिशियल टॉपर वेब ऐप!\n\n📲 सीधे अपने फोन में 1-क्लिक में इनस्टॉल करें:\n${url}\n\n✨ हस्तलिखित चैप्टर नोट्स, 50 MCQ टेस्ट और लाइव क्लासेस!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSaveBaseOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Math.max(0, parseInt(offsetInput || '0', 10) || 0);
    await updateAdminDownloadBaseOffset(num);
    setShowOffsetEditor(false);
    setStatusNote('✅ शुरुआती डाउनलोड संख्या (Base Count) अपडेट हो गई!');
    setTimeout(() => setStatusNote(null), 3500);
  };

  const handleTestRecord = async () => {
    await recordAppDownload({
      method: 'pwa_prompt',
      studentName: 'राजकुमार सर (Admin Test)',
      studentEmail: 'rajkumarchaurasia141@gmail.com'
    });
    setStatusNote('✅ टेस्ट डाउनलोड रिकॉर्ड सफलतापूर्वक जुड़ गया!');
    setTimeout(() => setStatusNote(null), 3500);
  };

  const handleExportCsv = () => {
    if (stats.records.length === 0) return;
    const headers = ['Student Name', 'Gmail / ID', 'Device Type', 'Browser', 'Install Method', 'Source', 'Downloaded At'];
    const rows = stats.records.map((r) => [
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.studentEmail || '').replace(/"/g, '""')}"`,
      `"${r.deviceType}"`,
      `"${r.browser}"`,
      `"${r.installMethodLabel}"`,
      `"${r.source}"`,
      `"${new Date(r.downloadedAt).toLocaleString('hi-IN')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bseb_app_downloads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = stats.records.filter((r) => {
    const matchesDevice =
      deviceFilter === 'all'
        ? true
        : deviceFilter === 'PC'
        ? r.deviceType === 'Windows PC' || r.deviceType === 'Mac' || r.deviceType === 'Other'
        : r.deviceType === deviceFilter;

    if (!matchesDevice) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.studentEmail || '').toLowerCase().includes(q) ||
      (r.deviceType || '').toLowerCase().includes(q) ||
      (r.source || '').toLowerCase().includes(q) ||
      (r.userAgentSummary || '').toLowerCase().includes(q)
    );
  });

  const formatHindiDateTime = (iso: string) => {
    if (!iso) return 'अभी';
    try {
      const d = new Date(iso);
      return d.toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 text-white p-5 rounded-3xl border border-emerald-500/30 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 text-stone-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <Download className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                📊 लाइव ऐप डाउनलोड ट्रैकर (App Download Tracker)
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE TRACKING
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              यहाँ वास्तविक समय (Real-Time) में देखें कि कितने छात्रों ने आपके ऐप को डाउनलोड / इंस्टॉल किया है और किस फोन से।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowOffsetEditor(!showOffsetEditor)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="पुराने डाउनलोड जोड़ें या एडजस्ट करें"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>काउंटर सेटिंग</span>
          </button>
          <button
            type="button"
            onClick={handleTestRecord}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="अपना टेस्ट डाउनलोड रिकॉर्ड चेक करें"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>टेस्ट ट्रैक करें</span>
          </button>
        </div>
      </div>

      {statusNote && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusNote}</span>
        </div>
      )}

      {/* Optional Base Count Editor */}
      {showOffsetEditor && (
        <form
          onSubmit={handleSaveBaseOffset}
          className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in"
        >
          <div className="space-y-1 flex-1">
            <label className="block text-xs font-black text-amber-950">
              🔢 पूर्व डाउनलोड संख्या (Previous / Base Downloads Count)
            </label>
            <p className="text-[11px] text-amber-800">
              यदि ट्रैकर लगाने से पहले आपके ऐप को कुछ छात्र डाउनलोड कर चुके हैं, तो वह संख्या यहाँ लिखें। लाइव ट्रैक किए गए नए डाउनलोड इसमें अपने आप जुड़ते जाएंगे।
            </p>
            <input
              type="number"
              min="0"
              value={offsetInput}
              onChange={(e) => setOffsetInput(e.target.value)}
              className="mt-2 w-full sm:w-56 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="उदा. 500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 bg-stone-900 hover:bg-black text-amber-400 font-black text-xs rounded-xl cursor-pointer"
            >
              सेव करें (Save)
            </button>
            <button
              type="button"
              onClick={() => setShowOffsetEditor(false)}
              className="px-3 py-2.5 bg-white border border-amber-200 text-stone-600 font-bold text-xs rounded-xl cursor-pointer"
            >
              बंद करें
            </button>
          </div>
        </form>
      )}

      {/* 4 Big Live Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Downloads */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              कुल डाउनलोड
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            {stats.totalDownloads.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-stone-500 flex items-center justify-between">
            <span>लाइव रिकॉर्ड: {stats.recordedCount}</span>
            {stats.baseOffset > 0 && (
              <span className="text-amber-700 font-bold">+{stats.baseOffset} पूर्व</span>
            )}
          </div>
        </div>

        {/* Card 2: Today's Downloads */}
        <div className="bg-white border border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
              आज के डाउनलोड
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            {stats.todayDownloads.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-emerald-700">
            आज इंस्टॉल करने वाले छात्र
          </div>
        </div>

        {/* Card 3: Last 7 Days */}
        <div className="bg-white border border-blue-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
              पिछले 7 दिन
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            {stats.weekDownloads.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 text-[11px] font-semibold text-stone-500">
            इस सप्ताह के कुल इंस्टॉल
          </div>
        </div>

        {/* Card 4: Device Breakdown */}
        <div className="bg-white border border-purple-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
              डिवाइस रिपोर्ट
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1 pt-0.5 text-xs font-bold">
            <div className="flex items-center justify-between text-stone-800">
              <span>🤖 Android फोन:</span>
              <span className="text-emerald-700 font-black">{stats.androidCount}</span>
            </div>
            <div className="flex items-center justify-between text-stone-700">
              <span>🍎 iPhone / iOS:</span>
              <span className="text-blue-700 font-black">{stats.iosCount}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>💻 कंप्यूटर / अन्य:</span>
              <span className="text-purple-700 font-black">{stats.desktopCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Student Download Log Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>डाउनलोड करने वाले छात्रों की सूची ({filteredRecords.length})</span>
            </h4>
            <p className="text-xs text-stone-500">
              जब भी कोई छात्र लॉगिन पेज या बैनर से ऐप इंस्टॉल करता है, उसका नाम, डिवाइस और समय यहाँ अपने आप दर्ज हो जाता है।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats.records.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel / CSV डाउनलोड</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('bseb-download-tracked'))}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Search & Device Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="छात्र का नाम, जीमेल, फोन मॉडल या सोर्स खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:bg-white focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'Android', 'iPhone/iOS', 'PC'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDeviceFilter(tab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  deviceFilter === tab
                    ? 'bg-stone-900 text-amber-400 shadow-xs'
                    : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all'
                  ? `सभी (${stats.records.length})`
                  : tab === 'Android'
                  ? `🤖 Android (${stats.androidCount})`
                  : tab === 'iPhone/iOS'
                  ? `🍎 iOS (${stats.iosCount})`
                  : `💻 PC (${stats.desktopCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Smartphone className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-sm font-black text-stone-700">अभी कोई डाउनलोड रिकॉर्ड नहीं मिला</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              जैसे ही कोई छात्र लॉगिन पेज पर <strong>"Install APK"</strong> या होम स्क्रीन पर <strong>"फोन में ऐप इंस्टॉल करें"</strong> दबाएगा, उसकी पूरी जानकारी यहाँ तुरंत दिखने लगेगी।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-stone-700 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">छात्र का नाम एवं ईमेल</th>
                  <th className="py-3 px-4">फोन / डिवाइस मॉडल</th>
                  <th className="py-3 px-4">इंस्टॉल तरीका (Method)</th>
                  <th className="py-3 px-4">सोर्स (Source)</th>
                  <th className="py-3 px-4">तारीख व समय</th>
                  <th className="py-3 px-3 text-right">एक्शन</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((rec, index) => (
                  <tr key={rec.id || index} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-4 font-black text-stone-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-black text-stone-900">{rec.studentName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{rec.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          rec.deviceType === 'Android'
                            ? 'bg-emerald-100 text-emerald-900'
                            : rec.deviceType === 'iPhone/iOS'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {rec.deviceType === 'Android' ? (
                          <Smartphone className="w-3 h-3" />
                        ) : (
                          <Monitor className="w-3 h-3" />
                        )}
                        {rec.deviceType} • {rec.browser}
                      </span>
                      {rec.userAgentSummary && (
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[180px]">
                          {rec.userAgentSummary}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-amber-100 text-amber-950 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                        {rec.installMethodLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-700">{rec.source}</td>
                    <td className="py-3 px-4 text-stone-600 font-semibold whitespace-nowrap">
                      {formatHindiDateTime(rec.downloadedAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteDownloadRecord(rec.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="रिकॉर्ड हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Smart Tracking & Campaign Links Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              मुख्य ऐप डाउनलोड एवं विज्ञापन लिंक (Official App Link)
            </h4>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Active Official Link
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              readOnly
              value={adCampaignUrl}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 block">
              Google Ads, Facebook Ads, YouTube Description और Instagram Bio में यही लिंक डालें। जब छात्र इस पर क्लिक करके ऐप इंस्टॉल करेंगे तो ऊपर ट्रैकर में उनकी संख्या अपने आप बढ़ जाएगी।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(adCampaignUrl, 'main')}
              className="px-4 py-2.5 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {copiedKey === 'main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'main' ? 'लिंक कॉपी हो गया!' : '📋 मुख्य ऐप लिंक कॉपी करें'}
            </button>

            <button
              type="button"
              onClick={() => shareOnWhatsApp(whatsappTrackUrl)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp पर ट्रैकिंग लिंक शेयर करें
            </button>
          </div>

          {/* Platform-Specific Tracking Links */}
          <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-emerald-800">🟢 WhatsApp ट्रैकिंग लिंक</div>
                <div className="text-[10px] text-stone-500 truncate font-mono">{whatsappTrackUrl}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(whatsappTrackUrl, 'wa')}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {copiedKey === 'wa' ? 'Copied!' : 'कॉपी'}
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-red-700">🔴 YouTube ट्रैकिंग लिंक</div>
                <div className="text-[10px] text-stone-500 truncate font-mono">{youtubeTrackUrl}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(youtubeTrackUrl, 'yt')}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {copiedKey === 'yt' ? 'Copied!' : 'कॉपी'}
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-pink-700">🟣 Instagram ट्रैकिंग लिंक</div>
                <div className="text-[10px] text-stone-500 truncate font-mono">{instaTrackUrl}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(instaTrackUrl, 'ig')}
                className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {copiedKey === 'ig' ? 'Copied!' : 'कॉपी'}
              </button>
            </div>
          </div>
        </div>

        {/* How users install it */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-black text-amber-900">
            <PlusSquare className="w-4 h-4 text-amber-600 shrink-0" />
            <span>यह डाउनलोड ट्रैकर कैसे काम करता है?</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-xs">
            <li>
              जब कोई छात्र लॉगिन स्क्रीन पर <strong>"Install APK"</strong> या नीचे दिखने वाले <strong>"फोन में ऐप इंस्टॉल करें"</strong> बटन पर क्लिक करता है, तो ट्रैकर तुरंत उसका डिवाइस (Android/iPhone) और समय नोट कर लेता है।
            </li>
            <li>
              जैसे ही वह छात्र अपना <strong>नाम और Gmail</strong> डालकर लॉगिन करता है, उसका नाम भी उसी डाउनलोड रिकॉर्ड के साथ जुड़ जाता है।
            </li>
            <li>
              एक ही फोन से बार-बार पेज रिफ्रेश करने पर डुप्लीकेट गिनती नहीं बढ़ती — <strong>1 फोन = 1 असली डाउनलोड</strong> गिना जाता है।
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
