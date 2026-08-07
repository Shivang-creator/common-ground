# Common Ground

**Make the unwritten rules written.**

Live: **https://common-ground-shivang-creator-shivcreates.vercel.app**
No account, no login, no setup. Paste a brief, or press *Use an example*.

Built for [IncludAI 2026](https://includai-2026.devpost.com/), the neurodiversity
hackathon run by IncludEDU in partnership with the Stanford Network for K-12
Neurodiversity Education and Advocacy.

---

## The problem

An assignment brief says: *"critically analyse a contemporary issue… explore the
topic… use appropriate sources… as discussed in the seminar, follow the usual
format. Groups should organise themselves."*

Six things are missing and none of them are marked as missing. How long is it?
What do you hand in? What are the marks actually for? Does "discuss" mean weigh
both sides or argue a position? How many is "appropriate"? Who does what — and do
you all get the same mark?

Some students fill those gaps by reading the room, asking a friend, or having
absorbed the conventions without noticing. That's the **hidden curriculum**:

> *"Neurotypical pupils often absorb these 'school rules' intuitively, while
> autistic pupils are expected to work them out."*

Everyone else pays for the gaps in time, in stress, and in marks — and the cost
lands hardest on autistic and ADHD students, students working in a second
language, and anyone who missed the class where it was explained.

Group work makes it worse. The finding that shaped this project:

> *"It wasn't the content that caused difficulty, it was the unpredictability of
> peer communication."*

**The work isn't the hard part. The unwritten social process around it is.**

---

## What Common Ground does

Four tools, all built on the same idea: take something that is normally decided
implicitly, and write it down.

### 1 · Read a brief — `/`
Paste an assignment. It returns **what finished looks like** (a concrete,
checkable list, derived only from what the brief says), **what you hand in**, and
**questions worth asking** — grouped by kind, each quoting the exact text that
triggered it and giving you a sentence you can send straight to a teacher.

It does not rewrite the brief. It does not write the assignment. It names the gaps
and hands them back as questions.

### 2 · Split the work — `/group`
Roles usually get decided by talking, fast, in the first meeting. That reliably
favours whoever is most comfortable negotiating out loud.

Instead: everyone answers the same four questions — which parts they want, how
they'd rather contribute, how much notice they want before a meeting, how they
want feedback. The split comes out of stated preferences, and **every allocation
carries a reason quoting what that person chose**.

It ends with a **working agreement** that accommodates the widest stated need and
never says whose it was. If one person asks for several days' notice, the group
norm becomes several days' notice — stated as a group rule, with no name attached.
**That is the mechanism by which someone gets what they need without disclosing
why they need it.**

There is no model call in the allocation, deliberately. If a group disputes the
split, *"the AI decided"* is not an acceptable answer.

### 3 · Decisions — `/log`
*A decision is only a decision once it is written down.* Otherwise agreement has
to be inferred from tone, silence and who didn't object.

**Silence is never counted as a yes.** Each entry shows who has agreed and who has
*not answered* — displayed as its own state, with the page saying plainly that not
answering is not the same as disagreeing. Raising something in writing is a
first-class entry: you never have to win a turn in a live conversation to get
something on the record.

There is also a private, **on-device-only** panel showing things *you* raised that
nobody answered. Never aggregated, never shared, never sent anywhere.

### 4 · Share — `/share`
The obvious version of this is a teacher dashboard that watches groups. **That is
deliberately not what this is.** A tool that reports on students to an authority
figure is surveillance regardless of intent.

So it is reversed: **the group composes this page, and the group decides whether
to send it.** No teacher login, no dashboard, no feed of groups. Everything on it
is a fact about the *project* — decisions not yet confirmed, questions open five
days or more, parts of the work with no owner. No participation score, no
per-student count, no judgement about any person.

### Also: `/judges` and `/checks`
`/judges` is a three-minute guided walkthrough — what to click, in what order, and
what each part is trying to prove.

Every check, listed straight from the array the engine runs, so the tool can be
read without cloning it.

---

## Why it's built for everyone, not for a diagnosis

This is the central design decision.

A tool that helps *neurodivergent students specifically* requires you to identify
as one to use it. That means disclosure, and it means being marked out at exactly
the moment you least want to be. So Common Ground is built the other way round: a
tool a **whole class** uses, whose design happens to remove barriers that fall
hardest on some people.

That principle has a name — **Universal Design for Learning** — and the research
supports it directly: UDL *"shifts inclusion from an accommodation mindset to a
design mindset, one where flexibility is built in from the start,"* and it
*"minimises the burden on neurodiverse students to request accommodations and
reduces the stigma."*

**Nobody discloses anything. Everyone benefits. The student it was designed for is
the last one anybody would guess.**

---

## What this tool will never do

These are architectural commitments, not policy promises.

| Never | Why |
|---|---|
| **Infer or report anything about a person** | There is no account, no profile, no behavioural score. The only input is a document. A tool that detected neurodivergence and told a teacher would be outing people without consent — the opposite of the point. |
| **Rewrite the brief or the student's words** | ASAN's July 2025 position on generative AI in accessibility work found it *"added new ideas that were not in the text we wrote"* and *"changes what something means."* This tool extracts and asks. It never restates. |
| **Write any part of the assignment** | It describes the task. It does not do it. |
| **Monitor, time, score or gamify** | *"An AI that detects a loud environment and does nothing about the resulting anxiety is not an accommodation. It is surveillance with extra steps."* And masking research links performance pressure to real harm — so there are no streaks, no timers, no progress guilt anywhere in this product. |
| **Teach anyone to mask** | It changes the environment, not the person. Nothing here asks a student to communicate differently. |

---

## How it works

Two layers. The first does the work; the second improves it.

### 1. Deterministic checks — no key required

18 checks across 7 categories, each a pure function over the brief text:

| Category | Looks for |
|---|---|
| **The finish line** | No length · no deliverable format · no deadline |
| **What you're being asked to do** | 14 instruction verbs markers read differently — *discuss, explore, critically analyse, engage with, reflect on…* — plus softened wording where required-vs-optional is unclear (*"you may wish to"*, *"ideally"*, *"where possible"*) |
| **How it's marked** | No rubric or criteria mentioned · several parts with no weighting |
| **How much** | Unquantified amounts — *some, several, appropriate, sufficient* |
| **Assumed knowledge** | *obviously, simply, as discussed, the usual format* — the hidden curriculum, in words — plus acronyms never spelled out |
| **Working as a group** | No role guidance · unclear whether the mark is shared or individual · no route if it goes wrong · no group size |
| **Between now and the deadline** | No checkpoint · sources expected but not defined · no submission method · no extensions policy |

Every finding quotes the exact text that triggered it. Nobody has to trust a
model's opinion about their assignment.

**Adding a check is one entry in `CHECKS`.** Nothing else in the codebase changes.

### 2. The AI layer — meaningful, and never load-bearing

Extracts the summary, a checkable definition of done, the deliverables, and the
separable workstreams. Rules it operates under, in code:

- **Only uses what's in the brief.** Never invents requirements, deadlines or criteria.
- **Never rewrites meaning.** Extract, don't reinterpret.
- **Degrades to nothing.** No key, a timeout, a malformed response → the caller
  gets `null` and the checks stand alone. A missing interpretation is fine; a
  confidently wrong one is not.
- **Never sees a person.** The only thing sent anywhere is the brief text.

Providers are tried in order and both are OpenAI-compatible: **Google Gemini**
(`gemini-3.6-flash`), then **Featherless** as fallback.

---

## Accessibility

25% of this hackathon's rubric, and the part usually bolted on last. Here it's in
the first commit.

- **Text size** (5 steps), **spacing** (line, letter and word), **typeface**,
  **contrast**, **colour theme**, **motion** — all user-controlled, all persisted,
  all applied *before first paint* so the page never flashes in the wrong state
- Controls live in the header on every page, in the same place, reachable by
  keyboard — **not** hidden behind a label that makes you identify as needing them
- Full keyboard operation, visible focus rings, skip link, live status regions
- Severity never communicated by colour alone — every badge carries a word
- Zoom never blocked
- Plain, direct language throughout. No idioms, no metaphors
- **No timers, no streaks, no notifications, no sound, no autoplay, no animation
  by default**

On the typeface control: evidence for specialised "dyslexia fonts" improving
reading speed is genuinely mixed, so the UI says *"pick whichever is easier for
you to read. There is no correct answer."* We offer a preference, not a remedy.

---

## Tests

```bash
npm test    # 56 tests
```

The one that matters most is **"a complete brief stays quiet"**. A checker that
flags something on every input is worse than no checker — it trains people to
ignore it, and it tells a student their perfectly clear assignment is full of
problems. So a brief that genuinely answers everything must produce **zero
blockers**.

That test failed the first time it ran, and caught a real false positive: a brief
saying *"bring a one page outline to the seminar in week 6 for feedback"* was being
told it had no checkpoint, because the check looked for "draft" and "formative" but
not "outline" — the word briefs actually use.

The suite also covers determinism in the role allocation (same input, same output,
regardless of the order people were entered), tolerant JSON parsing that throws
rather than guessing, and 9 pathological inputs including empty, unicode, regex
metacharacters and HTML.

One test enforces a product rule directly: **no finding may ever contain clinical
or diagnostic language.** This tool describes documents, never readers.

## Run it yourself

```bash
git clone https://github.com/Shivang-creator/common-ground
cd common-ground && npm install
cp .env.example .env.local     # optional — it works without keys
npm run dev
```

Without an API key you get the deterministic checks, which are the majority of the
value. With one, you also get the definition of done and workstreams.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · deployed on Vercel.
No database. Nothing you paste is stored — it is sent once, read, and forgotten.

---

## Research this is built on

- Hidden curriculum in schools — [Tes](https://www.tes.com/magazine/analysis/secondary/why-autistic-pupils-face-behaviour-barriers-in-schools)
- Group work and peer unpredictability — [De Gruyter](https://www.degruyterbrill.com/document/doi/10.1515/edu-2019-0008/html), [Sparkle Buds](https://sparklebuds.com/2026/05/21/autism-and-group-work-stress-classroom-adjustments-that-prevent-shutdowns/)
- Autistic inertia and unstructured environments — [APS Observer](https://www.psychologicalscience.org/publications/observer/student-notebook-autistic-inertia-srinivasan.html)
- Universal Design for Learning and stigma reduction — [Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1654115/full)
- Generative AI in plain-language work — [ASAN](https://autisticadvocacy.org/2025/07/asan-says-no-generative-ai-in-plain-language/)
- Surveillance vs accommodation — [Built Without Us](https://www.davidruttenberg.com/post/built-without-us-the-ai-and-autism-ethics-gap-nobody-is-closing)
- Masking and mental health — [Therapist Neurodiversity Collective](https://therapistndc.org/therapy/social-skills-training/), [Avela Health](https://www.avelahealth.com/resources/why-social-skills-training-often-fails-autistic-individuals/)

## Licence

MIT
