/**
 * The decision log.
 *
 * The group agreement page ends with: "A decision is only a decision once it is
 * written down here." This is the "here".
 *
 * Why this exists at all: in an undocumented group, agreement has to be inferred
 * from tone, silence, and who didn't object. That inference is invisible work,
 * it is unreliable for everyone, and it is a well-documented barrier for people
 * who don't read implicit social signals in real time. Writing decisions down
 * removes the inference step entirely — for the whole group, not for one person.
 *
 * Two deliberate properties:
 *
 *  - **Silence is never agreement.** An entry shows exactly who has said yes and
 *    who has not answered. "Not answered" is displayed as its own state, never
 *    folded into consent.
 *  - **Raising something in writing counts.** An open question is a first-class
 *    entry, not a lesser one. This is the written contribution path made real:
 *    you never have to win a turn in a live conversation to put something on the
 *    record.
 *
 * Storage is localStorage on the device of whoever is using it. There is no
 * server, no account, and nothing is transmitted anywhere.
 */

export type EntryKind = "decision" | "question";

export interface LogEntry {
  id: string;
  kind: EntryKind;
  /** What was decided, or what is being asked. The author's own words, never rewritten. */
  text: string;
  /** Who wrote it. A name typed by a person, not an identity the app assigns. */
  author: string;
  /** ISO timestamp. Used for ordering and for "how long has this sat unanswered". */
  at: string;
  /** Names of members who have explicitly agreed. Absence means "hasn't answered". */
  agreedBy: string[];
  /** For questions: the answer, once someone writes one. */
  answer?: { text: string; author: string; at: string };
}

export interface LogState {
  project: string;
  members: string[];
  entries: LogEntry[];
}

const KEY = "cg:log";

export const emptyLog = (): LogState => ({ project: "", members: [], entries: [] });

export function loadLog(): LogState {
  if (typeof window === "undefined") return emptyLog();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyLog();
    const parsed = JSON.parse(raw);
    return {
      project: typeof parsed.project === "string" ? parsed.project : "",
      members: Array.isArray(parsed.members) ? parsed.members.filter((m: unknown) => typeof m === "string") : [],
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return emptyLog();
  }
}

export function saveLog(state: LogState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // A full or blocked localStorage must not break the page. The user still has
    // everything on screen; it just won't survive a reload.
  }
}

export const newId = () =>
  `e${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Members who have not said yes. Never rendered as disagreement — only as "not answered". */
export function notAnswered(entry: LogEntry, members: string[]): string[] {
  return members.filter((m) => !entry.agreedBy.includes(m));
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86_400_000);
}

/**
 * Entries this person raised that nobody has responded to.
 *
 * This is shown **only to the person who wrote them, on their own device**. It is
 * never aggregated, never sent anywhere, and never shown to a teacher. Its purpose
 * is self-advocacy support — noticing "I asked this and it went nowhere" is the
 * hard part, and it is the thing self-advocates recommend supporting instead of
 * teaching people to communicate differently.
 */
export function unansweredBy(state: LogState, who: string): LogEntry[] {
  return state.entries.filter(
    (e) =>
      e.author === who &&
      ((e.kind === "question" && !e.answer) ||
        (e.kind === "decision" && notAnswered(e, state.members).length === state.members.length - 1)),
  );
}

/** Plain-text export — for pasting into an email, or handing in as a record of process. */
export function toMarkdown(state: LogState): string {
  const lines: string[] = [];
  lines.push(`# ${state.project || "Group project"} — decision log`);
  lines.push("");
  if (state.members.length) lines.push(`Group: ${state.members.join(", ")}`);
  lines.push("");

  const decisions = state.entries.filter((e) => e.kind === "decision");
  const questions = state.entries.filter((e) => e.kind === "question");

  lines.push("## Decisions");
  lines.push("");
  if (!decisions.length) lines.push("_Nothing recorded yet._");
  for (const d of decisions) {
    const missing = notAnswered(d, state.members);
    lines.push(`- **${d.text}**`);
    lines.push(`  - Written by ${d.author} on ${new Date(d.at).toLocaleDateString()}`);
    lines.push(`  - Agreed by: ${d.agreedBy.length ? d.agreedBy.join(", ") : "nobody yet"}`);
    if (missing.length) lines.push(`  - Not yet answered by: ${missing.join(", ")}`);
  }
  lines.push("");

  lines.push("## Open questions");
  lines.push("");
  if (!questions.length) lines.push("_None._");
  for (const q of questions) {
    lines.push(`- **${q.text}** — raised by ${q.author} on ${new Date(q.at).toLocaleDateString()}`);
    if (q.answer) lines.push(`  - Answered by ${q.answer.author}: ${q.answer.text}`);
    else lines.push(`  - _Still open after ${daysSince(q.at)} day(s)._`);
  }

  return lines.join("\n");
}
