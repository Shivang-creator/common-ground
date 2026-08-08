import { describe, it, expect } from "vitest";
import { runChecks } from "../lib/checks";

/**
 * Regression tests from real user testing, 8 August 2026.
 *
 * A neurodivergent tester ran Common Ground against a fully-specified brief of
 * their own and found that **three of the four findings it returned were wrong** —
 * it told them their brief was missing things the brief plainly stated.
 *
 * In their words: *"Sending my tutor a question they already answered in writing
 * is precisely the humiliation this tool exists to prevent."*
 *
 * That is the worst failure this tool can have, so every case they reported is
 * pinned here. If any of these regress, the build fails.
 */

/** The tester's own brief, reconstructed from the cases they quoted. */
const TESTER_BRIEF = `Assessment 2 — PH2032 Individual report

Write a 2,000 word report analysing one urban transport policy of your choice.
Submit it as a PDF via Moodle by 5pm on 14 March 2027.

Marking criteria (rubric available on Moodle):
- Argument and structure, worth 40%
- Use of evidence, worth 30%
- Critical engagement, worth 20%
- Referencing and presentation, worth 10%

Use a minimum of 8 peer-reviewed academic sources. Use Harvard referencing.

Bring a one page outline to the seminar in week 6 for feedback.

Extensions follow the standard university policy.

If your group runs into difficulties, email me or the module admin.`;

describe("tester-reported false positives — 8 Aug 2026", () => {
  const ids = runChecks(TESTER_BRIEF).findings.map((f) => f.id);

  it('does not claim there is no extensions policy when the brief says "Extensions follow the standard university policy"', () => {
    // Root cause: the word matcher required an exact boundary after the term, so
    // "Extensions" never matched "extension". Plurals are now tolerated.
    expect(ids).not.toContain("process.no-late-policy");
  });

  it('does not claim there is no conflict route when the brief says "email me or the module admin"', () => {
    // Root cause: the term list had "dispute" and "conflict" but not the words
    // briefs actually use — "difficulties", "email me", "module admin".
    expect(ids).not.toContain("group.no-conflict-route");
  });

  it('does not read the module code "PH2032" as an unexplained acronym', () => {
    // Root cause: the acronym pattern excluded adjacent letters but not digits.
    const acronyms = runChecks(TESTER_BRIEF).findings.filter((f) => f.id === "assumed.acronyms");
    expect(acronyms.map((f) => f.title).join(" ")).not.toContain("PH");
  });

  it("stays quiet overall on a well-specified brief", () => {
    const blockers = runChecks(TESTER_BRIEF).findings.filter((f) => f.severity === "blocker");
    expect(blockers).toHaveLength(0);
  });
});

describe("tester-reported harmful questions", () => {
  /**
   * *"'Relevant literature' is not a quantity. If I send that, I look like I can't
   * read English. Your whole pitch is asking this won't make you look stupid —
   * and these are the ones that would."*
   */
  it('never asks for a number when the word is a standard, not an amount', () => {
    const brief =
      "Write a report using relevant literature and appropriate sources. Discuss the topic.";
    const findings = runChecks(brief).findings;
    for (const f of findings) {
      if (/relevant|appropriate|suitable|adequate|sufficient/i.test(f.title)) {
        expect(f.question, `asked for a number about "${f.title}"`).not.toMatch(
          /how many|a number|rough number|minimum/i,
        );
      }
    }
  });

  it('asks what the standard is instead', () => {
    const brief = "Use relevant literature to support your argument in a 1000 word essay.";
    const f = runChecks(brief).findings.find((x) => x.id === "quantity.standard-unstated");
    expect(f).toBeDefined();
    expect(f!.question).toMatch(/what would make something/i);
  });
});

describe("tester-reported unsendable output", () => {
  /**
   * *"I pressed Copy all questions — the output is seven copies of the same
   * question with one word swapped. Nobody sends that email. Your flagship action
   * produces an unsendable artifact."*
   */
  it("returns one finding for instruction verbs, however many appear", () => {
    const brief = `Critically analyse the topic. Explore the context and engage with the
      literature. Discuss the findings, reflect on the implications, consider the
      alternatives, and analyse the outcome. Write 2000 words as a PDF by 1 May 2027,
      marked against the rubric on Moodle.`;
    const verbFindings = runChecks(brief).findings.filter((f) => f.id === "instruction.vague-verb");
    expect(verbFindings).toHaveLength(1);
  });

  it("names every verb it found in that single finding", () => {
    const brief = "Critically analyse and explore the topic. Discuss your findings.";
    const f = runChecks(brief).findings.find((x) => x.id === "instruction.vague-verb")!;
    const blob = `${f.title} ${f.question}`.toLowerCase();
    expect(blob).toContain("explore");
    expect(blob).toContain("discuss");
  });

  it("produces a copy-all output with no duplicated questions", () => {
    const brief = `Critically analyse and explore the topic, engage with the literature,
      discuss and reflect on the findings. Use relevant sources.`;
    const questions = runChecks(brief).findings.map((f) => f.question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
