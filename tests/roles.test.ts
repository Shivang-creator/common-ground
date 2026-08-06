import { describe, it, expect } from "vitest";
import { allocate } from "../lib/roles";
import type { MemberPrefs } from "../lib/types";

const member = (name: string, wants: string[], extra: Partial<MemberPrefs> = {}): MemberPrefs => ({
  id: name.toLowerCase(),
  name,
  wants,
  contribute: "either",
  notice: "a-day",
  feedback: "direct",
  ...extra,
});

const STREAMS = ["Research", "Analysis", "Writing", "Slides"];

describe("allocation is deterministic", () => {
  it("gives the same answer every time for the same input", () => {
    const members = [
      member("Ana", ["Writing", "Research"]),
      member("Ben", ["Research", "Analysis"]),
      member("Cal", ["Analysis", "Slides"]),
    ];
    const first = JSON.stringify(allocate(members, STREAMS).roles);
    for (let i = 0; i < 20; i++) {
      expect(JSON.stringify(allocate(members, STREAMS).roles)).toBe(first);
    }
  });

  it("does not depend on the order members were entered", () => {
    const a = member("Ana", ["Writing"]);
    const b = member("Ben", ["Research"]);
    const c = member("Cal", ["Analysis"]);
    const one = allocate([a, b, c], STREAMS).roles;
    const two = allocate([c, a, b], STREAMS).roles;
    const key = (rs: typeof one) =>
      rs.map((r) => `${r.memberName}:${r.workstream}`).sort().join("|");
    expect(key(one)).toBe(key(two));
  });
});

describe("allocation respects what people asked for", () => {
  it("gives everyone their first choice when there is no conflict", () => {
    const members = [
      member("Ana", ["Writing"]),
      member("Ben", ["Research"]),
      member("Cal", ["Slides"]),
    ];
    const { roles } = allocate(members, STREAMS);
    expect(roles.find((r) => r.memberName === "Ana")?.workstream).toBe("Writing");
    expect(roles.find((r) => r.memberName === "Ben")?.workstream).toBe("Research");
    expect(roles.find((r) => r.memberName === "Cal")?.workstream).toBe("Slides");
    for (const r of roles) expect(r.rationale).toBe("You listed this first.");
  });

  it("never assigns a workstream nobody asked for", () => {
    const members = [member("Ana", ["Writing"]), member("Ben", ["Research"])];
    const { roles } = allocate(members, STREAMS);
    for (const r of roles) {
      const m = members.find((x) => x.name === r.memberName)!;
      expect(m.wants).toContain(r.workstream);
    }
  });

  it("never gives one workstream to two people", () => {
    const members = [
      member("Ana", ["Research", "Writing"]),
      member("Ben", ["Research", "Writing"]),
      member("Cal", ["Research", "Analysis"]),
    ];
    const { roles } = allocate(members, STREAMS);
    const streams = roles.map((r) => r.workstream);
    expect(new Set(streams).size).toBe(streams.length);
  });

  it("explains a second choice by naming that an earlier one was taken", () => {
    const members = [
      member("Ana", ["Research", "Writing"]),
      member("Ben", ["Research", "Analysis"]),
    ];
    const { roles } = allocate(members, STREAMS);
    const second = roles.find((r) => r.rationale !== "You listed this first.");
    expect(second?.rationale).toMatch(/choice 2/);
  });

  it("surfaces unclaimed streams and unassigned people rather than dropping them", () => {
    const members = [member("Ana", ["Writing"]), member("Ben", ["Writing"])];
    const { agreement } = allocate(members, STREAMS);
    expect(agreement.unclaimed).toContain("Research");
    expect(agreement.unassigned).toContain("Ben");
  });
});

describe("the working agreement accommodates the widest need, unattributed", () => {
  it("takes the longest notice anyone asked for", () => {
    const members = [
      member("Ana", ["Writing"], { notice: "same-day" }),
      member("Ben", ["Research"], { notice: "several-days" }),
    ];
    const { agreement } = allocate(members, STREAMS);
    const notice = agreement.statements.find((s) => s.text.includes("Meetings"));
    expect(notice?.text).toMatch(/several days ahead/);
  });

  it("never names who needed the accommodation", () => {
    const members = [
      member("Ana", ["Writing"], { notice: "same-day", contribute: "speaking" }),
      member("Ben", ["Research"], { notice: "several-days", contribute: "writing" }),
    ];
    const { agreement } = allocate(members, STREAMS);
    const notice = agreement.statements.find((s) => s.text.includes("Meetings"))!;
    const written = agreement.statements.find((s) => s.text.includes("written"))!;
    // The accommodating statements must not attribute themselves to a person.
    for (const s of [notice, written]) {
      expect(s.text).not.toContain("Ben");
      expect(s.text).not.toContain("Ana");
    }
  });

  it("always guarantees a written path, even when everyone says they'll speak", () => {
    const members = [
      member("Ana", ["Writing"], { contribute: "speaking" }),
      member("Ben", ["Research"], { contribute: "speaking" }),
    ];
    const { agreement } = allocate(members, STREAMS);
    const written = agreement.statements.find((s) => s.text.includes("written"));
    expect(written).toBeDefined();
    expect(written!.because).toMatch(/costs nothing/);
  });

  it("always states that decisions must be written down", () => {
    const { agreement } = allocate([member("Ana", ["Writing"])], STREAMS);
    expect(agreement.statements.some((s) => s.text.includes("written down"))).toBe(true);
  });

  it("only reports notes people volunteered, and says so", () => {
    const members = [
      member("Ana", ["Writing"], { note: "slower to reply in the evenings" }),
      member("Ben", ["Research"]),
    ];
    const { agreement } = allocate(members, STREAMS);
    const notes = agreement.statements.find((s) => s.text.includes("slower to reply"));
    expect(notes).toBeDefined();
    expect(notes!.because).toMatch(/Nothing here was inferred/);
  });
});

describe("robustness", () => {
  it("handles a member who wants nothing", () => {
    const members = [member("Ana", []), member("Ben", ["Research"])];
    expect(() => allocate(members, STREAMS)).not.toThrow();
    const { roles, agreement } = allocate(members, STREAMS);
    expect(roles.find((r) => r.memberName === "Ana")).toBeUndefined();
    expect(agreement.unassigned).toContain("Ana");
  });

  it("handles wants that are not in the stream list", () => {
    const members = [member("Ana", ["Something else entirely"])];
    const { roles, agreement } = allocate(members, STREAMS);
    expect(roles).toHaveLength(0);
    expect(agreement.unassigned).toContain("Ana");
  });

  it("handles no members and no streams", () => {
    expect(() => allocate([], [])).not.toThrow();
    expect(allocate([], []).roles).toHaveLength(0);
  });

  it("terminates with more people than streams", () => {
    const members = Array.from({ length: 12 }, (_, i) => member(`P${i}`, ["Research", "Writing"]));
    const { roles } = allocate(members, ["Research", "Writing"]);
    expect(roles).toHaveLength(2);
  });

  it("gives every role a stated definition of done", () => {
    const members = [member("Ana", ["Writing"]), member("Ben", ["Research"])];
    for (const r of allocate(members, STREAMS).roles) {
      expect(r.done.length).toBeGreaterThan(10);
      expect(r.rationale.length).toBeGreaterThan(10);
    }
  });
});
