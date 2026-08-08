import { describe, it, expect } from "vitest";
import { readArithmetic, effortSentence, asWords } from "../lib/arithmetic";

/**
 * From a dyscalculic tester, 8 August 2026:
 *
 *   *"When a brief says '3000 words across four sections', tell me that's 750 each,
 *   because I will get that wrong and I will not notice."*
 *
 * "I will not notice" is why every case here is pinned. A wrong division presented
 * confidently is worse than no division at all.
 */

describe("words per section", () => {
  it("divides a total across sections written as a word", () => {
    const a = readArithmetic("Your report should be 3000 words across four sections.");
    expect(a.perSection).toEqual({ total: 3000, sections: 4, each: 750, unit: "words" });
  });

  it("divides when the count is a numeral and the total has a comma", () => {
    const a = readArithmetic("Write 2,400 words split across 3 parts.");
    expect(a.perSection?.each).toBe(800);
  });

  it("handles pages and slides too", () => {
    expect(readArithmetic("A 12 page report in three sections.").perSection?.each).toBe(4);
    expect(readArithmetic("Prepare 20 slides across four parts.").perSection?.each).toBe(5);
  });

  it("says nothing when there is nothing to divide", () => {
    expect(readArithmetic("Write a 2000 word essay.").perSection).toBeUndefined();
    expect(readArithmetic("Write 3000 words across one section.").perSection).toBeUndefined();
  });
});

describe("marks as effort", () => {
  const a = readArithmetic(
    "Marks: analysis is 40%, use of evidence 30%, structure 20% and presentation 10%.",
  );

  it("reads every weighting with its label", () => {
    expect(a.effort).toHaveLength(4);
    expect(a.effort![0]).toMatchObject({ percent: 40 });
    expect(a.effort!.map((e) => e.percent)).toEqual([40, 30, 20, 10]);
  });

  it("totals them so a brief that does not add to 100 is visible", () => {
    expect(a.weightTotal).toBe(100);
    const broken = readArithmetic("Analysis 50%, evidence 30%, structure 10%.");
    expect(broken.weightTotal).toBe(90);
  });

  it("needs at least two weightings before claiming a breakdown", () => {
    expect(readArithmetic("This is worth 20% of the module.").effort).toBeUndefined();
  });

  it("converts a share of the marks into a share of the days", () => {
    expect(effortSentence(40, 5)).toContain("two");
    expect(effortSentence(10, 5)).toMatch(/half a day|one day/);
    expect(effortSentence(100, 5)).toContain("five");
  });
});

describe("small numbers read as words", () => {
  it("spells out the small ones and leaves the rest alone", () => {
    expect(asWords(4)).toBe("four");
    expect(asWords(10)).toBe("ten");
    expect(asWords(750)).toBe("750");
  });
});

describe("robustness", () => {
  for (const [name, brief] of [
    ["empty", ""],
    ["no numbers", "Write an essay about policy."],
    ["absurd section count", "Write 3000 words across 400 sections."],
    ["percentages over 100", "Analysis 150%, evidence 200%."],
    ["unicode", "3000 词 across four sections"],
  ] as const) {
    it(`survives ${name}`, () => {
      expect(() => readArithmetic(brief)).not.toThrow();
    });
  }

  it("ignores a section count too large to be real", () => {
    expect(readArithmetic("Write 3000 words across 400 sections.").perSection).toBeUndefined();
  });
});
