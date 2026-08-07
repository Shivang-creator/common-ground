import { CHECKS } from "@/lib/checks";

export const metadata = {
  title: "A three-minute walkthrough — Common Ground",
  description: "What to click, in what order, and what to look for. Written for anyone evaluating this project.",
};

const Step = ({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) => (
  <li className="card p-5">
    <div className="flex items-baseline gap-3 mb-2">
      <span
        className="text-sm font-semibold px-2.5 py-0.5 rounded-full shrink-0"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        Step {n}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="space-y-3 measure">{children}</div>
  </li>
);

const Look = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
    <span className="font-semibold">Look for: </span>
    {children}
  </p>
);

export default function JudgesPage() {
  return (
    <div className="space-y-10">
      <section className="measure space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          A three-minute walkthrough.
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          What to click, in what order, and what each part is trying to prove. Written for
          anyone evaluating this — but it works just as well if you have simply landed here and
          want the short version.
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          Nothing here needs an account, a login, or an API key. Every page works on a phone.
        </p>
      </section>

      <section aria-labelledby="idea-h" className="card p-5 sm:p-6 measure">
        <h2 id="idea-h" className="text-xl font-semibold mb-3">
          The one idea, first
        </h2>
        <p className="mb-3">
          A tool that helps <em>neurodivergent students specifically</em> requires you to
          identify as one in order to use it. That means disclosing, and being marked out at
          exactly the moment you least want to be.
        </p>
        <p className="mb-3">
          So Common Ground is built the other way round: <strong>a tool a whole class uses</strong>,
          whose design removes barriers that happen to fall hardest on some people.
        </p>
        <p className="font-semibold">
          Nobody discloses anything. Everyone benefits. The student it was designed for is the
          last one anybody would guess.
        </p>
      </section>

      <section aria-labelledby="steps-h">
        <h2 id="steps-h" className="text-2xl font-semibold mb-4">
          The walkthrough
        </h2>
        <ol className="space-y-4">
          <Step n={1} title="Read a brief — 40 seconds">
            <p>
              Go to <a href="/" className="underline font-medium">Read a brief</a>, press{" "}
              <strong>Use an example</strong>, then <strong>Read this brief</strong>.
            </p>
            <p>
              The example is an ordinary-looking group assignment. It has {CHECKS.length} checks run
              against it and comes back with roughly twenty things worth asking about.
            </p>
            <Look>
              every finding quotes the <em>exact words</em> from the brief that triggered it. You
              can disagree with any one of them. Nothing is a black box, and nothing is a
              judgement about the reader — the summary says so explicitly:{" "}
              <em>&ldquo;None of this is a gap in you. It&rsquo;s a gap in the brief.&rdquo;</em>
            </Look>
          </Step>

          <Step n={2} title="Carry it into the split — 40 seconds">
            <p>
              In the results, find <strong>The parts this splits into</strong> and press{" "}
              <strong>Use these to split the work</strong>. Add two or three names, tap a couple
              of preferences each, and press <strong>Work out the split</strong>.
            </p>
            <Look>
              scroll past the roles to <strong>How this group works</strong>. If one person asked
              for several days&rsquo; notice before meetings, the group&rsquo;s rule is now
              several days&rsquo; notice — <strong>with no name attached to it</strong>. Try it
              with different answers and watch the rule change.
              <br />
              <br />
              That is the whole mechanism of this project in one screen:{" "}
              <strong>someone gets what they need without ever having to say why.</strong>
            </Look>
          </Step>

          <Step n={3} title="Decisions — 30 seconds">
            <p>
              Open <a href="/log" className="underline font-medium">Decisions</a>. Add two names,
              pick which one you are, and record a decision.
            </p>
            <Look>
              it shows who has agreed <em>and who has not answered</em>, as its own state — and
              says plainly that those are not the same thing.{" "}
              <strong>Silence is never counted as a yes.</strong> Raising something in writing is
              a first-class entry, so nobody has to win a turn in a live conversation to get
              something on the record.
            </Look>
          </Step>

          <Step n={4} title="The display controls — 20 seconds">
            <p>
              Press <strong>Display</strong> in the header, on any page. Change the text size,
              switch spacing to <strong>Roomy</strong>, try a different typeface and high
              contrast.
            </p>
            <Look>
              the controls are in the header on <em>every</em> page, in the same place — not
              hidden behind a label that makes you identify as needing them. Settings persist and
              are applied before first paint, so the page never flashes in the wrong state.
              <br />
              <br />
              On the typeface: evidence for specialised &ldquo;dyslexia fonts&rdquo; is genuinely
              mixed, so the interface says <em>&ldquo;pick whichever is easier for you to read.
              There is no correct answer.&rdquo;</em> A preference, not a remedy.
            </Look>
          </Step>

          <Step n={5} title="Optional — the parts that prove the claims">
            <p>
              <a href="/checks" className="underline font-medium">Checks</a> lists all{" "}
              {CHECKS.length}, rendered straight from the array the engine runs, so it cannot
              drift or claim a check that does not exist.
            </p>
            <p>
              <a href="/share" className="underline font-medium">Share</a> is the teacher-facing
              page — and it is deliberately <em>not</em> a dashboard that watches groups. The
              group composes it and decides whether to send it.
            </p>
          </Step>
        </ol>
      </section>

      <section aria-labelledby="ai-h" className="card p-5 sm:p-6">
        <h2 id="ai-h" className="text-xl font-semibold mb-3">
          Where the AI is, and where it deliberately isn&rsquo;t
        </h2>
        <div className="space-y-3 measure">
          <p>
            <strong>Two layers.</strong> {CHECKS.length} deterministic checks are pure functions
            over the text — no model, no key. On top, an AI layer extracts what the brief asks
            for, a checkable definition of done, and the separable parts of the work.
          </p>
          <p>
            <strong>The app works with no API key at all.</strong> Clone it, run it with no
            environment file, and the checks still work — that is tested, not just claimed. The AI
            improves the output; it is never load-bearing.
          </p>
          <p>
            <strong>The role allocation contains no model call, on purpose.</strong> If a group
            disputes the split, <em>&ldquo;the AI decided&rdquo;</em> is not an acceptable answer.
            So it is a deterministic algorithm where every allocation quotes the preference that
            produced it.
          </p>
          <p>
            <strong>The AI never rewrites anything.</strong> It extracts and asks. It never
            restates the brief in different words and never writes any part of the assignment —
            a rule taken directly from ASAN&rsquo;s finding that generative AI{" "}
            <em>&ldquo;added new ideas that were not in the text we wrote.&rdquo;</em>
          </p>
        </div>
      </section>

      <section aria-labelledby="never-h" className="card p-5 sm:p-6">
        <h2 id="never-h" className="text-xl font-semibold mb-3">
          What it will never do
        </h2>
        <ul className="space-y-3 measure text-sm">
          <li>
            <strong>Never infers or reports anything about a person.</strong> No account, no
            profile, no score. The only input is a document — there is nothing to infer from. A
            tool that detected neurodivergence and told a teacher would be outing people without
            consent.
          </li>
          <li>
            <strong>Never monitors, times, scores or gamifies.</strong> No streaks, no timers, no
            progress guilt. Masking research links performance pressure to real harm, so none of
            the usual engagement mechanics appear anywhere.
          </li>
          <li>
            <strong>Never teaches anyone to mask.</strong> It changes the environment, not the
            person.
          </li>
        </ul>
        <p className="text-sm mt-4 measure" style={{ color: "var(--text-muted)" }}>
          One automated test enforces this directly: no finding may ever contain clinical or
          diagnostic language. If someone later adds a check that says
          &ldquo;autistic&rdquo; or &ldquo;diagnosis&rdquo; in its output, the build fails.
        </p>
      </section>

      <section aria-labelledby="design-h" className="card p-5 sm:p-6">
        <h2 id="design-h" className="text-xl font-semibold mb-3">
          Why it looks this calm
        </h2>
        <div className="space-y-3 measure">
          <p>
            There is no animation on this site. Nothing moves, nothing slides in, nothing
            autoplays, and the hero illustration is a static drawing rather than something that
            builds itself as you scroll.
          </p>
          <p>
            That is a decision, not an omission. Sensory load is a documented barrier for a
            large part of the audience this was built for, and a tool that offers a
            &ldquo;reduce motion&rdquo; setting while animating its own landing page is not
            taking its own advice.
          </p>
          <p>
            The effort went instead into things that cost nothing to read: generous line spacing
            by default, a short measure so lines never run too long, colour that is never the
            only way meaning is carried, and severity badges that always spell out the word.
          </p>
        </div>
      </section>

      <section className="measure">
        <h2 className="text-xl font-semibold mb-3">Everything else</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Source, the research it is built on, and the full reasoning behind each decision are in
          the{" "}
          <a
            href="https://github.com/Shivang-creator/common-ground"
            className="underline font-medium"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>
    </div>
  );
}
