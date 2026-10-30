import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, X, Quote } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminQuotesManager() {
  const { motivationalQuotes, addQuote, deleteQuote, toggleQuoteActive } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [author, setAuthor] = useState('बिहार बोर्ड टॉपर प्रेरणा');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) {
      setErrorMsg('कृपया मोटिवेशनल लाइन / सुविचार दर्ज करें।');
      return;
    }

    try {
      await addQuote({
        quote: quoteText.trim(),
        author: author.trim() || 'राज सर',
        isActive: true
      });

      setSuccessMsg('मोटिवेशनल लाइन सफलतापूर्वक जोड़ दी गई है!');
      setQuoteText('');
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg('त्रुटि: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            मोटिवेशनल लाइन एवं सुविचार मैनेजमेंट (Motivational Lines)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप ऐप के होम पेज पर दिखने वाले सुविचार और कोट्स सेट कर सकते हैं।</p>
        </div>

        <button
          onClick={() => {
            setQuoteText('');
            setErrorMsg('');
            setSuccessMsg('');
            setShowAddModal(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> नई लाइन जोड़ें
        </button>
      </div>

      <div className="space-y-2.5">
        {motivationalQuotes.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all ${
              item.isActive ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span>लेखक/प्रेरणा: <strong>{item.author}</strong></span>
                  <span>•</span>
                  <span className={item.isActive ? 'text-emerald-600 font-bold' : 'text-stone-400 font-bold'}>
                    {item.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleQuoteActive(item.id, !item.isActive)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  item.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-stone-700 hover:bg-slate-200'
                }`}
              >
                {item.isActive ? 'सक्रिय है' : 'सक्रिय करें'}
              </button>

              <button
                onClick={() => {
                  if (confirm('क्या आप वाकई इस लाइन को हटाना चाहते हैं?')) {
                    deleteQuote(item.id);
                  }
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 text-stone-600 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                title="हटाएं"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                नई मोटिवेशनल लाइन जोड़ें
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">सुविचार / मोटिवेशनल लाइन (Quote)</label>
                <textarea
                  required
                  rows={3}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="उदा: असफलता एक चुनौती है, स्वीकार करो, क्या कमी रह गई, देखो और सुधार करो!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">लेखक / स्रोत (Author / Source)</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="उदा: राज सर / बिहार बोर्ड टॉपर"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer mt-2"
              >
                सुविचार सेव करें
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
