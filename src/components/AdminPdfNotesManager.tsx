import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  Link as LinkIcon, 
  BookOpen, 
  Sparkles,
  Download
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PaidPdfNote } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { triggerAutoContentNotification } from '../services/pushNotificationService';

const SUBJECT_OPTIONS = [
  { id: 'sanskrit', name: 'संस्कृत (पीयूषम्)' },
  { id: 'science', name: 'विज्ञान (Physics, Chem, Bio)' },
  { id: 'math', name: 'गणित (Mathematics)' },
  { id: 'hindi', name: 'हिन्दी (गोधूलि & वर्णिका)' },
  { id: 'social_science', name: 'सामाजिक विज्ञान (Social Science)' },
  { id: 'english', name: 'अंग्रेजी (English Panorama)' }
];

export function AdminPdfNotesManager() {
  const { paidNotes, addPaidNote, deletePaidNote } = useData();

  // Form State
  const [subjectId, setSubjectId] = useState('sanskrit');
  const [chapterNo, setChapterNo] = useState<number>(1);
  const [chapterName, setChapterName] = useState('मङ्गलम् (उपनिषदः)');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalPages, setTotalPages] = useState<number>(12);
  const [fileSize, setFileSize] = useState<string>('2.5 MB');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isGuessPaper, setIsGuessPaper] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preview Note State
  const [previewNote, setPreviewNote] = useState<PaidPdfNote | null>(null);

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('कृपया केवल .pdf फॉर्मेट की फाइल ही अपलोड करें।');
      return;
    }

    setFileName(file.name);
    // Calculate human-readable size
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${mb} MB`);

    if (!title) {
      // Auto-set title from file name
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPdfUrl(result);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('फाइल पढ़ने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submit
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('कृपया नोट्स का शीर्षक (Title) अवश्य दर्ज करें।');
      return;
    }

    if (!pdfUrl.trim()) {
      setErrorMsg('कृपया PDF फाइल चुनें अथवा PDF का वेब लिंक दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const selectedSub = SUBJECT_OPTIONS.find((s) => s.id === subjectId);
      const subjectLabel = selectedSub?.name || subjectId;
      await addPaidNote({
        subjectId,
        subjectName: subjectLabel,
        chapterNo: Number(chapterNo) || 1,
        chapterName: chapterName.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        pdfUrl: pdfUrl.trim(),
        totalPages: Number(totalPages) || 10,
        fileSize: fileSize || '2.0 MB',
        isPaid: true,
        isGuessPaper: isGuessPaper
      });

      // Automatically trigger Smart Push Notification for new PDF Notes publish
      triggerAutoContentNotification({
        contentType: 'notes',
        contentId: `note_${subjectId}_${chapterNo}_${title.trim()}`,
        subjectName: subjectLabel,
        title: title.trim(),
        url: `/?tab=downloads&subject=${encodeURIComponent(subjectId)}`
      }).catch(() => {});

      setSuccessMsg(`"${title}" को सफलतापूर्वक ${isGuessPaper ? 'स्पेशल गेस पेपर' : 'पेड नोट्स लाइब्रेरी'} में जोड़ दिया गया है!`);
      // Reset form fields
      setTitle('');
      setDescription('');
      setPdfUrl('');
      setFileName('');
      setIsGuessPaper(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'नोट्स सेव करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  // Seed sample notes
  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      for (const def of defaultPaidPdfNotes) {
        if (!paidNotes.some((n) => n.id === def.id || (n.subjectId === def.subjectId && n.chapterNo === def.chapterNo))) {
          await addPaidNote({
            subjectId: def.subjectId,
            subjectName: def.subjectName,
            chapterNo: def.chapterNo,
            chapterName: def.chapterName,
            title: def.title,
            description: def.description,
            pdfUrl: def.pdfUrl,
            totalPages: def.totalPages,
            fileSize: def.fileSize,
            isPaid: true
          });
        }
      }
      setSuccessMsg('सभी 6 विषयों के मॉडल PDF नोट्स सफलतापूर्वक लोड कर दिए गए हैं!');
    } catch (e: any) {
      setErrorMsg('सैंपल लोड करने में समस्या: ' + e?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-gradient-to-r from-red-950/80 via-stone-900 to-amber-950/80 border border-red-900/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-white">पेड PDF नोट्स अपलोड & प्रबंधन</h3>
          </div>
          <p className="text-xs text-stone-300 mt-1">
            यहाँ से आप सीधे मोबाइल या कंप्यूटर से PDF नोट्स अपलोड कर सकते हैं। यह सीधे "माय कोर्स (टॉपर बैच फुल सिलेबस)" और "डाउनलोड्स" दोनों जगह प्रदर्शित होगा।
          </p>
        </div>

        <button
          type="button"
          onClick={handleSeedDefaults}
          disabled={loading}
          className="bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          मॉडल NCERT नोट्स लोड करें
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-500/40 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add PDF Note Form Card */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          नया Paid PDF नोट जोड़ें (Add New PDF Note)
        </h4>

        <form onSubmit={handleAddNote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                विषय चुनें (Subject) *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                अध्याय संख्या (Chapter No.)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={chapterNo}
                onChange={(e) => setChapterNo(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                placeholder="उदा. 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Chapter Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                अध्याय का नाम (Chapter Name)
              </label>
              <input
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                placeholder="उदा. मङ्गलम् (उपनिषदः) / प्रकाश का परावर्तन"
              />
            </div>

            {/* Note Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                नोट्स का शीर्षक (Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                placeholder="उदा. सम्पूर्ण व्याख्या, मन्त्रार्थ एवं 50 VVI वस्तुनिष्ठ नोट्स"
                required
              />
            </div>
          </div>

          {/* Special Guess Paper Checkbox Toggle */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="guessPaperToggle" className="text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer">
                <span>🔥 क्या यह "स्पेशल गेस पेपर" है?</span>
                <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">VVI LOCK</span>
              </label>
              <p className="text-[11px] text-stone-400">
                इसे चेक करने पर यह सीधे "स्पेशल गेस पेपर" सेक्शन में लॉक होकर दिखेगा (केवल पेड छात्रों का लॉक खुलेगा)।
              </p>
            </div>
            <input
              id="guessPaperToggle"
              type="checkbox"
              checked={isGuessPaper}
              onChange={(e) => setIsGuessPaper(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              संक्षिप्त विवरण (Short Description / Overview)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              placeholder="उदा. बोर्ड परीक्षा फुल सिलेबस टॉपर स्पेशल हस्तलिखित नोट्स व मॉडल प्रश्नोत्तर"
            />
          </div>

          {/* PDF Source Choice: File or URL */}
          <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300">
                PDF अपलोड माध्यम चुनें:
              </span>
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-700">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'file' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" /> डिवाइस से फाइल
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('link')}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'link' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> PDF वेब लिंक
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div>
                <label className="border-2 border-dashed border-stone-700 hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-stone-900/50">
                  <UploadCloud className="w-8 h-8 text-red-400" />
                  <span className="text-xs font-semibold text-stone-300">
                    {fileName ? `चयनित फाइल: ${fileName}` : 'यहाँ क्लिक करके अपने फोन या कम्प्यूटर से .PDF चुनें'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    (अधिकतम 25 MB तक की PDF फाइल समर्थित है)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  PDF का यूआरएल (Google Drive / Cloud Link / PDF URL)
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="https://drive.google.com/... या https://example.com/notes.pdf"
                />
              </div>
            )}

            {/* Pages & Size */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  कुल पृष्ठ (Pages)
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalPages}
                  onChange={(e) => setTotalPages(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  फाइल साइज (File Size)
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  placeholder="2.5 MB"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>अपलोड और सेव हो रहा है...</span>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                <span>PDF नोट पब्लिश करें (Publish Paid PDF Note)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Notes List */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            अपलोड किए गए Paid PDF नोट्स ({paidNotes.length})
          </h4>
          <span className="text-xs text-stone-400">
            छात्रों के लिए तुरंत उपलब्ध
          </span>
        </div>

        {paidNotes.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            अभी कोई PDF नोट अपलोड नहीं किया गया है। ऊपर दिए गए फॉर्म से पहला नोट जोड़ें!
          </div>
        ) : (
          <div className="space-y-2.5">
            {paidNotes.map((note) => (
              <div
                key={note.id}
                className="bg-stone-950 border border-stone-800/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-800/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-950 text-red-300 border border-red-800/50 text-[10px] font-bold px-2 py-0.5 rounded">
                        {note.subjectName}
                      </span>
                      {note.chapterNo && (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800/50 text-[10px] font-bold px-2 py-0.5 rounded">
                          अध्याय {note.chapterNo}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400">
                        {note.totalPages || 12} पेज • {note.fileSize || '2 MB'}
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-xs sm:text-sm mt-1">
                      {note.title}
                    </h5>
                    {note.description && (
                      <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                        {note.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="PDF प्रीव्यू देखें"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>देखें</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`क्या आप "${note.title}" नोट को हटाना चाहते हैं?`)) {
                        deletePaidNote(note.id);
                      }
                    }}
                    className="bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/40 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="नोट हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {previewNote && (
        <PdfViewerModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
        />
      )}
    </div>
  );
}
