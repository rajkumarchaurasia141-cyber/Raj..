import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  FileText, 
  ExternalLink,
  RotateCcw,
  Cloud,
  Check,
  BookOpen,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { triggerAutoContentNotification } from '../services/pushNotificationService';

export interface DailyTestQuestion {
  q: string;
  options: [string, string, string, string];
  correctIndex: number;
  isAnswerGuessed?: boolean;
}

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `daily_test_${y}-${m}-${d}`;
}

/**
 * Ultra-robust parser for real-world question formats:
 * - Supports 1 to 100+ questions at once.
 * - Works with blank lines OR without any blank lines between questions.
 * - Supports Q:, Q.1, Q1:, 1., 1), (1), [1], प्रश्न 1:, प्रश्न 1., प्र. 1:, प्र० 1, १., २.
 * - Supports options on separate lines OR inline: (A)... (B)... (C)... (D)...
 * - Supports letters: A/B/C/D, a/b/c/d, Hindi: क/ख/ग/घ, numbers: 1/2/3/4.
 * - Supports answers: Ans:, Answer:, उत्तर:, सही उत्तर:, Right Answer:, Ans - B, उत्तर: (ख), etc.
 * - If answer line is omitted, defaults to 0 with isAnswerGuessed: true so the question is never lost.
 */
export function parseDailyTestText(text: string): DailyTestQuestion[] {
  if (!text || !text.trim()) return [];

  // Normalize line endings, non-breaking spaces (\u00A0), zero-width characters
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

  // Helper: check if a line is an explicit answer line
  const isAnswerLine = (line: string): boolean => {
    const l = line.trim();
    return /^(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|Correct(?:\s*Option)?|Opt(?:ion)?|हल|Solution|उ०|उ[.])[\s:=-]+(.*)/i.test(l) ||
      /^[(\[]\s*(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|हल)[\s:=-]+.*[)\]]/i.test(l);
  };

  // Helper: extract raw answer from an answer line
  const extractAnsFromLine = (line: string): string => {
    const l = line.trim();
    const bracketMatch = l.match(/[(\[]\s*(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|हल)[\s:=-]+([^\])]+)[)\]]/i);
    if (bracketMatch) return bracketMatch[1].trim();

    return l.replace(/^(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|Correct(?:\s*Option)?|Opt(?:ion)?|हल|Solution|उ०|उ[.])[\s:=-]+/i, '').trim();
  };

  // Helper: check if line starts with an option prefix (e.g. A., (A), B., etc.)
  const isOptionPrefix = (line: string): boolean => {
    const l = line.trim();
    if (/^[(\[{]?\s*(?:A|B|C|D|a|b|c|d|क|ख|ग|घ|1|2|3|4|१|२|३|४)\s*[)\]}:.-]/i.test(l)) return true;
    return false;
  };

  // Helper: check if line starts with a non-A option (B, C, D / ख, ग, घ / 2, 3, 4)
  const isNonAOptionPrefix = (line: string): boolean => {
    const l = line.trim();
    if (/^[(\[{]?\s*(?:B|C|D|b|c|d|ख|ग|घ|2|3|4|२|३|४)\s*[)\]}:.-]/i.test(l)) return true;
    return false;
  };

  // Helper: check if line is definitely a question header
  const isQuestionHeaderLine = (line: string): boolean => {
    const l = line.trim();
    if (!l) return false;
    if (isAnswerLine(l)) return false;

    // A line starting with B, C, D, ख, ग, घ, or numbers 2, 3, 4 with option punctuation is NEVER a question header!
    if (/^[(\[{]?\s*(?:B|C|D|b|c|d|ख|ग|घ|2|3|4|२|३|४)\s*[)\]}:.-]/i.test(l)) {
      return false;
    }

    // Explicit question markers: Q1, Question 1, प्रश्न 1, प्र. 1, etc.
    if (/^(?:Q(?:uestion)?[\s.:#№-]*\d{1,3}|प्रश्न[\s.:#№-]*\d{1,3}|प्र[०.][\s.:#№-]*\d{1,3})/i.test(l)) {
      return true;
    }

    // Numbered headers: 5., 6., 7., ... 100. are ALWAYS question headers! (Since options are only 1-4)
    if (/^(?:\[?\s*(?:[5-9]|\d{2,3})\s*[.)\]:-]|(?:\(\s*(?:[5-9]|\d{2,3})\s*\))|[५-९][.)\]:-]|[१२३४५६७८९०]{2,3}[.)\]:-])/i.test(l)) {
      return true;
    }

    // For numbers 1-4: check if it has question-like punctuation or number
    if (/^(?:\[?\s*[1-4]\s*[.)\]:-]|(?:\(\s*[1-4]\s*\))|[१-४]\s*[.)\]:-])\s*\S/i.test(l)) {
      return true;
    }

    // Plain number followed by text (e.g. "1 प्रकाश के परावर्तन के...")
    if (/^\d{1,3}\s+[\u0900-\u097F\w]{2,}/i.test(l) && !isOptionPrefix(l)) {
      return true;
    }

    return false;
  };

  // Helper to extract correct option index from answer string or options matching
  const extractAnswerIndex = (ansStr: string, options: [string, string, string, string]): number => {
    if (!ansStr || !ansStr.trim()) return -1;
    const cleanAns = ansStr.trim();

    // Check for explicit letter/number tokens in answer
    // B / b / ख / 2 / २
    if (/(?:^|[(\[\s.,:-])(?:B|b|ख|2|२)(?:$|[)\]\s.,:-])/i.test(cleanAns)) return 1;
    // C / c / ग / 3 / ३
    if (/(?:^|[(\[\s.,:-])(?:C|c|ग|3|३)(?:$|[)\]\s.,:-])/i.test(cleanAns)) return 2;
    // D / d / घ / 4 / ४
    if (/(?:^|[(\[\s.,:-])(?:D|d|घ|4|४)(?:$|[)\]\s.,:-])/i.test(cleanAns)) return 3;
    // A / a / क / 1 / १
    if (/(?:^|[(\[\s.,:-])(?:A|a|क|1|१)(?:$|[)\]\s.,:-])/i.test(cleanAns)) return 0;

    // Direct text matching with options (e.g. answer is "समतल दर्पण")
    const lowerClean = cleanAns.toLowerCase().replace(/[()[\]:.-]/g, '').trim();
    for (let i = 0; i < options.length; i++) {
      const opt = options[i].trim().toLowerCase().replace(/[()[\]:.-]/g, '').trim();
      if (opt.length >= 2 && (lowerClean.includes(opt) || opt.includes(lowerClean))) {
        return i;
      }
    }

    return -1;
  };

  // Step 1: Split raw text into intelligent question chunks
  const allLines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  const questionBlocks: string[][] = [];
  let currentBlock: string[] = [];
  let seenOptionsInBlock = 0;
  let seenAnsInBlock = false;

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const isQHeader = isQuestionHeaderLine(line);
    const isAns = isAnswerLine(line);
    const isOpt = isOptionPrefix(line);

    // Should we start a new question block?
    let startNewBlock = false;

    if (currentBlock.length > 0) {
      if (isQHeader) {
        // Check if this line is actually Option 1 (A) of the current question
        const isOptA = /^[(\[{]?\s*(?:A|a|क|1|१)\s*[)\]}:.-]/i.test(line);
        if (isOptA && seenOptionsInBlock === 0 && !seenAnsInBlock) {
          // This is option A/1 of the current question, NOT a new question
          startNewBlock = false;
        } else {
          startNewBlock = true;
        }
      } else if (seenAnsInBlock && !isNonAOptionPrefix(line)) {
        // If previous line was an answer, and current line is not an option B/C/D, it's the next question!
        startNewBlock = true;
      } else if (seenOptionsInBlock >= 4 && !isAns && !isNonAOptionPrefix(line)) {
        // If we already have 4 options and this is not an answer line or B/C/D option, it's a new question
        startNewBlock = true;
      }
    }

    if (startNewBlock) {
      if (currentBlock.length > 0) {
        questionBlocks.push(currentBlock);
      }
      currentBlock = [];
      seenOptionsInBlock = 0;
      seenAnsInBlock = false;
    }

    currentBlock.push(line);
    if (isOpt) seenOptionsInBlock++;
    if (isAns) seenAnsInBlock = true;
  }

  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock);
  }

  const results: DailyTestQuestion[] = [];

  // Step 2: Parse each question block
  for (const blockLines of questionBlocks) {
    if (blockLines.length === 0) continue;

    let ansRaw = '';
    const nonAnsLines: string[] = [];

    // Separate answer line if present
    for (const line of blockLines) {
      if (isAnswerLine(line)) {
        ansRaw = extractAnsFromLine(line);
      } else {
        // Check if line has inline answer at the end e.g. "Q. प्रकाश के नियम? (Ans: B)"
        const inlineAnsMatch = line.match(/(?:\[|\()\s*(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|हल)[\s:=-]*([^\])]+)[\])]/i);
        if (inlineAnsMatch) {
          ansRaw = inlineAnsMatch[1].trim();
          const cleanedLine = line.replace(/(?:\[|\()\s*(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर|Right\s*Answer|हल)[\s:=-]*([^\])]+)[\])]/i, '').trim();
          if (cleanedLine) nonAnsLines.push(cleanedLine);
        } else {
          nonAnsLines.push(line);
        }
      }
    }

    if (nonAnsLines.length === 0) continue;

    let qText = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let optionsParsed = false;

    // 2A. Check for all 4 inline options on a single line:
    // (A) ... (B) ... (C) ... (D) ...
    for (let li = 0; li < nonAnsLines.length; li++) {
      const line = nonAnsLines[li];

      // A, B, C, D inline
      const mEn = line.match(/[(\[{]?\s*A\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*B\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*C\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*D\s*[)\]}:.-]\s*(.*)/i);
      if (mEn) {
        optA = mEn[1].trim();
        optB = mEn[2].trim();
        optC = mEn[3].trim();
        optD = mEn[4].trim();
        qText = nonAnsLines.slice(0, li).join(' ').trim();
        optionsParsed = true;
        break;
      }

      // क, ख, ग, घ inline
      const mHi = line.match(/[(\[{]?\s*क\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*ख\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*ग\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*घ\s*[)\]}:.-]\s*(.*)/i);
      if (mHi) {
        optA = mHi[1].trim();
        optB = mHi[2].trim();
        optC = mHi[3].trim();
        optD = mHi[4].trim();
        qText = nonAnsLines.slice(0, li).join(' ').trim();
        optionsParsed = true;
        break;
      }

      // 1, 2, 3, 4 inline
      const mNum = line.match(/[(\[{]?\s*1\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*2\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*3\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*4\s*[)\]}:.-]\s*(.*)/i);
      if (mNum) {
        optA = mNum[1].trim();
        optB = mNum[2].trim();
        optC = mNum[3].trim();
        optD = mNum[4].trim();
        qText = nonAnsLines.slice(0, li).join(' ').trim();
        optionsParsed = true;
        break;
      }
    }

    // 2B. Check for 2 options per line (2 lines total)
    // Line 1: (A) ... (B) ...
    // Line 2: (C) ... (D) ...
    if (!optionsParsed) {
      for (let li = 0; li < nonAnsLines.length - 1; li++) {
        const line1 = nonAnsLines[li];
        const line2 = nonAnsLines[li + 1];

        // English pair: A & B on line 1, C & D on line 2
        const mAB = line1.match(/[(\[{]?\s*A\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*B\s*[)\]}:.-]\s*(.*)/i);
        const mCD = line2.match(/[(\[{]?\s*C\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*D\s*[)\]}:.-]\s*(.*)/i);
        if (mAB && mCD) {
          optA = mAB[1].trim();
          optB = mAB[2].trim();
          optC = mCD[1].trim();
          optD = mCD[2].trim();
          qText = nonAnsLines.slice(0, li).join(' ').trim();
          optionsParsed = true;
          break;
        }

        // Hindi pair: क & ख on line 1, ग & घ on line 2
        const mHiAB = line1.match(/[(\[{]?\s*क\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*ख\s*[)\]}:.-]\s*(.*)/i);
        const mHiCD = line2.match(/[(\[{]?\s*ग\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*घ\s*[)\]}:.-]\s*(.*)/i);
        if (mHiAB && mHiCD) {
          optA = mHiAB[1].trim();
          optB = mHiAB[2].trim();
          optC = mHiCD[1].trim();
          optD = mHiCD[2].trim();
          qText = nonAnsLines.slice(0, li).join(' ').trim();
          optionsParsed = true;
          break;
        }

        // Number pair: 1 & 2 on line 1, 3 & 4 on line 2
        const mNum12 = line1.match(/[(\[{]?\s*1\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*2\s*[)\]}:.-]\s*(.*)/i);
        const mNum34 = line2.match(/[(\[{]?\s*3\s*[)\]}:.-]\s*(.*?)\s+[(\[{]?\s*4\s*[)\]}:.-]\s*(.*)/i);
        if (mNum12 && mNum34) {
          optA = mNum12[1].trim();
          optB = mNum12[2].trim();
          optC = mNum34[1].trim();
          optD = mNum34[2].trim();
          qText = nonAnsLines.slice(0, li).join(' ').trim();
          optionsParsed = true;
          break;
        }
      }
    }

    // 2C. Line-by-line options parsing
    if (!optionsParsed) {
      const questionLines: string[] = [];
      let currentOption = -1;

      for (const line of nonAnsLines) {
        // Option A / a / क / 1 / १
        if (/^[(\[{]?\s*(?:A|a|क|1|१)\s*[)\]}:.-]\s*(.*)/i.test(line)) {
          currentOption = 0;
          optA = line.replace(/^[(\[{]?\s*(?:A|a|क|1|१)\s*[)\]}:.-]\s*/i, '').trim();
        }
        // Option B / b / ख / 2 / २
        else if (/^[(\[{]?\s*(?:B|b|ख|2|२)\s*[)\]}:.-]\s*(.*)/i.test(line)) {
          currentOption = 1;
          optB = line.replace(/^[(\[{]?\s*(?:B|b|ख|2|२)\s*[)\]}:.-]\s*/i, '').trim();
        }
        // Option C / c / ग / 3 / ३
        else if (/^[(\[{]?\s*(?:C|c|ग|3|३)\s*[)\]}:.-]\s*(.*)/i.test(line)) {
          currentOption = 2;
          optC = line.replace(/^[(\[{]?\s*(?:C|c|ग|3|३)\s*[)\]}:.-]\s*/i, '').trim();
        }
        // Option D / d / घ / 4 / ४
        else if (/^[(\[{]?\s*(?:D|d|घ|4|४)\s*[)\]}:.-]\s*(.*)/i.test(line)) {
          currentOption = 3;
          optD = line.replace(/^[(\[{]?\s*(?:D|d|घ|4|४)\s*[)\]}:.-]\s*/i, '').trim();
        }
        else {
          if (currentOption === -1) {
            questionLines.push(line);
          } else {
            if (currentOption === 0) optA += ' ' + line;
            else if (currentOption === 1) optB += ' ' + line;
            else if (currentOption === 2) optC += ' ' + line;
            else if (currentOption === 3) optD += ' ' + line;
          }
        }
      }

      qText = questionLines.join(' ').trim();
    }

    // 2D. Fallback for unlabelled 4 lines
    if (!optA && nonAnsLines.length >= 5) {
      qText = nonAnsLines.slice(0, nonAnsLines.length - 4).join(' ').trim();
      optA = nonAnsLines[nonAnsLines.length - 4].trim();
      optB = nonAnsLines[nonAnsLines.length - 3].trim();
      optC = nonAnsLines[nonAnsLines.length - 2].trim();
      optD = nonAnsLines[nonAnsLines.length - 1].trim();
    }

    // Clean question text of leading prefixes (e.g. Q:, 1., प्रश्न 1:, etc.)
    qText = qText.replace(/^(?:Q(?:uestion)?[\s.:#№-]*\d{1,3}|प्रश्न[\s.:#№-]*\d{1,3}|प्र[०.][\s.:#№-]*\d{1,3}|\[?\s*\d{1,3}\s*[.)\]:-]|\(\s*\d{1,3}\s*\)|[१२३४५६७८९०]{1,3}\s*[.)\]:-])\s*/i, '').trim();

    // If still empty question text, pick the first line
    if (!qText && nonAnsLines.length > 0) {
      qText = nonAnsLines[0].replace(/^(?:Q(?:uestion)?[\s.:#№-]*\d{1,3}|प्रश्न[\s.:#№-]*\d{1,3}|प्र[०.][\s.:#№-]*\d{1,3}|\[?\s*\d{1,3}\s*[.)\]:-]|\(\s*\d{1,3}\s*\)|[१२३४५६७८९०]{1,3}\s*[.)\]:-])\s*/i, '').trim();
    }

    if (!qText) continue;

    // Default missing options so questions never crash
    if (!optA) optA = 'हाँ';
    if (!optB) optB = 'नहीं';
    if (!optC) optC = 'इनमें से कोई नहीं';
    if (!optD) optD = 'इनमें से सभी';

    const options: [string, string, string, string] = [
      optA.trim(),
      optB.trim(),
      optC.trim(),
      optD.trim()
    ];

    // Determine correct index
    let correctIndex = extractAnswerIndex(ansRaw, options);
    let isGuessed = false;

    if (correctIndex < 0 || correctIndex > 3) {
      correctIndex = 0; // Default to Option A so question is preserved
      isGuessed = true;
    }

    results.push({
      q: qText,
      options,
      correctIndex,
      isAnswerGuessed: isGuessed
    });
  }

  return results;
}

const SAMPLE_TEXT = `1. प्रकाश के परावर्तन के कितने नियम हैं?
(A) 1
(B) 2
(C) 3
(D) 4
उत्तर: B

2. दाढ़ी बनाने में कौन सा दर्पण उपयुक्त होता है?
(क) समतल दर्पण
(ख) उत्तल दर्पण
(ग) अवतल दर्पण
(घ) इनमें से कोई नहीं
उत्तर: (ग)

3. हीलियम कैसा तत्व है?
A. अक्रिय
B. क्रियाशील
C. सक्रिय
D. उदासीन
Ans: A

4. जल में हाइड्रोजन तथा ऑक्सीजन की परमाणु संख्या का अनुपात क्या है?
(A) 2:1  (B) 1:2  (C) 3:1  (D) 1:1
उत्तर - A

5. मानव शरीर की सबसे बड़ी ग्रंथि कौन सी है?
1) अग्न्याशय
2) यकृत (Liver)
3) थायरॉयड
4) पीयूष ग्रंथि
उत्तर: 2`;

interface AdminDailyTestPageProps {
  onBack?: () => void;
  onNavigateToStudent?: () => void;
}

export function AdminDailyTestPage({ onBack, onNavigateToStudent }: AdminDailyTestPageProps) {
  const [inputText, setInputText] = useState('');
  const [todayKey, setTodayKey] = useState(getTodayDateKey());
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [lastPublishedTime, setLastPublishedTime] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Overrides map for admin clicking options to toggle correct answer: { [qIdx]: optionIndex }
  const [answerOverrides, setAnswerOverrides] = useState<{ [qIdx: number]: number }>({});

  // Parse questions from raw input
  const baseParsedQuestions = useMemo(() => {
    return parseDailyTestText(inputText);
  }, [inputText]);

  // Apply any manual click overrides to the parsed questions
  const parsedPreview: DailyTestQuestion[] = useMemo(() => {
    return baseParsedQuestions.map((q, idx) => {
      if (answerOverrides[idx] !== undefined) {
        return {
          ...q,
          correctIndex: answerOverrides[idx],
          isAnswerGuessed: false
        };
      }
      return q;
    });
  }, [baseParsedQuestions, answerOverrides]);

  // Subscribe to real-time Cloud Firestore published test
  useEffect(() => {
    const docRef = doc(db, 'daily_tests', todayKey);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.questions)) {
          setPublishedCount(data.questions.length);
          if (data.publishedAt) {
            setLastPublishedTime(new Date(data.publishedAt).toLocaleTimeString('hi-IN'));
          }
          setCloudSynced(true);
        }
      } else {
        // Fallback check localStorage
        try {
          const local = localStorage.getItem(todayKey);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setPublishedCount(parsed.length);
            }
          } else {
            setPublishedCount(0);
          }
        } catch {
          setPublishedCount(0);
        }
        setCloudSynced(false);
      }
    }, (err) => {
      console.warn('Firestore daily test sync error, using local fallback:', err);
      try {
        const local = localStorage.getItem(todayKey);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) setPublishedCount(parsed.length);
        }
      } catch {}
    });

    return () => unsub();
  }, [todayKey]);

  // Handle toggling / clicking correct option in the preview
  const handleToggleCorrectOption = (qIdx: number, optIdx: number) => {
    setAnswerOverrides(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  // Publish test unified to Firestore (and LocalStorage)
  const handlePublish = async () => {
    if (parsedPreview.length === 0) {
      setErrorMsg('कृपया पहले बॉक्स में प्रश्न पेस्ट करें।');
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        id: todayKey,
        title: 'बिहार बोर्ड 10वीं दैनिक टेस्ट (Daily Test)',
        questions: parsedPreview,
        totalQuestions: parsedPreview.length,
        dateKey: todayKey,
        publishedAt: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('hi-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        updatedAt: new Date().toISOString()
      };

      // 1. Save to Cloud Firestore for today's key
      await setDoc(doc(db, 'daily_tests', todayKey), payload);

      // 2. Also save to 'latest' so students always get the most recent test seamlessly
      await setDoc(doc(db, 'daily_tests', 'latest'), payload);

      // 3. Save to LocalStorage for instant offline cache
      try {
        localStorage.setItem(todayKey, JSON.stringify(parsedPreview));
        localStorage.setItem('daily_test_latest', JSON.stringify(parsedPreview));
      } catch (localErr) {
        console.warn('LocalStorage save error:', localErr);
      }

      setPublishedCount(parsedPreview.length);
      setLastPublishedTime(new Date().toLocaleTimeString('hi-IN'));
      setCloudSynced(true);

      // Automatically trigger Smart Push Notification for new Daily Test publish
      triggerAutoContentNotification({
        contentType: 'daily_test',
        contentId: `${todayKey}_q${parsedPreview.length}`,
        subjectName: 'सभी विषय (All Subjects)',
        title: `आज का डेली टेस्ट (${parsedPreview.length} महत्वपूर्ण प्रश्न)`,
        url: '/daily-test'
      }).catch(() => {});

      setSuccessMsg(`🎉 बधाई हो! कुल ${parsedPreview.length} प्रश्न लाइव सर्वर (Cloud Firestore) पर सफलतापूर्वक पब्लिश हो गए हैं। अब सभी छात्र अपने मोबाइल पर तुरंत यह टेस्ट दे सकेंगे!`);
      
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (e: any) {
      console.error('Publish error:', e);
      // If Firestore network failed, still preserve in LocalStorage
      try {
        localStorage.setItem(todayKey, JSON.stringify(parsedPreview));
        localStorage.setItem('daily_test_latest', JSON.stringify(parsedPreview));
        setPublishedCount(parsedPreview.length);
        setSuccessMsg(`ऑफ़लाइन मोड: कुल ${parsedPreview.length} प्रश्न लोकल डिवाइस में सेव हो गए हैं।`);
      } catch {}
      setErrorMsg(`क्लाउड पर सेव करने में समस्या: ${e?.message || 'कृपया इंटरनेट कनेक्शन जांचें'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Load sample text
  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setAnswerOverrides({});
    setSuccessMsg('');
    setErrorMsg('');
  };

  // Load currently published test from Firestore/LocalStorage into editor
  const handleLoadPublished = async () => {
    try {
      let questionsToLoad: DailyTestQuestion[] = [];
      const snap = await getDoc(doc(db, 'daily_tests', todayKey));
      if (snap.exists() && Array.isArray(snap.data()?.questions)) {
        questionsToLoad = snap.data().questions;
      } else {
        const local = localStorage.getItem(todayKey);
        if (local) questionsToLoad = JSON.parse(local);
      }

      if (questionsToLoad.length === 0) {
        alert("वर्तमान में कोई पब्लिश टेस्ट नहीं मिला।");
        return;
      }

      // Convert questions back to clean text format for the editor
      const textFormatted = questionsToLoad.map((item, idx) => {
        const optLetters = ['A', 'B', 'C', 'D'];
        return `${idx + 1}. ${item.q}
(A) ${item.options[0]}
(B) ${item.options[1]}
(C) ${item.options[2]}
(D) ${item.options[3]}
उत्तर: ${optLetters[item.correctIndex]}`;
      }).join('\n\n');

      setInputText(textFormatted);
      setAnswerOverrides({});
      setSuccessMsg(`वर्तमान पब्लिश टेस्ट के ${questionsToLoad.length} प्रश्न एडिटर में लोड कर दिए गए हैं। आप बदलाव करके पुनः पब्लिश कर सकते हैं।`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e: any) {
      alert("लोड करने में त्रुटि: " + (e?.message || String(e)));
    }
  };

  const handleClear = () => {
    if (window.confirm("क्या आप एडिटर के सभी प्रश्नों को साफ करना चाहते हैं?")) {
      setInputText('');
      setAnswerOverrides({});
      setSuccessMsg('');
      setErrorMsg('');
    }
  };

  const handleDeletePublished = async () => {
    if (window.confirm(`क्या आप आज का पब्लिश किया गया टेस्ट (${todayKey}) क्लाउड सर्वर से हटाना चाहते हैं?`)) {
      try {
        await deleteDoc(doc(db, 'daily_tests', todayKey));
        localStorage.removeItem(todayKey);
        localStorage.removeItem('daily_test_latest');
        setPublishedCount(0);
        setCloudSynced(false);
        setSuccessMsg("आज का टेस्ट क्लाउड सर्वर और लोकल स्टोरेज से सफलतापूर्वक हटा दिया गया है।");
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (e: any) {
        alert("हटाने में त्रुटि: " + e?.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4D6] py-5 px-3 sm:px-6 lg:px-8 text-[#222222]">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="वापस जाएँ"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#D8B45A] text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin Panel
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    /admin/daily-test
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    cloudSynced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${cloudSynced ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                    {cloudSynced ? 'Cloud Firestore लाइव' : 'सिंक तैयार'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
                  <span>डेली टेस्ट मैनेजर (Daily Test Manager)</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  10, 20 या <b>50+ प्रश्न</b> सीधे कॉपी-पेस्ट करें और 1-क्लिक में सभी छात्रों के लिए लाइव पब्लिश करें।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToStudent) {
                    onNavigateToStudent();
                  } else {
                    window.location.href = '/daily-test';
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>छात्र पेज देखें (/daily-test)</span>
              </button>
            </div>
          </div>

          {/* Current Status Strip */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700">
              <Calendar className="w-4 h-4 text-[#D8B45A]" />
              <span>दिनांक की: <b>{todayKey}</b></span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                publishedCount > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'
              }`}>
                {publishedCount > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>वर्तमान लाइव प्रश्न: <b>{publishedCount}</b></span>
                    {lastPublishedTime && (
                      <span className="text-[10px] text-emerald-600 font-mono">({lastPublishedTime})</span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>आज कोई टेस्ट पब्लिश नहीं है</span>
                  </>
                )}
              </span>

              {publishedCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleLoadPublished}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 border border-stone-200 transition"
                    title="वर्तमान पब्लिश टेस्ट को एडिटर में लोड करें"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>पब्लिश टेस्ट लोड करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeletePublished}
                    className="text-red-600 hover:text-red-700 font-bold px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-xs cursor-pointer flex items-center gap-1 border border-red-200 transition"
                    title="आज का पब्लिश टेस्ट हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success / Error Notification */}
        {successMsg && (
          <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-400 text-red-950 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Paste Box Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D8B45A]" />
                <span>प्रश्न कॉपी करके यहाँ पेस्ट करें (Paste Your Questions)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                चाहे 10 प्रश्न हों या पूरे <b>50 प्रश्न</b>, किसी भी फॉन्ट (क, ख, ग, घ या A, B, C, D) में पेस्ट करें - सिस्टम अपने आप पहचान लेगा।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>नमूना प्रश्न लोड करें (Sample)</span>
              </button>
              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-stone-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>साफ करें</span>
                </button>
              )}
            </div>
          </div>

          {/* Versatile Format Tips Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed space-y-1.5">
            <div className="font-bold text-amber-950 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>समर्थित प्रारूप (सभी तरह के फॉन्ट सपोर्टेड हैं):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-stone-800">
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                <span className="font-bold text-amber-900 block font-sans">1. अंग्रेजी प्रारूप:</span>
                1. प्रकाश के कितने नियम हैं?<br/>
                (A) 1  (B) 2<br/>
                (C) 3  (D) 4<br/>
                उत्तर: B
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                <span className="font-bold text-amber-900 block font-sans">2. हिन्दी प्रारूप:</span>
                प्रश्न 1. दाढ़ी बनाने का दर्पण?<br/>
                क) समतल  ख) उत्तल<br/>
                ग) अवतल  घ) कोई नहीं<br/>
                Ans: ग
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                <span className="font-bold text-amber-900 block font-sans">3. एक लाइन में विकल्प:</span>
                1. हीलियम कैसा तत्व है?<br/>
                (A) अक्रिय (B) सक्रिय (C) उदासीन (D) कोई नहीं<br/>
                उत्तर - A
              </div>
            </div>
          </div>

          {/* Big Textarea */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setAnswerOverrides({});
              }}
              placeholder={`यहाँ अपने 10, 20 या 50 प्रश्न कॉपी-पेस्ट करें...\n\nउदा:\n1. प्रकाश के परावर्तन के कितने नियम हैं?\n(A) 1\n(B) 2\n(C) 3\n(D) 4\nउत्तर: B\n\n2. दाढ़ी बनाने में कौन सा दर्पण प्रयुक्त होता है?\n(क) समतल दर्पण\n(ख) उत्तल दर्पण\n(ग) अवतल दर्पण\n(घ) इनमें से कोई नहीं\nउत्तर: (ग)`}
              className="w-full h-80 sm:h-96 p-4 border-2 border-stone-300 rounded-2xl font-mono text-xs sm:text-sm leading-relaxed bg-[#FFFDF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D8B45A] focus:border-transparent resize-y shadow-inner"
            />
            {inputText && (
              <span className="absolute bottom-3 right-3 text-[11px] font-mono text-stone-500 bg-white/90 px-2.5 py-1 rounded-md border border-stone-200 backdrop-blur-xs">
                {inputText.split('\n').length} लाइनें | {parsedPreview.length} प्रश्न पहचाने गए
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-stone-600">
              {parsedPreview.length > 0 ? (
                <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>कुल <b>{parsedPreview.length} प्रश्न</b> सफलतापूर्वक पहचाने गए (पब्लिश के लिए तैयार)</span>
                </span>
              ) : (
                <span className="text-stone-500 text-xs">
                  💡 ऊपर बॉक्स में अपने प्रश्न पेस्ट करें (चाहे 50 प्रश्न हों या अधिक)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={parsedPreview.length === 0 || isPublishing}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                parsedPreview.length > 0 && !isPublishing
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 border border-amber-500 shadow-md active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              }`}
            >
              {isPublishing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-stone-900" />
                  <span>क्लाउड सर्वर पर पब्लिश हो रहा है...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-stone-950" />
                  <span>आज का टेस्ट लाइव पब्लिश करें ({parsedPreview.length} प्रश्न)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#D8B45A]" />
              <div>
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  पहचाने गए प्रश्नों का लाइव प्रिव्यू ({parsedPreview.length})
                </h2>
                <p className="text-[11px] text-stone-500">
                  💡 यदि किसी प्रश्न का सही उत्तर बदलना हो, तो नीचे उसके सही विकल्प (A, B, C, D) पर सीधे क्लिक करें।
                </p>
              </div>
            </div>
            {parsedPreview.length > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                <span>फॉर्मेट मान्य ({parsedPreview.length} प्रश्न)</span>
              </span>
            )}
          </div>

          {parsedPreview.length === 0 ? (
            <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
              <FileText className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-600">अभी कोई प्रश्न पार्स नहीं हुआ है</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                ऊपर दिए गए बॉक्स में अपने प्रश्न पेस्ट करें या "नमूना प्रश्न लोड करें" पर क्लिक करें।
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[800px] overflow-y-auto pr-1">
              {parsedPreview.map((item, index) => {
                const optLabels = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-amber-400 transition shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#D8B45A] text-stone-950 font-black text-xs flex items-center justify-center mt-0.5 shadow-2xs">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                            {item.q}
                          </h3>
                          {item.isAnswerGuessed && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              ⚠️ उत्तर अनुमानित (क्लिक करके बदलें)
                            </span>
                          )}
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {item.options.map((opt, optIdx) => {
                            const isCorrect = item.correctIndex === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleToggleCorrectOption(index, optIdx)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 text-left transition cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/50 shadow-xs'
                                    : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                                }`}
                                title="इसे सही उत्तर बनाने के लिए क्लिक करें"
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {optLabels[optIdx]}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-black flex items-center gap-0.5">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>सही उत्तर</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-2.5 text-xs text-stone-500 flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-stone-200/50">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-500">चयनित सही उत्तर:</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300">
                              विकल्प ({optLabels[item.correctIndex]}) {item.options[item.correctIndex]}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            (बदलने के लिए किसी भी विकल्प पर क्लिक करें)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
