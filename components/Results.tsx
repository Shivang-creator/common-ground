"use client";

import { useMemo, useState, useEffect } from "react";
import { CATEGORY_META, type CheckCategory, type DecodeResult, type Finding, type Severity } from "@/lib/types";
import { ResultSummary } from "@/components/ResultSummary";
import { ReadAloud } from "@/components/ReadAloud";
import { AnswerBox } from "@/components/AnswerBox";
import { Arithmetic } from "@/components/Arithmetic";
import {
  loadAnswers, saveAnswer, removeAnswer, questionKey, shareLink,
  type Answer,
} from "@/lib/answers";

const SEV_LABEL: Record<Finding["severity"], string> = {
  blocker: "Blocks starting",
  friction: "Slows you down",
  note: "Worth checking",
};

/**
 * The brief's own sentence, with the phrase that triggered the finding marked.
 *
 * A dyslexic tester found the old truncated ribbons the hardest thing on the page —
 * "ellipses mid-sentence with no punctuation to anchor on". A whole sentence gives
 * you the anchors; the mark tells you where to look without removing the context.
 *
 * Never colour alone: the phrase is bold and underlined too.
 */
function Marked({ sentence, phrase }: { sentence: string; phrase?: string }) {
  if (!phrase) return <>{sentence}</>;
  const i = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (i === -1) return <>{sentence}</>;
  return (
    <>
      {sentence.slice(0, i)}
      <strong
        className="underline underline-offset-2 decoration-2"
        style={{ color: "var(--text)" }}
      >
        {sentence.slice(i, i + phrase.length)}
      </strong>
      {sentence.slice(i + phrase.length)}
    </>
  );
}

/**
 * A distinct shape per category.
 *
 * A dyslexic tester: *"Seven category headings that are all the same grey small-caps
 * means I navigate by reading, which is exactly the thing I'm slow at. A distinct
 * shape or icon per category would let me find 'how it's marked' without reading."*
 *
 * Shapes, not colours, and every one keeps its text label — the icon is a landmark,
 * never the only carrier of meaning.
 */
function CategoryMark({ category }: { category: CheckCategory }) {
  const common = { width: 22, height: 22, "aria-hidden": true as const, className: "shrink-0" };
  const stroke = { stroke: "var(--accent)", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (category) {
    case "finish-line": // chequered flag
      return <svg {...common} viewBox="0 0 24 24"><path d="M5 21V4" {...stroke} /><path d="M5 5h14l-3 4 3 4H5" {...stroke} /></svg>;
    case "instruction": // speech mark
      return <svg {...common} viewBox="0 0 24 24"><path d="M20 6H4v10h4l3 3v-3h9z" {...stroke} /></svg>;
    case "assessment": // tick in a circle
      return <svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" {...stroke} /><path d="M8.5 12.5l2.5 2.5 4.5-5" {...stroke} /></svg>;
    case "quantity": // ruler
      return <svg {...common} viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="8" rx="1.5" {...stroke} /><path d="M8 8v3M12 8v4M16 8v3" {...stroke} /></svg>;
    case "assumed": // key
      return <svg {...common} viewBox="0 0 24 24"><circle cx="8" cy="12" r="3.5" {...stroke} /><path d="M11.5 12H21M18 12v3M15 12v2" {...stroke} /></svg>;
    case "group": // two people
      return <svg {...common} viewBox="0 0 24 24"><circle cx="9" cy="9" r="3" {...stroke} /><circle cx="17" cy="10" r="2.4" {...stroke} /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M17 14.5c2 0 3.5 1.6 3.5 3.6" {...stroke} /></svg>;
    case "process": // calendar
      return <svg {...common} viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2" {...stroke} /><path d="M3.5 10h17M8 3v4M16 3v4" {...stroke} /></svg>;
  }
}

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

export function Results({ result, brief }: { result: DecodeResult; brief: string }) {
  const { findings, interpretation } = result;

  // Answers the group has already collected for this brief.
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  useEffect(() => setAnswers(loadAnswers(brief)), [brief]);

  const answeredCount = findings.filter((f) => answers[questionKey(f.question)]).length;
  const stillToAsk = findings.length - answeredCount;

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
    // Only what is still genuinely unanswered. This is the point of the whole
    // feature: the tenth person in a group emails the tutor one question, not five.
    const qs = shown.filter((f) => !answers[questionKey(f.question)]).map((f) => f.question);
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
  }, [shown, answers]);

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

      <Arithmetic brief={brief} />

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

      {/* The answer loop.
          Three testers found the same hole: thirty students send thirty identical
          emails, the tutor stops answering, and the tool stops working. This is the
          fix they described — one person asks, the answer travels, everyone else's
          email gets shorter. */}
      {findings.length > 0 && (
        <section aria-labelledby="loop-h" className="card p-4 sm:p-5">
          <h2 id="loop-h" className="font-semibold mb-1">
            {answeredCount === 0
              ? "Before you send it — has anyone already asked?"
              : `${answeredCount} of these ${answeredCount === 1 ? "has" : "have"} been answered`}
          </h2>
          <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
            {answeredCount === 0 ? (
              <>
                If a tutor answers one of these, write it down here. It drops out of the
                email — and if you share it, out of everyone else&rsquo;s too. Thirty people
                asking the same five questions is how a tutor stops replying.
              </>
            ) : (
              <>
                {stillToAsk === 0
                  ? "Nothing left to ask. The brief is fully answered for your group."
                  : `Your email now has ${stillToAsk} question${stillToAsk === 1 ? "" : "s"} in it instead of ${findings.length}.`}{" "}
                Send the link to your group so nobody asks these again.
              </>
            )}
          </p>
          {answeredCount > 0 && (
            <div className="mt-3 no-print">
              <CopyButton
                text={shareLink(brief, answers)}
                label="Copy a link with these answers"
              />
            </div>
          )}
        </section>
      )}

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
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <CategoryMark category={cat} />
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

                        <AnswerBox
                          answer={answers[questionKey(f.question)]}
                          onSave={(a) => {
                            saveAnswer(brief, f.question, a);
                            setAnswers(loadAnswers(brief));
                          }}
                          onRemove={() => {
                            removeAnswer(brief, f.question);
                            setAnswers(loadAnswers(brief));
                          }}
                        />

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
                                <Marked sentence={f.excerpt} phrase={f.match} />
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

      {findings.length > 0 && (
        <section aria-labelledby="after-h" className="card p-5">
          <h2 id="after-h" className="font-semibold mb-2">
            After you send it
          </h2>
          <div className="space-y-2 text-sm measure" style={{ color: "var(--text-muted)" }}>
            <p>
              Most tutors reply within two or three working days. Sending questions in
              writing before a deadline is a normal thing to do and does not count against
              you — it is the same information you would get by catching someone after class,
              in a form you can keep.
            </p>
            <p>
              If nobody answers in about three working days, it is reasonable to send the same
              message once more, or ask a course administrator who else could answer. Not
              replying usually means it got buried, not that the question was wrong.
            </p>
            <p>
              When an answer comes back, write it in above. It leaves your email — and your
              group&rsquo;s.
            </p>
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
