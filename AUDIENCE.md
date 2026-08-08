# Who this is for, and what makes it different

Written from seven user-testing sessions on 8 August 2026 — ADHD, dyslexia, autism,
dyspraxia, dyscalculia, one student with no diagnosis, and the original tester's
second look. Every claim below is something a tester said, not something we assumed.

---

## 1 · The audience is not a diagnosis

The obvious framing is "neurodivergent students." The testing says that is the wrong
axis.

The original tester corrected our first version of the problem statement:

> *"The people who 'seem to know' mostly don't know either — they asked each other.
> It travels through group chats. So the barrier is as much social capital as brief
> quality."*

And the student with no diagnosis put the same thing from the other side:

> *"I'm the person on the other side of it. I find these one in my seminar. So the
> honest framing is: this is a group chat for people who don't have one."*

**That is the audience.** Not a condition — a position. The information exists, it is
just expensive to retrieve, and the cost falls on whoever cannot ask casually.

### Primary — students who cannot cheaply ask
Neurodivergent students are the largest and hardest-hit group, but the same barrier
catches: students working in a second language, commuters and part-time students who
leave straight after class, mature students, transfers, anyone who was absent the day
it was explained, and anyone for whom "come and see me" is not a free action.

### Secondary — the group
Not a nice-to-have. A tester identified why:

> *"This only works if the whole class uses it. If it's just me pasting the brief and
> turning up with 23 questions, I'm now visibly the person who Has A System — which
> is its own kind of marked."*

Group adoption is not a growth strategy here, it is **the mechanism**. One person
using it is conspicuous; a group using it is normal.

### Third — whoever writes the brief
The tester's own idea, and the only version where nobody has to be the one who asked:

> *"The version that closes it is aimed at whoever writes the brief: run it on your
> own assignment before you publish it."*

Same engine, same output, opposite end of the problem. It is on the front page.

---

## 2 · What each group actually came for

They did not want the same thing. This matters for what we build next.

| Who | The barrier, in their words | What they used |
|---|---|---|
| **ADHD** | *"The questions were never my problem; writing the email was. I've drafted that email in my head eleven times and never sent it."* | The email. And speed — 25 seconds lost them entirely. |
| **Dyslexia** | *"Re-reading a brief costs me something it doesn't cost other people. Something that reads it for me and gives me a five-line list is worth more to me than to almost anyone."* | The summary, Display controls, read-aloud. |
| **Autism** | *"'Come and see me if you have questions' is not a route — it's an unscheduled conversation with an authority figure where I have to perform not-understanding in real time."* | The written question. And the **group page over the brief reader**. |
| **Dyspraxia** | *"I know what to ask. The physical and organisational cost of producing the artefact — the formatting, the file, the submission portal — is what sinks me."* | "What you hand in", "how to submit". Tap targets and undo decide whether they can use it at all. |
| **Dyscalculia** | *"How long is 'a section', what '40% of the marks' means for how much time to spend. Everyone else converts weightings into effort automatically. I can't, and nobody has ever written that conversion down."* | The arithmetic and the timeline. |
| **No diagnosis** | *"I already knew to ask about the word count. What I got that I didn't have was the individual-vs-group-mark one, and the email."* | Confirms the tool clears a genuinely useful bar even for the well-connected. |

**The shared thread:** every one of them described a cost that is invisible to everyone
else. Not an inability — a tax.

---

## 3 · The USP

> **Common Ground is the only tool of its kind that nobody has to admit they are using.**

Everything else in this category — every task splitter, every study coach, every
accessibility add-on — requires you to identify as the person who needs it. Opening
it *is* the disclosure. Common Ground inverts that: the whole class uses one tool,
and its design removes barriers that happen to fall hardest on some people.

The autistic tester on why this is the part that matters:

> *"This is the part that matters most to me, because the alternative is walking into
> an office to get a form."*

### The four things that make it defensible

**1. It changes the environment, not the person.**
Every other approach teaches the student to cope with an unclear brief. This makes
the brief answerable. Nothing here asks anyone to communicate differently, mask, or
build a habit — which also means it cannot do the harm that social-skills training
demonstrably does.

**2. Accommodation without attribution.**
The group page takes the widest stated need and never says whose it was. One person
asks for several days' notice; the group's rule becomes several days' notice, with no
name on it. That single mechanism is the product in miniature, and no competitor has it.

**3. Asking scales *and* answering scales.**
> *"If your whole class uses this, your tutor receives thirty near-identical emails.
> Then they stop answering, and the tool stops working."*

An answer written down drops that question out of everyone's email. Most tools in
this space would have created that problem and never noticed it.

**4. It never models a person — architecturally, not as a policy.**
No account, no profile, no score. The only input is a document, so there is nothing
to infer from. A test fails the build if any output ever contains clinical language.

### And it works with nothing
No login, no install, no API key required — eighteen deterministic checks carry the
value and the model only improves it. For an audience routinely failed by technology
that demands setup first, that is not a technical footnote; it is the reason they got
past the first screen.

---

## 4 · The honest caveats

The sceptic earned this section:

> *"This is a group chat for people who don't have one. Which is a real product —
> I'd just be careful pretending it's for everyone equally."*

**It is not equally useful to everyone.** Someone with a good group chat gets modest
value. Saying "for everyone" is true about *access*, not about *benefit*, and we
should say which we mean.

**Universal design is the mechanism, not the marketing.** The whole class uses it so
that nobody is marked — not because everyone needs it equally.

**It removes one barrier and replaces nothing.** It is not a reason for anyone to have
fewer formal accommodations, and the site says so.

**One gap is still open**, named by the ADHD tester:
> *"The tool is great at 'I can't start.' It does nothing for 'I started and lost the
> thread.'"*
Re-entry after weeks away is unsolved. Listed in What's next, not papered over.

---

## 5 · If this became a product

**User:** the student. **Adopter:** the group. **Buyer:** the institution.

The buyer is a real tension worth naming early. A university would want a dashboard;
we deliberately refuse to build one, because a tool that reports on students to an
authority figure is surveillance regardless of intent. The sellable version is the
**brief-writer** side — course teams running their own briefs before publishing —
which improves outcomes at the source and needs no student data at all.

That is also the version where the product eventually makes itself unnecessary, which
is the correct ambition for something in this space.
