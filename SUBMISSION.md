# IncludAI submission — draft

Everything needed for Devpost, ready to edit and paste.
**Deadline: Sat 8 Aug 11:59 PM PT = Sun 9 Aug ~12:15 IST.**
Track: **1 — AI for Learners Who Think Differently.**

Requirements checklist:
- [ ] Demo video, 3 min max, public on YouTube or Vimeo
- [x] Public GitHub repo — https://github.com/Shivang-creator/common-ground
- [ ] Project description (draft below)
- [x] Live product — https://common-ground-shivang-creator-shivcreates.vercel.app

---

## 1 · Devpost project description — draft

### The problem

An assignment brief says: *"critically analyse a contemporary issue… explore the
topic… use appropriate sources… as discussed in the seminar, follow the usual
format. Groups should organise themselves."*

Six things are missing, and none of them are marked as missing. How long is it?
What do you hand in? What are the marks for? Does "discuss" mean weigh both sides
or argue a position? How many is "appropriate"? Who does what — and does everyone
get the same mark?

Some students fill those gaps by reading the room. That's the **hidden
curriculum** — and the research is blunt about who pays for it:

> *"Neurotypical pupils often absorb these 'school rules' intuitively, while
> autistic pupils are expected to work them out."*

Group work makes it worse. The finding that shaped this whole project:

> *"It wasn't the content that caused difficulty, it was the unpredictability of
> peer communication."*

**The work isn't the hard part. The unwritten social process around it is.**

### Who it's for — and the design decision that defines this project

A tool that helps *neurodivergent students specifically* requires you to identify
as one in order to use it. That means disclosure, and being marked out at exactly
the moment you least want to be.

So Common Ground is built the other way round: **a tool a whole class uses**,
whose design removes barriers that happen to fall hardest on some people. That
principle is Universal Design for Learning, and the research supports it directly —
UDL *"minimises the burden on neurodiverse students to request accommodations and
reduces the stigma."*

**Nobody has to disclose anything to benefit.**

The clearest example is in the group tool. Everyone answers the same four
questions about how they like to work. The output includes a group agreement that
**accommodates the widest stated need and never says whose it was** — if one
person asks for several days' notice before meetings, the group norm becomes
several days' notice, stated as a group rule with no name attached.

That is the entire mechanism: **someone gets what they need without ever
disclosing why they need it.**

### What it does

**Read a brief** — paste an assignment, get what finished looks like, what you
hand in, and the specific questions worth asking, each quoting the exact text that
triggered it and phrased so you can send it straight to a teacher.

**Split the work** — roles allocated from everyone's stated preferences instead of
by fast verbal negotiation, with a reason attached to every allocation, plus the
group working agreement.

**Decisions** — a log where **silence is never counted as agreement**. Each entry
shows who agreed and who has *not answered*, as its own state, with the page saying
plainly that not answering is not the same as disagreeing. Raising something in
writing carries the same weight as saying it aloud.

**Share** — a page the group composes and chooses whether to send to a teacher.
Not a dashboard that watches them.

### How AI is used meaningfully

Two layers, and the split matters.

**A deterministic layer** of 18 checks — pure functions over the brief text, no
model, no key. Every finding quotes the exact words that triggered it, so a student
can always disagree with one.

**An AI layer** on top that extracts what the brief asks for, a checkable
definition of done, and the separable parts of the work. It is bound by rules
written into the code:

- **Only uses what's in the brief.** Never invents requirements or criteria.
- **Never rewrites meaning.** It extracts and asks; it never restates the brief.
- **Degrades to nothing.** No key, a timeout, a malformed reply → the checks stand
  alone. A missing interpretation is fine; a confidently wrong one is not.

It is covered by **56 tests**, including one that enforces a product rule directly:
no finding may ever contain clinical or diagnostic language. This tool describes
documents, never readers.

**The app works with no API key at all.** The AI improves the output; it is never
load-bearing. That was deliberate — a tool for people who are routinely failed by
technology should not fail when a service is down.

And the role allocation contains **no model call on purpose**. If a group disputes
the split, *"the AI decided"* is not an acceptable answer, so it's a deterministic
algorithm where every line can be explained.

### What it will never do

- **Never infers or reports anything about a person.** No account, no profile, no
  score. The only input is a document. A tool that detected neurodivergence and
  told a teacher would be outing people without consent.
- **Never rewrites a student's or teacher's words.** ASAN's July 2025 position
  found generative AI *"added new ideas that were not in the text we wrote"* and
  *"changes what something means."*
- **Never monitors, times, scores or gamifies.** *"An AI that detects a loud
  environment and does nothing about the resulting anxiety is not an accommodation.
  It is surveillance with extra steps."* And masking research links performance
  pressure to real harm — so there are no streaks, timers or progress guilt.
- **Never teaches anyone to mask.** It changes the environment, not the person.

### Accessibility

Text size, spacing, typeface, contrast, colour and motion are all user-controlled,
persisted, and applied before first paint so the page never flashes. The controls
sit in the header on every page — **not** hidden behind a label that makes you
identify as needing them. Full keyboard operation, visible focus, skip link, live
status regions, no colour-only meaning, zoom never blocked.

On the typeface option: evidence for specialised "dyslexia fonts" is genuinely
mixed, so the UI says *"pick whichever is easier for you to read. There is no
correct answer."* A preference, not a remedy.

### ⚠️ How neurodivergent users shaped this — FILL THIS IN

**If someone replied on Discord:** name them (or note they chose anonymity), what
you asked, what they said, and — most important — **one concrete thing you changed
because of it.** One documented change beats five vague claims.

**If nobody replied:** say so plainly, note that you asked publicly in the
IncludEDU Discord on 7 August (screenshot it), and point to the design rationale
table below. The organiser explicitly sanctioned this route: *"Base your design on
published research, interviews, or first-person accounts from neurodivergent
creators (cite your sources in your submission)."*

---

## 2 · Design rationale — every decision, and the finding behind it

| Decision | Because |
|---|---|
| Built for a whole class; there is no disclosure path | UDL *"minimises the burden to request accommodations and reduces the stigma"* |
| Roles allocated by private form, not live discussion | *"It wasn't the content that caused difficulty, it was the unpredictability of peer communication"* |
| Written contribution path alongside spoken | Real-time turn-taking disadvantages processing-speed differences |
| Group agreement takes the widest stated need, unattributed | The mechanism for getting an accommodation without disclosing |
| Silence is never agreement | Inferring consent from tone and non-objection is invisible, unreliable work |
| The brief is never rewritten — only questioned | ASAN, July 2025, on generative AI in plain-language work |
| Teacher page composed and sent *by the group* | *"Surveillance with extra steps"* — detection without agency isn't accommodation |
| No streaks, timers or pressure mechanics | Masking correlates with *"suicidal ideation, decreased self-esteem, PTSD, depression"* |
| Nothing models a person, architecturally | *"Most tools built for autistic people were made without a single autistic person in the room"* |
| Ambiguity flagged, never resolved on the student's behalf | Autistic inertia: *"unstructured environments exacerbate inertia… harder to act"* |

Sources are listed in the README.

---

## 3 · Demo video script — 3 minutes

Judges stop at three minutes. Show the product working in the first thirty seconds.

**0:00–0:25 — The problem, on screen**
Show the example brief. Read the vague parts aloud: *"critically analyse… use
appropriate sources… as discussed, follow the usual format."*
> "Six things are missing here and none of them are marked as missing. Some
> students fill those gaps by reading the room. Everyone else pays for them."

**0:25–1:05 — Read a brief (live)**
Click *Read this brief*. Results appear.
> "Eighteen checks, and it found twenty-three things. What finished looks like.
> What you hand in. And the questions worth asking — each one quoting the exact
> words that triggered it, written so you can send it straight to a teacher."

Land this line: **"None of this is a gap in you. It's a gap in the brief."**

**1:05–1:50 — Split the work**
Click through to the group page with the parts carried over.
> "Roles normally get decided by talking, fast, in the first meeting — which
> favours whoever is most comfortable negotiating out loud. Here everyone answers
> the same four questions."

Show the split, then the agreement. **This is the moment of the whole demo:**
> "One person asked for several days' notice. So the group's rule is now several
> days' notice — with no name attached to it. That's how someone gets what they
> need without ever having to say why."

**1:50–2:20 — Decisions**
> "Silence is never counted as agreement. It shows who's agreed and who hasn't
> answered — and says plainly that those aren't the same thing. And raising
> something in writing counts exactly as much as saying it out loud."

**2:20–2:45 — The design decision**
> "There's no account, no profile, no score. It never works out who's
> neurodivergent, because it never models a person at all — the only thing it reads
> is a document. Nobody discloses anything to benefit from this. The student it was
> designed for is the last one anybody would guess."

**2:45–3:00 — Close**
Open the Display panel, bump text size, switch contrast.
> "It works with no API key at all. And it never rewrites your teacher's words or
> writes your assignment — it names the gaps and hands them back to you."

**Record with:** the Display panel at default, a real brief (the built-in example is
fine), and no dead air waiting for the API — cut the wait if it's slow.
