import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, CheckCircle2, AlertCircle, Mail, Key } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminAdminsManager() {
  const { appConfig, updateSettings } = useData();
  const envEmail = (import.meta.env?.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase() || 'rajkumarchaurasia141@gmail.com';
  const [adminEmails, setAdminEmails] = useState<string[]>(
    appConfig.adminEmails && appConfig.adminEmails.length > 0 
      ? appConfig.adminEmails 
      : [envEmail]
  );
  const [newEmail, setNewEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('कृपया वैध ईमेल आईडी दर्ज करें।');
      return;
    }

    if (adminEmails.includes(cleanEmail)) {
      setErrorMsg('यह ईमेल आईडी पहले से ही एडमिन सूची में है।');
      return;
    }

    const updated = [...adminEmails, cleanEmail];
    try {
      await updateSettings({
        ...appConfig,
        adminEmails: updated
      });
      setAdminEmails(updated);
      localStorage.setItem('bseb_admin_emails', JSON.stringify(updated));
      setNewEmail('');
      setSuccessMsg(`सफलता! ${cleanEmail} को नया एडमिन बना दिया गया है।`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('एडमिन जोड़ने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      setErrorMsg('कम से कम 1 मुख्य एडमिन होना अनिवार्य है!');
      return;
    }
    const envEmailLocal = (import.meta.env?.VITE_MAIN_ADMIN_EMAIL || '').trim().toLowerCase() || 'rajkumarchaurasia141@gmail.com';
    if (emailToRemove === envEmailLocal) {
      if (!confirm('क्या आप मुख्य सुपर एडमिन ईमेल को हटाना चाहते हैं?')) return;
    }

    const updated = adminEmails.filter(e => e !== emailToRemove);
    try {
      await updateSettings({
        ...appConfig,
        adminEmails: updated
      });
      setAdminEmails(updated);
      localStorage.setItem('bseb_admin_emails', JSON.stringify(updated));
      setSuccessMsg(`सफलता! ${emailToRemove} को एडमिन अधिकार से हटा दिया गया है।`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('एडमिन हटाने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            एडमिन आईडी / ईमेल प्रबंधन (Admin Access Management)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप नए एडमिन की ईमेल आईडी जोड़ सकते हैं या पुराने एडमिन को हटा सकते हैं।</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-3 border-b border-slate-100 pb-6">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-amber-600" /> नया एडमिन ईमेल (Google Login Email) जोड़ें:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="उदा: newadmin@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> एडमिन जोड़ें
            </button>
          </div>
          <span className="text-[11px] text-stone-500 block">जिस ईमेल से नया व्यक्ति ऐप में गूगल लॉगिन करेगा, वही ईमेल यहाँ दर्ज करें।</span>
        </form>

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

        {/* Current Admins List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" /> वर्तमान अधिकृत एडमिन ईमेल (Active Admins - {adminEmails.length})
          </h4>

          <div className="space-y-2">
            {adminEmails.map((email, idx) => (
              <div key={email} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 font-mono">{email}</span>
                    <span className="block text-[10px] text-emerald-700 font-medium">Full Super Admin Access</span>
                  </div>
                </div>

                {adminEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAdmin(email)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> हटाएँ
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
