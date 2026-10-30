// Text-to-Speech (TTS) helper for Hindi audio narration

export function speakHindiText(text: string, onStart?: () => void, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    alert('आपका ब्राउज़र टेक्स्ट-टू-स्पीच (ऑडियो) सपोर्ट नहीं करता है।');
    return;
  }

  try {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown formatting stars for clean audio reading
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/[#_*~`>]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN'; // Hindi
    utterance.rate = 1.0; // Normal speech speed
    utterance.pitch = 1.0;

    // Try to find a Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('Hindi'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech error:', e);
    if (onEnd) onEnd();
  }
}

export function stopHindiSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
