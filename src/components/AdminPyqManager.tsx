import React, { useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Calendar, BookOpen, Download } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminPyqManager() {
  const { pyqs, addPyq, deletePyq } = useData();

  const [year, setYear] = useState('2025');
  const [subjectName, setSubjectName] = useState('गणित (Maths)');
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [isVip, setIsVip] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAddPyq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('कृपया प्रश्न पत्र का शीर्षक (Title) भरें!');
      return;
    }

    try {
      await addPyq({
        year,
        subjectName,
        title,
        pdfUrl: pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isVip,
        downloadsCount: Math.floor(Math.random() * 2000) + 1000,
        uploadedAt: new Date().toISOString()
      });

      setTitle('');
      setMsg('✅ PYQ प्रश्न पत्र सफलतापूर्वक अपलोड हो गया!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert('Error uploading PYQ: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black">📤 PYQ प्रश्न पत्र प्रबंधक (Add PYQ PDF)</h3>
            <p className="text-xs text-stone-400">बिहार बोर्ड पिछले वर्षों के प्रश्न पत्र (PYQs) अपलोड करें</p>
          </div>
        </div>

        <form onSubmit={handleAddPyq} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">परीक्षा वर्ष (Year)</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
              >
                <option value="2025">2025 परीक्षा</option>
                <option value="2024">2024 परीक्षा</option>
                <option value="2023">2023 परीक्षा</option>
                <option value="2022">2022 परीक्षा</option>
                <option value="2021">2021 परीक्षा</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">विषय (Subject)</label>
              <select
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
              >
                <option value="गणित (Maths)">गणित (Maths)</option>
                <option value="विज्ञान (Science)">विज्ञान (Science)</option>
                <option value="सामाजिक विज्ञान">सामाजिक विज्ञान</option>
                <option value="हिन्दी">हिन्दी</option>
                <option value="संस्कृत">संस्कृत</option>
                <option value="अंग्रेजी">अंग्रेजी</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">प्रश्न पत्र शीर्षक (Title)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
              placeholder="Ex: BSEB 10th गणित 2025 वार्षिक परीक्षा प्रश्न पत्र & Solution"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">PDF URL</label>
              <input
                value={pdfUrl}
                onChange={e => setPdfUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">एक्सेस (Access)</label>
              <select
                value={isVip ? 'vip' : 'free'}
                onChange={e => setIsVip(e.target.value === 'vip')}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-red-500 focus:outline-none"
              >
                <option value="free">🎁 Free (सभी के लिए मुफ्त)</option>
                <option value="vip">🔒 VIP Paid (केवल क्रैश कोर्स)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>PYQ PDF अपलोड करें</span>
          </button>

          {msg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Existing PYQs list */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-2xl">
        <h4 className="font-black text-sm text-stone-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-500" />
          <span>प्रकाशित PYQ प्रश्न पत्र ({pyqs.length})</span>
        </h4>

        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {pyqs.map(item => (
            <div 
              key={item.id}
              className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-white truncate">{item.title}</h5>
                  <p className="text-[10px] text-stone-400 flex items-center gap-2">
                    <span className="text-red-400 font-bold">वर्ष {item.year}</span>
                    <span>•</span>
                    <span>{item.subjectName}</span>
                    <span>•</span>
                    <span>{item.downloadsCount || 1000}+ डाउनलोड्स</span>
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (confirm('क्या आप वाकई इस PYQ PDF को हटाना चाहते हैं?')) {
                    await deletePyq(item.id);
                  }
                }}
                className="p-2 text-stone-400 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
