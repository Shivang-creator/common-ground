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

## Not built yet — tonight's work with you

- **Group setup** — the private preference form → proposed explicit roles. Types
  are written (`MemberPrefs`, `RoleProposal`), UI isn't.
- **Decision log**
- **Teacher view** — group process health only, never individuals
- **Demo video**

I'm continuing on group setup overnight.

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
