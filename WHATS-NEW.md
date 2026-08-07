# Read this on your phone ☕

**Live now:** https://common-ground-shivang-creator-shivcreates.vercel.app
**Repo:** https://github.com/Shivang-creator/common-ground

Open the link, tap **"Use an example"**, then **"Read this brief"**. That's the
whole product in two taps. Also open the **Display** button top-right and change
the text size — everything persists.

---

## What's built and working

**The brief decoder — the hero feature, done.**
Paste an assignment brief, get back:
- **What finished looks like** — a checkable list, derived only from the brief
- **What you hand in** — the deliverables it implies
- **Questions worth asking** — grouped, each with the exact text that triggered it,
  why it matters, and a sentence you can send straight to a teacher
- **Copy all questions** button, and print support

On the example brief it finds **21 things**, 5 of them blockers. Live API round
trip is ~9 seconds.

**Two layers, deliberately.**
1. **12 deterministic checks** across 7 categories — pure functions, no API key
   needed. Every finding quotes the exact text that triggered it.
2. **AI layer** on top — extracts the summary, definition of done, deliverables
   and separable workstreams.

**The app works with no API key at all.** The AI improves it; it's never
load-bearing. That's deliberate — a judge who clones it without keys still gets a
real result. (Same lesson as Pitstop's fixture mode.)

**Accessibility, built in from the first commit** — text size (5 steps), spacing,
typeface, contrast, colour theme, motion. All persisted, applied before first
paint so there's no flash. Keyboard throughout, visible focus, skip link, live
status announcements. **No timers, no streaks, no pressure mechanics anywhere** —
the masking research makes those an active harm for this audience.

---

## What I decided, and why — check these

**1. The tool never rewrites the brief.** It points at gaps and hands them back as
questions. This is directly because of ASAN's July 2025 position: generative AI
"added new ideas that were not in the text we wrote" and "changes what something
means." So we extract and ask. We never restate.

**2. Nothing models a person.** No account, no profile, no score. The only input
is a document. There is no code path that could infer anything about a student,
because there's nothing to infer from. This is the fix for the concern you raised
last night.

**3. Severity is "Blocks starting / Slows you down / Worth checking"** — not
"error/warning/info". The framing is about the *work*, never about the reader.

**4. The summary says "None of this is a gap in you. It's a gap in the brief."**
That sentence is doing a lot of work. Change it if it reads wrong to you.

**5. Font choice is offered as a preference, not a remedy.** Evidence for
specialised "dyslexia fonts" is genuinely mixed — so the UI says "pick whichever
is easier for you to read. There is no correct answer." Honest, and it avoids
claiming something the research doesn't support.

---

## ✅ Group setup — now built and live

**https://common-ground-shivang-creator-shivcreates.vercel.app/group**

Everyone answers the same four questions — which parts they want (tapped in
preference order), how they'd rather contribute, how much notice they want before
a meeting, how they want feedback. Then it produces the split, with a reason
attached to every allocation that quotes what that person actually chose.

**The bit I'm most pleased with — "How this group works".** It builds a working
agreement that *accommodates the widest stated need and never says whose it was*.
If one person asks for several days' notice, the group norm becomes several days'
notice — stated as a group rule with no name attached. That's the whole mechanism
by which someone gets what they need without disclosing why they need it.

No model call in the allocation, deliberately. If a group disputes the split, "the
AI decided" is not an acceptable answer — so it's a deterministic algorithm where
every line can be explained.

## ✅ Decision log — built and live

**/log** — "A decision is only a decision once it's written down."

The design point: **silence is never counted as agreement.** Each entry shows who
has said yes and who has *not answered*, displayed as its own state, with the UI
saying plainly that not answering is not the same as disagreeing. And raising
something in writing is a first-class entry — you never have to win a turn in a
live conversation to get something on the record.

There's a private, on-device-only panel: *"things you raised that nobody's
answered."* Never aggregated, never shared, never sent anywhere. Self-advocacy
support is what self-advocates recommend *instead of* teaching people to
communicate differently.

## ✅ Share with your teacher — built and live, and inverted

**/share** — I did **not** build a teacher dashboard. A tool that reports on
students to an authority figure is surveillance regardless of intent.

So it's reversed: **the group composes this page and the group decides whether to
send it.** No teacher login, no dashboard, no feed of groups. A teacher sees it
only because a group handed it over. Everything on it is a fact about the
*project* — decisions recorded, decisions not yet confirmed, questions open five
days or more, parts of the work with no owner. No participation score, no
per-student count.

This is the version of your "teachers understand the student better" instinct
that survives the ethics review.

## ✅ Checks: 12 → 18

Added the politest ways marks get lost: *"you may wish to"* / *"ideally"* /
*"where possible"* (required or optional?), unexplained acronyms, no submission
method, no extensions policy, no group size, and several parts with no weighting.

Verified live: **18 checks, 23 findings** on the sample brief, and the conditional
checks correctly stay quiet when a brief does answer them.

## ✅ /checks — every check, listed

**/checks** renders the full list straight from the array the engine runs, so it
can't drift out of date and can't claim a check that doesn't exist. A tool that
makes judgements about someone's assignment should be readable without cloning a
repo — this is also the page to point a judge at.

## ✅ The flow now joins up

The decoder found the parts of the work, but the group page was making you retype
them. That seam was exactly the friction this project exists to remove — and it
broke the one flow a demo wants to show.

Now: read a brief → **"The parts this splits into"** → one button carries them to
the split. Verified live: a real brief returns workstreams and hands them over.

## ✅ SUBMISSION.md — your Sunday morning, mostly written

A full Devpost description draft, the design-rationale table (every decision mapped
to the research finding behind it), and a **3-minute video script** timed section by
section. One section is deliberately left blank: how neurodivergent users shaped it.
That's the bit only you can fill in.

## ✅ 56 tests — and they found a bug

`npm test`. The one that matters is **"a complete brief stays quiet"**: a checker
that flags something on every input is worse than no checker.

**It failed on the first run.** A brief saying *"bring a one page outline to the
seminar in week 6 for feedback"* was being told it had no checkpoint — the check
looked for "draft" and "formative" but not "outline", which is the word briefs
actually use. Fixed the check, not the test. That's a false positive a judge or a
tester would have hit.

Also covers: role allocation determinism (same answer across 20 runs and any input
order), the agreement always taking the widest stated need *without naming who
needed it*, tolerant JSON parsing that throws rather than guessing, and 9
pathological inputs (empty, unicode, regex metacharacters, HTML, a 60k-word brief).

One test enforces a product rule directly: **no finding may ever contain clinical
or diagnostic language.** Good number to quote in the submission.

## ✅ Verified the no-key claim — and it found one more bug

I'd written in the README *and* the submission draft that the app works with no API
key. I'd never actually run it that way. **It does** — 18 checks, 23 findings, page
renders fine.

But testing the claim instead of asserting it found a gap: with no provider
configured the UI showed no interpretation *and no reason why*, because the "no AI
provider is configured" message could never fire. To a judge cloning the repo
without keys, that reads like something is broken rather than a deliberate design.
Fixed.

Two bugs now found by testing claims rather than trusting them. Worth remembering.

## ✅ Design, walkthrough and compliance audit

**On animations / 3D — I pushed back, and here's why.** Usability & accessibility is
**25%** of the score and sensory load is a documented barrier for this audience. A
tool that offers a "reduce motion" setting while animating its own landing page is
not taking its own advice, and Stanford NNEA judges would spot that first.

But you were right that it read as unfinished. So the effort went where it costs
nothing to read:
- **A static hero figure** — a brief with the vague parts marked, and the questions
  that come back. Someone who reads none of the copy still understands the product.
  It reuses the severity palette, so colours mean the same thing on the landing page
  as in a result.
- Deleted the five stock Next.js SVGs still sitting in `public/`.
- **`/judges`** — a three-minute walkthrough with a "why it looks this calm" section.
  Restraint that's explained reads as a decision; restraint that isn't reads as an
  omission.

**`COMPLIANCE.md`** holds the whole thing against the rules and rubric, including a
blunt "where this could lose" section.

## ⚠️ The competition, from Discord

- **Rehearse** (osasgentech, Track 2) — live at rehearse.duckdns.org. A voice agent
  roleplaying conversations to practise. **This is the idea I talked you out of.**
  Note their safety layer: say "stop" and it drops the roleplay instantly — they're
  handling the masking risk directly. Not our track, and our reasoning holds.
- **H_L** (Track 1) — ADHD task initiation, and they're an **NYU UI/UX designer with
  research experience**. Strongest competitor in your track. But they're building the
  thing four other visible projects are also building; you aren't.

## Not built yet

- **Demo video** — the script in SUBMISSION.md is ready to follow
- Anything you want changed after reading this

---

## Things I need your call on

1. **Name** — "Common Ground" is in the repo and the UI. Say if you want Roundtable.
2. **The `ME` Gemini key had a stray leading `P`** (a paste artifact). I stripped
   it in the env — worth fixing in `~/.gemini-router/keys.env` too so the router works.
3. **Track** — I'd submit to **Track 1**. Every other Track 1 entry is a task
   splitter; this is the differentiated one, and the $1,000 Grand Prize is judged
   across all tracks anyway.
4. **Did anyone reply on Discord?** If yes, send them the live link — it's ready
   to be tried.

---

## If something looks wrong

Reply from your phone with what to change and I'll queue it. The repo is public
and the deploy auto-updates from `main`.


---

## Overnight log

**07 Aug, ~03:00** — Group setup shipped (`/group`). Deterministic preference-based
allocation + working agreement. Nav added to the header. Both pages verified HTTP 200
in production. Continuing on the decision log next.

**07 Aug, ~03:30** — Decision log (`/log`) and Share (`/share`) shipped. Checks 12 → 18.
All four pages verified HTTP 200 in production, live API confirmed running 18 checks
with AI on. All four planned features are now built — remaining work is your review,
a real user's feedback if anyone replied on Discord, and the demo video.

**07 Aug, ~03:55** — Added `/checks` (all 18, generated from the engine). README now
documents all four tools and the reasoning behind each. Accessibility audit across all
five pages: fixed an invalid `aria-pressed` on a `<label>` in the group form and made
keyboard focus visible on the hidden radios via `:focus-within`. Heading order verified
correct, every input labelled, no colour-only meaning. Five pages live at HTTP 200.

**07 Aug, ~04:20** — Joined the flow: decoder workstreams now carry into the group page
instead of being retyped. Added SUBMISSION.md with a Devpost draft, the design-rationale
table and a 3-minute video script. Five pages live at HTTP 200; live API confirmed
returning 18 checks and workstreams.

**07 Aug, ~04:45** — Added a 56-test suite (vitest). It immediately caught a false
positive in the checkpoint check and I fixed the check. All five pages still live at
HTTP 200. README documents the testing approach.

**07 Aug, ~05:45** — Verified the app genuinely runs with no API key (it does), and
fixed the resulting bug where the "no provider configured" explanation could never
display. 56 tests pass, five pages live at HTTP 200, production API confirmed healthy.

**Everything I can do without you is done.** Waiting on: your review, a Discord tester
if one replied, and the demo video.

**07 Aug, ~07:30** — Static hero figure, `/judges` walkthrough, stock assets removed,
`COMPLIANCE.md` audit against rules and rubric. Six pages live at HTTP 200, 56 tests
passing. Pushed back on animation/3D — reasoning in the design section above.
