import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Youtube, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Users, 
  PhoneCall,
  Instagram,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface SocialMediaModalProps {
  onClose: () => void;
}

export function SocialMediaModal({ onClose }: SocialMediaModalProps) {
  const { appConfig } = useData();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const YOUTUBE_URL = appConfig.youtubeUrl;
  const INSTAGRAM_URL = appConfig.instagramUrl;
  const HELPLINE_NUMBER = (appConfig.whatsappNumber === '9507464117' ? '9241511070' : appConfig.whatsappNumber) || 
    (appConfig.helplineNumber === '9507464117' ? '9241511070' : appConfig.helplineNumber) || '9241511070';
  const HELPLINE_TEL = '+91' + HELPLINE_NUMBER;
  const WHATSAPP_HELPLINE_URL = `https://wa.me/91${HELPLINE_NUMBER}?text=${encodeURIComponent('नमस्ते सर, मुझे BSEB GURU 10वीं टॉपर क्रैश कोर्स और नोट्स के बारे में जानकारी चाहिए।')}`;
  const WHATSAPP_GROUP_URL = appConfig.whatsappGroupUrl || `https://wa.me/91${HELPLINE_NUMBER}?text=${encodeURIComponent('नमस्ते सर, मुझे 10th BSEB फुल सिलेबस WhatsApp ग्रुप में जोड़ें।')}`;
  const TELEGRAM_URL = appConfig.telegramUrl || 'https://t.me';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                सोशल मीडिया & स्टूडेंट हेल्पलाइन
              </h3>
              <p className="text-xs text-red-100">YouTube, WhatsApp व हेल्पलाइन सहायता</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          
          {/* 1. YOUTUBE CHANNEL (VIDYA AGENT 2.0) - Highlighted */}
          <div className="p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50/70 via-white to-rose-50/40 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              ऑफिशियल चैनल
            </div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                  <Youtube className="w-7 h-7 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-stone-900 text-base leading-tight">Vidya Agent 2.0</h4>
                  </div>
                  <div className="text-xs font-bold text-red-700">@Vidyaagent2.0</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                    <Users className="w-3 h-3 text-stone-400" />
                    <span>बिहार बोर्ड 10वीं ऑनलाइन क्लासेस</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              बिहार बोर्ड मैट्रिक (BSEB फुल सिलेबस) की सभी लाइव मैराथन क्लासेज, मॉडल पेपर्स और चैप्टर-वाइज वीडियो लेक्चर्स देखने के लिए तुरंत सब्सक्राइब करें।
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>चैनल खोलें / सब्सक्राइब करें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleCopy(YOUTUBE_URL, 'yt')}
                className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-stone-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="चैनल लिंक कॉपी करें"
              >
                {copiedLink === 'yt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">कॉपी हुआ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>कॉपी लिंक</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. STUDENT HELPLINE (9241511070) */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-stone-50 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-400 flex items-center justify-center shadow-md shrink-0 border border-stone-700">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">स्टूडेंट हेल्पलाइन & सपोर्ट</h4>
                  <div className="text-xs font-black text-amber-800 tracking-wide">
                    +91 {HELPLINE_NUMBER}
                  </div>
                  <div className="text-[11px] text-stone-500">सुबह 8:00 AM से रात्रि 9:00 PM तक</div>
                </div>
              </div>

              <button
                onClick={() => handleCopy(HELPLINE_NUMBER, 'helpline')}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="हेल्पलाइन नंबर कॉपी करें"
              >
                {copiedLink === 'helpline' ? (
                  <span className="text-emerald-600 font-bold text-[11px]">कॉपी हुआ!</span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                )}
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-snug">
              VIP बैच एक्टिवेशन, नोट्स डाउनलोड, पेमेंट या किसी भी प्रकार की सहायता हेतु सीधे कॉल या व्हाट्सएप करें।
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${HELPLINE_TEL}`}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>सीधे कॉल करें</span>
              </a>

              <a
                href={WHATSAPP_HELPLINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp चैट</span>
              </a>
            </div>
          </div>

          {/* 3. WHATSAPP STUDY GROUP */}
          <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 transition-all shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">WhatsApp स्टडी ग्रुप (10th BSEB)</h4>
                  <div className="text-[11px] text-stone-500">डेली क्लास अपडेट्स, PDF लिंक्स व सूचनाएं</div>
                </div>
              </div>

              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span>जुड़ें</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 4. TELEGRAM CHANNEL */}
          <div className="p-3.5 rounded-2xl border border-sky-200 bg-sky-50/40 hover:border-sky-300 transition-all shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">Telegram ऑफिशियल चैनल</h4>
                  <div className="text-[11px] text-stone-500">सभी अध्यायों के हाई-क्वालिटी हस्तलिखित PDF नोट्स</div>
                </div>
              </div>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span>चैनल देखें</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 5. INSTAGRAM PROFILE (@unbroken_raj_01) */}
          <div className="p-3.5 rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/50 via-white to-pink-50/30 hover:border-fuchsia-300 transition-all shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">Instagram ऑफिशियल</h4>
                  <div className="text-xs font-bold text-fuchsia-700">@unbroken_raj_01</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <span>फॉलो करें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleCopy(INSTAGRAM_URL, 'insta')}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-stone-700 hover:bg-slate-50 text-xs font-bold flex items-center transition-colors cursor-pointer shrink-0"
                  title="Instagram लिंक कॉपी करें"
                >
                  {copiedLink === 'insta' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-snug">
              एग्जाम टिप्स, डेली मोटिवेशन, रील्स और महत्वपूर्ण सूचनाओं के लिए इंस्टाग्राम पर जुड़ें।
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between">
          <div className="text-left">
            <div className="text-[11px] font-bold text-stone-700">हेल्पलाइन: {HELPLINE_NUMBER}</div>
            <div className="text-[10px] text-stone-500">WhatsApp व कॉल दोनों उपलब्ध</div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
