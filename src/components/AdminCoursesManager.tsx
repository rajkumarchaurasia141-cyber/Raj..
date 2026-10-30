import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { BookOpen, Plus, Trash2, Edit2, CheckCircle2, Sparkles, GraduationCap } from 'lucide-react';
import { useData } from '../context/DataContext';

export interface CoursePackage {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  subjects: string[];
  price: number;
  isFeatured: boolean;
  createdAt: string;
}

const DEFAULT_COURSES: CoursePackage[] = [
  {
    id: 'topper-batch-फुल सिलेबस',
    name: 'टॉपर बैच फुल सिलेबस (Topper Batch)',
    subtitle: 'बिहार बोर्ड कक्षा 10वीं सम्पूर्ण तैयारी',
    description: 'सभी 7 मुख्य विषयों के हस्तलिखित नोट्स, VVI चैप्टर वाइज MCQs एवं लाइव क्लास।',
    badge: 'BSEB फुल सिलेबस अनिवार्य',
    subjects: ['math', 'science', 'social_science', 'hindi', 'sanskrit', 'english'],
    price: 499,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'new-crash-course-2025',
    name: 'न्यू क्रैश कोर्स (New Crash Course)',
    subtitle: '10th Fast-Track Revision Batch',
    description: '151+ अध्यायों के 30 VVI MCQs, तुरंत व्याख्या और स्पेशल बूस्टर्स।',
    badge: 'Limited Time Offer',
    subjects: ['math', 'science', 'social_science', 'hindi', 'sanskrit', 'english'],
    price: 299,
    isFeatured: true,
    createdAt: new Date().toISOString()
  }
];

export function AdminCoursesManager() {
  const { subjects } = useData();
  const [courses, setCourses] = useState<CoursePackage[]>(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('BSEB फुल सिलेबस');
  const [price, setPrice] = useState(499);
  const [isFeatured, setIsFeatured] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['math', 'science', 'social_science', 'hindi', 'sanskrit', 'english']);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'admin_courses'), (snapshot) => {
        if (!snapshot.empty) {
          const list: CoursePackage[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({ 
              id: d.id, 
              ...data,
              price: Number(data.price) === 600 || Number(data.price) === 299 ? 499 : (Number(data.price) || 499)
            } as CoursePackage);
          });
          setCourses(list);
        }
      }, (err) => {
        console.warn("Courses snapshot notice:", err?.message || String(err));
      });
      return () => unsub();
    } catch (e) {
      console.warn("Courses fetch error:", e);
    }
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg('कृपया कोर्स का नाम दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const courseId = editingId || `course-${Date.now()}`;
      const newCourse: CoursePackage = {
        id: courseId,
        name: name.trim(),
        subtitle: subtitle.trim() || 'बिहार बोर्ड संपूर्ण तैयारी',
        description: description.trim() || 'उच्च गुणवत्ता वाले नोट्स और टेस्ट सीरीज़।',
        badge: badge.trim() || 'फुल सिलेबस Topper',
        subjects: selectedSubjects,
        price: Number(price) || 499,
        isFeatured,
        createdAt: new Date().toISOString()
      };

      await safeSetDoc(doc(db, 'admin_courses', courseId), newCourse, { merge: true });
      
      // Also save to localStorage
      const updated = editingId 
        ? courses.map(c => c.id === courseId ? newCourse : c)
        : [newCourse, ...courses];
      
      setCourses(updated);
      localStorage.setItem('admin_custom_courses', JSON.stringify(updated));

      setMsg(`कोर्स "${name}" सफलतापूर्वक ${editingId ? 'अपडेट' : 'जोड़ा'} गया!`);
      // Reset form
      setName('');
      setSubtitle('');
      setDescription('');
      setEditingId(null);
    } catch (err: any) {
      if (isQuotaError(err)) {
        setMsg(`कोर्स "${name}" स्थानीय रूप से सहेज लिया गया है (आज की क्लाउड लिमिट पूरी है)।`);
      } else {
        setMsg('कोर्स सहेजने में त्रुटि: ' + err.message);
      }
    }
    setLoading(false);
  };

  const handleEdit = (c: CoursePackage) => {
    setEditingId(c.id);
    setName(c.name);
    setSubtitle(c.subtitle);
    setDescription(c.description);
    setBadge(c.badge);
    setPrice(c.price);
    setIsFeatured(c.isFeatured);
    setSelectedSubjects(c.subjects || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप वाकई इस कोर्स को हटाना चाहते हैं?')) return;
    try {
      await safeDeleteDoc(doc(db, 'admin_courses', id));
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      localStorage.setItem('admin_custom_courses', JSON.stringify(updated));
      setMsg('कोर्स सफलतापूर्वक हटा दिया गया।');
    } catch (err: any) {
      if (isQuotaError(err)) {
        const updated = courses.filter(c => c.id !== id);
        setCourses(updated);
        localStorage.setItem('admin_custom_courses', JSON.stringify(updated));
        setMsg('कोर्स स्थानीय रूप से हटा दिया गया है।');
      } else {
        setMsg('कोर्स हटाने में त्रुटि: ' + err.message);
      }
    }
  };

  const toggleSubjectSelect = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-stone-900 text-base">कोर्स प्रबंधक (Add & Manage Courses)</h3>
            <p className="text-xs text-stone-500">अपना कस्टम कोर्स (जैसे: टॉपर बैच फुल सिलेबस) बनाएं और उसमें विषय जोड़ें</p>
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            msg.includes('त्रुटि') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">कोर्स का नाम (Course Title) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="जैसे: टॉपर बैच फुल सिलेबस (Topper Batch)"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">सबटाइट्ल (Subtitle)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="जैसे: बिहार बोर्ड कक्षा 10वीं सम्पूर्ण तैयारी"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">बैज (Badge Text)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="जैसे: BSEB फुल सिलेबस"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">फीस (Price in ₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-stone-800">फीचर्ड कोर्स (Featured)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-stone-700 mb-1">कोर्स विवरण (Description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="कोर्स की मुख्य विशेषताओं के बारे में लिखें..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>

          {/* Subject selection for this course */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 mb-2">इस कोर्स में शामिल विषय (Select Subjects):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'math', name: 'गणित (Mathematics)' },
                { id: 'science', name: 'विज्ञान (Science)' },
                { id: 'social_science', name: 'सामाजिक विज्ञान (SST)' },
                { id: 'hindi', name: 'हिन्दी (Hindi)' },
                { id: 'sanskrit', name: 'संस्कृत (Sanskrit)' },
                { id: 'english', name: 'अंग्रेजी (English)' }
              ].map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => toggleSubjectSelect(sub.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-red-500 text-red-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-stone-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-red-600 text-white' : 'border border-slate-300'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setName(''); setSubtitle(''); setDescription(''); }}
                className="px-4 py-2.5 rounded-xl bg-slate-200 text-stone-700 font-bold text-xs hover:bg-slate-300 transition-all cursor-pointer"
              >
                रद्द करें
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'कोर्स अपडेट करें' : 'नया कोर्स जोड़ें'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Courses List */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-stone-900 text-sm">सक्रिय कोर्स सूची ({courses.length})</h4>
        
        {courses.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 font-black text-[10px] px-2 py-0.5 rounded-full">
                  {c.badge}
                </span>
                <span className="text-xs text-stone-500 font-semibold">मूल्य: ₹{c.price}</span>
              </div>
              <h5 className="font-black text-stone-900 text-sm">{c.name}</h5>
              <p className="text-xs text-stone-600">{c.subtitle}</p>
              <div className="flex items-center gap-1 pt-1 flex-wrap">
                <span className="text-[10px] text-stone-400 font-bold">विषय:</span>
                {c.subjects.map((sId) => (
                  <span key={sId} className="bg-slate-100 text-stone-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    {sId}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(c)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 transition-colors cursor-pointer"
                title="संपादित करें"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                title="हटाएं"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
