import React from 'react';
import { X, Smartphone, Sparkles, PlusSquare, MoreVertical, CheckCircle2, ArrowDown } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstallPrompt?: () => void;
  hasPrompt?: boolean;
}

export function InstallGuideModal({
  isOpen,
  onClose,
  onTriggerInstallPrompt,
  hasPrompt
}: InstallGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AppLogo className="w-12 h-12 ring-2 ring-amber-400 rounded-2xl shadow-lg" />
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Sparkles className="w-3 h-3 text-amber-400" /> वेब ऐप (PWA)
              </div>
              <h3 className="text-base font-black text-white">
                फोन में ऐप जैसा इनस्टॉल करें
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Note */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200/90 leading-relaxed">
          💡 <strong>यह एक हाई-स्पीड वेब ऐप है!</strong> इसे बिना किसी APK फाइल या प्ले स्टोर के सीधे अपने फोन के होम स्क्रीन पर असली ऐप की तरह इनस्टॉल किया जा सकता है।
        </div>

        {/* 1-Click Install Button if browser supports prompt */}
        {hasPrompt && onTriggerInstallPrompt && (
          <button
            type="button"
            onClick={() => {
              onTriggerInstallPrompt();
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition-transform active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-stone-950" />
            <span>⚡ 1-क्लिक में अभी इनस्टॉल करें</span>
          </button>
        )}

        {/* Simple Step by Step Instructions */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <span>आसान तरीका (2 सेकंड में):</span>
          </h4>

          {/* Step 1 */}
          <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                ऊपर दाहिने कोने में <MoreVertical className="w-3.5 h-3.5 text-amber-400 inline" /> तीन डॉट (Menu) दबाएं
              </p>
              <p className="text-[11px] text-stone-400">
                क्रोम (Chrome) या अपने मोबाइल ब्राउज़र के टॉप-राइट में बने 3 डॉट पर क्लिक करें।
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> "Add to Home screen" या "Install app" चुनें
              </p>
              <p className="text-[11px] text-stone-400">
                मेनू में <strong className="text-white">"होम स्क्रीन में जोड़ें"</strong> या <strong className="text-white">"ऐप इंस्टॉल करें"</strong> पर क्लिक करें।
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">
                "Install" या "Add" पर क्लिक करें
              </p>
              <p className="text-[11px] text-stone-400">
                आपके फोन के मेनू में BSEB GURU का ऐप आइकन आ जाएगा और यह फुल-स्क्रीन ऐप जैसा खुलेगा!
              </p>
            </div>
          </div>
        </div>

        {/* Footer close button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
        >
          समझ गया, बंद करें
        </button>
      </div>
    </div>
  );
}
