# Held against the rules and the rubric

Audit of Common Ground against IncludAI's stated requirements and judging criteria.
Honest about the one gap.

---

## Hard requirements

| Requirement | Status |
|---|---|
| **AI used meaningfully — "not merely a chat-interface wrapper"** | ✅ Two layers. 18 deterministic checks plus an AI layer that extracts a definition of done, deliverables and separable workstreams. It is not a chat interface — there is no conversation, and the model's output is schema-validated, length-capped and filtered before display. |
| **Real neurodivergent users involved in design or testing, described in the submission** | ⚠️ **The one gap.** Asked publicly in the IncludEDU Discord on 7 Aug; no reply yet. Falling back to the organiser's option 2 — cited research and first-person accounts — with the design-rationale table in `SUBMISSION.md`. Screenshot the Discord post as evidence of the ask. |
| **Substantially built during the hackathon period (1–8 Aug)** | ✅ Built entirely on 7 Aug. Full commit history is public and timestamped. |
| **Pre-existing code or assets clearly disclosed** | ✅ None. Scaffolded from `create-next-app` on the day; no code carried in from any prior project. |
| **Demo video, 3 min max, public on YouTube/Vimeo** | ⬜ Script written and timed in `SUBMISSION.md`. Needs recording. |
| **Public GitHub repository** | ✅ github.com/Shivang-creator/common-ground |
| **Project description covering problem, users, AI use, and user involvement** | ✅ Drafted in `SUBMISSION.md`. |
| **English** | ✅ |
| **Pick one track** | ✅ Track 1 — *AI for Learners Who Think Differently*. Their framing is *"adapt your tool to the student, not the student to your tool,"* which is precisely this. |

---

## Judging criteria

### Impact on neurodivergent youth — 30%
The heaviest weighting, and where the core design decision pays off.

Most tools in this space require you to identify as neurodivergent to benefit,
which means disclosing. Common Ground removes the barrier for a whole class, so
nobody has to. The clearest expression is the working agreement: **it takes the
widest stated need and never says whose it was.** One person asks for several
days' notice; the group's rule becomes several days' notice, unattributed.

Each of the three problems it addresses is documented, not assumed:
- Hidden curriculum — *"neurotypical pupils often absorb these 'school rules'
  intuitively, while autistic pupils are expected to work them out."*
- Group work — *"it wasn't the content that caused difficulty, it was the
  unpredictability of peer communication."*
- Ambiguity and inertia — *"unstructured environments exacerbate inertia,
  increasing stress and making it even harder to act."*

**Weakness:** impact is argued from research rather than demonstrated with a user.
That is the gap above, and it is the honest thing to say in the submission.

### Innovation in AI application — 25%
The novel move is **where the AI is not**. Role allocation is deterministic on
purpose — if a group disputes the split, *"the AI decided"* is not an acceptable
answer. The AI is confined to reading a document, never to judging a person, and
it degrades to nothing rather than guessing.

Also unusual for this field: the tool **never generates content for the student**.
It extracts and asks. That constraint comes straight from ASAN's finding that
generative AI *"added new ideas that were not in the text we wrote."*

**Weakness:** a judge could argue the AI layer is thin — extraction rather than
anything novel in modelling. The counter is that thinness is the design: the
deterministic layer carries the weight and the app works with no key at all.

### Usability & accessibility — 25%
Text size, spacing, typeface, contrast, colour and motion all user-controlled,
persisted, applied before first paint so the page never flashes. Controls sit in
the header on every page — not behind a label that makes you identify as needing
them. Full keyboard operation, visible focus, skip link, live status regions, no
colour-only meaning, zoom never blocked.

**No animation anywhere, by design.** A tool offering a reduce-motion setting
while animating its own landing page is not taking its own advice.

**No timers, streaks or pressure mechanics.** Masking research links performance
pressure to real harm, so none of the standard engagement patterns appear.

### Technical execution — 10%
56 tests. Plugin check architecture. Provider fallback. Graceful degradation with
no key — verified by running it that way, not asserted. One test enforces a
product rule: no finding may ever contain clinical or diagnostic language.

### Presentation quality — 10%
Live product, no login. `/judges` gives a three-minute guided walkthrough.
`/checks` lists every check straight from the engine. README carries the full
research trail.

---

## Where this could lose

Stated plainly, because knowing it is better than being surprised by it.

1. **No user testing.** The largest risk against the heaviest-weighted criterion.
   Mitigated by a documented public ask and cited research, but a project with a
   real quoted tester beats one without.
2. **Track 1 is the crowded track.** Most entries there are task splitters, so this
   is differentiated within it — and the $1,000 Grand Prize is judged across all
   tracks regardless.
3. **The AI could read as light.** Deliberate, defensible, but a judge weighting
   "innovation in AI" toward model sophistication may not agree.
4. **Calm design could read as unfinished** to someone who equates polish with
   motion. `/judges` addresses this head-on with a "why it looks this calm" section.

## Where it is strong

1. The central design decision is genuinely uncommon in this field, and it is
   carried through the architecture rather than claimed in copy.
2. Every constraint is traceable to a published source or a community position.
3. It works with no API key — unusual, and it means a judge can always evaluate it.
4. It refuses things a weaker submission would have shipped: no teacher dashboard,
   no neurodivergence inference, no generated assignment text.
