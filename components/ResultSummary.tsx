"use client";

import type { Finding, Severity } from "@/lib/types";

/**
 * The three counts, as filters.
 *
 * A tester put it exactly right: *"'Done. 23 things worth asking about.' That's
 * not relief, that's a new task with 23 subtasks."* The results page was fourteen
 * phone screens long, and the three big numbers at the top were decoration —
 * you could read them but not press them.
 *
 * So they are buttons now, and the page opens showing only what blocks starting.
 * The rest is a choice you make, not a wall you are handed.
 */
export function ResultSummary({
  findings,
  active,
  onChange,
}: {
  findings: Finding[];
  active: Severity | "all";
  onChange: (s: Severity | "all") => void;
}) {
  const counts = { blocker: 0, friction: 0, note: 0 };
  findings.forEach((f) => counts[f.severity]++);

  const cells: { sev: Severity; label: string; sub: string }[] = [
    { sev: "blocker", label: "Blocks starting", sub: "Worth an answer before you begin" },
    { sev: "friction", label: "Slows you down", sub: "Costs time later if unasked" },
    { sev: "note", label: "Worth checking", sub: "Small, easy to ask while you're there" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Filter findings">
        {cells.map((c) => {
          const on = active === c.sev;
          return (
            <button
              key={c.sev}
              type="button"
              onClick={() => onChange(on ? "all" : c.sev)}
              aria-pressed={on}
              disabled={counts[c.sev] === 0}
              className={`sev-${c.sev} rounded-xl p-4 border text-left w-full disabled:opacity-45 disabled:cursor-not-allowed`}
              style={{
                borderColor: "currentColor",
                borderWidth: on ? 3 : 1,
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tabular-nums leading-none">
                  {counts[c.sev]}
                </span>
                <span className="font-semibold">{c.label}</span>
              </div>
              <p className="text-sm mt-1.5 opacity-90">{c.sub}</p>
              <p className="text-sm mt-2 font-semibold underline underline-offset-4">
                {counts[c.sev] === 0 ? "None" : on ? "Showing these — tap to show all" : "Show only these"}
              </p>
            </button>
          );
        })}
      </div>

      {active !== "all" && (
        <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
          Showing {counts[active]} of {findings.length}.{" "}
          <button
            type="button"
            className="underline font-medium"
            style={{ color: "var(--text)" }}
            onClick={() => onChange("all")}
          >
            Show all {findings.length}
          </button>
        </p>
      )}
    </div>
  );
}
