/**
 * Common Ground — shared types.
 *
 * Design note: nothing in this codebase models a *person*. There is no user
 * profile, no behavioural score, no inference about who anyone is. Everything
 * here describes a **document** (an assignment brief) or a **process** (how a
 * group has agreed to work). That is a deliberate boundary, not an oversight —
 * see README, "What this tool will never do".
 */

export type Severity = "blocker" | "friction" | "note";

export type CheckCategory =
  | "finish-line" // What does "done" actually look like?
  | "instruction" // What is this verb actually asking me to do?
  | "assessment" // How will this be marked?
  | "quantity" // "Some sources" — how many is some?
  | "assumed" // Knowledge the brief assumes you already have
  | "group" // Who does what, and how is that decided?
  | "process"; // What happens between now and the deadline?

export interface Finding {
  /** Stable id, e.g. "instruction.vague-verb" */
  id: string;
  category: CheckCategory;
  severity: Severity;
  /** Short human title, plain language, no jargon. */
  title: string;
  /** The whole sentence from the brief that triggered this, if any. */
  excerpt?: string;
  /** The exact phrase within that sentence, so the UI can mark it. */
  match?: string;
  /** Why this matters — plain language, no clinical framing. */
  why: string;
  /**
   * The question to take to the teacher. This is the product: the brief is not
   * rewritten, and no answer is invented. The gap is named and handed back.
   */
  question: string;
}

export interface CategoryMeta {
  key: CheckCategory;
  label: string;
  blurb: string;
}

export const CATEGORY_META: Record<CheckCategory, CategoryMeta> = {
  "finish-line": {
    key: "finish-line",
    label: "The finish line",
    blurb: "What counts as finished, and how you would know.",
  },
  instruction: {
    key: "instruction",
    label: "What you're being asked to do",
    blurb: "Instruction words that mean different things to different markers.",
  },
  assessment: {
    key: "assessment",
    label: "How it's marked",
    blurb: "What the marks are actually given for.",
  },
  quantity: {
    key: "quantity",
    label: "How much",
    blurb: "Amounts left as a judgement call rather than a number.",
  },
  assumed: {
    key: "assumed",
    label: "Assumed knowledge",
    blurb: "Things the brief treats as already understood.",
  },
  group: {
    key: "group",
    label: "Working as a group",
    blurb: "Who does what, and how that gets decided.",
  },
  process: {
    key: "process",
    label: "Between now and the deadline",
    blurb: "Checkpoints, and what to do when you're stuck.",
  },
};

/** A single deterministic check. Add one file, register it, nothing else changes. */
export interface Check {
  id: string;
  category: CheckCategory;
  /** What this check looks for — shown in the /checks listing. */
  describes: string;
  run: (brief: string) => Finding[];
}

/** The AI layer's output. Everything here is optional — the tool works without it. */
export interface Interpretation {
  /** One plain sentence: what this assignment is actually asking for. */
  summary?: string;
  /** Concrete, checkable statements of "done". */
  definitionOfDone?: string[];
  /** Deliverables the brief implies but may not list explicitly. */
  deliverables?: string[];
  /** Distinct work streams — used to propose roles, never to assign people. */
  workstreams?: { name: string; description: string }[];
}

export interface DecodeResult {
  findings: Finding[];
  interpretation?: Interpretation;
  /** True when the AI layer ran. False = deterministic checks only, still useful. */
  aiUsed: boolean;
  /** Present when the AI layer was attempted and failed. Shown honestly, never hidden. */
  aiError?: string;
  meta: {
    words: number;
    checksRun: number;
    ms: number;
  };
}

/* ── Group setup ─────────────────────────────────────────────────────────── */

/**
 * Working preferences. Note what is NOT here: no diagnosis, no disability field,
 * no "do you need accommodations?". Every member answers the same questions, and
 * every answer is a legitimate preference rather than a disclosure.
 */
export interface MemberPrefs {
  id: string;
  name: string;
  /** Which workstreams they'd like, in order of preference. */
  wants: string[];
  /** How they'd rather contribute in meetings. */
  contribute: "speaking" | "writing" | "either";
  /** How much notice they want before a meeting. */
  notice: "same-day" | "a-day" | "several-days";
  /** How they'd like feedback on their part. */
  feedback: "direct" | "written-first" | "in-conversation";
  /** Anything else they want the group to know. Free text, optional. */
  note?: string;
}

export interface RoleProposal {
  memberId: string;
  memberName: string;
  workstream: string;
  /** Concrete statement of what finished looks like for this role. */
  done: string;
  /** Why this allocation — always about stated preferences, never about the person. */
  rationale: string;
}
