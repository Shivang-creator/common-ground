/**
 * The deterministic check layer.
 *
 * Every check here is a pure function over the brief text. No model, no network,
 * no key required. This matters for three reasons:
 *
 *  1. **It works with nothing.** A judge, a teacher, or a student with no API key
 *     still gets a real result. The AI layer improves the output; it is never
 *     load-bearing.
 *  2. **It is auditable.** Every finding names the exact text that triggered it.
 *     Nobody has to trust a model's opinion about their assignment.
 *  3. **It never invents.** ASAN's position on generative AI in accessibility work
 *     is that it "added new ideas that were not in the text we wrote" and "changes
 *     what something means". These checks cannot do that — they only point.
 *
 * Adding a check is one entry in CHECKS. Nothing else in the codebase changes.
 */

import type { Check, Finding } from "./types";

/* ── helpers ─────────────────────────────────────────────────────────────── */

/**
 * The whole sentence the match sits in, not a slice of characters around it.
 *
 * A dyslexic tester: *"The quote fragments are the hardest thing on the page —
 * ellipses mid-sentence with no punctuation to anchor on. Give me the whole
 * sentence with the phrase bolded instead of a truncated ribbon."*
 *
 * So this walks out to real sentence boundaries. A sentence long enough to be its
 * own problem still gets trimmed, but always at a word, and only then.
 */
const sentenceAround = (text: string, index: number): string => {
  const before = text.slice(0, index);
  const after = text.slice(index);

  let start = Math.max(
    before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? "),
    before.lastIndexOf("\n"),
  );
  start = start === -1 ? 0 : start + 1;

  const endRel = after.search(/[.!?](\s|$)/);
  const end = endRel === -1 ? text.length : index + endRel + 1;

  let sentence = text.slice(start, end).trim().replace(/\s+/g, " ");

  // Only trim if it is genuinely unreadable, and never mid-word.
  if (sentence.length > 260) {
    const cut = sentence.slice(0, 260);
    sentence = cut.slice(0, cut.lastIndexOf(" ")) + " …";
  }
  return sentence;
};

/** Find whole-word matches for any phrase in `terms`. Case-insensitive. */
function findTerms(brief: string, terms: string[]): { term: string; excerpt: string }[] {
  const out: { term: string; excerpt: string }[] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    const re = new RegExp(`(?<![\\w-])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "i");
    const m = re.exec(brief);
    if (m && m.index !== undefined && !seen.has(term.toLowerCase())) {
      seen.add(term.toLowerCase());
      out.push({ term: m[0], excerpt: sentenceAround(brief, m.index) });
    }
  }
  return out;
}

/**
 * Whole-word match, tolerant of plurals and simple inflections.
 *
 * The original version required an exact word boundary immediately after the
 * term, so a brief saying "Extensions follow the standard university policy"
 * did not match "extension" and was told it had no extensions policy. A tester
 * hit exactly that. Telling someone their brief is missing something it plainly
 * states is the worst failure this tool has, so matching now allows a trailing
 * s / es / ed / ing.
 */
const has = (brief: string, terms: string[]): boolean =>
  terms.some((t) => new RegExp(`(?<![\\w-])${t}(?:s|es|ed|ing)?(?![\\w-])`, "i").test(brief));

/**
 * Is this actually group work?
 *
 * Merely containing the word "group" is not enough. A tester's brief was titled
 * "Individual report" and mentioned a group only once, in passing — "if your group
 * runs into difficulties, email me" — and got told it needed role guidance and a
 * marking split. Both are nonsense for an individual assignment.
 *
 * So: an explicit individual framing wins outright, and otherwise the brief has to
 * actually instruct group work rather than mention the word.
 */
const mentionsGroup = (brief: string): boolean => {
  if (/\bindividual(ly)?\b/i.test(brief) && !/\bgroup work\b/i.test(brief)) return false;

  const instructsGroupWork =
    /\b(in|as|into)\s+(a\s+)?(groups?|teams?|pairs?)\b/i.test(brief) ||
    /\bgroups?\s+of\s+\w+/i.test(brief) ||
    /\byour\s+(group|team)\s+(should|must|will|needs?)\b/i.test(brief) ||
    /\b(group|team)\s+(project|work|assignment|presentation|report|submission)\b/i.test(brief) ||
    /\bwork\s+(together|collaborativel\w+)\b/i.test(brief) ||
    /\bcollaborat\w+\b/i.test(brief);

  return instructsGroupWork;
};

/* ── the checks ──────────────────────────────────────────────────────────── */

export const CHECKS: Check[] = [
  /* — finish line — */
  {
    id: "finish-line.no-length",
    category: "finish-line",
    describes: "No length given — no word count, page count or duration.",
    run: (brief) => {
      const hasLength =
        /\b\d[\d,]*\s*(-|–|to)?\s*[\d,]*\s*(words?|pages?|slides?|minutes?|mins?|hours?)\b/i.test(brief) ||
        /\b(word count|page limit|time limit|duration)\b/i.test(brief);
      if (hasLength) return [];
      return [
        {
          id: "finish-line.no-length",
          category: "finish-line",
          severity: "blocker",
          title: "No length is given",
          why: "Without a size, there is no way to tell whether you have done too little or far too much. People who like to be thorough often lose time here, and people who are unsure often stop too early.",
          question: "Roughly how long should this be — a word count, page count, or time?",
        },
      ];
    },
  },
  {
    id: "finish-line.no-format",
    category: "finish-line",
    describes: "No deliverable format — what am I actually handing in?",
    run: (brief) => {
      const hasFormat = has(brief, [
        "essay", "report", "presentation", "slides", "poster", "video", "podcast", "portfolio",
        "prototype", "code", "repository", "document", "pdf", "docx", "notebook", "spreadsheet",
        "diagram", "model", "demo",
      ]);
      if (hasFormat) return [];
      return [
        {
          id: "finish-line.no-format",
          category: "finish-line",
          severity: "blocker",
          title: "It doesn't say what you hand in",
          why: "The brief describes the task but not the artefact. Two people can do the same work and submit completely different things.",
          question: "What exactly are we submitting — a document, slides, a video, code, something else?",
        },
      ];
    },
  },
  {
    id: "finish-line.no-deadline",
    category: "finish-line",
    describes: "No date or deadline anywhere in the brief.",
    run: (brief) => {
      const hasDate =
        /\b(\d{1,2}[\/.-]\d{1,2}([\/.-]\d{2,4})?)\b/.test(brief) ||
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b/i.test(brief) ||
        /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(brief) ||
        /\b(deadline|due date|due on|submit by|hand in by|by the end of)\b/i.test(brief) ||
        /\bweek\s+\d+\b/i.test(brief);
      if (hasDate) return [];
      return [
        {
          id: "finish-line.no-deadline",
          category: "finish-line",
          severity: "friction",
          title: "No deadline is stated",
          why: "Planning backwards from a date is one of the few reliable ways to start. Without one, everything stays equally urgent and equally not-yet.",
          question: "When is this due, and is there a time of day?",
        },
      ];
    },
  },

  /* — instruction words — */
  {
    id: "instruction.vague-verb",
    category: "instruction",
    describes: "Instruction verbs that different markers interpret differently.",
    run: (brief) => {
      const VERBS: Record<string, string> = {
        discuss: "Some markers want both sides weighed up. Others want you to argue one position and defend it. These score very differently.",
        explore: "Open-ended by design — but the mark scheme usually is not.",
        "critically analyse": "'Critically' rarely means 'be negative'. It usually means show the limits of the evidence — but which limits?",
        "critically evaluate": "Evaluate against what standard? The criterion is usually assumed rather than stated.",
        "engage with": "Engage how — summarise it, apply it, disagree with it?",
        "reflect on": "Personal experience, or academic reflection with sources? The two look nothing alike.",
        consider: "Consider and then do what — mention it, or build on it?",
        explain: "To whom, and at what level of prior knowledge?",
        "compare and contrast": "Along which dimensions? Chosen by you, or expected ones?",
        analyse: "Break into parts, or interpret meaning? Both are called analysis.",
        "comment on": "Describe it, or judge it?",
        appraise: "Against what benchmark?",
        interrogate: "A stronger word than it looks — usually means challenge assumptions, not describe.",
        problematise: "Assumes you already know what is taken for granted here.",
      };
      const hits = findTerms(brief, Object.keys(VERBS));
      if (!hits.length) return [];

      // One finding, not one per verb.
      //
      // A tester pressed "Copy all questions" on a brief with seven instruction
      // verbs and got seven copies of the same sentence with one word swapped.
      // Nobody sends that email — and Copy-all is the flagship action. So these
      // collapse into a single finding that names every verb once and asks one
      // answerable question.
      const terms = hits.map((h) => h.term.toLowerCase());
      const list =
        terms.length === 1
          ? `"${terms[0]}"`
          : terms.slice(0, -1).map((t) => `"${t}"`).join(", ") + ` and "${terms[terms.length - 1]}"`;

      return [
        {
          id: "instruction.vague-verb",
          category: "instruction" as const,
          severity: "friction" as const,
          title:
            terms.length === 1
              ? `"${terms[0]}" can mean more than one thing`
              : `${terms.length} instruction words that mean different things to different markers`,
          excerpt: hits[0].excerpt,
          match: hits[0].term,
          why:
            (VERBS[terms[0]] ?? "Markers read this instruction word differently.") +
            (terms.length > 1
              ? ` The same is true of the others here — each one is read differently by different markers, and the brief does not say which reading it wants.`
              : ""),
          question:
            terms.length === 1
              ? `When the brief says "${terms[0]}", what does that look like in an answer that gets full marks?`
              : `The brief uses ${list}. Could you say what one or two of those look like in practice for this assignment — I want to make sure I'm answering what you're actually asking for.`,
        },
      ];
    },
  },

  /* — assessment — */
  {
    id: "assessment.no-criteria",
    category: "assessment",
    describes: "No marking criteria, rubric or weighting mentioned.",
    run: (brief) => {
      // Two or more percentage weightings IS a marking breakdown, whatever it is called.
      if ((brief.match(/\b\d{1,3}\s*%/g) ?? []).length >= 2) return [];
      const hasCriteria = has(brief, [
        "criteria", "criterion", "rubric", "marking", "marked on", "assessed on", "grading",
        "marks", "mark scheme", "weighting",
        "weighting", "weighted", "marks? for", "graded on", "learning outcomes?",
      ]);
      if (hasCriteria) return [];
      return [
        {
          id: "assessment.no-criteria",
          category: "assessment",
          severity: "blocker",
          title: "It doesn't say what the marks are for",
          why: "Without criteria, the safest strategy is to do everything to the same depth — which is the most expensive possible way to work, and it rewards guessing what the marker wants.",
          question: "Is there a rubric or marking criteria we can see, and how are the marks split?",
        },
      ];
    },
  },

  /* — quantity — */
  {
    id: "quantity.unquantified",
    category: "quantity",
    describes: "Amounts left as a judgement call — 'some', 'several', 'appropriate'.",
    run: (brief) => {
      // Words that really are amounts. Asking for a number here is sensible.
      const AMOUNTS = ["some", "several", "a few", "a range of", "a variety of", "multiple", "various"];
      // Words that are standards, not amounts. Asking "how many is relevant?" would
      // make the sender look like they cannot read English — so ask what the
      // standard is instead.
      const STANDARDS = [
        "appropriate", "adequate", "sufficient", "relevant", "suitable",
        "in depth", "detailed", "thorough", "comprehensive",
      ];

      const amountHits = findTerms(brief, AMOUNTS).slice(0, 3).map(({ term, excerpt }) => ({
        id: "quantity.unquantified",
        category: "quantity" as const,
        severity: "note" as const,
        title: `"${term}" — how many is that?`,
        excerpt, match: term,
        why: "Amounts like this are obvious to whoever wrote the brief and genuinely ambiguous to everyone reading it. Guessing low loses marks; guessing high loses time.",
        question: `The brief says "${term}" — is there a rough number or minimum you have in mind?`,
      }));

      const standardHits = findTerms(brief, STANDARDS).slice(0, 2).map(({ term, excerpt }) => ({
        id: "quantity.standard-unstated",
        category: "quantity" as const,
        severity: "note" as const,
        title: `"${term}" — measured against what?`,
        excerpt, match: term,
        why: "This is a standard rather than an amount, and the standard is assumed rather than stated. Whoever wrote it has something specific in mind.",
        question: `What would make something "${term}" for this assignment — is there an example of one that hit the mark?`,
      }));

      return [...amountHits, ...standardHits];
    },
  },

  /* — assumed knowledge (the hidden curriculum) — */
  {
    id: "assumed.taken-for-granted",
    category: "assumed",
    describes: "Words that signal the brief assumes shared background knowledge.",
    run: (brief) => {
      const TERMS = [
        "obviously", "clearly", "simply", "just", "of course", "as you know", "as discussed",
        "as we covered", "as usual", "the usual", "standard format", "normal", "as always",
        "you should already", "familiar with", "needless to say", "straightforward",
      ];
      const hits = findTerms(brief, TERMS);
      return hits.slice(0, 6).map(({ term, excerpt }) => ({
        id: "assumed.taken-for-granted",
        category: "assumed" as const,
        severity: "friction" as const,
        title: `"${term}" assumes you already know something`,
        excerpt, match: term,
        why: "Phrases like this point at knowledge that was never written down — often mentioned once in a class, or simply expected. It is not a gap in you; it is a gap in the brief.",
        question: `The brief says "${term}" here — could you spell out what's being assumed? I'd rather check than guess.`,
      }));
    },
  },

  /* — group work — */
  {
    id: "group.no-roles",
    category: "group",
    describes: "Group work with no guidance on how to split it.",
    run: (brief) => {
      if (!mentionsGroup(brief)) return [];
      if (has(brief, ["roles?", "responsibilit\\w+", "divide", "split", "allocat\\w+", "each member", "who does"])) return [];
      return [
        {
          id: "group.no-roles",
          category: "group",
          severity: "blocker",
          title: "Group work, but no guidance on splitting it",
          why: "When a brief doesn't define roles, groups decide them by talking — usually fast, usually in the first meeting, and usually in favour of whoever speaks first. Research on group work found the difficulty was not the content but the unpredictability of peer communication.",
          question: "Do you want us to split this into set roles, or work on all of it together? Is there a split you'd recommend?",
        },
      ];
    },
  },
  {
    id: "group.individual-vs-group-mark",
    category: "group",
    describes: "Group work without saying whether marks are individual or shared.",
    run: (brief) => {
      if (!mentionsGroup(brief)) return [];
      if (/\b(individual|shared|same)\s+(mark|grade|score)\b/i.test(brief)) return [];
      if (/\bpeer\s+(assessment|review|marking|evaluation)\b/i.test(brief)) return [];
      return [
        {
          id: "group.individual-vs-group-mark",
          category: "group",
          severity: "blocker",
          title: "Unclear whether you're marked together or separately",
          why: "This single fact changes how a group should be run. If the mark is shared, the group needs agreement on standards up front. If it's individual, everyone needs their contribution to be visible and attributable.",
          question: "Do we all get the same mark, or is it marked individually? If individual, how do you want contributions recorded?",
        },
      ];
    },
  },
  {
    id: "group.no-conflict-route",
    category: "group",
    describes: "Group work with no stated route if it goes wrong.",
    run: (brief) => {
      if (!mentionsGroup(brief)) return [];
      if (has(brief, [
        "if there are problems", "not contributing", "dispute", "conflict", "concern",
        "raise it", "come to me", "let me know", "difficult\\w*", "issue", "trouble",
        "email me", "contact me", "speak to me", "module admin", "course admin", "get in touch",
      ])) return [];
      return [
        {
          id: "group.no-conflict-route",
          category: "group",
          severity: "friction",
          title: "No route if the group runs into trouble",
          why: "Most groups never need this. The ones that do usually leave it far too late, because nobody knows whether raising it is allowed or who to raise it with.",
          question: "If something isn't working in the group, who should we come to and at what point?",
        },
      ];
    },
  },

  /* — process — */
  {
    id: "process.no-checkpoint",
    category: "process",
    describes: "No milestone or check-in between now and the deadline.",
    run: (brief) => {
      // "outline" and "peer review" are how most briefs actually describe a midpoint;
      // "feedback session"/"formative" are the words the policy documents use. Both matter.
      if (has(brief, [
        "checkpoint", "milestone", "draft", "interim", "progress", "check-in", "check in",
        "formative", "feedback session", "proposal", "outline", "peer review", "peer-review",
        "work in progress", "first version",
      ])) return [];
      return [
        {
          id: "process.no-checkpoint",
          category: "process",
          severity: "friction",
          title: "No checkpoint before the deadline",
          why: "A single far-off deadline means the first real feedback arrives after it's too late to use. One agreed midpoint changes that, and it also gives the work a smaller, closer thing to aim at.",
          question: "Could we check a draft or outline with you partway through? When would suit?",
        },
      ];
    },
  },
  {
    id: "process.no-sources-guidance",
    category: "process",
    describes: "Research expected but no guidance on what counts as a source.",
    run: (brief) => {
      const needsSources = has(brief, ["research", "sources?", "references?", "cite", "citation", "literature", "evidence", "bibliograph\\w+"]);
      if (!needsSources) return [];
      if (has(brief, ["peer-reviewed", "academic sources?", "journal", "referencing style", "harvard", "apa", "mla", "ieee", "chicago", "reference list"])) return [];
      return [
        {
          id: "process.no-sources-guidance",
          category: "process",
          severity: "friction",
          title: "Sources expected, but not what kind",
          why: "Whether a blog post, a textbook or a peer-reviewed paper 'counts' is usually assumed knowledge. So is the referencing style.",
          question: "What kinds of sources count for this, and which referencing style should we use?",
        },
      ];
    },
  },
  /* — instruction: the optional-or-not trap — */
  {
    id: "instruction.maybe-optional",
    category: "instruction",
    describes: "Softened wording where it's unclear if something is required or optional.",
    run: (brief) => {
      const TERMS = [
        "you may wish to", "you might want to", "you may want to", "consider including",
        "you could", "it would be good to", "ideally", "where possible", "if appropriate",
        "feel free to", "you are encouraged to", "it is recommended",
      ];
      const hits = findTerms(brief, TERMS);
      return hits.slice(0, 4).map(({ term, excerpt }) => ({
        id: "instruction.maybe-optional",
        category: "instruction" as const,
        severity: "friction" as const,
        title: `"${term}" — required, or genuinely optional?`,
        excerpt, match: term,
        why: "Politely-worded instructions are one of the most common places marks are quietly lost. Some markers write suggestions this way; others write requirements this way. Read literally, it is optional. Read as most people mean it, it is not.",
        question: `The brief says "${term}" here — is that something we have to do, or genuinely up to us?`,
      }));
    },
  },

  /* — assumed: unexplained acronyms — */
  {
    id: "assumed.acronyms",
    category: "assumed",
    describes: "Acronyms used without being spelled out anywhere in the brief.",
    run: (brief) => {
      const found = new Map<string, string>();
      // Not preceded or followed by a letter OR a digit — otherwise module codes
      // like "PH2032" read as the acronym "PH". A tester hit exactly that.
      const re = /(?<![A-Za-z0-9])([A-Z]{2,6})(?![A-Za-z0-9])/g;
      const COMMON = new Set(["AI","UK","US","USA","EU","UN","PDF","URL","FAQ","OK","TV","CV","ID","IT","AM","PM","PhD","BBC","NHS","CEO","DIY","API"]);
      let m: RegExpExecArray | null;
      while ((m = re.exec(brief))) {
        const a = m[1];
        if (COMMON.has(a) || found.has(a)) continue;
        // Spelled out nearby? e.g. "Life Cycle Assessment (LCA)"
        const around = brief.slice(Math.max(0, m.index - 120), m.index);
        if (new RegExp(a.split("").join("\\w+\\s+"), "i").test(around)) continue;
        found.set(a, sentenceAround(brief, m.index));
      }
      return [...found.entries()].slice(0, 3).map(([a, excerpt]) => ({
        id: "assumed.acronyms",
        category: "assumed" as const,
        severity: "note" as const,
        title: `"${a}" is never spelled out`,
        excerpt, match: a,
        why: "Course shorthand is invisible to whoever wrote it and opaque to anyone who missed the class where it was introduced. Asking is not a sign you are behind.",
        question: `What does "${a}" stand for in this context?`,
      }));
    },
  },

  /* — process: how do I actually hand it in — */
  {
    id: "process.no-submission-method",
    category: "process",
    describes: "No statement of where or how the work is submitted.",
    run: (brief) => {
      if (has(brief, ["submit via", "upload", "hand in to", "turnitin", "moodle", "canvas", "blackboard", "email it", "portal", "submission link", "in person", "hard copy"])) return [];
      return [
        {
          id: "process.no-submission-method",
          category: "process",
          severity: "friction",
          title: "It doesn't say how to hand it in",
          why: "Worth settling early rather than at the deadline. Submission systems have their own quirks — file types, size limits, whether a late click counts.",
          question: "Where do we submit this, and is there a file format you need?",
        },
      ];
    },
  },

  /* — process: what if something goes wrong — */
  {
    id: "process.no-late-policy",
    category: "process",
    describes: "No mention of extensions or what happens if it's late.",
    run: (brief) => {
      if (has(brief, ["extension", "late submission", "late penalt\\w+", "mitigating", "extenuating", "deferral"])) return [];
      return [
        {
          id: "process.no-late-policy",
          category: "process",
          severity: "note",
          title: "Nothing about extensions or lateness",
          why: "Most people never need this. Knowing the route in advance means that if something does go wrong, asking is a step you already know how to take rather than a thing to panic about.",
          question: "If something goes wrong and we need more time, what's the process?",
        },
      ];
    },
  },

  /* — group: how big — */
  {
    id: "group.no-size",
    category: "group",
    describes: "Group work with no stated group size.",
    run: (brief) => {
      if (!mentionsGroup(brief)) return [];
      if (/\bgroups? of\s+(\d+|two|three|four|five|six)\b/i.test(brief)) return [];
      if (/\b(pairs?|in twos)\b/i.test(brief)) return [];
      return [
        {
          id: "group.no-size",
          category: "group",
          severity: "friction",
          title: "Group work, but no group size",
          why: "Group size changes how the work should be split and how much each person carries. It also decides whether you are choosing your own group or being placed in one — which is a much bigger question for some people than it looks.",
          question: "How many people per group, and do we form our own or are they assigned?",
        },
      ];
    },
  },

  /* — assessment: parts without weighting — */
  {
    id: "assessment.no-weighting",
    category: "assessment",
    describes: "Several distinct parts, but no indication of what each is worth.",
    run: (brief) => {
      const partWords = (brief.match(/\b(part|section|component|element|task)\s*(\d+|one|two|three|a|b|c)\b/gi) ?? []).length;
      const listed = (brief.match(/^\s*[-*\u2022]\s+/gm) ?? []).length;
      if (partWords < 2 && listed < 3) return [];
      if (/\b\d{1,3}\s*%/.test(brief) || has(brief, ["weighted", "weighting", "worth"])) return [];
      return [
        {
          id: "assessment.no-weighting",
          category: "assessment",
          severity: "friction",
          title: "Several parts, no sense of what each is worth",
          why: "Without weightings the only safe approach is to treat every part as equally important, which is rarely true and is the most expensive way to spend your time.",
          question: "How are the marks split across the different parts?",
        },
      ];
    },
  },
];

export function runChecks(brief: string): { findings: import("./types").Finding[]; checksRun: number } {
  const findings: Finding[] = [];
  for (const check of CHECKS) {
    try {
      findings.push(...check.run(brief));
    } catch {
      // A broken check must never take down the page. Skip it silently and keep going.
    }
  }
  const order = { blocker: 0, friction: 1, note: 2 } as const;
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return { findings, checksRun: CHECKS.length };
}
