/**
 * The unwritten arithmetic.
 *
 * A dyscalculic tester described a gap nothing else in this tool covered:
 *
 *   *"There's a version of it you don't cover: the unwritten arithmetic. How long is
 *   'a section', how many sources is enough, what '40% of the marks' means for how
 *   much time to spend. Everyone else seems to convert weightings into effort
 *   automatically. I can't, and nobody has ever written that conversion down."*
 *
 * And then told us exactly what to build: *"Convert the rubric into time: 'analysis
 * is 40% — that's about two of your five working days.' And when a brief says '3000
 * words across four sections', tell me that's 750 each, because I will get that
 * wrong and I will not notice."*
 *
 * So this module does the division nobody writes down. Every number here comes out
 * of the brief — nothing is invented, nothing is estimated, and where a figure is
 * approximate it says so.
 *
 * Pure functions. No model involved: arithmetic is not something to ask a language
 * model to do on someone's coursework.
 */

export interface Arithmetic {
  /** "3000 words across four sections" -> 750 each. */
  perSection?: { total: number; sections: number; each: number; unit: string };
  /** Marking weights, converted into a share of the effort. */
  effort?: { label: string; percent: number }[];
  /** Total of the weights, so a brief that does not add to 100 is visible. */
  weightTotal?: number;
}

const WORD_NUMBERS: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

/** Small numbers read more easily as words. The tester asked for this directly. */
export function asWords(n: number): string {
  const words = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve",
  ];
  return n >= 0 && n < words.length ? words[n] : String(n);
}

function parseCount(raw: string): number | null {
  const t = raw.trim().toLowerCase();
  if (WORD_NUMBERS[t]) return WORD_NUMBERS[t];
  const n = parseInt(t.replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function readArithmetic(brief: string): Arithmetic {
  const out: Arithmetic = {};

  /* ── "3,000 words across four sections" ─────────────────────────────────── */
  const split = brief.match(
    /\b([\d,]{1,7})\s*(words?|pages?|slides?|minutes?)\b[^.]{0,40}?\b(?:across|in|split\s+(?:in|across|between)|over|divided\s+(?:in|into|across))\s+([a-z]+|\d+)\s+(sections?|parts?|chapters?|questions?|slides?|areas?)/i,
  );
  if (split) {
    const total = parseCount(split[1]);
    const sections = parseCount(split[3]);
    if (total && sections && sections > 1 && sections <= 20) {
      out.perSection = {
        total,
        sections,
        each: Math.round(total / sections),
        unit: split[2].toLowerCase().replace(/s$/, "") + "s",
      };
    }
  }

  /* ── marking weights -> share of the effort ─────────────────────────────── */
  const weights: { label: string; percent: number }[] = [];
  const re = /([A-Za-z][A-Za-z ,&'\-]{2,48}?)\s*[—:\-–(]?\s*(?:worth\s+)?(\d{1,3})\s*%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(brief))) {
    const label = m[1].replace(/\b(is|are|and|the|a|an|carries|worth)\b\s*$/i, "").trim();
    const percent = parseInt(m[2], 10);
    if (label.length >= 3 && percent > 0 && percent <= 100) {
      weights.push({ label: label.replace(/^[\s,\-–—]+/, ""), percent });
    }
  }
  if (weights.length >= 2) {
    out.effort = weights.slice(0, 8);
    out.weightTotal = weights.reduce((a, b) => a + b.percent, 0);
  }

  return out;
}

/**
 * A weight, expressed as time.
 *
 * Deliberately given in *your* working days rather than hours: a percentage is a
 * share of the effort, and the honest conversion is proportional, not absolute.
 */
export function effortSentence(percent: number, workingDays: number): string {
  const days = (percent / 100) * workingDays;
  if (days < 0.5) return `about half a day of your ${asWords(workingDays)}`;
  if (days < 1.25) return `about one day of your ${asWords(workingDays)}`;
  const rounded = Math.round(days * 2) / 2;
  const label = Number.isInteger(rounded) ? asWords(rounded) : `${rounded}`;
  return `about ${label} of your ${asWords(workingDays)} working days`;
}
