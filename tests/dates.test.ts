import { describe, it, expect } from "vitest";
import { findDates, buildTimeline, daysBetween } from "../lib/dates";

const NOW = new Date(2026, 10, 20); // 20 Nov 2026

describe("finding real dates in a brief", () => {
  it("reads day-month-year", () => {
    const d = findDates("Submit by 14 December 2026.", NOW);
    expect(d[0].date.getMonth()).toBe(11);
    expect(d[0].date.getDate()).toBe(14);
  });

  it("reads month-day", () => {
    const d = findDates("Due December 14.", NOW);
    expect(d[0].date.getDate()).toBe(14);
  });

  it("reads numeric dates day-first", () => {
    // "14/12/2026" is 14 December where these briefs are written, not 12 February.
    const d = findDates("Deadline 14/12/2026.", NOW);
    expect(d[0].date.getDate()).toBe(14);
    expect(d[0].date.getMonth()).toBe(11);
  });

  it("ignores dates absurdly far out — almost always a misparse", () => {
    expect(findDates("Reference the 1998 paper and the 2050 projection.", NOW)).toHaveLength(0);
  });

  it("finds nothing when there is nothing", () => {
    expect(findDates("Write an essay about policy.", NOW)).toHaveLength(0);
  });
});

describe("the backwards plan", () => {
  const line = buildTimeline("Submit by 14 December. Bring an outline in week 6.", NOW);

  it("starts today and ends at the deadline", () => {
    expect(line[0].kind).toBe("now");
    expect(line[line.length - 1].kind).toBe("deadline");
  });

  it("keeps everything in date order", () => {
    const t = line.map((m) => m.date.getTime());
    expect(t).toEqual([...t].sort((a, b) => a - b));
  });

  it("puts asking questions first, since answers take days to arrive", () => {
    const ask = line.find((m) => m.label.startsWith("Ask"))!;
    const draft = line.find((m) => m.label.startsWith("First full draft"))!;
    expect(ask.date.getTime()).toBeLessThan(draft.date.getTime());
  });

  it("labels invented dates as suggestions and real ones as from the brief", () => {
    for (const m of line) {
      if (m.kind === "suggested") expect(m.note).toMatch(/suggested|Leaves time/i);
      if (m.kind === "deadline") expect(m.note).toMatch(/The brief says/);
    }
  });

  it("stays silent when the brief has no date at all", () => {
    expect(buildTimeline("Write an essay. Hand it in when you can.", NOW)).toHaveLength(0);
  });

  it("does not invent a plan when there is no room for one", () => {
    const tight = buildTimeline("Submit by 22 November.", NOW);
    expect(tight.some((m) => m.kind === "suggested")).toBe(false);
    expect(tight[tight.length - 1].kind).toBe("deadline");
  });

  it("ignores dates that have already passed", () => {
    const line2 = buildTimeline("Set on 1 October. Submit by 14 December.", NOW);
    expect(line2.every((m) => daysBetween(NOW, m.date) >= 0)).toBe(true);
  });
});

describe("robustness", () => {
  for (const [name, brief] of [
    ["empty", ""],
    ["nonsense date", "Submit by 99 Smarch 3000."],
    ["out of range", "Due on 45/45/2026."],
    ["unicode", "提交 by 14 December."],
  ] as const) {
    it(`survives ${name}`, () => {
      expect(() => buildTimeline(brief, NOW)).not.toThrow();
    });
  }
});
