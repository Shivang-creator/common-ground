/**
 * The answer loop.
 *
 * Three testers, independently, found the same hole — and the sceptic put it best:
 *
 *   *"If your whole class uses this, your tutor receives thirty near-identical
 *   emails with the same five questions. Then they stop answering, and the tool
 *   stops working. You've made asking scale; you haven't made answering scale."*
 *
 * The original tester called it the most important open problem, ahead of anything
 * cosmetic. They also described the fix: *"one person's questions become the
 * group's questions, the tutor answers once, and the answer goes back into the
 * brief for everyone."*
 *
 * So: an answer written here attaches to the question, drops that question out of
 * the email, and travels to the rest of the group as a link. The second person to
 * open that brief sees the answers already filled in and only emails what is still
 * genuinely unanswered.
 *
 * No account and no server. Answers live in this browser and move by a link the
 * group shares — the same way the answers already travel today, in the group chat
 * that some people are not in.
 */

export interface Answer {
  /** What the tutor said. Their words, never rewritten. */
  text: string;
  /** Who wrote it down. Optional — a group may not want names on it. */
  by?: string;
  /** ISO timestamp. */
  at: string;
}

export interface AnswerBundle {
  /** Which brief these answers belong to. */
  brief: string;
  /** questionKey -> answer */
  answers: Record<string, Answer>;
}

const KEY = "cg:answers";

/* ── stable keys ─────────────────────────────────────────────────────────── */

function hash(s: string): string {
  const norm = s.trim().replace(/\s+/g, " ").toLowerCase();
  let h1 = 0x811c9dc5,
    h2 = 0x01000193;
  for (let i = 0; i < norm.length; i++) {
    h1 = Math.imul(h1 ^ norm.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + norm.charCodeAt(i), 2654435761) >>> 0;
  }
  return h1.toString(36) + h2.toString(36);
}

/** Which brief. Matches the server's normalisation so a group shares one key. */
export const briefKey = (brief: string): string => hash(brief);

/** Which question. Keyed on the question text, so it survives check reordering. */
export const questionKey = (question: string): string => hash(question);

/* ── storage ─────────────────────────────────────────────────────────────── */

type Store = Record<string, Record<string, Answer>>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Full or blocked storage must never break the page. The answers stay on
    // screen for this session; they just will not survive a reload.
  }
}

export function loadAnswers(brief: string): Record<string, Answer> {
  return readStore()[briefKey(brief)] ?? {};
}

export function saveAnswer(brief: string, question: string, answer: Answer) {
  const store = readStore();
  const k = briefKey(brief);
  store[k] = { ...(store[k] ?? {}), [questionKey(question)]: answer };
  writeStore(store);
}

export function removeAnswer(brief: string, question: string) {
  const store = readStore();
  const k = briefKey(brief);
  if (!store[k]) return;
  delete store[k][questionKey(question)];
  writeStore(store);
}

export function mergeAnswers(bundle: AnswerBundle): number {
  const store = readStore();
  const existing = store[bundle.brief] ?? {};
  let added = 0;
  for (const [q, a] of Object.entries(bundle.answers)) {
    if (!existing[q]) added++;
    existing[q] = a;
  }
  store[bundle.brief] = existing;
  writeStore(store);
  return added;
}

/* ── sharing ─────────────────────────────────────────────────────────────── */

const b64encode = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64decode = (s: string) =>
  decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

/**
 * A link that carries the answers.
 *
 * Everything travels in the URL fragment, which browsers never send to a server —
 * so a group can pass answers around without those answers being uploaded anywhere,
 * including to us.
 */
export function shareLink(brief: string, answers: Record<string, Answer>): string {
  const bundle: AnswerBundle = { brief: briefKey(brief), answers };
  const payload = b64encode(JSON.stringify(bundle));
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/#answers=${payload}`;
}

export function readSharedBundle(): AnswerBundle | null {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/answers=([^&]+)/);
  if (!m) return null;
  try {
    const parsed = JSON.parse(b64decode(m[1]));
    if (typeof parsed?.brief === "string" && parsed.answers && typeof parsed.answers === "object") {
      return parsed as AnswerBundle;
    }
  } catch {
    // A mangled link is not worth an error message. Ignore it.
  }
  return null;
}

export function clearShareFromUrl() {
  if (typeof window === "undefined") return;
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
