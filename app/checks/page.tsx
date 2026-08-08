import { CHECKS } from "@/lib/checks";
import { CATEGORY_META, type CheckCategory } from "@/lib/types";

export const metadata = {
  title: "Every check — Common Ground",
  description: "The full list of what Common Ground looks for in an assignment brief, and what it deliberately does not do.",
};

/**
 * The full check list, rendered from the same array the engine runs.
 *
 * This page exists because a tool that makes judgements about someone's
 * assignment should be readable without cloning a repo. Nothing here is a
 * marketing summary — it is generated from CHECKS, so it cannot drift out of
 * date, and it cannot claim a check that does not exist.
 */
export default function ChecksPage() {
  const byCategory = new Map<CheckCategory, typeof CHECKS>();
  for (const c of CHECKS) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }

  return (
    <div className="space-y-10">
      <section className="measure space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          Everything this looks for.
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          All {CHECKS.length} checks, listed straight from the code that runs them. None of
          these need an API key, an account, or an internet connection to the outside world —
          they are plain functions over the text you paste.
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          Where a check finds something in the text, it quotes the exact words that triggered
          it. Some checks look for what <em>isn&rsquo;t</em> there — a missing deadline has
          nothing to quote — and those say so plainly instead.
        </p>
      </section>

      <div className="space-y-8">
        {[...byCategory.entries()].map(([cat, checks]) => {
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat} aria-labelledby={`c-${cat}`}>
              <h2 id={`c-${cat}`} className="text-xl font-semibold">
                {meta.label}
              </h2>
              <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                {meta.blurb}
              </p>
              <ul className="space-y-2">
                {checks.map((c) => (
                  <li key={c.id} className="card p-4">
                    <p>{c.describes}</p>
                    <p className="text-xs mt-2 font-mono" style={{ color: "var(--text-muted)" }}>
                      {c.id}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="measure space-y-3">
        <h2 className="text-xl font-semibold">And what it never does</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>It never decides anything about you.</strong> There is no account, no
            profile, no score. The only thing it reads is a document.
          </li>
          <li>
            <strong>It never rewrites the brief.</strong> It points at gaps and hands them back
            as questions in your own hands. Your teacher&rsquo;s words stay your teacher&rsquo;s
            words.
          </li>
          <li>
            <strong>It never writes the assignment.</strong> It describes the task. It does not
            do it.
          </li>
          <li>
            <strong>It never tells anyone anything.</strong> Nothing you paste is stored, and
            nothing about how you use it is reported to a teacher, a school, or us.
          </li>
        </ul>
      </section>
    </div>
  );
}
