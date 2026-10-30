import React, { useState, useMemo } from 'react';
import { 
  Users, 
  X, 
  Clock, 
  Crown, 
  UserCheck, 
  UserX, 
  Send, 
  Search, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  ShieldCheck,
  Eye,
  MessageCircle
} from 'lucide-react';
import { LiveWatchRecord, BatchStudent } from '../types';
import { formatWatchDuration } from '../services/attendanceTracker';

interface ClassAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classTitle: string;
  isLive: boolean;
  activeRecords: LiveWatchRecord[];
  allBatchStudents: BatchStudent[];
  currentStudentId?: string;
  isAdmin?: boolean;
}

export function ClassAttendanceModal({
  isOpen,
  onClose,
  classTitle,
  isLive,
  activeRecords,
  allBatchStudents,
  currentStudentId,
  isAdmin = false
}: ClassAttendanceModalProps) {
  const [activeTab, setActiveTab] = useState<'connected' | 'absent'>('connected');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter connected students: online or had activity
  const connectedStudents = useMemo(() => {
    return (activeRecords || []).filter(r => r.isOnline || r.watchSeconds > 0);
  }, [activeRecords]);

  // Determine connected student emails/IDs for quick lookup
  const connectedEmailsSet = useMemo(() => {
    const set = new Set<string>();
    connectedStudents.forEach(r => {
      if (r.studentEmail) set.add(r.studentEmail.toLowerCase());
      if (r.studentId) set.add(r.studentId);
    });
    return set;
  }, [connectedStudents]);

  // Determine absent students: registered batch students not currently connected
  const absentStudents = useMemo(() => {
    return (allBatchStudents || []).filter(s => {
      const emailMatch = s.email && connectedEmailsSet.has(s.email.toLowerCase());
      const idMatch = s.id && connectedEmailsSet.has(s.id);
      return !emailMatch && !idMatch;
    });
  }, [allBatchStudents, connectedEmailsSet]);

  // Filter by search query
  const filteredConnected = useMemo(() => {
    if (!searchQuery.trim()) return connectedStudents;
    const q = searchQuery.toLowerCase();
    return connectedStudents.filter(
      r => r.studentName.toLowerCase().includes(q) || r.studentEmail.toLowerCase().includes(q)
    );
  }, [connectedStudents, searchQuery]);

  const filteredAbsent = useMemo(() => {
    if (!searchQuery.trim()) return absentStudents;
    const q = searchQuery.toLowerCase();
    return absentStudents.filter(
      s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone && s.phone.includes(q))
    );
  }, [absentStudents, searchQuery]);

  // Calculate statistics
  const totalWatchSec = connectedStudents.reduce((sum, r) => sum + r.watchSeconds, 0);
  const avgWatchSec = connectedStudents.length > 0 ? Math.round(totalWatchSec / connectedStudents.length) : 0;
  const paidConnectedCount = connectedStudents.filter(r => r.isPaid).length;

  const handleSendReminder = (student: BatchStudent) => {
    const text = encodeURIComponent(
      `नमस्ते ${student.name}! BSEB 10वीं की लाइव क्लास "${classTitle}" चल रही है। तुरंत BSEB GURU ऐप खोलें और क्लास में जुड़ें!`
    );
    const phone = student.phone?.replace(/[^0-9]/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-700/80 rounded-3xl max-w-xl w-full p-4 sm:p-5 text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-white truncate">
                  लाइव क्लास अटेंडेंस & वॉच-टाइम
                </h3>
                {isLive ? (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="bg-stone-800 text-stone-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-stone-700">
                    RECORDED
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 truncate max-w-sm">
                {classTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 shrink-0">
          <div className="bg-stone-950/80 border border-emerald-500/30 p-2.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span>अभी जुड़े हैं</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white">{connectedStudents.length}</span>
              <span className="text-[10px] text-stone-400">छात्र</span>
            </div>
            <span className="text-[9px] text-emerald-300/80 font-semibold truncate mt-0.5">
              {paidConnectedCount} पेड (VIP) सदस्य
            </span>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 p-2.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span>औसत वॉच-टाइम</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-amber-300">
                {formatWatchDuration(avgWatchSec)}
              </span>
            </div>
            <span className="text-[9px] text-stone-400 truncate mt-0.5">
              कुल सक्रिय अध्ययन
            </span>
          </div>

          <div className="bg-stone-950/80 border border-red-500/20 p-2.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-red-400 text-xs font-bold">
              <span>नहीं जुड़े (बाकी)</span>
              <UserX className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white">{absentStudents.length}</span>
              <span className="text-[10px] text-stone-400">छात्र</span>
            </div>
            <span className="text-[9px] text-red-300/80 font-semibold truncate mt-0.5">
              अनुपस्थित विद्यार्थी
            </span>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 p-2.5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-300 text-xs font-bold">
              <span>कुल पंजीकृत</span>
              <Users className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                {connectedStudents.length + absentStudents.length}
              </span>
              <span className="text-[10px] text-stone-400">टॉपर बैच</span>
            </div>
            <span className="text-[9px] text-stone-400 truncate mt-0.5">
              BSEB 10वीं बैच
            </span>
          </div>
        </div>

        {/* Tab Buttons (जुड़े हुए vs नहीं जुड़े) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('connected')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'connected'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>🟢 जुड़े हुए छात्र ({connectedStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('absent')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'absent'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>🔴 जो नहीं जुड़े ({absentStudents.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative my-2.5 shrink-0">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'connected'
                ? 'जुड़े हुए छात्रों में नाम या ईमेल से खोजें...'
                : 'अनुपस्थित छात्रों में नाम या मोबाइल से खोजें...'
            }
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-700">
          {activeTab === 'connected' ? (
            filteredConnected.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-stone-600 animate-pulse" />
                <p className="text-xs font-bold">अभी कोई छात्र नहीं जुड़े हैं</p>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  जैसे ही कोई छात्र यह क्लास देखना शुरू करेगा, उसका नाम और वॉच-टाइम यहाँ रियल-टाइम में अपडेट होगा।
                </p>
              </div>
            ) : (
              filteredConnected.map((record) => {
                const isCurrent = record.studentId === currentStudentId;
                return (
                  <div
                    key={record.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 flex items-center justify-center font-black text-xs text-white">
                          {record.studentName.charAt(0) || 'S'}
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-950 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-white truncate">
                            {record.studentName}
                          </span>
                          {record.isPaid ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> VIP
                            </span>
                          ) : (
                            <span className="bg-stone-800 text-stone-400 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              डेमो
                            </span>
                          )}
                          {isCurrent && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">
                              आप (You)
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-stone-400 truncate">
                          {record.studentEmail || 'पंजीकृत छात्र'}
                        </p>
                      </div>
                    </div>

                    {/* Watch Time & Status */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs font-black text-amber-300 justify-end">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatWatchDuration(record.watchSeconds)}</span>
                      </div>
                      <span className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        लाइव देख रहे हैं
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            filteredAbsent.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-white">सभी पंजीकृत छात्र क्लास में जुड़े हुए हैं!</p>
                <p className="text-[11px] text-stone-400">100% अटेंडेंस दर्ज हो चुकी है।</p>
              </div>
            ) : (
              filteredAbsent.map((student) => (
                <div
                  key={student.id}
                  className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-red-500/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center justify-center font-black text-xs text-red-300 shrink-0">
                      {student.name.charAt(0) || 'S'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white truncate">
                          {student.name}
                        </span>
                        {student.isPaid && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> VIP Paid
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-stone-400 truncate">
                        {student.email || student.phone || 'पंजीकृत छात्र'}
                      </p>
                    </div>
                  </div>

                  {/* Actions for absent student */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-red-400 font-bold bg-red-950/50 border border-red-900/50 px-2 py-1 rounded-lg hidden sm:inline-block">
                      अनुपस्थित
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReminder(student)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                      title="WhatsApp पर क्लास में जुड़ने का संदेश भेजें"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>रिमाइंडर</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>लाइव वॉच-टाइम हर सेकंड ऑटोमैटिकली रिकॉर्ड हो रहा है।</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
