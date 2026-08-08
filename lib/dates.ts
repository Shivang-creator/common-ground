/**
 * Dates as a line, and a plan that runs backwards from the deadline.
 *
 * Two testers asked for the same thing from different directions.
 *
 * A dyscalculic tester: *"One picture would earn its place: a timeline. Deadline at
 * one end, now at the other, the checkpoint in between. Dates as a line rather than
 * digits is the single most useful translation you could do for me."*
 *
 * An ADHD tester: *"Deadline in, backwards plan out — 'outline by the 3rd'."*
 *
 * Both are the same computation: find the real dates in the brief, put them on a
 * line, and work backwards. Every date here is read out of the brief. Nothing is
 * invented, and if the brief gives no date, this stays silent rather than guessing.
 */

export interface Milestone {
  label: string;
  date: Date;
  kind: "now" | "checkpoint" | "deadline" | "suggested";
  /** Why this date exists — a quote from the brief, or how it was derived. */
  note?: string;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Dates found in the brief, in the order they appear. */
export function findDates(brief: string, now = new Date()): { date: Date; text: string }[] {
  const out: { date: Date; text: string }[] = [];
  const seen = new Set<string>();

  const push = (d: Date, text: string) => {
    if (isNaN(d.getTime())) return;
    // A coursework date more than two years out is almost certainly a misparse.
    const years = (d.getTime() - now.getTime()) / (365 * 864e5);
    if (years < -1 || years > 2) return;
    const k = d.toDateString();
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ date: d, text });
  };

  // "14 March 2027" / "14 March"
  const dmy = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?\s*(\d{4})?\b/g;
  let m: RegExpExecArray | null;
  while ((m = dmy.exec(brief))) {
    const mi = MONTHS.findIndex((x) => x.startsWith(m![2].toLowerCase()));
    if (mi === -1) continue;
    const year = m[3] ? parseInt(m[3], 10) : now.getFullYear();
    push(new Date(year, mi, parseInt(m[1], 10)), m[0].trim());
  }

  // "March 14, 2027" / "March 14"
  const mdy = /\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/g;
  while ((m = mdy.exec(brief))) {
    const mi = MONTHS.findIndex((x) => x.startsWith(m![1].toLowerCase()));
    if (mi === -1) continue;
    const year = m[3] ? parseInt(m[3], 10) : now.getFullYear();
    push(new Date(year, mi, parseInt(m[2], 10)), m[0].trim());
  }

  // 14/03/2027 — day-first, which is the convention where "week 6" briefs are written.
  const num = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/g;
  while ((m = num.exec(brief))) {
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    push(new Date(y, parseInt(m[2], 10) - 1, parseInt(m[1], 10)), m[0]);
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Whole days between two dates, ignoring the time of day. */
export const daysBetween = (a: Date, b: Date): number =>
  Math.round(
    (new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
      new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()) /
      864e5,
  );

/**
 * The deadline, whatever else is in the brief, plus a plan that runs backwards
 * from it.
 *
 * The suggested dates are proportional and clearly labelled as suggestions — the
 * brief did not set them and this does not pretend otherwise.
 */
export function buildTimeline(brief: string, now = new Date()): Milestone[] {
  const dates = findDates(brief, now).filter((d) => daysBetween(now, d.date) >= 0);
  if (!dates.length) return [];

  const deadline = dates[dates.length - 1];
  const total = daysBetween(now, deadline.date);
  if (total < 1) return [];

  const out: Milestone[] = [{ label: "Today", date: now, kind: "now" }];

  for (const d of dates.slice(0, -1)) {
    out.push({
      label: "In the brief",
      date: d.date,
      kind: "checkpoint",
      note: `The brief says "${d.text}"`,
    });
  }

  // Only suggest a plan when there is genuinely room for one.
  if (total >= 5) {
    const at = (frac: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + Math.round(total * frac));
      return d;
    };
    out.push(
      { label: "Ask your questions by", date: at(0.12), kind: "suggested", note: "Leaves time for a reply before you need the answer" },
      { label: "Rough outline done by", date: at(0.4), kind: "suggested", note: "Suggested, not from the brief" },
      { label: "First full draft by", date: at(0.75), kind: "suggested", note: "Suggested, not from the brief" },
    );
  }

  out.push({
    label: "Due",
    date: deadline.date,
    kind: "deadline",
    note: `The brief says "${deadline.text}"`,
  });

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}
