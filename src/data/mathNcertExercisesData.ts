import {
  MathChapterExercises,
  MathExercise,
  MathExerciseQuestion,
  mathExercisesCh1to5,
} from './mathExercisesCh1to5';
import { mathExercisesCh6to10 } from './mathExercisesCh6to10';
import { mathExercisesCh11to15 } from './mathExercisesCh11to15';

export type { MathChapterExercises, MathExercise, MathExerciseQuestion };

export const allMathChaptersExercises: Record<number, MathChapterExercises> = {
  ...mathExercisesCh1to5,
  ...mathExercisesCh6to10,
  ...mathExercisesCh11to15,
};

export function getMathChapterExercises(chapterNo: number): MathChapterExercises | undefined {
  return allMathChaptersExercises[chapterNo];
}

/**
 * Converts any raw LaTeX or Markdown syntax (e.g. **bold**, $a$, $$...$$, \frac{a}{b}, \sqrt{x}, \le, \quad, etc.)
 * into clean, natural Unicode mathematical text so no raw code-like characters ever appear on screen.
 */
export function cleanMathAndMarkdownText(raw: any): string {
  if (raw === null || raw === undefined) return '';
  let text = typeof raw === 'string' ? raw : String(raw);

  // 1. Remove display math delimiters $$ and inline math delimiters $
  text = text.replace(/\$\$/g, '');
  text = text.replace(/\$/g, '');

  // 2. Remove Markdown bold ** and __
  text = text.replace(/\*\*/g, '');
  text = text.replace(/__/g, '');

  // 3. Convert \text{...} and \mathbb{...}
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');
  text = text.replace(/\\mathbb\{Z\}/g, 'Z (पूर्णांक)');
  text = text.replace(/\\mathbb\{R\}/g, 'R (वास्तविक संख्या)');
  text = text.replace(/\\mathbb\{N\}/g, 'N (प्राकृत संख्या)');
  text = text.replace(/\\mathbb\{([^}]*)\}/g, '$1');

  // 4. Convert \frac{a}{b} to (a/b) or a/b
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    const numWrap = cleanNum.length > 2 && /[+\-]/.test(cleanNum) ? `(${cleanNum})` : cleanNum;
    const denWrap = cleanDen.length > 2 && /[+\-]/.test(cleanDen) ? `(${cleanDen})` : cleanDen;
    return `${numWrap}/${denWrap}`;
  });

  // 5. Convert \sqrt{...} to √(...)
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, (_, inner) => {
    const cleanInner = inner.trim();
    return cleanInner.length <= 2 ? `√${cleanInner}` : `√(${cleanInner})`;
  });

  // 6. Remove \left and \right
  text = text.replace(/\\left/g, '');
  text = text.replace(/\\right/g, '');

  // 7. Replace LaTeX math symbols & Greek letters with clean Unicode equivalents
  const latexReplacements: Array<[RegExp, string]> = [
    [/\\quad/g, '   '],
    [/\\qquad/g, '     '],
    [/\\le\b/g, '≤'],
    [/\\leq\b/g, '≤'],
    [/\\ge\b/g, '≥'],
    [/\\geq\b/g, '≥'],
    [/\\ne\b/g, '≠'],
    [/\\neq\b/g, '≠'],
    [/\\times\b/g, '×'],
    [/\\div\b/g, '÷'],
    [/\\pm\b/g, '±'],
    [/\\mp\b/g, '∓'],
    [/\\cdot\b/g, '·'],
    [/\\therefore\b/g, '∴'],
    [/\\because\b/g, '∵'],
    [/\\Rightarrow\b/g, '⇒'],
    [/\\implies\b/g, '⇒'],
    [/\\rightarrow\b/g, '→'],
    [/\\infty\b/g, '∞'],
    [/\\in\b/g, '∈'],
    [/\\notin\b/g, '∉'],
    [/\\triangle\b/g, 'Δ'],
    [/\\angle\b/g, '∠'],
    [/\\perp\b/g, '⊥'],
    [/\\parallel\b/g, '∥'],
    [/\\sim\b/g, '~'],
    [/\\cong\b/g, '≅'],
    [/\\approx\b/g, '≈'],
    [/\^\\circ/g, '°'],
    [/\\circ\b/g, '°'],
    [/\\pi\b/g, 'π'],
    [/\\theta\b/g, 'θ'],
    [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'],
    [/\\gamma\b/g, 'γ'],
    [/\\delta\b/g, 'δ'],
    [/\\lambda\b/g, 'λ'],
    [/\\sigma\b/g, 'σ'],
    [/\\sum\b/g, 'Σ'],
  ];

  for (const [pattern, replacement] of latexReplacements) {
    text = text.replace(pattern, replacement);
  }

  // 8. Convert superscripts ^0..^9, ^n, ^m and subscripts _0.._9, _n
  const supMap: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    n: 'ⁿ',
    m: 'ᵐ',
  };
  text = text.replace(/\^\{([0-9nm]+)\}/g, (_, chars: string) =>
    chars
      .split('')
      .map((c) => supMap[c] || `^${c}`)
      .join('')
  );
  text = text.replace(/\^([0-9nm])/g, (_, c: string) => supMap[c] || `^${c}`);

  const subMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    n: 'ₙ',
    i: 'ᵢ',
  };
  text = text.replace(/_\{([0-9ni]+)\}/g, (_, chars: string) =>
    chars
      .split('')
      .map((c) => subMap[c] || `_${c}`)
      .join('')
  );
  text = text.replace(/_([0-9ni])/g, (_, c: string) => subMap[c] || `_${c}`);

  // 9. Clean up any remaining stray backslashes before letters
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');

  return text;
}
