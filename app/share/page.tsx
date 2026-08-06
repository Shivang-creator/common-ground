"use client";

import { useEffect, useState } from "react";
import { loadLog, notAnswered, daysSince, emptyLog, type LogState } from "@/lib/log";
import type { AllocationResult } from "@/lib/roles";

/**
 * "Share how we're working" — the teacher-facing view, inverted.
 *
 * The obvious version of this feature is a teacher dashboard that watches groups.
 * That version is not built here, on purpose. A tool that reports on students to
 * an authority figure is surveillance regardless of intent, and inferring anything
 * about an individual from how they use software would out people who never chose
 * to disclose.
 *
 * So the direction is reversed: **the group composes this, and the group decides
 * whether to send it.** There is no login for teachers, no dashboard, no feed of
 * groups. A teacher sees this only because a group handed it to them.
 *
 * And it describes the *process*, never a person. There is no per-student count,
 * no participation score, no engagement metric. Everything on this page is a fact
 * about the project: what was agreed, what is unanswered, what is unclaimed.
 */
export default function SharePage() {
  const [log, setLog] = useState<LogState>(emptyLog());
  const [roles, setRoles] = useState<AllocationResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLog(loadLog());
    try {
      const r = localStorage.getItem("cg:roles");
      if (r) setRoles(JSON.parse(r));
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  const decisions = log.entries.filter((e) => e.kind === "decision");
  const questions = log.entries.filter((e) => e.kind === "question");
  const openQs = questions.filter((q) => !q.answer);
  const undecided = decisions.filter((d) => notAnswered(d, log.members).length > 0);
  const stale = openQs.filter((q) => daysSince(q.at) >= 5);

  const nothingYet = !roles && log.entries.length === 0;

  const summaryText = [
    `${log.project || "Group project"} — how we're working`,
    "",
    log.members.length ? `Group: ${log.members.join(", ")}` : "",
    "",
    roles ? "How the work is split:" : "",
    ...(roles?.roles.map((r) => `- ${r.memberName}: ${r.workstream}`) ?? []),
    roles?.agreement.unclaimed.length ? `- Not yet claimed: ${roles.agreement.unclaimed.join(", ")}` : "",
    "",
    `Decisions recorded: ${decisions.length}`,
    `Decisions everyone has confirmed: ${decisions.length - undecided.length}`,
    `Questions still open: ${openQs.length}`,
    "",
    openQs.length ? "Open questions:" : "",
    ...openQs.map((q) => `- ${q.text} (open ${daysSince(q.at)} day(s))`),
  ]
    .filter((l) => l !== "")
    .join("\n");

  return (
    <div className="space-y-10">
      <section className="measure space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          Show your teacher how the work is going.
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          One page describing the project&rsquo;s process — how the work was split, what has
          been agreed, and what is still open. Useful when marks are individual, and useful for
          raising a problem early with something concrete to point at.
        </p>
        <div className="card p-4">
          <p className="text-sm font-semibold mb-1">This is yours to send, or not.</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            There is no teacher login and no dashboard watching your group. Nothing here goes
            anywhere unless you copy it and send it. And nothing here describes a person — no
            participation score, no per-student count, no judgement about anyone. It only
            describes the work.
          </p>
        </div>
      </section>

      {nothingYet ? (
        <section className="card p-5">
          <h2 className="font-semibold mb-2">Nothing to show yet</h2>
          <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
            Split the work on the <a href="/group" className="underline">Split the work</a> page,
            or record something on the{" "}
            <a href="/log" className="underline">
              Decisions
            </a>{" "}
            page, and it will appear here.
          </p>
        </section>
      ) : (
        <>
          <section aria-labelledby="sum-h" className="card p-5 space-y-4">
            <h2 id="sum-h" className="text-xl font-semibold">
              {log.project || "This project"}
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Decisions recorded", value: decisions.length },
                { label: "Confirmed by everyone", value: decisions.length - undecided.length },
                { label: "Questions still open", value: openQs.length },
                { label: "Parts of the work", value: roles?.roles.length ?? 0 },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {s.label}
                  </dt>
                  <dd className="text-2xl font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {roles && (
            <section aria-labelledby="split-h">
              <h2 id="split-h" className="text-xl font-semibold mb-3">
                How the work is split
              </h2>
              <ul className="space-y-2">
                {roles.roles.map((r) => (
                  <li key={r.memberId} className="card p-3 flex flex-wrap gap-x-3 items-baseline">
                    <span className="font-medium">{r.memberName}</span>
                    <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
                    <span style={{ color: "var(--accent)" }}>{r.workstream}</span>
                  </li>
                ))}
              </ul>
              {roles.agreement.unclaimed.length > 0 && (
                <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                  Not yet claimed by anyone: <strong>{roles.agreement.unclaimed.join(", ")}</strong>
                </p>
              )}
            </section>
          )}

          {/* Process flags — always about the project, never about a person. */}
          {(undecided.length > 0 || stale.length > 0 || (roles?.agreement.unclaimed.length ?? 0) > 0) && (
            <section aria-labelledby="flag-h">
              <h2 id="flag-h" className="text-xl font-semibold mb-1">
                Worth a conversation
              </h2>
              <p className="text-sm mb-3 measure" style={{ color: "var(--text-muted)" }}>
                These are facts about the project, not about anyone in it.
              </p>
              <ul className="space-y-2">
                {undecided.length > 0 && (
                  <li className="card p-3 text-sm">
                    <strong>{undecided.length}</strong>{" "}
                    {undecided.length === 1 ? "decision has" : "decisions have"} been written down
                    but not confirmed by the whole group yet.
                  </li>
                )}
                {stale.length > 0 && (
                  <li className="card p-3 text-sm">
                    <strong>{stale.length}</strong>{" "}
                    {stale.length === 1 ? "question has" : "questions have"} been open for five days
                    or more.
                  </li>
                )}
                {(roles?.agreement.unclaimed.length ?? 0) > 0 && (
                  <li className="card p-3 text-sm">
                    Part of the work has no owner:{" "}
                    <strong>{roles!.agreement.unclaimed.join(", ")}</strong>.
                  </li>
                )}
              </ul>
            </section>
          )}

          {openQs.length > 0 && (
            <section aria-labelledby="oq-h">
              <h2 id="oq-h" className="text-xl font-semibold mb-3">
                Questions we haven&rsquo;t settled
              </h2>
              <ul className="space-y-2">
                {openQs.map((q) => (
                  <li key={q.id} className="card p-3">
                    <p className="text-sm">{q.text}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Open for {daysSince(q.at)} day(s)
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="no-print flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary px-5 py-2.5"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summaryText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                } catch {}
              }}
            >
              {copied ? "Copied — paste it into an email" : "Copy this summary"}
            </button>
            <button type="button" className="btn btn-quiet px-4 py-2.5" onClick={() => window.print()}>
              Print or save as PDF
            </button>
          </section>
        </>
      )}
    </div>
  );
}
