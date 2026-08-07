"use client";

import { useState, useRef } from "react";
import type { DecodeResult } from "@/lib/types";
import { Results } from "@/components/Results";
import { SAMPLE_BRIEF } from "@/lib/sample";
import { HeroFigure } from "@/components/HeroFigure";

export default function Home() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  async function decode(text: string) {
    setLoading(true);
    setError(null);
    setResult(null);
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
        // Move focus to results so keyboard and screen-reader users land there.
        requestAnimationFrame(() => resultsRef.current?.focus());
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {!result && (
        <section className="measure space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Make the unwritten rules written.
          </h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Most assignment briefs leave things out — how long it should be, what
            &ldquo;discuss&rdquo; means here, who does what in the group, what the marks are
            actually for. Some people fill those gaps by reading the room. Everyone else pays for
            them in time and stress.
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            Paste a brief. Get back the specific questions worth asking — in words you can send
            straight to a teacher.
          </p>
        </section>
      )}

      {!result && (
        <section aria-label="How it works" className="-mx-1">
          <HeroFigure />
          <p className="text-sm text-center measure mx-auto" style={{ color: "var(--text-muted)" }}>
            The vague parts of a brief, turned into questions you can actually ask.
          </p>
        </section>
      )}

      <section aria-labelledby="paste-h" className="space-y-3 no-print">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label htmlFor="brief" id="paste-h" className="text-lg font-semibold">
            Paste the assignment brief
          </label>
          <button
            type="button"
            className="btn btn-quiet px-3 py-1.5 text-sm"
            onClick={() => {
              setBrief(SAMPLE_BRIEF);
              setResult(null);
              setError(null);
            }}
          >
            Use an example
          </button>
        </div>

        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste the whole thing — every sentence the teacher wrote. The more it says, the more can be checked."
          aria-describedby="brief-help"
          className="w-full p-4 text-base resize-y"
        />
        <p id="brief-help" className="text-sm" style={{ color: "var(--text-muted)" }}>
          Nothing you paste is stored. It is sent once, read, and forgotten.
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
            ? "Reading the brief. This usually takes a few seconds."
            : result
              ? `Done. ${result.findings.length} ${result.findings.length === 1 ? "thing" : "things"} worth asking about.`
              : ""}
        </p>

        {error && (
          <p className="sev-blocker rounded-lg p-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </section>

      {result && (
        <div ref={resultsRef} tabIndex={-1} aria-label="Results">
          <Results result={result} />
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
          </ul>
        </section>
      )}
    </div>
  );
}
