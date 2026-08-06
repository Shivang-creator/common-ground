import { describe, it, expect } from "vitest";
import { parseInterpretation } from "../lib/llm";

/**
 * Models return JSON wrapped in prose, in code fences, with trailing commentary,
 * or not at all. The parser has to be tolerant of all of that and strict about
 * what it lets through — because anything that gets past here is shown to a
 * student as a statement about their assignment.
 */

describe("tolerant extraction", () => {
  it("reads plain JSON", () => {
    const r = parseInterpretation('{"summary":"Write a report."}');
    expect(r.summary).toBe("Write a report.");
  });

  it("reads JSON inside a fenced code block", () => {
    const r = parseInterpretation('```json\n{"summary":"Write a report."}\n```');
    expect(r.summary).toBe("Write a report.");
  });

  it("reads JSON inside an unlabelled fence", () => {
    const r = parseInterpretation('```\n{"summary":"Write a report."}\n```');
    expect(r.summary).toBe("Write a report.");
  });

  it("reads JSON surrounded by chat", () => {
    const r = parseInterpretation(
      'Sure! Here is the breakdown:\n{"summary":"Write a report."}\nHope that helps.',
    );
    expect(r.summary).toBe("Write a report.");
  });

  it("throws rather than guessing when there is no JSON", () => {
    expect(() => parseInterpretation("I could not read that brief, sorry.")).toThrow();
  });

  it("throws on malformed JSON rather than returning something half-parsed", () => {
    expect(() => parseInterpretation('{"summary": "unterminated')).toThrow();
  });
});

describe("strict about what gets through", () => {
  it("drops non-string entries from string arrays", () => {
    const r = parseInterpretation(
      '{"definitionOfDone":["Real item", 42, null, {"a":1}, "Another real item"]}',
    );
    expect(r.definitionOfDone).toEqual(["Real item", "Another real item"]);
  });

  it("drops empty and whitespace-only strings", () => {
    const r = parseInterpretation('{"deliverables":["A report", "", "   ", "Slides"]}');
    expect(r.deliverables).toEqual(["A report", "Slides"]);
  });

  it("returns undefined rather than an empty array", () => {
    const r = parseInterpretation('{"definitionOfDone":[], "deliverables":["  "]}');
    expect(r.definitionOfDone).toBeUndefined();
    expect(r.deliverables).toBeUndefined();
  });

  it("caps list lengths so one bad response cannot flood the page", () => {
    const many = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
    const r = parseInterpretation(JSON.stringify({ definitionOfDone: many, deliverables: many }));
    expect(r.definitionOfDone!.length).toBeLessThanOrEqual(7);
    expect(r.deliverables!.length).toBeLessThanOrEqual(6);
  });

  it("drops workstreams without a name", () => {
    const r = parseInterpretation(
      '{"workstreams":[{"name":"Research","description":"Find sources"},{"description":"no name"},{"name":123}]}',
    );
    expect(r.workstreams).toHaveLength(1);
    expect(r.workstreams![0].name).toBe("Research");
  });

  it("tolerates a workstream with no description", () => {
    const r = parseInterpretation('{"workstreams":[{"name":"Research"}]}');
    expect(r.workstreams![0].description).toBe("");
  });

  it("truncates an over-long summary instead of rendering it whole", () => {
    const r = parseInterpretation(JSON.stringify({ summary: "x".repeat(5000) }));
    expect(r.summary!.length).toBeLessThanOrEqual(400);
  });

  it("returns an object with everything undefined for an empty JSON object", () => {
    const r = parseInterpretation("{}");
    expect(r.summary).toBeUndefined();
    expect(r.definitionOfDone).toBeUndefined();
    expect(r.deliverables).toBeUndefined();
    expect(r.workstreams).toBeUndefined();
  });
});
