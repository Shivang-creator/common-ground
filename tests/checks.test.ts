import { describe, it, expect } from "vitest";
import { CHECKS, runChecks } from "../lib/checks";
import { SAMPLE_BRIEF } from "../lib/sample";

/**
 * The most important test in this file is "a complete brief stays quiet".
 *
 * A checker that flags something on every input is worse than no checker: it
 * trains people to ignore it, and it tells a student their perfectly clear
 * assignment is full of problems. Crying wolf is the specific failure mode
 * this suite exists to catch.
 */

/** A brief that genuinely answers everything the checks look for. */
const COMPLETE_BRIEF = `Assessment 2 — Individual report

Write a 2,000 word report analysing one urban transport policy of your choice.
Submit it as a PDF via Moodle by 5pm on 14 March 2027.

Marking criteria (rubric on Moodle):
- Argument and structure, worth 40%
- Use of evidence, worth 30%
- Critical engagement with counter-arguments, worth 20%
- Referencing and presentation, worth 10%

When we say "critically engage", we mean: identify at least two positions in the
literature that disagree, explain why they disagree, and state which you find more
convincing and on what grounds.

Use a minimum of 8 peer-reviewed academic sources. Use Harvard referencing.

Bring a one page outline to the seminar in week 6 for feedback. This is not marked
but you will get written comments back within a week.

If you need an extension, email me before the deadline and we will sort it out.`;

describe("crying wolf", () => {
  it("stays almost silent on a brief that answers everything", () => {
    const { findings } = runChecks(COMPLETE_BRIEF);
    const blockers = findings.filter((f) => f.severity === "blocker");
    // Zero blockers is the bar. A complete brief must never be told it is unstartable.
    expect(blockers).toHaveLength(0);
    // A little noise is acceptable; a wall of it is not.
    expect(findings.length).toBeLessThanOrEqual(4);
  });

  it("does not flag missing length, format, deadline or criteria when they are present", () => {
    const ids = new Set(runChecks(COMPLETE_BRIEF).findings.map((f) => f.id));
    expect(ids.has("finish-line.no-length")).toBe(false);
    expect(ids.has("finish-line.no-format")).toBe(false);
    expect(ids.has("finish-line.no-deadline")).toBe(false);
    expect(ids.has("assessment.no-criteria")).toBe(false);
    expect(ids.has("process.no-checkpoint")).toBe(false);
    expect(ids.has("process.no-sources-guidance")).toBe(false);
    expect(ids.has("process.no-submission-method")).toBe(false);
    expect(ids.has("process.no-late-policy")).toBe(false);
  });

  it("treats a list of percentage weightings as marking criteria", () => {
    // A brief can give a full marking breakdown without ever saying "criteria".
    const brief = "Write a 1500 word report. Analysis 40%, evidence 40%, structure 20%.";
    expect(runChecks(brief).findings.map((f) => f.id)).not.toContain("assessment.no-criteria");
  });

  it("does not raise group findings on an individual assignment", () => {
    const findings = runChecks(COMPLETE_BRIEF).findings;
    expect(findings.filter((f) => f.category === "group")).toHaveLength(0);
  });
});

describe("finding the gaps that are actually there", () => {
  const { findings } = runChecks(SAMPLE_BRIEF);
  const ids = findings.map((f) => f.id);

  it("flags the blockers in the example brief", () => {
    // The example brief now states a word count, a format and a marking split, so
    // those checks correctly stay silent. What remains is what it genuinely omits:
    // who does what, and whether the mark is shared.
    for (const id of ["group.no-roles", "group.individual-vs-group-mark"]) {
      expect(ids, `expected ${id}`).toContain(id);
    }
  });

  it("orders blockers before friction before notes", () => {
    const rank = { blocker: 0, friction: 1, note: 2 } as const;
    const seq = findings.map((f) => rank[f.severity]);
    expect(seq).toEqual([...seq].sort((a, b) => a - b));
  });

  it("gives every finding a question that could be sent to a teacher", () => {
    for (const f of findings) {
      expect(f.question.length).toBeGreaterThan(15);
      expect(f.why.length).toBeGreaterThan(20);
      expect(f.title.length).toBeGreaterThan(3);
    }
  });
});

describe("group checks only fire on group work", () => {
  it("stays silent when the brief never mentions a group", () => {
    const solo = "Write a short reflection on your reading. Hand it in when you can.";
    expect(runChecks(solo).findings.filter((f) => f.category === "group")).toHaveLength(0);
  });

  it("fires when it does", () => {
    const grp = "Work in teams to produce something. Hand it in when you can.";
    expect(runChecks(grp).findings.filter((f) => f.category === "group").length).toBeGreaterThan(0);
  });

  it("does not ask for a group size when the brief gives one", () => {
    const sized = "Work in groups of four on this task.";
    expect(runChecks(sized).findings.map((f) => f.id)).not.toContain("group.no-size");
  });
});

describe("word matching is not naive substring matching", () => {
  it("does not match an instruction verb inside a longer word", () => {
    // "discussion" and "considerable" must not trigger "discuss" / "consider".
    const brief = "Submit a 500 word discussion. There is considerable reading.";
    const verbs = runChecks(brief).findings.filter((f) => f.id === "instruction.vague-verb");
    expect(verbs).toHaveLength(0);
  });

  it("skips acronyms that the brief itself spells out", () => {
    const brief =
      "Produce a 1,500 word report as a PDF. Apply Life Cycle Assessment (LCA) to your chosen product. Submit via Moodle by 3 May 2027. Marking criteria are on the module page. Use Harvard referencing with peer-reviewed sources. Bring a draft in week 5. Email me for an extension.";
    const acr = runChecks(brief).findings.filter((f) => f.id === "assumed.acronyms");
    expect(acr.map((f) => f.title).join(" ")).not.toContain("LCA");
  });
});

describe("robustness", () => {
  const nasty: [string, string][] = [
    ["empty", ""],
    ["whitespace", "   \n\n\t  "],
    ["single word", "Essay"],
    ["punctuation only", "!!! ??? ... ---"],
    ["very long", "Write an essay about policy. ".repeat(2000)],
    ["unicode", "书面报告 — critically analyse 政策 🎓 ✏️"],
    ["regex metacharacters", "Discuss (a|b) [x]{2} $^ \\d+ *? this."],
    ["html", "<script>alert(1)</script><p>Discuss the topic</p>"],
    ["newline soup", "\n".repeat(500) + "Discuss this" + "\n".repeat(500)],
  ];

  for (const [name, brief] of nasty) {
    it(`survives ${name}`, () => {
      expect(() => runChecks(brief)).not.toThrow();
      const { findings } = runChecks(brief);
      expect(Array.isArray(findings)).toBe(true);
      for (const f of findings) {
        expect(typeof f.question).toBe("string");
        expect(typeof f.why).toBe("string");
      }
    });
  }

  it("reports how many checks ran", () => {
    expect(runChecks("anything at all here").checksRun).toBe(CHECKS.length);
  });

  it("keeps excerpts short enough to read", () => {
    const { findings } = runChecks(SAMPLE_BRIEF);
    for (const f of findings) {
      if (f.excerpt) expect(f.excerpt.length).toBeLessThan(400);
    }
  });
});

describe("check registry integrity", () => {
  it("has no duplicate check ids", () => {
    const ids = CHECKS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every check a human description for the /checks page", () => {
    for (const c of CHECKS) {
      expect(c.describes.length).toBeGreaterThan(10);
    }
  });

  it("never emits clinical or diagnostic language", () => {
    // This tool describes documents. It must never describe a reader.
    const banned = [
      "autistic", "autism", "adhd", "dyslexi", "neurodiverg", "disorder",
      "diagnos", "symptom", "deficit", "impair", "condition", "disabilit",
    ];
    const briefs = [SAMPLE_BRIEF, COMPLETE_BRIEF, "Work in groups. Discuss it."];
    for (const b of briefs) {
      for (const f of runChecks(b).findings) {
        const blob = `${f.title} ${f.why} ${f.question}`.toLowerCase();
        for (const word of banned) {
          expect(blob, `"${word}" leaked into: ${f.id}`).not.toContain(word);
        }
      }
    }
  });
});
