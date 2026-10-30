import React, { useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle, BookOpen, Download, Sparkles, Filter, Eye, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminCrashCourseManager() {
  const { crashCoursePdfs, addCrashCoursePdf, deleteCrashCoursePdf } = useData();

  const [subjectId, setSubjectId] = useState('science');
  const [chapterNo, setChapterNo] = useState<number>(1);
  const [chapterName, setChapterName] = useState('');
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [totalPages, setTotalPages] = useState<number>(8);
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [isVip, setIsVip] = useState(true);
  const [msg, setMsg] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  const subjectsList = [
    { id: 'science', name: 'विज्ञान (Science)', icon: '🔬' },
    { id: 'math', name: 'गणित (Maths)', icon: '📐' },
    { id: 'social_science', name: 'सामाजिक विज्ञान (SST)', icon: '🌍' },
    { id: 'hindi', name: 'हिन्दी (Hindi)', icon: '📖' },
    { id: 'sanskrit', name: 'संस्कृत (Sanskrit)', icon: '🕉️' },
    { id: 'english', name: 'अंग्रेजी (English)', icon: '🔤' }
  ];

  const currentSubjectObj = subjectsList.find(s => s.id === subjectId) || subjectsList[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert("फ़ाइल 25MB से बड़ी है। कृपया ड्राइव लिंक या डायरेक्ट PDF URL का उपयोग करें।");
        return;
      }
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setFileSize(sizeStr);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPdfUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('कृपया पीडीएफ का शीर्षक (Title) दर्ज करें!');
      return;
    }
    if (!chapterName.trim()) {
      alert('कृपया अध्याय का नाम (Chapter Name) दर्ज करें!');
      return;
    }

    try {
      await addCrashCoursePdf({
        subjectId,
        subjectName: currentSubjectObj.name,
        chapterNo: Number(chapterNo) || 1,
        chapterName: chapterName.trim(),
        title: title.trim(),
        pdfUrl: pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalPages: Number(totalPages) || 8,
        fileSize: fileSize.trim() || '1.5 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        isVip
      });

      setTitle('');
      setChapterName('');
      setMsg('✅ क्रैश कोर्स पीडीएफ सफलतापूर्वक अपलोड हो गया!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert('Error uploading Crash Course PDF: ' + (err.message || String(err)));
    }
  };

  const filteredPdfs = crashCoursePdfs.filter(pdf => {
    if (selectedSubjectFilter !== 'all' && pdf.subjectId !== selectedSubjectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Upload Box */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center font-bold shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <span>🚀 क्रैश कोर्स पीडीएफ प्रबंधक (Crash Course PDF Manager)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              यहाँ से विषय और अध्याय अनुसार क्रैश कोर्स के स्पेशल पीडीएफ नोट्स अपलोड करें
            </p>
          </div>
        </div>

        <form onSubmit={handleAddPdf} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">विषय चुनें (Subject) *</label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
              >
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Number */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">अध्याय संख्या (Chapter No) *</label>
              <input
                type="number"
                min="1"
                max="50"
                value={chapterNo}
                onChange={e => setChapterNo(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                placeholder="उदा. 1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chapter Name */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">अध्याय का नाम (Chapter Name) *</label>
              <input
                type="text"
                value={chapterName}
                onChange={e => setChapterName(e.target.value)}
                placeholder="उदा. रासायनिक अभिक्रियाएँ एवं समीकरण"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            {/* PDF Title */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">पीडीएफ शीर्षक (Notes Title) *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="उदा. अध्याय 1: सम्पूर्ण फॉर्मूला व VVI सारांश हस्तलिखित नोट्स"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pages */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">कुल पृष्ठ (Total Pages)</label>
              <input
                type="number"
                min="1"
                value={totalPages}
                onChange={e => setTotalPages(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                placeholder="8"
              />
            </div>

            {/* File Size */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">फ़ाइल आकार (Size)</label>
              <input
                type="text"
                value={fileSize}
                onChange={e => setFileSize(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                placeholder="1.5 MB"
              />
            </div>

            {/* VIP Status */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">एक्सेस (Lock Status)</label>
              <select
                value={isVip ? 'vip' : 'free'}
                onChange={e => setIsVip(e.target.value === 'vip')}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="vip">🔒 VIP Paid (केवल क्रैश कोर्स छात्र)</option>
                <option value="free">🔓 Free (सभी छात्रों के लिए फ्री)</option>
              </select>
            </div>
          </div>

          {/* PDF URL or Direct Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-300">पीडीएफ लिंक या फ़ाइल अपलोड (PDF URL / Upload) *</label>
            <input
              type="text"
              value={pdfUrl}
              onChange={e => setPdfUrl(e.target.value)}
              placeholder="https://example.com/notes.pdf या Google Drive लिंक"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-3 text-xs font-mono text-stone-300 focus:border-amber-500 focus:outline-none"
            />
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 font-bold">या डिवाइस से PDF चुनें:</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="text-[11px] text-stone-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-stone-800 file:text-white hover:file:bg-stone-700 cursor-pointer"
              />
            </div>
          </div>

          {msg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>क्रैश कोर्स में नया पीडीएफ जोड़ें (Upload PDF)</span>
          </button>
        </form>
      </div>

      {/* Uploaded Crash Course PDFs Table / List */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>अपलोड किए गए क्रैश कोर्स पीडीएफ नोट्स ({crashCoursePdfs.length})</span>
            </h3>
            <p className="text-xs text-stone-500">
              ये सभी पीडीएफ छात्रों के ऐप में "क्रैश कोर्स" सेक्शन में तुरंत दिखाई दे रहे हैं
            </p>
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              सभी ({crashCoursePdfs.length})
            </button>
            {subjectsList.map(s => {
              const count = crashCoursePdfs.filter(p => p.subjectId === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedSubjectFilter === s.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name.split(' ')[0]} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredPdfs.length === 0 ? (
          <div className="p-10 text-center text-stone-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
            <p className="text-sm font-bold text-stone-500">इस विषय में अभी कोई पीडीएफ नहीं है।</p>
            <p className="text-xs text-stone-400">ऊपर दिए गए फॉर्म से नया पीडीएफ अपलोड करें।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPdfs.map(pdf => (
              <div
                key={pdf.id}
                className="p-4 rounded-2xl border border-stone-200 hover:border-amber-400 bg-stone-50/70 hover:bg-white transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      {pdf.subjectName}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                      अध्याय {pdf.chapterNo}
                    </span>
                    {pdf.isVip ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        🔒 VIP
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        🔓 FREE
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`क्या आप "${pdf.title}" पीडीएफ को हटाना चाहते हैं?`)) {
                        deleteCrashCoursePdf(pdf.id);
                      }
                    }}
                    className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="डिलीट करें"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-amber-800 leading-snug">
                    {pdf.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    पाठ: {pdf.chapterName}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-200/60 font-semibold">
                  <span>📄 {pdf.totalPages || 8} पृष्ठ • {pdf.fileSize || '1.4 MB'}</span>
                  <a
                    href={pdf.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>देखें</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
