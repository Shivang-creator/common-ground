"use client";

import { useState } from "react";
import { readArithmetic, effortSentence, asWords } from "@/lib/arithmetic";

/**
 * The division nobody writes down.
 *
 * Built entirely from a dyscalculic tester's description of the gap and their own
 * proposed fix. Every figure is computed from the brief — nothing is invented, and
 * the one number the reader supplies (how many working days they have) is theirs to
 * set, because only they know it.
 */
export function Arithmetic({ brief }: { brief: string }) {
  const a = readArithmetic(brief);
  const [days, setDays] = useState(5);

  if (!a.perSection && !a.effort) return null;

  return (
    <section aria-labelledby="arith-h" className="card p-5 sm:p-6 space-y-5">
      <div>
        <h2 id="arith-h" className="text-xl font-semibold">
          The arithmetic the brief leaves you to do
        </h2>
        <p className="text-sm mt-1 measure" style={{ color: "var(--text-muted)" }}>
          Worked out from the numbers already in the brief. Nothing here is a guess.
        </p>
      </div>

      {a.perSection && (
        <div>
          <p className="text-lg">
            <strong>
              {a.perSection.total.toLocaleString()} {a.perSection.unit}
            </strong>{" "}
            across <strong>{asWords(a.perSection.sections)}</strong>{" "}
            {a.perSection.sections === 1 ? "section" : "sections"} is{" "}
            <strong style={{ color: "var(--accent)" }}>
              about {a.perSection.each.toLocaleString()} {a.perSection.unit} each
            </strong>
            .
          </p>
        </div>
      )}

      {a.effort && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-semibold">What the marks are worth, as time.</p>
            <label className="text-sm" style={{ color: "var(--text-muted)" }}>
              If you have{" "}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="p-1.5 mx-1"
                aria-label="How many working days you have"
              >
                {[2, 3, 4, 5, 6, 7, 8, 10, 12, 14].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>{" "}
              working days
            </label>
          </div>

          <ul className="space-y-2">
            {a.effort.map((w, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 gap-y-0.5 items-baseline">
                <span className="font-medium">{w.label}</span>
                <span style={{ color: "var(--text-muted)" }}>
                  is {w.percent}% — that&rsquo;s {effortSentence(w.percent, days)}
                </span>
              </li>
            ))}
          </ul>

          {a.weightTotal !== undefined && a.weightTotal !== 100 && (
            <p className="sev-friction text-sm rounded-lg p-3">
              These add up to <strong>{a.weightTotal}%</strong>, not 100%. Either something
              is missing from the brief or one of the figures is wrong — worth asking about
              before you plan around it.
            </p>
          )}

          <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
            A percentage is a share of the marks, so the honest conversion is a share of
            your time. It is not advice about how fast you work.
          </p>
        </div>
      )}
    </section>
  );
}
