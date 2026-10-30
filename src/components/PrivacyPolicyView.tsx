import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, Sparkles } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5 pb-24 animate-fade-in text-stone-800 text-xs sm:text-sm">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>होम पर वापस जाएं</span>
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Privacy Policy • गोपनीयता नीति</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Privacy Policy for BSEB GURU
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 font-medium">
          Last updated: October 2026. This policy outlines how we collect, use, and protect your information, including Google AdSense cookies compliance.
        </p>
      </div>

      {/* Policy Content Sections */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>1. Information We Collect</span>
          </h2>
          <p className="text-stone-600">
            When you use <b>BSEB GURU</b>, we may collect basic user details such as your name, email address (when logging in), and app interaction data to provide personalized study materials, notes, and test scores.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-600" />
            <span>2. Google AdSense & Cookies</span>
          </h2>
          <p className="text-stone-600">
            We use third-party advertising companies, including <b>Google AdSense</b>, to serve ads when you visit our app or website. Google uses cookies (such as the DART cookie) to serve ads based on your prior visits to our app and other sites on the Internet.
          </p>
          <p className="text-stone-600">
            Users may opt out of personalized advertising by visiting Google Ads Settings (<b>https://www.google.com/settings/ads</b>).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>3. How We Use Information</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>To deliver accurate BSEB Class 9th & 10th notes, test series, and live classes.</li>
            <li>To improve app performance, user experience, and study features.</li>
            <li>To display relevant educational advertisements and sponsor offers.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <span>4. Data Security</span>
          </h2>
          <p className="text-stone-600">
            We take reasonable security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely via Firebase and encrypted protocols.
          </p>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <h2 className="text-sm font-black text-stone-900">5. Contact Us Regarding Privacy</h2>
          <p className="text-stone-600 text-xs">
            If you have any questions or concerns about our Privacy Policy, please contact us at: <br />
            <b>Email: rajkumarchaurasia141@gmail.com</b>
          </p>
        </div>
      </div>
    </div>
  );
}
