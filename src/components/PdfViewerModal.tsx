import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Crown,
  Share2,
  Printer
} from 'lucide-react';
import { PaidPdfNote } from '../types';

interface PdfViewerModalProps {
  note: PaidPdfNote;
  onClose: () => void;
}

export function PdfViewerModal({ note, onClose }: PdfViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeView, setActiveView] = useState<'reader' | 'embed'>('reader');
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (note.pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.download = `${note.subjectName}_Ch${note.chapterNo || 1}_${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(note.pdfUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: `कक्षा 10वीं टॉपर बैच फुल सिलेबस - ${note.subjectName}: ${note.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      {/* Container */}
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
        
        {/* Top Header Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                  {note.subjectName}
                </span>
                {note.chapterNo && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    अध्याय {note.chapterNo}
                  </span>
                )}
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded">
                  {note.totalPages || 12} पृष्ठ • {note.fileSize || '2.5 MB'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 truncate mt-0.5" title={note.title}>
                {note.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="PDF डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">डाउनलोड</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              aria-label="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Controls Toolbar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('reader')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeView === 'reader' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              📖 स्मार्ट रीडर मोड
            </button>
            <button
              onClick={() => setActiveView('embed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeView === 'embed' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              📄 ओरिजिनल PDF फाइल
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeView === 'reader' && (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                  className="hover:text-white p-0.5 cursor-pointer"
                  title="ज़ूम कम करें"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="hover:text-white p-0.5 cursor-pointer"
                  title="ज़ूम बढ़ाएं"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleShare}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="शेयर करें"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 flex justify-center">
          {activeView === 'embed' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-4 text-center">
              <iframe
                src={note.pdfUrl}
                className="w-full h-full min-h-[450px] rounded-xl border border-slate-800 bg-white"
                title={note.title}
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> सीधे PDF डाउनलोड करें या नई विंडो में खोलें
                </button>
              </div>
            </div>
          ) : (
            /* Smart High-Fidelity Study Material Document Reader */
            <div 
              style={{ fontSize: `${zoomLevel}%` }}
              className="w-full max-w-3xl bg-white text-stone-900 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-slate-200 transition-all select-text relative overflow-hidden"
            >
              {/* Background App Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.05] z-0">
                <span className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-stone-900 transform -rotate-45 whitespace-nowrap">
                  BIHAR BOARD SOLUTION CLASSES
                </span>
              </div>

              {/* Document Header with Official Watermark */}
              <div className="border-b-2 border-red-700 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-700 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                      BSEB 10TH TOPPER BATCH फुल सिलेबस
                    </span>
                    <span className="text-xs font-bold text-red-700">★ OFFICIAL STUDY MATERIAL</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                    {note.subjectName}: {note.title}
                  </h1>
                  {note.chapterName && (
                    <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-0.5">
                      अध्याय {note.chapterNo || 1} • {note.chapterName}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-black text-red-700">लक्ष्य: 450+ अंक</span>
                  <span className="text-[11px] text-stone-500 font-medium">हस्तलिखित सम्पूर्ण हल</span>
                </div>
              </div>

              {/* Description & Overview */}
              {note.description && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed font-medium">
                  <strong>💡 पाठ का सार एवं रूपरेखा:</strong> {note.description}
                </div>
              )}

              {/* Content Sections */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-stone-800">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-extrabold text-red-800 text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700" />
                    1. मुख्य बिन्दु एवं बोर्ड परीक्षा महत्वपूर्ण तथ्य
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
                    <li>एनसीईआरटी (NCERT / BSEB) नवीनतम पाठ्यक्रम के अनुसार प्रत्येक विषय के प्रत्येक बिंदु का सरल हिन्दी व्याख्या।</li>
                    <li>प्रत्येक अध्याय के प्रमुख मन्त्र/परिभाषाएं/सूत्र और उनके परीक्षा में पूछे जाने वाले वास्तविक उदाहरण।</li>
                    <li>पिछले 10 वर्षों में पूछे गए रिपीटेड प्रश्न और 100% आने वाले VVI मॉडल प्रश्नोत्तर।</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-extrabold text-red-800 text-sm mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    2. टॉपर्स सीक्रेट रिवीजन टिप्स & ट्रिक्स
                  </h4>
                  <p className="text-stone-700">
                    • परीक्षा में कॉपी लिखते समय उत्तर को हमेशा पॉइंट-वाइज लिखें और मुख्य शब्दों को अंडरलाइन करें।
                    <br />
                    • वस्तुनिष्ठ (Objective) प्रश्नों के लिए रटने के बजाय मूल अवधारणा (Concept) को अच्छी तरह समझें।
                    <br />
                    • इस पीडीएफ नोट्स को कम से कम 3 बार रिवाइज करें ताकि 50 में से पूरे 50 अंक प्राप्त हों।
                  </p>
                </div>

                <div className="p-4 bg-red-50/60 rounded-xl border border-red-100 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-red-900 text-xs sm:text-sm">
                      सम्पूर्ण {note.totalPages || 12} पृष्ठों की ओरिजिनल कलरफुल PDF फाइल
                    </h5>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      ऑफ़लाइन सेव करके प्रिंट या पढ़ने के लिए डाउनलोड करें (आकार: {note.fileSize || '2.5 MB'})
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> डाउनलोड PDF
                  </button>
                </div>
              </div>

              {/* Watermark Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-stone-400">
                <span>कॉपीराइट © फुल सिलेबस बिहार बोर्ड 10वीं टॉपर बैच</span>
                <span>पेज 1 / {note.totalPages || 12}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
