"use client";

import { useState, useRef, useEffect } from "react";
import type { DecodeResult } from "@/lib/types";
import { Results } from "@/components/Results";
import { SAMPLE_BRIEF } from "@/lib/sample";
import { HeroFigure } from "@/components/HeroFigure";
import { readSharedBundle, mergeAnswers, clearShareFromUrl } from "@/lib/answers";
import { BriefInput } from "@/components/BriefInput";

/** What the tool is actually doing, in order. Shown one at a time while it works. */
const STAGES = [
  "Reading the brief…",
  "Checking what you hand in, and by when…",
  "Checking how it's marked…",
  "Looking for words that mean different things to different markers…",
  "Writing the questions…",
];

export default function Home() {
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  // The exact text the current result came from — answers attach to this, not to
  // whatever is in the textarea now.
  const [decodedBrief, setDecodedBrief] = useState("");
  const [imported, setImported] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // A group member opening a shared link: fold their answers in before anything else.
  useEffect(() => {
    const bundle = readSharedBundle();
    if (bundle) {
      const added = mergeAnswers(bundle);
      setImported(added);
      clearShareFromUrl();
    }
    // Bring back the last brief so closing the tab does not lose your place —
    // an ADHD tester: "something that survives me closing the tab; right now if I
    // come back tomorrow it's gone."
    try {
      const last = localStorage.getItem("cg:lastBrief");
      if (last) setBrief(last);
    } catch {}
  }, []);

  async function decode(text: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setStage(0);
    // Named stages, not a spinner. Testers asked to see it is alive and roughly where
    // it has got to — a bare wait is where they open another tab and never come back.
    const ticker = setInterval(() => setStage((n) => Math.min(n + 1, STAGES.length - 1)), 1600);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Try again.");
      } else {
        setResult(data);
        setDecodedBrief(text);
        try { localStorage.setItem("cg:lastBrief", text); } catch {}
        // Land on the results, not on the brief you just read. Focus moves for keyboard
        // and screen-reader users; the scroll is for everyone else.
        requestAnimationFrame(() => {
          resultsRef.current?.focus();
          resultsRef.current?.scrollIntoView({ block: "start" });
        });
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {!result && (
        <section className="space-y-5">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-balance measure">
            Make the unwritten rules written.
          </h1>
          <p className="text-lg sm:text-xl measure" style={{ color: "var(--text-muted)" }}>
            Assignment briefs leave things out. The answers travel by asking someone — a
            group chat, a friend, a quick word after class. If you don&rsquo;t have that,
            you pay for it.
          </p>

          <HeroFigure />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-primary px-6 py-3 text-lg"
              disabled={loading}
              onClick={() => decode(brief)}
            >
              {loading ? "Reading the brief…" : "Try it on this example →"}
            </button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Already loaded. No signup, nothing to install.
            </span>
          </div>
        </section>
      )}

      <section aria-labelledby="paste-h" className="space-y-3 no-print">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label htmlFor="brief" id="paste-h" className="text-lg font-semibold">
            {result ? "The brief" : "…or paste your own"}
          </label>
          <button
            type="button"
            className="btn btn-quiet px-3 py-1.5 text-sm"
            onClick={() => {
              setBrief("");
              setResult(null);
              setError(null);
            }}
          >
            Clear
          </button>
        </div>

        <BriefInput
          disabled={loading}
          onText={(t) => {
            setBrief(t);
            setResult(null);
            setError(null);
          }}
        />

        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder="Paste the whole thing — every sentence the teacher wrote. The more it says, the more can be checked."
          aria-describedby="brief-help"
          className="w-full p-4 text-base resize-y"
        />
        <p id="brief-help" className="text-sm" style={{ color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)" }}>It never writes your assignment.</strong>{" "}
          It reads the brief and hands you questions — it does not do the work, and it does not
          rewrite your tutor&rsquo;s words. Nothing you paste is stored: it is sent once to
          be read — by Google Gemini, or by Featherless if Google is unavailable — is never
          used for training, and is not kept afterwards.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-primary px-5 py-2.5"
            disabled={loading || brief.trim().length < 40}
            onClick={() => decode(brief)}
          >
            {loading ? "Reading the brief…" : "Read this brief"}
          </button>
          {result && (
            <button
              type="button"
              className="btn btn-quiet px-4 py-2.5"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
            >
              Start again
            </button>
          )}
        </div>

        {/* Status is announced, never only shown. */}
        <p ref={statusRef} role="status" aria-live="polite" className="text-sm min-h-[1.25rem]" style={{ color: "var(--text-muted)" }}>
          {loading
            ? STAGES[stage]
            : result
              ? `Done. ${result.findings.length} ${result.findings.length === 1 ? "thing" : "things"} worth asking about.`
              : ""}
        </p>

        {imported !== null && (
          <p className="sev-note rounded-lg p-3 text-sm" role="status">
            {imported > 0
              ? `Loaded ${imported} answer${imported === 1 ? "" : "s"} your group already got from the tutor. Those questions are out of your email.`
              : "Your group's answers were already saved here — nothing new to add."}
          </p>
        )}

        {error && (
          <p className="sev-blocker rounded-lg p-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </section>

      {result && (
        <div ref={resultsRef} tabIndex={-1} aria-label="Results">
          <Results result={result} brief={decodedBrief} />
        </div>
      )}

      {!result && (
        <section className="measure space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            What this will never do
          </h2>
          <ul className="space-y-2">
            <li>
              <strong style={{ color: "var(--text)" }}>It never writes your assignment.</strong>{" "}
              It describes the task. It does not do it.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>It never rewrites the brief.</strong>{" "}
              It points at gaps and hands them back as questions. It does not restate what your
              teacher meant.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>It never models you.</strong>{" "}
              There is no account, no profile, no score, and nothing about any person is inferred,
              stored or reported to anyone.
            </li>
            <li>
              <strong style={{ color: "var(--text)" }}>
                It doesn&rsquo;t replace asking for what you need.
              </strong>{" "}
              This removes one barrier. It is not a reason for anyone to have fewer formal
              accommodations, and it never argues that it is.
            </li>
          </ul>

          <div className="card p-4 mt-2">
            <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
              If you write briefs, run yours through this before you publish it.
            </p>
            <p>
              Same tool, same output. Every question it hands back is one a student would
              otherwise have to find the confidence to ask — and if you answer them in the brief,
              nobody in the class has to be the one who asked.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
