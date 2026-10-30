import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, Plus, Trash2, Calendar, BookOpen, Link as LinkIcon } from 'lucide-react';
import { extractYouTubeVideoId } from '../utils/youtubeHelper';
import { triggerAutoContentNotification } from '../services/pushNotificationService';

export function AdminDailyQuizManager() {
  const { dailyQuizzes, addDailyQuiz, deleteDailyQuiz } = useData();

  const [dateLabel, setDateLabel] = useState('20 सितम्बर');
  const [subjectName, setSubjectName] = useState('गणित');
  const [title, setTitle] = useState('गणित - वास्तविक संख्याएँ महाटेस्ट');
  const [chaptersCount, setChaptersCount] = useState(15);
  const [totalQuestions, setTotalQuestions] = useState(300);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateLabel.trim() || !subjectName.trim() || !title.trim()) {
      alert('कृपया सभी आवश्यक जानकारी भरें!');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanVid = extractYouTubeVideoId(youtubeUrl);
      const cleanUrl = cleanVid ? `https://www.youtube.com/watch?v=${cleanVid}` : youtubeUrl.trim();

      await addDailyQuiz({
        dateLabel: dateLabel.trim(),
        subjectName: subjectName.trim(),
        title: title.trim(),
        chaptersCount: Number(chaptersCount) || 10,
        totalQuestions: Number(totalQuestions) || 200,
        youtubeUrl: cleanUrl,
        createdAt: new Date().toISOString()
      });

      // Automatically trigger Smart Push Notification for new Test/Quiz publish
      triggerAutoContentNotification({
        contentType: 'test',
        contentId: `quiz_${subjectName.trim()}_${title.trim()}`,
        subjectName: subjectName.trim(),
        title: title.trim(),
        url: '/?tab=daily_quiz'
      }).catch(() => {});

      alert('✅ नया डेली क्विज़/टेस्ट सफलतापर्वूक जोड़ दिया गया है!');
      setTitle('');
      setYoutubeUrl('');
    } catch (err: any) {
      alert('त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl text-white shadow-xl border border-stone-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">डेली क्विज़ & टेस्ट प्रबंधक (Daily Quiz Manager)</h2>
            <p className="text-xs text-stone-400">यहाँ से आप नए दिनांक वार क्विज़ और ऑनलाइन टेस्ट जोड़ सकते हैं जो सीधे छात्रों के ऐप में दिखेंगे।</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>नया क्विज़ / टेस्ट जोड़ें</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">दिनांक लेबल (जैसे: 20 सितम्बर):</label>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">विषय का नाम (जैसे: गणित, विज्ञान):</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">क्विज़ शीर्षक (Title):</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पाठों की संख्या (Chapters):</label>
            <input
              type="number"
              value={chaptersCount}
              onChange={(e) => setChaptersCount(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">कुल प्रश्न (Total Questions):</label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">YouTube वीडियो लिंक (वैकल्पिक):</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black py-3 px-4 rounded-2xl shadow-md hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{isSubmitting ? 'जोड़ा जा रहा है...' : 'क्विज प्रकाशित करें (Publish)'}</span>
        </button>
      </form>

      {/* Quizzes List */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          प्रकाशित क्विज़ सूची ({dailyQuizzes.length})
        </h3>

        <div className="space-y-2">
          {dailyQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-full">
                    {quiz.dateLabel}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {quiz.subjectName}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-stone-900">{quiz.title}</h4>
              </div>

              <button
                onClick={async () => {
                  if (window.confirm('क्या आप वाकई इस क्विज़ को हटाना चाहते हैं?')) {
                    await deleteDailyQuiz(quiz.id);
                  }
                }}
                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
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
