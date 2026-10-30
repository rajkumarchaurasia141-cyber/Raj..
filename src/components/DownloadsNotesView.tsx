import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileText, 
  Crown, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Sparkles, 
  Download,
  Search,
  BookOpen
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PaidPdfNote } from '../types';
import { PdfViewerModal } from './PdfViewerModal';

interface DownloadsNotesViewProps {
  onOpenSubject: (subjectId: string) => void;
  onOpenVip: () => void;
  initialFilter?: string;
}

export function DownloadsNotesView({ onOpenSubject, onOpenVip, initialFilter = 'all' }: DownloadsNotesViewProps) {
  const { paidNotes, subjects } = useData();
  const { isVIP } = useAuth();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePdfNote, setActivePdfNote] = useState<PaidPdfNote | null>(null);

  const guessPapersCount = paidNotes.filter(n => n.isGuessPaper).length;

  const filteredNotes = paidNotes.filter((note) => {
    let matchesCategory = true;
    if (selectedSubjectFilter === 'guess_paper') {
      matchesCategory = note.isGuessPaper === true;
    } else if (selectedSubjectFilter !== 'all') {
      matchesCategory = note.subjectId === selectedSubjectFilter;
    }
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      note.title.toLowerCase().includes(query) ||
      note.subjectName.toLowerCase().includes(query) ||
      (note.chapterName && note.chapterName.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  const handleOpenPdf = (note: PaidPdfNote) => {
    setActivePdfNote(note);
  };

  const handleDownload = (note: PaidPdfNote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.download = `${note.subjectName}_${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(note.pdfUrl, '_blank');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-2.5 sm:p-3 space-y-3 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-amber-300" />
            <h3 className="font-black text-base sm:text-lg text-white">
              Test & PDFs (टेस्ट सामग्री, प्रश्न पत्र व नोट्स)
            </h3>
          </div>
          <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% FREE
          </span>
        </div>
        <p className="text-xs text-stone-200">
          कक्षा 10वीं बिहार बोर्ड टेस्ट सामग्री, प्रैक्टिस टेस्ट, प्रश्न पत्र, क्रैश कोर्स टेस्ट व डाउनलोड करने योग्य पीडीएफ नोट्स।
        </p>
      </div>

      {/* 100% Free Access Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-emerald-900 text-xs">
            सभी टेस्ट और पीडीएफ 100% मुफ़्त हैं (All Tests & PDFs Free)
          </h4>
          <p className="text-[11px] text-emerald-700">
            सभी परीक्षा सामग्री, गेस पेपर और प्रश्न पत्र बिना किसी शुल्क के उपलब्ध हैं।
          </p>
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="पीडीएफ नोट्स या अध्याय खोजें..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-600 shadow-2xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSubjectFilter('guess_paper')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSubjectFilter === 'guess_paper'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400'
                : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-extrabold'
            }`}
          >
            <span>🔥 स्पेशल गेस पेपर</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-300 font-black">
              {guessPapersCount}
            </span>
            {!isVIP && <Lock className="w-3 h-3 text-amber-700" />}
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'all'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            सभी विषय ({paidNotes.length})
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('sanskrit')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'sanskrit'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            संस्कृत
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('science')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'science'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            विज्ञान
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('math')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'math'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            गणित
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('hindi')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'hindi'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('social_science')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'social_science'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            सामाजिक विज्ञान
          </button>
          <button
            onClick={() => setSelectedSubjectFilter('english')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubjectFilter === 'english'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-stone-600 hover:bg-slate-50'
            }`}
          >
            अंग्रेजी
          </button>
        </div>
      </div>

      {/* PDF Notes Cards */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-stone-500 text-xs">
            कोई PDF नोट नहीं मिला। कृपया दूसरा विषय चुनें या एडमिन पैनल से नया नोट जोड़ें।
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isUnlocked = isVIP || note.id === 'sanskrit-ch1-mangalam-pdf' || !note.isPaid;

            return (
              <div
                key={note.id}
                onClick={() => handleOpenPdf(note)}
                className={`bg-white hover:bg-slate-50 border rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group relative overflow-hidden ${
                  note.isGuessPaper 
                    ? 'border-amber-300 ring-1 ring-amber-400/40 bg-gradient-to-r from-amber-500/5 via-white to-white' 
                    : 'border-slate-200/90'
                }`}
              >
                {note.isGuessPaper && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-1">
                    <span>🔥 स्पेशल गेस पेपर</span>
                    {!isUnlocked && <Lock className="w-2.5 h-2.5" />}
                  </span>
                )}
                {!note.isGuessPaper && !isVIP && note.id === 'sanskrit-ch1-mangalam-pdf' && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg">
                    फ्री सैंपल
                  </span>
                )}

                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform mt-0.5 ${
                    note.isGuessPaper 
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                      : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {note.isGuessPaper ? <Sparkles className="w-6 h-6 text-amber-700" /> : <FileText className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                        note.isGuessPaper 
                          ? 'bg-amber-500 text-stone-950 border-amber-500 font-black' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {note.subjectName}
                      </span>
                      {note.chapterNo && (
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
                          अध्याय {note.chapterNo}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400">
                        {note.totalPages || 12} पृष्ठ • {note.fileSize || '2.5 MB'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-red-700 transition-colors leading-snug">
                      {note.title}
                    </h4>

                    {note.description && (
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {note.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isUnlocked ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleDownload(note, e)}
                        className="bg-slate-100 hover:bg-red-50 text-stone-600 hover:text-red-700 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="PDF डाउनलोड करें"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <span className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        <span>PDF पढ़ें</span>
                      </span>
                    </>
                  ) : (
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-950 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{note.isGuessPaper ? '🔒 गेस पेपर लॉक खोलें' : '🔒 अनलॉक करें'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Viewer Modal */}
      {activePdfNote && (
        <PdfViewerModal
          note={activePdfNote}
          onClose={() => setActivePdfNote(null)}
        />
      )}
    </div>
  );
}
