"use client";

import { useEffect, useState } from "react";
import {
  loadLog,
  saveLog,
  emptyLog,
  newId,
  notAnswered,
  daysSince,
  unansweredBy,
  toMarkdown,
  type LogState,
  type EntryKind,
} from "@/lib/log";

export default function LogPage() {
  const [state, setState] = useState<LogState>(emptyLog());
  const [loaded, setLoaded] = useState(false);
  const [me, setMe] = useState("");
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<EntryKind>("decision");
  const [newMember, setNewMember] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = loadLog();
    setState(s);
    setMe(localStorage.getItem("cg:me") ?? "");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveLog(state);
  }, [state, loaded]);

  const setMeAndStore = (n: string) => {
    setMe(n);
    try {
      localStorage.setItem("cg:me", n);
    } catch {}
  };

  const add = () => {
    const text = draft.trim();
    if (!text || !me) return;
    setState((s) => ({
      ...s,
      entries: [
        {
          id: newId(),
          kind,
          text,
          author: me,
          at: new Date().toISOString(),
          agreedBy: kind === "decision" ? [me] : [],
        },
        ...s.entries,
      ],
    }));
    setDraft("");
  };

  const toggleAgree = (id: string) =>
    setState((s) => ({
      ...s,
      entries: s.entries.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              agreedBy: e.agreedBy.includes(me)
                ? e.agreedBy.filter((n) => n !== me)
                : [...e.agreedBy, me],
            },
      ),
    }));

  const answer = (id: string, text: string) =>
    setState((s) => ({
      ...s,
      entries: s.entries.map((e) =>
        e.id !== id ? e : { ...e, answer: { text, author: me, at: new Date().toISOString() } },
      ),
    }));

  const decisions = state.entries.filter((e) => e.kind === "decision");
  const questions = state.entries.filter((e) => e.kind === "question");
  const mine = me ? unansweredBy(state, me) : [];

  if (!loaded) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div className="space-y-10">
      <section className="measure space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          A decision is only a decision once it&rsquo;s written down.
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Otherwise agreement has to be worked out from tone, silence, and who didn&rsquo;t
          object. That guessing is invisible work, it&rsquo;s unreliable for everybody, and it
          decides things nobody actually agreed to.
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          Here, silence is never counted as a yes — and raising something in writing carries
          exactly the same weight as saying it out loud.
        </p>
      </section>

      {/* Setup */}
      <section aria-labelledby="setup-h" className="card p-4 sm:p-5 space-y-4 no-print">
        <h2 id="setup-h" className="text-lg font-semibold">
          Who&rsquo;s in this
        </h2>
        <div>
          <label htmlFor="project" className="text-sm font-semibold block mb-1">
            Project name
          </label>
          <input
            id="project"
            value={state.project}
            onChange={(e) => setState((s) => ({ ...s, project: e.target.value }))}
            className="w-full p-2.5"
            placeholder="e.g. Urban sustainability group project"
          />
        </div>

        <div>
          <span className="text-sm font-semibold block mb-1">Group members</span>
          {state.members.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-2">
              {state.members.map((m) => (
                <li key={m} className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full" style={{ background: "var(--surface-2)" }}>
                  {m}
                  <button
                    type="button"
                    aria-label={`Remove ${m}`}
                    className="font-bold px-1"
                    style={{ color: "var(--text-muted)" }}
                    onClick={() => setState((s) => ({ ...s, members: s.members.filter((x) => x !== m) }))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newMember.trim()) {
                  setState((s) => ({ ...s, members: [...s.members, newMember.trim()] }));
                  setNewMember("");
                }
              }}
              className="flex-1 p-2.5"
              placeholder="Add a name and press Enter"
              aria-label="Add a group member"
            />
            <button
              type="button"
              className="btn btn-quiet px-4"
              onClick={() => {
                if (!newMember.trim()) return;
                setState((s) => ({ ...s, members: [...s.members, newMember.trim()] }));
                setNewMember("");
              }}
            >
              Add
            </button>
          </div>
        </div>

        {state.members.length > 0 && (
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-semibold">Which one are you?</legend>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Only stored on this device, so the page knows what you&rsquo;ve already agreed to.
            </p>
            <div className="flex flex-wrap gap-2">
              {state.members.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={me === m}
                  className="btn btn-quiet px-3 py-1.5 text-sm"
                  style={me === m ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}
                  onClick={() => setMeAndStore(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      {/* Add an entry */}
      {me && (
        <section aria-labelledby="add-h" className="space-y-3 no-print">
          <h2 id="add-h" className="text-lg font-semibold">
            Put something on the record
          </h2>
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">What kind of entry</legend>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={kind === "decision"}
                className="btn btn-quiet px-3 py-1.5 text-sm"
                style={kind === "decision" ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}
                onClick={() => setKind("decision")}
              >
                Something we decided
              </button>
              <button
                type="button"
                aria-pressed={kind === "question"}
                className="btn btn-quiet px-3 py-1.5 text-sm"
                style={kind === "question" ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}
                onClick={() => setKind("question")}
              >
                Something I want to ask
              </button>
            </div>
          </fieldset>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full p-3"
            aria-label={kind === "decision" ? "What was decided" : "What do you want to ask"}
            placeholder={
              kind === "decision"
                ? "e.g. We're covering transport policy, not housing."
                : "e.g. Are we each writing our own section, or one document together?"
            }
          />
          <button type="button" className="btn btn-primary px-5 py-2.5" disabled={!draft.trim()} onClick={add}>
            {kind === "decision" ? "Record it" : "Ask it"}
          </button>
        </section>
      )}

      {/* Private nudge — this device only, never shared */}
      {mine.length > 0 && (
        <section className="card p-4 sm:p-5" aria-labelledby="mine-h">
          <h2 id="mine-h" className="font-semibold mb-1">
            Things you raised that nobody&rsquo;s answered
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
            Only visible to you, on this device. Not shared with the group and not sent anywhere.
          </p>
          <ul className="space-y-2">
            {mine.map((e) => (
              <li key={e.id} className="text-sm">
                &ldquo;{e.text}&rdquo;{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  — {daysSince(e.at) === 0 ? "raised today" : `${daysSince(e.at)} day(s) ago`}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-3 measure" style={{ color: "var(--text-muted)" }}>
            It&rsquo;s reasonable to bring these up again. Nobody ignored you on purpose — things
            just get missed.
          </p>
        </section>
      )}

      {/* Decisions */}
      <section aria-labelledby="dec-h">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 id="dec-h" className="text-xl font-semibold">
            Decisions
          </h2>
          {state.entries.length > 0 && (
            <div className="no-print flex gap-2">
              <button
                type="button"
                className="btn btn-quiet px-3 py-1.5 text-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(toMarkdown(state));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  } catch {}
                }}
              >
                {copied ? "Copied" : "Copy the whole log"}
              </button>
              <button type="button" className="btn btn-quiet px-3 py-1.5 text-sm" onClick={() => window.print()}>
                Print
              </button>
            </div>
          )}
        </div>

        {decisions.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Nothing recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {decisions.map((e) => {
              const missing = notAnswered(e, state.members);
              const allAgreed = state.members.length > 0 && missing.length === 0;
              return (
                <li key={e.id} className="card p-4">
                  <p className="font-medium mb-2">{e.text}</p>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    Written by {e.author}, {new Date(e.at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                      className={`${allAgreed ? "sev-note" : "sev-friction"} text-xs font-semibold px-2 py-0.5 rounded-full`}
                    >
                      {allAgreed ? "Everyone has agreed" : `${e.agreedBy.length} of ${state.members.length} agreed`}
                    </span>
                    {missing.length > 0 && (
                      <span style={{ color: "var(--text-muted)" }}>
                        Not yet answered by {missing.join(", ")} — that is not the same as disagreeing.
                      </span>
                    )}
                  </div>
                  {me && (
                    <button
                      type="button"
                      className="btn btn-quiet px-3 py-1.5 text-sm mt-3 no-print"
                      aria-pressed={e.agreedBy.includes(me)}
                      onClick={() => toggleAgree(e.id)}
                    >
                      {e.agreedBy.includes(me) ? "You've agreed — undo" : "I agree with this"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Questions */}
      <section aria-labelledby="q-h">
        <h2 id="q-h" className="text-xl font-semibold mb-3">
          Open questions
        </h2>
        {questions.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>None right now.</p>
        ) : (
          <ul className="space-y-3">
            {questions.map((e) => (
              <li key={e.id} className="card p-4">
                <p className="font-medium mb-2">{e.text}</p>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  Asked by {e.author}, {new Date(e.at).toLocaleDateString()}
                  {!e.answer && daysSince(e.at) > 0 && ` · open for ${daysSince(e.at)} day(s)`}
                </p>
                {e.answer ? (
                  <div className="rounded-lg p-3 text-sm" style={{ background: "var(--surface-2)" }}>
                    <span className="font-semibold">{e.answer.author}: </span>
                    {e.answer.text}
                  </div>
                ) : (
                  me && (
                    <form
                      className="flex flex-col sm:flex-row gap-2 no-print"
                      onSubmit={(ev) => {
                        ev.preventDefault();
                        const input = (ev.currentTarget.elements.namedItem("a") as HTMLInputElement);
                        if (input.value.trim()) answer(e.id, input.value.trim());
                      }}
                    >
                      <input name="a" className="flex-1 p-2.5" placeholder="Answer this" aria-label={`Answer: ${e.text}`} />
                      <button type="submit" className="btn btn-quiet px-4 py-2">
                        Answer
                      </button>
                    </form>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
        This log lives in this browser only. Nothing is uploaded. Use <strong>Copy the whole
        log</strong> to share it with your group or hand it in as a record of how the work was
        divided.
      </p>
    </div>
  );
}
