"use client";

import { buildTimeline, daysBetween, type Milestone } from "@/lib/dates";
import { asWords } from "@/lib/arithmetic";

/**
 * The deadline as a line rather than a set of digits.
 *
 * Built to a dyscalculic tester's specification: *"Deadline at one end, now at the
 * other, the checkpoint in between. Dates as a line rather than digits is the single
 * most useful translation you could do for me."* Combined with an ADHD tester's
 * *"deadline in, backwards plan out."*
 *
 * Static. No animation, no countdown ticking, and deliberately no pressure language —
 * "eleven days" is a fact; "only eleven days left!" is a threat.
 */
const KIND_LABEL: Record<Milestone["kind"], string> = {
  now: "Today",
  checkpoint: "From the brief",
  deadline: "Deadline",
  suggested: "Suggested",
};

export function Timeline({ brief }: { brief: string }) {
  const milestones = buildTimeline(brief);
  if (milestones.length < 2) return null;

  const now = milestones[0].date;
  const end = milestones[milestones.length - 1].date;
  const span = Math.max(1, daysBetween(now, end));
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <section aria-labelledby="time-h" className="card p-5 sm:p-6">
      <h2 id="time-h" className="text-xl font-semibold">
        Between now and the deadline
      </h2>
      <p className="text-sm mt-1 mb-5 measure" style={{ color: "var(--text-muted)" }}>
        {span <= 12 ? asWords(span) : span} days. The dates in the brief are marked as such;
        the rest are suggestions to give the time a shape, and you can ignore them.
      </p>

      {/* The line. Decorative — everything on it is also in the list below. */}
      <div className="relative mb-6 mt-2" aria-hidden="true">
        <div className="h-1 rounded-full" style={{ background: "var(--border)" }} />
        {milestones.map((m, i) => {
          const pct = (daysBetween(now, m.date) / span) * 100;
          const solid = m.kind === "deadline" || m.kind === "now" || m.kind === "checkpoint";
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: `${Math.min(98, Math.max(0, pct))}%`, top: -5 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: m.kind === "deadline" ? 15 : 11,
                  height: m.kind === "deadline" ? 15 : 11,
                  background: solid ? "var(--accent)" : "var(--surface)",
                  border: `2px solid var(--accent)`,
                  marginLeft: -6,
                }}
              />
            </div>
          );
        })}
      </div>

      <ol className="space-y-3">
        {milestones.map((m, i) => {
          const away = daysBetween(now, m.date);
          return (
            <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: m.kind === "suggested" ? "var(--surface-2)" : "var(--accent-soft)",
                  color: m.kind === "suggested" ? "var(--text-muted)" : "var(--accent)",
                }}
              >
                {KIND_LABEL[m.kind]}
              </span>
              <span className="font-medium">{m.label}</span>
              <span style={{ color: "var(--text)" }}>{fmt(m.date)}</span>
              {m.kind !== "now" && (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {away === 0 ? "today" : away === 1 ? "tomorrow" : `in ${away <= 12 ? asWords(away) : away} days`}
                </span>
              )}
              {m.note && (
                <span className="text-sm w-full" style={{ color: "var(--text-muted)" }}>
                  {m.note}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
