import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  LogIn, 
  AlertCircle 
} from 'lucide-react';

interface GmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPrompt?: boolean;
}

export function GmailAuthModal({ isOpen, onClose, adminPrompt = false }: GmailAuthModalProps) {
  const { user, login, logout, isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Resolve Admin configuration
  const getAdminEmails = (): string[] => {
    try {
      const stored = localStorage.getItem('bseb_admin_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map(e => e.trim().toLowerCase());
      }
    } catch (e) {}
    const envEmail = (import.meta.env?.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase();
    return envEmail ? [envEmail] : ['rajkumarchaurasia141@gmail.com'];
  };
  
  // Real-time checks
  const cleanEmail = email.trim().toLowerCase();
  const isTargetAdmin = getAdminEmails().includes(cleanEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('कृपया अपना नाम दर्ज करें।');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य Gmail ID दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      await login(trimmedName, cleanEmail);
      if (isTargetAdmin) {
        setSuccess('एडमिन की पहचान सफल! सभी एडमिन अधिकार सक्रिय कर दिए गए हैं।');
      } else {
        setSuccess('लॉगिन सफलतापूर्वक संपन्न हुआ!');
      }
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('लॉगिन में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" id="gmail-auth-modal-overlay">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative" id="gmail-auth-modal-container">
        
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-red-700 via-stone-900 to-amber-700 p-5 text-white relative">
          <button
            onClick={onClose}
            id="close-auth-modal-btn"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <LogIn className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight flex items-center gap-2">
                <span>विद्यार्थी लॉगिन</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase">
                  BSEB फुल सिलेबस
                </span>
              </h3>
              <p className="text-xs text-stone-200 mt-0.5">
                ऐप की सभी सुविधाओं का लाभ उठाने के लिए लॉगिन करें
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2 animate-fade-in" id="auth-error-msg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in" id="auth-success-msg">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Simple Form (Name First, Gmail Second) */}
          <form onSubmit={handleSubmit} className="space-y-4" id="manual-auth-form">
            
            {/* 1. Student Name (Upper field) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>आपका नाम (Your Name)</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                id="manual-name-input"
                placeholder="अपना पूरा नाम दर्ज करें"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-red-600 shadow-inner"
              />
            </div>

            {/* 2. Gmail ID (Lower field) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>जीमेल आईडी (Gmail ID)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                id="manual-email-input"
                placeholder="उदा. yourname@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-red-600 shadow-inner"
              />
              {isTargetAdmin && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-pulse" id="realtime-admin-detected-badge">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आपकी पहचान हो गई, आप मुख्य एडमिन हैं!</span>
                </div>
              )}
            </div>

            {/* Submit and Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                id="manual-auth-submit-btn"
                className="flex-1 py-3 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>लॉगिन करें</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                id="cancel-auth-modal-btn"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </form>

          {/* Current Status Footer */}
          {user?.email && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-stone-500" id="current-auth-status">
              <span className="truncate">लॉग इन: <strong>{user.email}</strong> {isAdmin && '(Admin)'}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setError(null);
                  setSuccess('लॉगआउट कर दिया गया है।');
                  setTimeout(() => setSuccess(null), 1500);
                }}
                id="logout-auth-btn"
                className="text-red-600 hover:text-red-800 font-bold cursor-pointer shrink-0 ml-2"
              >
                लॉगआउट करें
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
