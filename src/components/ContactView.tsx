import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle2, Phone, MapPin, Sparkles } from 'lucide-react';

interface ContactViewProps {
  onBack: () => void;
}

export function ContactView({ onBack }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('कृपया सभी फील्ड भरें।');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5 pb-24 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="text-stone-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-red-700" /> 
        <span>होम पर वापस जाएं</span>
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Contact Us • संपर्क करें</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          हमसे संपर्क करें (Get in Touch)
        </h1>
        <p className="text-xs sm:text-sm text-stone-200 font-medium">
          यदि आपके मन में कोई प्रश्न, सुझाव या सहायता की आवश्यकता है, तो नीचे दिए गए फॉर्म या ईमेल के माध्यम से संपर्क करें।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info Cards */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 md:col-span-1">
          <h3 className="font-black text-sm text-stone-900 border-b border-slate-100 pb-2">Direct Contact</h3>
          
          <div className="flex items-start gap-3 text-xs text-stone-700">
            <Mail className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-stone-900">Email ID:</span>
              <a href="mailto:rajkumarchaurasia141@gmail.com" className="text-blue-600 hover:underline break-all font-semibold">
                rajkumarchaurasia141@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-700">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-stone-900">WhatsApp / Helpline:</span>
              <span className="text-stone-600 font-semibold">+91 9241511070</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-700">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-stone-900">Location:</span>
              <span className="text-stone-600">Patna, Bihar, India (BSEB)</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm md:col-span-2">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-base text-stone-900">संदेश सफलतापूर्वक भेजा गया!</h3>
              <p className="text-xs text-stone-600">
                धन्यवाद! हमें आपका संदेश प्राप्त हो गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                दूसरा संदेश भेजें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-black text-sm text-stone-900 border-b border-slate-100 pb-2">संदेश भेजें (Send Message Form)</h3>
              
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">आपका नाम (Your Name)</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="पूरा नाम दर्ज करें..." 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ईमेल आईडी (Email ID)</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@gmail.com" 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">आपका संदेश (Your Message)</label>
                <textarea 
                  rows={4} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="अपनी समस्या या सुझाव यहाँ लिखें..." 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white font-black py-3 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>संदेश भेजें (Submit Message)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
