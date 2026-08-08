"use client";

import type { Finding } from "@/lib/types";

/**
 * The visual summary at the top of a result.
 *
 * The old results page opened with a paragraph. People who are already
 * overwhelmed by a brief do not want to be handed more prose about how
 * overwhelming it is — they want to see the shape of it at a glance and then
 * choose what to read.
 *
 * So: three counts, sized and coloured, with the severity word always present.
 * Still no animation. Still no score, no grade, no judgement of the reader.
 */
export function ResultSummary({ findings }: { findings: Finding[] }) {
  const counts = { blocker: 0, friction: 0, note: 0 };
  findings.forEach((f) => counts[f.severity]++);

  const cells = [
    {
      n: counts.blocker,
      sev: "blocker" as const,
      label: "Blocks starting",
      sub: "You'd want an answer before you begin",
    },
    {
      n: counts.friction,
      sev: "friction" as const,
      label: "Slows you down",
      sub: "Costs you time later if unasked",
    },
    {
      n: counts.note,
      sev: "note" as const,
      label: "Worth checking",
      sub: "Small, but easy to ask while you're there",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cells.map((c) => (
        <div
          key={c.sev}
          className={`sev-${c.sev} rounded-xl p-4 border`}
          style={{ borderColor: "currentColor" }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums leading-none">{c.n}</span>
            <span className="font-semibold">{c.label}</span>
          </div>
          <p className="text-sm mt-1.5 opacity-90">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
