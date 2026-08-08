"use client";

import { useMemo, useState } from "react";
import { CATEGORY_META, type CheckCategory, type DecodeResult, type Finding, type Severity } from "@/lib/types";
import { ResultSummary } from "@/components/ResultSummary";
import { ReadAloud } from "@/components/ReadAloud";

const SEV_LABEL: Record<Finding["severity"], string> = {
  blocker: "Blocks starting",
  friction: "Slows you down",
  note: "Worth checking",
};

function Badge({ severity }: { severity: Finding["severity"] }) {
  return (
    <span className={`sev-${severity} text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap`}>
      {SEV_LABEL[severity]}
    </span>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet px-3 py-1.5 text-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch {}
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function Results({ result }: { result: DecodeResult }) {
  const { findings, interpretation } = result;

  // Open on what blocks starting. Everything else is a choice, not a wall.
  const [filter, setFilter] = useState<Severity | "all">(
    findings.some((f) => f.severity === "blocker") ? "blocker" : "all",
  );
  const shown = useMemo(
    () => (filter === "all" ? findings : findings.filter((f) => f.severity === filter)),
    [findings, filter],
  );

  const grouped = useMemo(() => {
    const m = new Map<CheckCategory, Finding[]>();
    for (const f of shown) {
      if (!m.has(f.category)) m.set(f.category, []);
      m.get(f.category)!.push(f);
    }
    return [...m.entries()];
  }, [shown]);

  // One sendable message, not a list of bullets.
  //
  // A tester pressed this and got 23 numbered lines including seven near-identical
  // ones. "Nobody sends that email." So it now writes an actual email, and it
  // copies what is on screen rather than everything.
  const questionList = useMemo(() => {
    const qs = shown.map((f) => f.question);
    return [
      "Hello,",
      "",
      qs.length === 1
        ? "I've read through the brief and there's one thing I want to check before I start:"
        : `I've read through the brief and there are a few things I'd like to check before I start:`,
      "",
      ...qs.map((q) => `  ${qs.length > 1 ? "\u2022 " : ""}${q}`),
      "",
      "Thank you.",
    ].join("\n");
  }, [shown]);

  const counts = useMemo(() => {
    const c = { blocker: 0, friction: 0, note: 0 };
    findings.forEach((f) => c[f.severity]++);
    return c;
  }, [findings]);

  return (
    <div className="space-y-8">
      {/* Visual first, prose second. Someone already overwhelmed does not want a
          paragraph about how overwhelming their brief is. */}
      <section aria-labelledby="summary-h" className="space-y-4">
        <h2 id="summary-h" className="text-2xl font-semibold">
          What this brief leaves unsaid
        </h2>

        {findings.length === 0 ? (
          <p className="measure" style={{ color: "var(--text-muted)" }}>
            This brief is unusually complete. Nothing came up worth asking about.
          </p>
        ) : (
          <>
            <ResultSummary findings={findings} active={filter} onChange={setFilter} />
            <p className="measure" style={{ color: "var(--text-muted)" }}>
              Every one of these is a fair thing to ask. The brief left them out; you
              didn&rsquo;t miss them.
            </p>
          </>
        )}

        {interpretation?.summary && (
          <p className="measure card p-4">
            <span className="font-semibold">In one sentence: </span>
            {interpretation.summary}
          </p>
        )}
      </section>

      {/* Definition of done */}
      {(interpretation?.definitionOfDone?.length || interpretation?.deliverables?.length) && (
        <section aria-labelledby="done-h" className="card p-5 sm:p-6">
          <h2 id="done-h" className="text-xl font-semibold mb-1">
            What finished looks like
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Taken only from what the brief actually says. If something you expected isn&rsquo;t here,
            the brief probably didn&rsquo;t say it — which is worth asking about.
          </p>

          {interpretation?.deliverables?.length ? (
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2">You hand in</h3>
              <ul className="space-y-1.5">
                {interpretation.deliverables.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" style={{ color: "var(--accent)" }}>
                      •
                    </span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {interpretation?.definitionOfDone?.length ? (
            <div>
              <h3 className="text-sm font-semibold mb-2">It&rsquo;s done when</h3>
              <ul className="space-y-2">
                {interpretation.definitionOfDone.map((d, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-block w-4 h-4 rounded border shrink-0"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {/* Handoff into the group page — the decoder already found the parts. */}
      {interpretation?.workstreams?.length ? (
        <section aria-labelledby="ws-h" className="card p-5 sm:p-6">
          <h2 id="ws-h" className="text-xl font-semibold mb-1">
            The parts this splits into
          </h2>
          <p className="text-sm mb-4 measure" style={{ color: "var(--text-muted)" }}>
            Separable pieces of the work, read out of the brief. Nothing is assigned to
            anyone here — that only happens once everyone has said what they&rsquo;d like.
          </p>
          <ul className="space-y-2 mb-4">
            {interpretation.workstreams.map((w, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden="true" style={{ color: "var(--accent)" }}>
                  •
                </span>
                <span>
                  <span className="font-medium">{w.name}</span>
                  {w.description && (
                    <span style={{ color: "var(--text-muted)" }}> — {w.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <a
            href="/group"
            className="btn btn-primary px-5 py-2.5 inline-block no-print"
            onClick={() => {
              try {
                localStorage.setItem(
                  "cg:workstreams",
                  JSON.stringify(interpretation.workstreams!.map((w) => w.name)),
                );
              } catch {}
            }}
          >
            Use these to split the work
          </a>
        </section>
      ) : null}

      {/* The questions — the actual product */}
      {findings.length > 0 && (
        <section aria-labelledby="questions-h">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 id="questions-h" className="text-xl font-semibold">
              Questions worth asking
            </h2>
            <div className="no-print flex gap-2">
              <CopyButton text={questionList} label={filter === "all" ? "Copy as an email" : "Copy these as an email"} />
              <ReadAloud text={shown.map((f) => f.question).join(". ")} label="Read these aloud" />
              <button type="button" className="btn btn-quiet px-3 py-1.5 text-sm" onClick={() => window.print()}>
                Print
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {grouped.map(([cat, items]) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                    {meta.label}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                    {meta.blurb}
                  </p>
                  <ul className="space-y-3">
                    {items.map((f, i) => (
                      <li key={`${f.id}-${i}`} className="card p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold">{f.title}</h4>
                          <Badge severity={f.severity} />
                        </div>
                        {/* Ask first. The reasoning is there for anyone who wants it and
                            out of the way for anyone who does not — two testers read none
                            of it, two needed all of it. */}
                        <div
                          className="rounded-lg p-3 text-sm flex flex-wrap items-start justify-between gap-2"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <p className="measure">
                            <span className="font-semibold">Ask: </span>
                            &ldquo;{f.question}&rdquo;
                          </p>
                          <span className="no-print flex gap-2">
                            <CopyButton text={f.question} />
                            <ReadAloud text={f.question} label="Read" />
                          </span>
                        </div>

                        <details className="mt-2 group">
                          <summary className="text-sm cursor-pointer select-none tap" style={{ color: "var(--text-muted)" }}>
                            Why this matters
                          </summary>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm measure">{f.why}</p>
                            {f.excerpt && (
                              <blockquote
                                className="text-sm mb-1 pl-3 border-l-2"
                                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                              >
                                {f.excerpt}
                              </blockquote>
                            )}
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Honest footer about what ran. */}
      <section className="text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
        <p>
          We checked eighteen things
          {result.aiUsed ? ", and read the brief for what it asks you to hand in." : "."}
        </p>
        {!result.aiUsed && result.aiError && result.aiError !== "no-provider" && (
          <p>
            The AI reading did not run this time ({result.aiError}). Everything above still applies —
            the checks do not need it.
          </p>
        )}
        {!result.aiUsed && result.aiError === "no-provider" && (
          <p>
            No AI provider is configured, so this is the checks only. They work on their own.
          </p>
        )}
      </section>
    </div>
  );
}
