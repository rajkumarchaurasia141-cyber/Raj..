import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit2, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminRoutineManager() {
  const { routine, addRoutineItem, updateRoutineItem, deleteRoutineItem } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subject, setSubject] = useState('विज्ञान (Science)');
  const [time, setTime] = useState('07:30 AM - 08:30 AM');
  const [topic, setTopic] = useState('भौतिकी / रसायन थ्योरी');
  const [instructor, setInstructor] = useState('साइंस टीम');
  const [days, setDays] = useState('प्रतिदिन (Mon - Sat)');
  const [color, setColor] = useState('border-l-blue-500 bg-blue-50/50');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setSubject('विज्ञान (Science)');
    setTime('07:30 AM - 08:30 AM');
    setTopic('भौतिकी / रसायन थ्योरी');
    setInstructor('साइंस टीम');
    setDays('प्रतिदिन (Mon - Sat)');
    setColor('border-l-blue-500 bg-blue-50/50');
    setErrorMsg('');
    setSuccessMsg('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setSubject(item.subject);
    setTime(item.time);
    setTopic(item.topic);
    setInstructor(item.instructor);
    setDays(item.days);
    setColor(item.color || 'border-l-blue-500 bg-blue-50/50');
    setErrorMsg('');
    setSuccessMsg('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !time.trim()) {
      setErrorMsg('कृपया विषय और समय दर्ज करें।');
      return;
    }

    try {
      if (editingId) {
        await updateRoutineItem(editingId, {
          subject: subject.trim(),
          time: time.trim(),
          topic: topic.trim(),
          instructor: instructor.trim(),
          days: days.trim(),
          color
        });
        setSuccessMsg('रूटीन सफलतापूर्वक अपडेट कर दिया गया है!');
      } else {
        await addRoutineItem({
          subject: subject.trim(),
          time: time.trim(),
          topic: topic.trim(),
          instructor: instructor.trim(),
          days: days.trim(),
          color
        });
        setSuccessMsg('नया रूटीन सफलतापूर्वक जोड़ दिया गया है!');
      }

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
            <Calendar className="w-5 h-5 text-red-700" />
            क्लास रूटीन मैनेजमेंट (Class Time Table)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से छात्र ऐप में दिखने वाला रूटीन बदल सकते हैं।</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> रूटीन जोड़ें
        </button>
      </div>

      <div className="space-y-2.5">
        {routine.map((item) => (
          <div
            key={item.id}
            className={`bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs border-l-4 ${item.color || 'border-l-red-500'}`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-stone-900 text-xs sm:text-sm">
                  {item.subject}
                </span>
                <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {item.time}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium line-clamp-1">{item.topic}</p>
              <div className="text-[11px] text-stone-500 flex items-center gap-3">
                <span>शिक्षक: <strong>{item.instructor}</strong></span>
                <span className="text-red-700 font-semibold">{item.days}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenEdit(item)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                title="संपादित करें"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('क्या आप वाकई इस रूटीन को हटाना चाहते हैं?')) {
                    deleteRoutineItem(item.id);
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

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-700" />
                {editingId ? 'रूटीन एडिट करें' : 'नया क्लास रूटीन जोड़ें'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">विषय का नाम (Subject Name)</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="उदा: विज्ञान (Science)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">समय (Time)</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="उदा: 07:30 AM - 08:30 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">टॉपिक / विवरण (Topic)</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="उदा: भौतिकी / रसायन थ्योरी"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">शिक्षक (Instructor)</label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="उदा: साइंस टीम"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">दिन (Days)</label>
                  <input
                    type="text"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="उदा: प्रतिदिन"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">कलर थीम (Accent Border)</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                >
                  <option value="border-l-red-500 bg-red-50/50">लाल (Red)</option>
                  <option value="border-l-amber-500 bg-amber-50/50">पीला / एम्बर (Amber)</option>
                  <option value="border-l-blue-500 bg-blue-50/50">नीला (Blue)</option>
                  <option value="border-l-emerald-500 bg-emerald-50/50">हरा (Emerald)</option>
                  <option value="border-l-purple-500 bg-purple-50/50">बैंगनी (Purple)</option>
                  <option value="border-l-indigo-500 bg-indigo-50/50">इंडigo (Indigo)</option>
                </select>
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
                className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer mt-2"
              >
                {editingId ? 'रूटीन अपडेट करें' : 'रूटीन सेव करें'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
