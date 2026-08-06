"use client";

import { useState } from "react";
import type { MemberPrefs } from "@/lib/types";
import { allocate, type AllocationResult } from "@/lib/roles";

const CONTRIBUTE = [
  { v: "speaking", label: "Speaking in meetings" },
  { v: "writing", label: "Writing things down" },
  { v: "either", label: "Either is fine" },
] as const;

const NOTICE = [
  { v: "same-day", label: "Same day is fine" },
  { v: "a-day", label: "At least a day" },
  { v: "several-days", label: "Several days" },
] as const;

const FEEDBACK = [
  { v: "direct", label: "Direct and to the point" },
  { v: "written-first", label: "In writing first" },
  { v: "in-conversation", label: "In conversation" },
] as const;

const blank = (i: number): MemberPrefs => ({
  id: `m${i}`,
  name: "",
  wants: [],
  contribute: "either",
  notice: "a-day",
  feedback: "direct",
  note: "",
});

export default function GroupPage() {
  const [streamsRaw, setStreamsRaw] = useState("");
  const [members, setMembers] = useState<MemberPrefs[]>([blank(1), blank(2)]);
  const [result, setResult] = useState<AllocationResult | null>(null);

  const workstreams = streamsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const ready =
    workstreams.length >= 2 &&
    members.length >= 2 &&
    members.every((m) => m.name.trim() && m.wants.length > 0);

  const update = (id: string, patch: Partial<MemberPrefs>) =>
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const toggleWant = (m: MemberPrefs, ws: string) => {
    const has = m.wants.includes(ws);
    update(m.id, { wants: has ? m.wants.filter((w) => w !== ws) : [...m.wants, ws] });
  };

  const Radio = <T extends string>({
    legend,
    hint,
    name,
    options,
    value,
    onChange,
  }: {
    legend: string;
    hint?: string;
    name: string;
    options: readonly { v: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
  }) => (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-semibold">{legend}</legend>
      {hint && (
        <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((o) => (
          <label
            key={o.v}
            className="btn btn-quiet px-3 py-1.5 text-sm cursor-pointer"
            aria-pressed={value === o.v}
            style={
              value === o.v
                ? { background: "var(--accent-soft)", borderColor: "var(--accent)" }
                : undefined
            }
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === o.v}
              onChange={() => onChange(o.v)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="space-y-10">
      <section className="measure space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          Split the work without a negotiation.
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Roles usually get decided by talking, in the first meeting, fast. That reliably
          favours whoever is most comfortable negotiating out loud — which is why group
          research finds the barrier isn&rsquo;t the work, it&rsquo;s the unpredictability of
          talking to each other.
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          Everyone fills in the same short form. The split comes out of what people asked for,
          and every allocation says why.
        </p>
      </section>

      {/* Workstreams */}
      <section aria-labelledby="ws-h" className="space-y-2 no-print">
        <label htmlFor="streams" id="ws-h" className="text-lg font-semibold">
          The parts of the work
        </label>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          One per line. If you decoded the brief on the home page, use the workstreams it
          found.
        </p>
        <textarea
          id="streams"
          rows={5}
          value={streamsRaw}
          onChange={(e) => setStreamsRaw(e.target.value)}
          placeholder={"Literature research\nData and analysis\nWriting and structure\nSlides and presenting"}
          className="w-full p-4 text-base resize-y"
        />
      </section>

      {/* Members */}
      <section aria-labelledby="mem-h" className="space-y-4 no-print">
        <h2 id="mem-h" className="text-lg font-semibold">
          Everyone in the group
        </h2>
        <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
          Every person answers the same four questions. There is no question here about who
          you are, and no answer that marks anyone out — every option is a normal way to
          prefer working.
        </p>

        {members.map((m, i) => (
          <div key={m.id} className="card p-4 sm:p-5 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1">
                <label htmlFor={`name-${m.id}`} className="text-sm font-semibold block mb-1">
                  Name
                </label>
                <input
                  id={`name-${m.id}`}
                  value={m.name}
                  onChange={(e) => update(m.id, { name: e.target.value })}
                  className="w-full p-2.5"
                  placeholder={`Person ${i + 1}`}
                />
              </div>
              {members.length > 2 && (
                <button
                  type="button"
                  className="btn btn-quiet px-3 py-2 text-sm"
                  onClick={() => setMembers((ms) => ms.filter((x) => x.id !== m.id))}
                >
                  Remove
                </button>
              )}
            </div>

            <fieldset className="border-0 p-0 m-0">
              <legend className="text-sm font-semibold">
                Which parts would you like? Tap in order of preference.
              </legend>
              {workstreams.length === 0 ? (
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Add the parts of the work above first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {workstreams.map((ws) => {
                    const idx = m.wants.indexOf(ws);
                    const on = idx !== -1;
                    return (
                      <button
                        key={ws}
                        type="button"
                        onClick={() => toggleWant(m, ws)}
                        aria-pressed={on}
                        className="btn btn-quiet px-3 py-1.5 text-sm"
                        style={on ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}
                      >
                        {on && <span className="font-semibold mr-1.5">{idx + 1}.</span>}
                        {ws}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-3">
              <Radio
                legend="I'd rather contribute by"
                name={`c-${m.id}`}
                options={CONTRIBUTE}
                value={m.contribute}
                onChange={(v) => update(m.id, { contribute: v })}
              />
              <Radio
                legend="Notice I want before a meeting"
                name={`n-${m.id}`}
                options={NOTICE}
                value={m.notice}
                onChange={(v) => update(m.id, { notice: v })}
              />
              <Radio
                legend="Feedback on my part, please"
                name={`f-${m.id}`}
                options={FEEDBACK}
                value={m.feedback}
                onChange={(v) => update(m.id, { feedback: v })}
              />
            </div>

            <div>
              <label htmlFor={`note-${m.id}`} className="text-sm font-semibold block mb-1">
                Anything else the group should know? <span className="font-normal" style={{ color: "var(--text-muted)" }}>Optional.</span>
              </label>
              <input
                id={`note-${m.id}`}
                value={m.note ?? ""}
                onChange={(e) => update(m.id, { note: e.target.value })}
                className="w-full p-2.5"
                placeholder="e.g. I'm slower to reply in the evenings"
              />
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-quiet px-4 py-2"
            onClick={() => setMembers((ms) => [...ms, blank(ms.length + 1)])}
          >
            Add a person
          </button>
          <button
            type="button"
            className="btn btn-primary px-5 py-2.5"
            disabled={!ready}
            onClick={() => {
              const r = allocate(members, workstreams);
              setResult(r);
              try {
                localStorage.setItem("cg:roles", JSON.stringify(r));
              } catch {}
            }}
          >
            Work out the split
          </button>
        </div>
        {!ready && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Needs at least two parts of the work, and everyone to have a name and at least one
            choice.
          </p>
        )}
      </section>

      {result && (
        <section aria-labelledby="res-h" className="space-y-6" role="region">
          <h2 id="res-h" className="text-2xl font-semibold">
            The split
          </h2>

          <ul className="space-y-3">
            {result.roles.map((r) => (
              <li key={r.memberId} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <span className="font-semibold text-lg">{r.memberName}</span>
                  <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
                  <span className="font-semibold" style={{ color: "var(--accent)" }}>
                    {r.workstream}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {r.rationale}
                </p>
              </li>
            ))}
          </ul>

          {(result.agreement.unclaimed.length > 0 || result.agreement.unassigned.length > 0) && (
            <div className="card p-4 sm:p-5 space-y-2">
              <h3 className="font-semibold">Still to sort out</h3>
              {result.agreement.unclaimed.length > 0 && (
                <p className="text-sm">
                  Nobody chose: <strong>{result.agreement.unclaimed.join(", ")}</strong>. Worth
                  deciding together whether these get shared out or dropped — and if dropped,
                  telling your teacher.
                </p>
              )}
              {result.agreement.unassigned.length > 0 && (
                <p className="text-sm">
                  No part yet for: <strong>{result.agreement.unassigned.join(", ")}</strong>.
                  There are fewer parts than people, so some will be shared.
                </p>
              )}
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-1">How this group works</h3>
            <p className="text-sm mb-4 measure" style={{ color: "var(--text-muted)" }}>
              Written from what everyone asked for. Nobody is named as the reason for any of it.
            </p>
            <ul className="space-y-3">
              {result.agreement.statements.map((s, i) => (
                <li key={i} className="card p-4">
                  <p className="font-medium mb-1">{s.text}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {s.because}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="no-print flex flex-wrap gap-3">
            <button type="button" className="btn btn-quiet px-4 py-2" onClick={() => window.print()}>
              Print or save as PDF
            </button>
            <button type="button" className="btn btn-quiet px-4 py-2" onClick={() => setResult(null)}>
              Change something
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
