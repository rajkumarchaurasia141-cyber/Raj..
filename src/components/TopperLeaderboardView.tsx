import React, { useState } from 'react';
import { 
  Award, 
  Crown, 
  Trophy, 
  Medal, 
  Sparkles, 
  Search, 
  Plus, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  TrendingUp,
  User,
  Star
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface TopperLeaderboardViewProps {
  onOpenVip?: () => void;
}

const BIHAR_DISTRICTS = [
  'पटना (Patna)',
  'मुजफ्फरपुर (Muzaffarpur)',
  'दरभंगा (Darbhanga)',
  'समस्तीपुर (Samastipur)',
  'गया (Gaya)',
  'भागलपुर (Bhagalpur)',
  'बेगूसराय (Begusarai)',
  'पूर्णिया (Purnia)',
  'सारण (Siwan / Saran)',
  'वैशाली (Vaishali)',
  'नालंदा (Nalanda)',
  'अन्य जिला (Other)'
];

export function TopperLeaderboardView({ onOpenVip }: TopperLeaderboardViewProps) {
  const { leaderboard, addLeaderboardScore } = useData();
  const { user, isVIP } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [district, setDistrict] = useState(BIHAR_DISTRICTS[0]);
  const [score, setScore] = useState('');
  const [totalMarks, setTotalMarks] = useState('500');
  const [testName, setTestName] = useState('बिहार बोर्ड फुल सिलेबस विज्ञान मॉडल टेस्ट');
  const [subjectName, setSubjectName] = useState('विज्ञान');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtered leaderboard
  const filtered = leaderboard.filter((item) => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' || item.subjectName === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const topThree = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !score.trim()) {
      setErrorMsg('कृपया अपना नाम और प्राप्त अंक (Score) दर्ज करें।');
      return;
    }

    const numScore = parseInt(score, 10);
    const numTotal = parseInt(totalMarks, 10) || 500;

    if (isNaN(numScore) || numScore < 0 || numScore > numTotal) {
      setErrorMsg(`कृपया 0 से ${numTotal} के बीच वैध अंक दर्ज करें।`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addLeaderboardScore({
        studentName: studentName.trim(),
        district,
        score: numScore,
        totalMarks: numTotal,
        testName: testName.trim() || 'ऑनलाइन टेस्ट सीरीज',
        subjectName,
        isVip: isVIP,
        createdAt: new Date().toISOString()
      });

      setSuccessMsg('बधाई हो! आपका स्कोर लीडरबोर्ड पर सफलतापूर्वक जोड़ दिया गया है।');
      setScore('');
      setTimeout(() => {
        setShowSubmitModal(false);
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg('त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2.5 sm:p-3 max-w-2xl mx-auto space-y-3 pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-800 to-stone-950 rounded-3xl p-5 text-white shadow-lg border border-amber-400/30 space-y-3">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />

        <div className="flex items-center justify-between relative z-10">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-amber-300" />
            BSEB फुल सिलेबस TOPPER RANKINGS
          </span>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> अपना स्कोर जोड़ें
          </button>
        </div>

        <div className="relative z-10 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-300 fill-amber-300 animate-bounce" />
            टॉपर लीडरबोर्ड (Leaderboard)
          </h2>
          <p className="text-xs text-amber-100">
            बिहार बोर्ड परीक्षा में सर्वोच्च अंक प्राप्त करने वाले छात्र-छात्राओं की सूची। टेस्ट देकर अपनी रैंक सुधारें!
          </p>
        </div>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="छात्र, जिला या टेस्ट का नाम खोजें..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-500 shadow-xs"
        >
          <option value="ALL">सभी विषय (All Subjects)</option>
          <option value="संस्कृत">संस्कृत</option>
          <option value="विज्ञान">विज्ञान</option>
          <option value="गणित">गणित</option>
          <option value="हिन्दी">हिन्दी</option>
          <option value="सामाजिक विज्ञान">सामाजिक विज्ञान</option>
        </select>
      </div>

      {/* Top 3 Podium (Rank 1, 2, 3) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 rounded-2xl p-3 text-center flex flex-col items-center relative shadow-md transform -translate-y-2">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 border-2 border-white text-slate-700 font-black text-xs flex items-center justify-center shadow">
                #2
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-700 flex items-center justify-center font-bold text-base mb-1 mt-2">
                🥈
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 w-full">
                {topThree[1].studentName}
              </h4>
              <p className="text-[10px] text-stone-500 flex items-center justify-center gap-0.5 line-clamp-1">
                <MapPin className="w-2.5 h-2.5" /> {topThree[1].district.split(' ')[0]}
              </p>
              <div className="mt-2 bg-slate-800 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
                {topThree[1].score} / {topThree[1].totalMarks}
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-1">
                {Math.round((topThree[1].score / topThree[1].totalMarks) * 100)}%
              </span>
            </div>
          )}

          {/* Rank 1 (Gold - Topper) */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-400 rounded-3xl p-3.5 text-center flex flex-col items-center relative shadow-xl transform -translate-y-5 z-10">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-400 border-2 border-white text-stone-950 font-black text-sm flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 fill-stone-950" />
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-lg mb-1 mt-2">
                🥇
              </div>
              <h4 className="font-black text-stone-950 text-xs sm:text-sm line-clamp-1 w-full">
                {topThree[0].studentName}
              </h4>
              <p className="text-[10px] text-stone-600 flex items-center justify-center gap-0.5 line-clamp-1">
                <MapPin className="w-2.5 h-2.5 text-amber-700" /> {topThree[0].district.split(' ')[0]}
              </p>
              <div className="mt-2 bg-amber-600 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-md">
                {topThree[0].score} / {topThree[0].totalMarks}
              </div>
              <span className="text-[10px] font-black text-amber-900 mt-1">
                {Math.round((topThree[0].score / topThree[0].totalMarks) * 100)}% 🏆
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="bg-gradient-to-b from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-3 text-center flex flex-col items-center relative shadow-md transform -translate-y-1">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-orange-300 border-2 border-white text-orange-950 font-black text-xs flex items-center justify-center shadow">
                #3
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-400/20 text-orange-700 flex items-center justify-center font-bold text-base mb-1 mt-2">
                🥉
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 w-full">
                {topThree[2].studentName}
              </h4>
              <p className="text-[10px] text-stone-500 flex items-center justify-center gap-0.5 line-clamp-1">
                <MapPin className="w-2.5 h-2.5" /> {topThree[2].district.split(' ')[0]}
              </p>
              <div className="mt-2 bg-orange-700 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
                {topThree[2].score} / {topThree[2].totalMarks}
              </div>
              <span className="text-[10px] font-bold text-orange-800 mt-1">
                {Math.round((topThree[2].score / topThree[2].totalMarks) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Remaining Leaderboard List */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider px-1">
          अन्य रैंक धारक छात्र (Rank 4 onwards)
        </h3>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-stone-500 text-xs">
            कोई छात्र नहीं मिला। अपना स्कोर जोड़कर सूची में शामिल हों!
          </div>
        ) : (
          filtered.map((item, index) => {
            const rank = index + 1;
            const percentage = Math.round((item.score / item.totalMarks) * 100);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all hover:shadow-md ${
                  rank <= 3 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    rank === 1 ? 'bg-amber-400 text-stone-950 shadow' :
                    rank === 2 ? 'bg-slate-300 text-slate-800' :
                    rank === 3 ? 'bg-orange-300 text-orange-950' : 'bg-slate-100 text-stone-600'
                  }`}>
                    #{rank}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                        {item.studentName}
                      </h4>
                      {item.isVip && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" /> {item.district}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {item.subjectName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-stone-900 text-sm">
                    {item.score} <span className="text-[10px] text-stone-400 font-normal">/ {item.totalMarks}</span>
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-600">
                    {percentage}% अंक
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Score Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" /> अपना टेस्ट स्कोर जोड़ें
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitScore} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">आपका पूरा नाम (Student Name)</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="उदा: राहुल कुमार"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">बिहार जिला (District)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                >
                  {BIHAR_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">प्राप्त अंक (Your Score)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="500"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="उदा: 475"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">कुल पूर्णांक (Total Marks)</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">विषय (Subject)</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="संस्कृत">संस्कृत</option>
                  <option value="विज्ञान">विज्ञान</option>
                  <option value="गणित">गणित</option>
                  <option value="हिन्दी">हिन्दी</option>
                  <option value="सामाजिक विज्ञान">सामाजिक विज्ञान</option>
                  <option value="अंग्रेजी">अंग्रेजी</option>
                  <option value="सभी विषय (All Subjects)">सभी विषय (All Subjects)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">टेस्ट सीरीज का नाम (Test Name)</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="उदा: संस्कृत मङ्गलम् महाटेस्ट"
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
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-amber-900/20 text-xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {submitting ? 'सबमिट हो रहा है...' : 'लीडरबोर्ड पर स्कोर जोड़ें'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
