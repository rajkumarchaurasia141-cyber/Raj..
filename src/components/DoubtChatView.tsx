import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, Mic, MicOff, Camera, Image as ImageIcon, X, Sparkles, Volume2, VolumeX, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getAccurateDoubtAnswer } from '../utils/doubtKnowledgeEngine';
import { speakHindiText, stopHindiSpeech } from '../utils/speechHelper';

function FormattedBotMessage({ text, onReadAloud }: { text: string; onReadAloud: () => void }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-600" /> बिहार गुरु • BSEB Class 9-10 सटीक उत्तर
        </span>
        <button
          onClick={onReadAloud}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-lg text-[10px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
          title="उत्तर बोलकर सुनें (Read Aloud)"
        >
          <Volume2 className="w-3.5 h-3.5" /> सुनकर पढ़ें
        </button>
      </div>

      {lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} className="h-1.5" />;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lIdx} className="leading-relaxed text-stone-800">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-stone-950">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function DoubtChatView({ onOpenVip }: { onOpenVip: () => void }) {
  const { user } = useAuth();
  const { appConfig } = useData();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; image?: string }>>([
    {
      sender: 'bot',
      text: `नमस्ते ${user?.name || 'विद्यार्थी'}! 🙏\n\nमैं हूँ आपका **'बिहार गुरु' (पढ़ेगा बिहार AI Assistant)**।\n\nमैं केवल **बिहार बोर्ड कक्षा 9वीं एवं 10वीं** के 4 मुख्य विषयों:\n• 📖 **Hindi (हिंदी: गोधूलि, वर्णिका, व्याकरण)**\n• 🇬🇧 **English (अंग्रेजी: Panorama, Grammar, Translation)**\n• 🔬 **Science (विज्ञान: भौतिकी, रसायन, जीवविज्ञान)**\n• 🌍 **SST (सामाजिक विज्ञान: इतिहास, भूगोल, राजनीति, अर्थशास्त्र)**\nको पढ़ाता हूँ।\n\nआप **लिखकर**, **बोलकर (माइक 🎙️)** या **फोटो खींचकर (कैमरा 📷)** कोई भी सवाल पूछें — पहले मैं **एकदम सरल भाषा में समझाऊँगा**, फिर **बिहार बोर्ड परीक्षा के अनुसार सटीक उत्तर** दूँगा!`,
      time: 'अभी'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImage]);

  useEffect(() => {
    return () => {
      stopHindiSpeech();
    };
  }, []);

  const quickQuestions = [
    'प्रकाश संश्लेषण (Photosynthesis) क्या है?',
    'श्रम विभाजन और जाति प्रथा का सारांश',
    'Tense कितने प्रकार के होते हैं?',
    '1848 की फ्रांसीसी क्रांति के कारण',
    'ओम का नियम (Ohm\'s Law) और सूत्र',
    'अम्ल और क्षार में क्या अंतर है?',
    'Active and Passive Voice के नियम',
    'चम्पारण सत्याग्रह (1917) का महत्व'
  ];

  // Speech Recognition (Bol kar poochhein)
  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const spoken = prompt('माइक उपलब्ध नहीं है। कृपया अपना प्रश्न यहाँ बोलकर या टाइप करके दर्ज करें:');
      if (spoken && spoken.trim()) {
        setInput(spoken.trim());
        handleSend(spoken.trim());
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setInput(speechText);
        setIsListening(false);
        // Automatically send question for instant answer!
        handleSend(speechText);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const spoken = prompt('माइक्रोफ़ोन से आवाज नहीं सुन पाए। कृपया अपना प्रश्न बोलकर या लिखकर टाइप करें:');
        if (spoken && spoken.trim()) {
          setInput(spoken.trim());
          handleSend(spoken.trim());
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      const spoken = prompt('माइक्रोफ़ोन चालू करने में बाधा आई। अपना प्रश्न यहाँ लिखें:');
      if (spoken && spoken.trim()) {
        setInput(spoken.trim());
        handleSend(spoken.trim());
      }
    }
  };

  // Image selection handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q && !selectedImage) return;

    const currentImage = selectedImage;
    const userMsg = {
      sender: 'user' as const,
      text: q || (currentImage ? '📷 [फोटो आधारित डाउट]' : ''),
      time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      image: currentImage || undefined
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: q,
          image: currentImage,
          history: newMessages.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          const answerText = data.answer;
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot' as const,
              text: answerText,
              time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsTyping(false);

          // Automatically read aloud the answer for lightning-fast voice experience!
          const newIdx = newMessages.length;
          setActiveSpeakingIndex(newIdx);
          speakHindiText(
            answerText,
            () => setActiveSpeakingIndex(newIdx),
            () => setActiveSpeakingIndex(null)
          );
          return;
        }
      }
      throw new Error('Fallback required');
    } catch (err) {
      const reply = getAccurateDoubtAnswer(q || 'गणित या विज्ञान का प्रश्न');
      const newIdx = newMessages.length;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: reply,
          time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
      setActiveSpeakingIndex(newIdx);
      speakHindiText(
        reply,
        () => setActiveSpeakingIndex(newIdx),
        () => setActiveSpeakingIndex(null)
      );
    }
  };

  const handleSpeakMessage = (text: string, idx: number) => {
    if (activeSpeakingIndex === idx) {
      stopHindiSpeech();
      setActiveSpeakingIndex(null);
      return;
    }
    setActiveSpeakingIndex(idx);
    speakHindiText(
      text,
      () => setActiveSpeakingIndex(idx),
      () => setActiveSpeakingIndex(null)
    );
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-red-700 text-white flex items-center justify-center font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-stone-900 text-sm leading-tight flex items-center gap-1.5">
              <span>बिहार गुरु (Bihar Guru)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-stone-500 font-semibold">
              पढ़ेगा बिहार AI Assistant • Class 9-10 (Hindi, English, Science, SST)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-red-200"
            title="फोटो खींचकर पूछें"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">कैमरा</span>
          </button>
          <a
            href={`https://wa.me/91${appConfig.whatsappNumber || '9241511070'}?text=${encodeURIComponent('नमस्ते बिहार गुरु सर, मुझे बिहार बोर्ड क्लास 9-10 पढ़ाई में सहायता चाहिए।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            title="व्हाट्सएप पर सहायता पाएं"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>व्हाट्सएप</span>
          </a>
        </div>
      </div>

      {/* Hidden inputs for camera and gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs space-y-2 ${
                m.sender === 'user'
                  ? 'bg-red-700 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Doubt photo"
                  className="w-full max-h-48 object-cover rounded-xl border border-white/20"
                />
              )}
              {m.sender === 'user' ? (
                <p className="whitespace-pre-line">{m.text}</p>
              ) : (
                <FormattedBotMessage
                  text={m.text}
                  onReadAloud={() => handleSpeakMessage(m.text, idx)}
                />
              )}

              {/* Active audio speaking indicator */}
              {activeSpeakingIndex === idx && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>बिहार गुरु बोलकर समझा रहे हैं...</span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-stone-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-stone-600 p-2 bg-white rounded-xl border border-slate-200 w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-100"></span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-200"></span>
            <span className="text-[10px] font-bold ml-1 text-red-700">बिहार गुरु उत्तर तैयार कर रहे हैं...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Pills */}
      <div className="bg-white border-t border-slate-100 p-2 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-700 text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Selected Image Preview Box */}
      {selectedImage && (
        <div className="bg-stone-900 p-2.5 px-4 flex items-center justify-between border-t border-slate-200">
          <div className="flex items-center gap-3">
            <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-stone-700" />
            <div>
              <span className="text-white text-xs font-bold block">फोटो संलग्न है (Photo Attached)</span>
              <span className="text-stone-400 text-[10px]">अब अपना सवाल लिखकर या सीधे भेजें</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listening Indicator Bar */}
      {isListening && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>बोलिए, हम सुन रहे हैं... (Listening & Transcribing...)</span>
          </div>
          <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded">बोलकर पूछें</span>
        </div>
      )}

      {/* Input Area (Text, Voice, Photo) */}
      <div className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2">
        {/* Camera / Gallery photo upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="गैलरी से फोटो चुनें"
        >
          <ImageIcon className="w-4 h-4 text-indigo-600" />
        </button>

        {/* Voice Speech Recognition button */}
        <button
          type="button"
          onClick={handleStartListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-stone-700'
          }`}
          title="बोलकर पूछें (Voice Search)"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-600" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="अपना सवाल लिखकर या बोलकर पूछें..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() && !selectedImage}
          className="w-9 h-9 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
          title="भेजें"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
