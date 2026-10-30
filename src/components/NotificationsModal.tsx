import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  BellOff,
  Clock,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  BookOpen,
  ListChecks,
  Video,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  getDevicePushState,
  subscribeDeviceToPush,
  unsubscribeDeviceFromPush,
  showLocalSwNotification
} from '../services/pushNotificationService';

interface NotificationsModalProps {
  onClose: () => void;
  onOpenVip: () => void;
  onOpenCourse: () => void;
  onNavigateDeepLink?: (url: string) => void;
}

export function NotificationsModal({
  onClose,
  onOpenVip,
  onOpenCourse,
  onNavigateDeepLink
}: NotificationsModalProps) {
  const { notifications } = useData();
  const { user, isAdmin } = useAuth();

  const [pushState, setPushState] = useState(getDevicePushState());
  const [studentClass, setStudentClass] = useState<string>(pushState.studentClass || 'Class 10');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPreExplainer, setShowPreExplainer] = useState(!pushState.subscribed);

  useEffect(() => {
    setPushState(getDevicePushState());
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const result = await subscribeDeviceToPush({
        studentName: user?.name || 'बिहार बोर्ड छात्र',
        studentEmail: user?.email || '',
        studentClass,
        isAdmin: Boolean(isAdmin)
      });

      setPushState(getDevicePushState());

      if (result.ok) {
        setShowPreExplainer(false);
        setStatusMsg({
          type: 'success',
          text: result.message
        });
        await showLocalSwNotification(
          'BSEB GURU 🔔 स्मार्ट नोटिफिकेशन चालू!',
          'बधाई हो! अब नए नोट्स, डेली टेस्ट, लाइव क्लास और 5 स्मार्ट स्टडी रिमाइंडर सीधे आपके फोन पर मिलेंगे।',
          '/'
        );
      } else {
        setStatusMsg({
          type: 'error',
          text: result.message
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'नोटिफिकेशन चालू करने में त्रुटि हुई।'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await unsubscribeDeviceFromPush();
      setPushState(getDevicePushState());
      setStatusMsg({
        type: 'info',
        text: res.message
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'नोटिफिकेशन बंद करने में समस्या आई।'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestOnMyPhone = async () => {
    await showLocalSwNotification(
      'BSEB GURU 📚 डेली स्टडी अलर्ट',
      'यह एक टेस्ट नोटिफिकेशन है! इस पर टैप करने से सीधे संबंधित नोट्स या डेली टेस्ट खुल जाएगा।',
      '/daily-test'
    );
    setStatusMsg({
      type: 'success',
      text: 'आपके डिवाइस पर टेस्ट पुश नोटिफिकेशन भेज दिया गया है!'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                BSEB GURU स्मार्ट नोटिफिकेशन
              </h3>
              <p className="text-xs text-amber-200">
                नए नोट्स • डेली टेस्ट • लाइव क्लास • स्टडी रिमाइंडर
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smart Push Opt-In & Device Control Section */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-b from-amber-50/90 to-white border-b border-amber-200/80 space-y-3 shrink-0">
          {/* Status Strip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  pushState.subscribed && pushState.permission === 'granted'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-black text-stone-900">
                {pushState.subscribed && pushState.permission === 'granted'
                  ? `✅ स्मार्ट पुश नोटिफिकेशन चालू है (${pushState.studentClass})`
                  : '🔔 स्मार्ट पुश नोटिफिकेशन अभी बंद है'}
              </span>
            </div>

            {pushState.subscribed && pushState.permission === 'granted' && (
              <button
                type="button"
                onClick={handleTestOnMyPhone}
                className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>टेस्ट देखें</span>
              </button>
            )}
          </div>

          {/* Pre-Permission Friendly Explanation Card (Required before browser prompt) */}
          {(!pushState.subscribed || pushState.permission !== 'granted' || showPreExplainer) && (
            <div className="bg-white rounded-2xl p-3 border border-amber-200 shadow-xs space-y-2.5">
              <p className="text-xs font-bold text-stone-800 leading-relaxed">
                🎯 <b>नोटिफिकेशन क्यों चालू करें?</b> इसे चालू करने पर जब भी ऐप बंद रहेगा, तब भी आपको सीधे फोन पर ये अलर्ट मिलेंगे:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-stone-700">
                <div className="flex items-center gap-1.5 bg-amber-50/70 px-2 py-1.5 rounded-xl border border-amber-100">
                  <BookOpen className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>नए PDF नोट्स व अध्याय</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50/70 px-2 py-1.5 rounded-xl border border-amber-100">
                  <ListChecks className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>नया डेली टेस्ट व क्विज़</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50/70 px-2 py-1.5 rounded-xl border border-amber-100">
                  <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>नई लाइव व वीडियो क्लास</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50/70 px-2 py-1.5 rounded-xl border border-amber-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>5 दैनिक स्मार्ट रिमाइंडर</span>
                </div>
              </div>

              {/* Class Selection for Targeted Notifications */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="text-[11px] font-extrabold text-stone-700">
                  अपनी कक्षा चुनें:
                </label>
                <div className="flex items-center gap-1.5">
                  {['Class 10', 'Class 9'].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setStudentClass(cls)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                        studentClass === cls
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cls === 'Class 10' ? 'कक्षा 10वीं (Matric)' : 'कक्षा 9वीं'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enable / Disable Action Buttons */}
          <div className="flex items-center gap-2">
            {!pushState.subscribed || pushState.permission !== 'granted' ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleEnableNotifications}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Bell className="w-4 h-4 animate-bounce" />
                <span>{loading ? 'चालू किया जा रहा है...' : '🔔 Notifications चालू करें'}</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between gap-2 bg-emerald-50/90 border border-emerald-200 rounded-xl px-3 py-2">
                <div className="text-[11px] font-bold text-emerald-900">
                  सुबह 7, 10, दोपहर 2, शाम 6 व रात 9 बजे स्मार्ट रिमाइंडर सक्रिय
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDisableNotifications}
                  className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 font-black text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <BellOff className="w-3 h-3" />
                  <span>बंद करें</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Message */}
          {statusMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Recent Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              हाल की सूचनाएं और अपडेट्स ({notifications.length})
            </h4>
          </div>

          {notifications.map((n: any) => {
            let actionFn: (() => void) | null = null;
            let actionText: string | null = null;

            if (n.clickUrl && onNavigateDeepLink) {
              actionFn = () => onNavigateDeepLink(n.clickUrl);
              actionText = 'अभी खोलें';
            } else if (n.actionType === 'vip') {
              actionFn = onOpenVip;
              actionText = 'ऑफर देखें';
            } else if (n.actionType === 'daily_test' && onNavigateDeepLink) {
              actionFn = () => onNavigateDeepLink('/daily-test');
              actionText = 'डेली टेस्ट दें';
            } else if (n.actionType === 'live' && onNavigateDeepLink) {
              actionFn = () => onNavigateDeepLink('/?tab=live');
              actionText = 'लाइव क्लास देखें';
            } else if (n.actionType === 'courses' || n.actionType === 'live') {
              actionFn = onOpenCourse;
              actionText = n.actionType === 'live' ? 'लाइव क्लास देखें' : 'कोर्स खोलें';
            }

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (actionFn) {
                    onClose();
                    actionFn();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  actionFn ? 'cursor-pointer hover:border-red-300' : ''
                } ${
                  n.isNew
                    ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                    {n.title}
                  </h4>
                  {n.isNew && (
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                      NEW
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {n.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.timeLabel || 'अभी-अभी'}
                  </span>

                  {actionFn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        actionFn!();
                      }}
                      className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{actionText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
