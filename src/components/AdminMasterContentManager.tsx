import React, { useState } from 'react';
import { Database, Save, CheckCircle2, AlertCircle, Code, Layers, Sparkles, Download } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminMasterContentManager() {
  const { 
    subjects = {}, 
    paidNotes = [], 
    liveClasses = [], 
    leaderboard = [], 
    routine = [], 
    motivationalQuotes = [], 
    notifications = [], 
    appConfig = {}, 
    updateSettings, 
    refreshData 
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'json' | 'curriculum_summary' | 'quick_texts'>('json');
  
  // Convert subjects record to array for standard JSON representation
  const subjectsArray = Object.values(subjects);

  // Exact structure required by app_data.json
  const masterDataObject = {
    subjects: subjectsArray,
    paid_notes: paidNotes,
    live_classes: liveClasses,
    leaderboard: leaderboard,
    routine: routine,
    motivational_quotes: motivationalQuotes,
    notifications: notifications,
    app_config: appConfig
  };

  const [jsonText, setJsonText] = useState(JSON.stringify(masterDataObject, null, 2));
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveJson = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const parsed = JSON.parse(jsonText);
      
      // Save appConfig if present
      if (parsed.app_config) {
        await updateSettings(parsed.app_config);
      }

      // Also update local storage cache
      localStorage.setItem('bseb_master_override', JSON.stringify(parsed));
      await refreshData();

      setSuccessMsg('मास्टर डेटा और सेटिंग्स सफलतापूर्वक अपडेट हो गए हैं!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('JSON सिंटैक्स त्रुटि: कृपया सही JSON फॉर्मेट दर्ज करें। (' + (err?.message || String(err)) + ')');
    }
  };

  // Triggers immediate download of app_data.json to device
  const handleDownloadJson = () => {
    try {
      const blob = new Blob([JSON.stringify(masterDataObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'app_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMsg('app_data.json फ़ाइल डाउनलोड हो गई है! अब इसे अपने प्रोजेक्ट के public/ फ़ोल्डर में पेस्ट करके डिप्लॉय करें।');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg('डाउनलोड विफल: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            मास्टर कंटेंट, टेक्स्ट एवं डेटा एडिटर (Full Database & Content Control)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप ऐप का कोई भी टेक्स्ट, डेटा, चैप्टर, नोट्स या सेटिंग्स सीधे एडिट या डिलीट कर सकते हैं।</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'json' ? 'bg-white text-indigo-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> मास्टर JSON एडिटर
          </button>
          <button
            onClick={() => setActiveSubTab('curriculum_summary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'curriculum_summary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> पाठ्यक्रम सारांश
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeSubTab === 'json' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-600" /> संपूर्ण ऐप डेटा JSON (App Master Database)
                </h4>
                <p className="text-[11px] text-stone-500">आप नीचे दिए गए JSON में कोई भी बदलाव करके एक साथ सभी टेक्स्ट, मूल्य, कोर्स या सेटिंग्स बदल सकते हैं।</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                  title="Download app_data.json file directly to update your app backend"
                >
                  <Download className="w-4 h-4" /> Download app_data.json
                </button>
                <button
                  type="button"
                  onClick={handleSaveJson}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Save className="w-4 h-4" /> मास्टर डेटा सेव करें
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={18}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-2">
              <div className="font-black flex items-center gap-1 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" /> मोबाइल यूजर्स के लिए "वन-क्लिक फिक्स" फ़ीचर:
              </div>
              <p className="leading-relaxed">
                जब भी आप ऐप में कोई बदलाव करें (जैसे कोई लाइव क्लास जोड़ना या रूटीन बदलना), तो ऊपर दिए गए 
                <strong className="text-emerald-700 font-bold"> "Download app_data.json" </strong> 
                बटन पर क्लिक करें। यह फ़ाइल आपके फ़ोन या कंप्यूटर में डाउनलोड हो जाएगी। इसके बाद इस फ़ाइल को अपने प्रोजेक्ट के <strong className="font-bold">`public/`</strong> फ़ोल्डर में कॉपी-पेस्ट करके गिटहब (GitHub) पर पुश कर दें। आपका पूरा ऐप बिना एक भी रुपया खर्च किए हमेशा 100% लाइव रहेगा!
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download app_data.json
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> सभी बदलाव सेव और सिंक करें (Save All Changes)
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'curriculum_summary' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> वर्तमान पाठ्यक्रम एवं विषय स्थिति (Subjects & Content Overview)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(subjectsArray || []).map((subj) => (
                <div key={subj.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-900">{subj.subject_name || subj.name}</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {subj.chapters?.length || 0} चैप्टर्स
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">{subj.subject_name_hindi || subj.hindi || ''} {subj.subtitle ? `• ${subj.subtitle}` : ''}</p>
                  <div className="pt-1 text-[11px] text-emerald-700 font-bold">
                    फीचर्ड विषय • लाइव एवं नोट्स उपलब्ध
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
              <div className="font-black flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-600" />टिप:
              </div>
              <p>चैप्टर जोड़ने, हटाने या एडिट करने के लिए आप ऊपर **मास्टर JSON एडिटर** का उपयोग कर सकते हैं या एडमिन पैनल के अन्य विशिष्ट टैब (जैसे PDF नोट्स, लाइव क्लास, रूटीन) का उपयोग कर सकते हैं।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
