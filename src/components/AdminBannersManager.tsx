import React, { useState } from 'react';
import { Layout, Plus, Trash2, Edit3, Save, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { BannerItem } from '../types';

export function AdminBannersManager() {
  const { appConfig, updateSettings } = useData();
  const banners = appConfig.banners || [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [tag, setTag] = useState('🔥 स्पेशल बोर्ड परीक्षा क्रैश कोर्स');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [oldPrice, setOldPrice] = useState('₹999');
  const [newPrice, setNewPrice] = useState('₹299');
  const [actionText, setActionText] = useState('क्रैश कोर्स ज्वाइन करें');
  const [actionSub, setActionSub] = useState('मात्र ₹299');
  const [featuresInput, setFeaturesInput] = useState('लाइव & रिकॉर्डेड क्लासेस, हस्तलिखित चैप्टर नोट्स (PDF), डाउट समाधान, 50 MCQ टेस्ट');
  const [subjectsInput, setSubjectsInput] = useState('गणित, विज्ञान, संस्कृत, हिंदी');
  const [bgGradient, setBgGradient] = useState('from-red-900 via-stone-900 to-red-950');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setTag('⚡ स्पेशल बोर्ड परीक्षा क्रैश कोर्स');
    setTitle('बिहार बोर्ड 10वीं टॉपर क्रैश कोर्स');
    setSubtitle('कम समय में 450+ अंक लाने का पक्का फॉर्मूला');
    setOldPrice('₹999');
    setNewPrice('₹299 मात्र');
    setActionText('क्रैश कोर्स ज्वाइन करें');
    setActionSub('मात्र ₹299');
    setFeaturesInput('लाइव क्लास, PDF नोट्स, ऑनलाइन टेस्ट');
    setSubjectsInput('गणित, विज्ञान, सामाजिक विज्ञान');
    setBgGradient('from-amber-900 via-stone-900 to-stone-950');
    setErrorMsg('');
  };

  const handleStartEdit = (b: BannerItem) => {
    setEditingId(b.id);
    setIsAdding(false);
    setTag(b.tag);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setOldPrice(b.oldPrice);
    setNewPrice(b.newPrice);
    setActionText(b.actionText || '');
    setActionSub(b.actionSub || '');
    setFeaturesInput(b.features.join(', '));
    setSubjectsInput(b.subjects.join(', '));
    setBgGradient(b.bgGradient || 'from-red-900 via-stone-900 to-red-950');
    setErrorMsg('');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !subtitle.trim()) {
      setErrorMsg('कृपया बैनर का शीर्षक (Title) और उपशीर्षक (Subtitle) भरें।');
      return;
    }

    const features = featuresInput.split(',').map(s => s.trim()).filter(Boolean);
    const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newBanner: BannerItem = {
      id: editingId || 'banner_' + Date.now(),
      tag: tag.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      features,
      subjects,
      oldPrice: oldPrice.trim(),
      newPrice: newPrice.trim(),
      priceLabel: 'Course Fee',
      actionText: actionText.trim(),
      actionSub: actionSub.trim(),
      bgGradient,
      badgeColor: 'bg-amber-400 text-stone-950'
    };

    let updatedBanners = [...banners];
    if (editingId) {
      updatedBanners = updatedBanners.map(b => b.id === editingId ? newBanner : b);
    } else {
      updatedBanners = [newBanner, ...updatedBanners];
    }

    try {
      await updateSettings({
        ...appConfig,
        banners: updatedBanners
      });
      setSuccessMsg('बैनर सफलतापूर्वक सेव और होमपेज पर लाइव हो गया है!');
      setIsAdding(false);
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('बैनर सेव करने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस बैनर को हटाना चाहते हैं?')) return;
    const updatedBanners = banners.filter(b => b.id !== id);
    try {
      await updateSettings({
        ...appConfig,
        banners: updatedBanners
      });
      setSuccessMsg('बैनर हटा दिया गया है!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setErrorMsg('बैनर हटाने में त्रुटि: ' + err?.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-red-600" />
            होमपेज बैनर & विजेट्स मैनेजर (Hero Carousel Banners)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप होमपेज पर दिखने वाले बैनर (Banners), उनके कोट्स, कीमतें और फीचर्स बदल या नए बैनर जोड़ सकते हैं।</p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> नया बैनर जोड़ें
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add / Edit Form Modal or Card */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSaveBanner} className="bg-white border-2 border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {editingId ? 'बैनर एडिट करें' : 'नया बैनर जोड़ें'}
            </h4>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">बैनर टैग / बैच नाम</label>
              <input
                type="text"
                required
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="उदा: बिहार बोर्ड परीक्षा फुल सिलेबस"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">मुख्य शीर्षक (Title)</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="उदा: टॉपर बैच - फुल सिलेबस"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">उपशीर्षक (Subtitle)</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="उदा: 10th All Subjects (NCERT)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">पुराना मूल्य (कट किया हुआ, उदा: ₹1800)</label>
              <input
                type="text"
                required
                value={oldPrice}
                onChange={e => setOldPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">नया ऑफर मूल्य (उदा: ₹299)</label>
              <input
                type="text"
                required
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">बटन टेक्स्ट (Action Text)</label>
              <input
                type="text"
                required
                value={actionText}
                onChange={e => setActionText(e.target.value)}
                placeholder="उदा: ज्वाइन करें"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">बटन सब-टेक्स्ट</label>
              <input
                type="text"
                required
                value={actionSub}
                onChange={e => setActionSub(e.target.value)}
                placeholder="उदा: VIP अनलॉक"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">फीचर्स / चेकलिस्ट (कॉमा (,) से अलग करें)</label>
              <input
                type="text"
                required
                value={featuresInput}
                onChange={e => setFeaturesInput(e.target.value)}
                placeholder="लाइव क्लास, PDF नोट्स, MCQ टेस्ट"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">विषय चिप्स (कॉमा (,) से अलग करें)</label>
              <input
                type="text"
                required
                value={subjectsInput}
                onChange={e => setSubjectsInput(e.target.value)}
                placeholder="गणित, विज्ञान, संस्कृत, हिंदी"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">थीम / बैकग्राउंड ग्रेडिएंट</label>
              <select
                value={bgGradient}
                onChange={e => setBgGradient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-500"
              >
                <option value="from-red-900 via-stone-900 to-red-950">डार्क रेड (Red Night)</option>
                <option value="from-amber-900 via-stone-900 to-stone-950">गोल्डन एम्बर (Amber Gold)</option>
                <option value="from-blue-950 via-stone-900 to-indigo-950">रॉयल ब्लू (Royal Indigo)</option>
                <option value="from-emerald-950 via-stone-900 to-teal-950">एराल्ड ग्रीन (Emerald)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> सेव करें
            </button>
          </div>
        </form>
      )}

      {/* List of Current Banners */}
      <div className="space-y-3">
        {banners.map((b, index) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded">
                  बैनर #{index + 1}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {b.tag}
                </span>
              </div>
              <h4 className="text-sm font-black text-stone-900">{b.title} <span className="text-xs font-normal text-stone-500">({b.subtitle})</span></h4>
              <div className="flex items-center gap-3 text-xs font-bold text-stone-700 pt-0.5">
                <span>मूल्य: <strong className="text-red-600">{b.newPrice}</strong> <span className="line-through text-stone-400 font-normal">{b.oldPrice}</span></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleStartEdit(b)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" /> एडिट
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> हटाएं
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
