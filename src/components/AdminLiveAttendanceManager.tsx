import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Users, 
  Clock, 
  Crown, 
  Radio, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Eye, 
  ShieldCheck, 
  MessageCircle, 
  Calendar,
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import { LiveClass, LiveWatchRecord, BatchStudent } from '../types';
import { 
  subscribeAllAttendance, 
  formatWatchDuration, 
  DEFAULT_BATCH_STUDENTS 
} from '../services/attendanceTracker';

export function AdminLiveAttendanceManager() {
  const { liveClasses } = useData();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [allAttendance, setAllAttendance] = useState<LiveWatchRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'connected' | 'absent'>('connected');
  const [search, setSearch] = useState('');
  const [filterVipOnly, setFilterVipOnly] = useState(false);
  const [batchStudents] = useState<BatchStudent[]>(DEFAULT_BATCH_STUDENTS);

  // Subscribe to all attendance records safely
  useEffect(() => {
    const unsub = subscribeAllAttendance((records) => {
      setAllAttendance(records);
    });
    return () => unsub();
  }, []);

  // Filter attendance records by selected class
  const filteredRecords = useMemo(() => {
    let list = allAttendance;
    if (selectedClassId !== 'all') {
      list = list.filter(r => r.classId === selectedClassId);
    }
    if (filterVipOnly) {
      list = list.filter(r => r.isPaid);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => 
        (r.studentName || '').toLowerCase().includes(q) || 
        (r.studentEmail || '').toLowerCase().includes(q) ||
        (r.classTitle || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAttendance, selectedClassId, filterVipOnly, search]);

  // Online / Active Viewers
  const onlineRecords = useMemo(() => {
    return filteredRecords.filter(r => r.isOnline);
  }, [filteredRecords]);

  // Connected students set
  const connectedEmailsSet = useMemo(() => {
    const set = new Set<string>();
    filteredRecords.forEach(r => {
      if (r.studentEmail) set.add(r.studentEmail.toLowerCase());
      if (r.studentId) set.add(r.studentId);
    });
    return set;
  }, [filteredRecords]);

  // Absent students
  const absentStudents = useMemo(() => {
    return batchStudents.filter(s => {
      const matchEmail = s.email && connectedEmailsSet.has(s.email.toLowerCase());
      const matchId = s.id && connectedEmailsSet.has(s.id);
      if (filterVipOnly && !s.isPaid) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch = (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      return !matchEmail && !matchId;
    });
  }, [batchStudents, connectedEmailsSet, filterVipOnly, search]);

  // Statistics
  const totalWatchSeconds = filteredRecords.reduce((acc, curr) => acc + curr.watchSeconds, 0);
  const avgWatchSeconds = filteredRecords.length > 0 ? Math.round(totalWatchSeconds / filteredRecords.length) : 0;
  const vipCount = filteredRecords.filter(r => r.isPaid).length;

  const currentSelectedClass = liveClasses.find(c => c.id === selectedClassId);

  const handleSendReminder = (student: BatchStudent) => {
    const title = currentSelectedClass?.title || 'BSEB 10वीं लाइव क्लास';
    const text = encodeURIComponent(
      `नमस्ते ${student.name}! BSEB 10वीं की क्लास "${title}" चल रही है। आप अभी तक क्लास में नहीं जुड़े हैं। कृपया तुरंत ऐप खोलकर क्लास ज्वाइन करें!`
    );
    const phone = student.phone?.replace(/[^0-9]/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-stone-900 border border-red-500/30 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                REAL-TIME TRACKER
              </span>
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                फायरबेस सुरक्षित (Zero Quota Strain)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              🔴 लाइव क्लास अटेंडेंस & वॉच-टाइम ट्रैकर
            </h3>
            <p className="text-xs text-stone-300 max-w-xl">
              यहाँ आप देख सकते हैं कि कौन सा छात्र (पेड/फ्री) क्लास में जुड़ा है, कितने समय (घंटे/मिनट) से देख रहा है, और कौन अभी तक नहीं जुड़ा है।
            </p>
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 max-w-xs shadow-md"
            >
              <option value="all">🌐 सभी कक्षाएं (All Classes)</option>
              {liveClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.isLive ? '🔴 LIVE: ' : '📹 '} {cls.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900 border border-emerald-500/40 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>अभी एक्टिव देख रहे हैं</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white">{onlineRecords.length}</span>
            <span className="text-xs text-stone-400">छात्र लाइव</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
            ✓ हर सेकंड लाइव वॉच-टाइम ट्रैकिंग
          </p>
        </div>

        <div className="bg-stone-900 border border-amber-500/40 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
            <span>औसत वॉच-टाइम</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-300">
              {formatWatchDuration(avgWatchSeconds)}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            कुल: {formatWatchDuration(totalWatchSeconds)}
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-yellow-400 text-xs font-bold">
            <span>पेड (VIP) छात्र</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white">{vipCount}</span>
            <span className="text-xs text-stone-400">सदस्य जुड़े</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            सत्यापित ₹299 क्रैश कोर्स
          </p>
        </div>

        <div className="bg-stone-900 border border-red-500/30 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-red-400 text-xs font-bold">
            <span>नहीं जुड़े (अनुपस्थित)</span>
            <UserX className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white">{absentStudents.length}</span>
            <span className="text-xs text-stone-400">छात्र</span>
          </div>
          <p className="text-[10px] text-red-400 font-semibold mt-1">
            1-क्लिक रिमाइंडर उपलब्ध
          </p>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        {/* Tabs: जुड़े हुए vs नहीं जुड़े */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('connected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'connected'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>🟢 जुड़े हुए छात्र ({filteredRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('absent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'absent'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>🔴 जो नहीं जुड़े ({absentStudents.length})</span>
          </button>
        </div>

        {/* Search & VIP Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="छात्र का नाम या ईमेल खोजें..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterVipOnly(!filterVipOnly)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              filterVipOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>केवल VIP</span>
          </button>
        </div>
      </div>

      {/* Main Table / Cards Content */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        {activeTab === 'connected' ? (
          filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-3 p-4">
              <Users className="w-12 h-12 mx-auto text-stone-600 animate-pulse" />
              <h4 className="font-black text-sm text-white">अभी कोई लाइव वॉच रिकॉर्ड नहीं मिला</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                जैसे ही कोई भी छात्र (पेड या फ्री) क्लास खोलेगा, उसका नाम, जुड़ने का समय और हर सेकंड का वॉच-टाइम यहाँ दिखाई देगा।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-extrabold border-b border-stone-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">विद्यार्थी (Student)</th>
                    <th className="py-3.5 px-4">कक्षा (Class)</th>
                    <th className="py-3.5 px-4">सदस्यता (Plan)</th>
                    <th className="py-3.5 px-4">वॉच-टाइम (Watch Time)</th>
                    <th className="py-3.5 px-4">शुरू करने का समय</th>
                    <th className="py-3.5 px-4 text-right">लाइव स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record.id}
                      className="hover:bg-stone-850/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-800 to-stone-950 border border-stone-700 flex items-center justify-center font-black text-xs text-white">
                              {record.studentName.charAt(0) || 'S'}
                            </div>
                            {record.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-stone-900 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">
                              {record.studentName}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              {record.studentEmail || 'पंजीकृत उपयोगकर्ता'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-300 line-clamp-1 max-w-[200px]" title={record.classTitle}>
                          {record.classTitle || 'BSEB लाइव क्लास'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {record.isPaid ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <Crown className="w-2.5 h-2.5" /> VIP Paid
                          </span>
                        ) : (
                          <span className="bg-stone-800 text-stone-400 text-[9.5px] font-bold px-2 py-0.5 rounded-full w-fit inline-block">
                            फ्री डेमो
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs font-black text-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatWatchDuration(record.watchSeconds)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-400 text-[11px]">
                        {new Date(record.joinedAt).toLocaleTimeString('hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {record.isOnline ? (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            लाइव देख रहे हैं
                          </span>
                        ) : (
                          <span className="bg-stone-800 text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            क्लास समाप्त की
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          absentStudents.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2 p-4">
              <UserCheck className="w-12 h-12 mx-auto text-emerald-500" />
              <h4 className="font-black text-sm text-white">सभी विद्यार्थी क्लास में उपस्थित हैं!</h4>
              <p className="text-xs text-stone-400">कोई भी पंजीकृत छात्र अनुपस्थित नहीं है।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-extrabold border-b border-stone-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">विद्यार्थी (Student)</th>
                    <th className="py-3.5 px-4">मोबाइल / ईमेल</th>
                    <th className="py-3.5 px-4">सदस्यता (Plan)</th>
                    <th className="py-3.5 px-4">अटेंडेंस स्थिति</th>
                    <th className="py-3.5 px-4 text-right">रिमाइंडर एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {absentStudents.map((student) => (
                    <tr 
                      key={student.id}
                      className="hover:bg-stone-850/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center justify-center font-black text-xs text-red-300 shrink-0">
                            {student.name.charAt(0) || 'S'}
                          </div>
                          <span className="font-bold text-white text-xs">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-400">
                        {student.phone ? `+91 ${student.phone}` : student.email}
                      </td>

                      <td className="py-3 px-4">
                        {student.isPaid ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <Crown className="w-2.5 h-2.5" /> VIP Paid
                          </span>
                        ) : (
                          <span className="bg-stone-800 text-stone-400 text-[9.5px] font-bold px-2 py-0.5 rounded-full w-fit inline-block">
                            फ्री छात्र
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                          अभी नहीं जुड़े
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(student)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          title="WhatsApp पर क्लास में जुड़ने का रिमाइंडर भेजें"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp रिमाइंडर</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
