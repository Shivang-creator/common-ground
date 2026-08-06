/**
 * Role allocation.
 *
 * This is deliberately a plain algorithm, not a model call. Three reasons:
 *
 *  1. **It has to be explainable to the group.** Every allocation carries a
 *     rationale that quotes what someone actually chose. "The AI decided" is not
 *     an acceptable answer when someone thinks the split is unfair.
 *  2. **It must be deterministic.** Same inputs, same output, every time. A group
 *     re-running this and getting a different answer would undermine the point.
 *  3. **It cannot infer.** The only inputs are stated preferences. Nothing here
 *     looks at how fast someone typed, how much they wrote, or anything else that
 *     could stand in for a characteristic of a person.
 *
 * What this replaces: deciding roles by talking, in the first meeting, quickly.
 * That process reliably favours whoever speaks first and is most comfortable
 * negotiating in real time — which is precisely the "unpredictability of peer
 * communication" that group-work research identifies as the actual barrier.
 */

import type { MemberPrefs, RoleProposal } from "./types";

export interface GroupAgreement {
  /** Plain statements the whole group has effectively agreed by filling the form. */
  statements: { text: string; because: string }[];
  /** Workstreams nobody picked — surfaced, never silently dropped. */
  unclaimed: string[];
  /** Members with no workstream, if there are fewer streams than people. */
  unassigned: string[];
}

export interface AllocationResult {
  roles: RoleProposal[];
  agreement: GroupAgreement;
}

/**
 * Greedy allocation by stated preference rank, with a deterministic tie-break.
 *
 * Round 1 gives everyone their highest remaining choice that nobody else has
 * ranked higher. Ties break toward the member who has fewer acceptable options
 * left (they have less room to move), then by name for stability.
 */
export function allocate(members: MemberPrefs[], workstreams: string[]): AllocationResult {
  const roles: RoleProposal[] = [];
  const takenStreams = new Set<string>();
  const placed = new Set<string>();

  const rank = (m: MemberPrefs, ws: string) => {
    const i = m.wants.indexOf(ws);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  // Deterministic ordering: fewest stated options first, then name.
  const order = [...members].sort((a, b) => {
    const aOpts = a.wants.filter((w) => workstreams.includes(w)).length;
    const bOpts = b.wants.filter((w) => workstreams.includes(w)).length;
    if (aOpts !== bOpts) return aOpts - bOpts;
    return a.name.localeCompare(b.name);
  });

  for (let pass = 0; pass < workstreams.length + 1; pass++) {
    let progressed = false;
    for (const m of order) {
      if (placed.has(m.id)) continue;
      const choice = m.wants.find((w) => workstreams.includes(w) && !takenStreams.has(w));
      if (!choice) continue;

      // Does anyone unplaced rank this higher? If so, defer this pass.
      const contender = order.find(
        (o) => !placed.has(o.id) && o.id !== m.id && rank(o, choice) < rank(m, choice),
      );
      if (contender) continue;

      const position = m.wants.indexOf(choice);
      const rationale =
        position === 0
          ? "You listed this first."
          : `You listed this as choice ${position + 1}. Your earlier choices were taken by someone who ranked them higher.`;

      roles.push({
        memberId: m.id,
        memberName: m.name,
        workstream: choice,
        done: `${choice} is finished when the group has agreed it is, and it is written down here.`,
        rationale,
      });
      takenStreams.add(choice);
      placed.add(m.id);
      progressed = true;
    }
    if (!progressed) break;
  }

  const unassigned = members.filter((m) => !placed.has(m.id)).map((m) => m.name);
  const unclaimed = workstreams.filter((w) => !takenStreams.has(w));

  return { roles, agreement: buildAgreement(members, unclaimed, unassigned) };
}

/**
 * The working agreement.
 *
 * The rule throughout: **accommodate the widest need, and never say whose it was.**
 * If one person wants several days' notice, the group gives several days' notice —
 * stated as a group norm, with no name attached. That is the whole mechanism by
 * which someone gets what they need without disclosing why they need it.
 */
function buildAgreement(members: MemberPrefs[], unclaimed: string[], unassigned: string[]): GroupAgreement {
  const statements: { text: string; because: string }[] = [];

  // Meeting notice — take the longest anyone asked for.
  const noticeRank = { "same-day": 0, "a-day": 1, "several-days": 2 } as const;
  const longest = members.reduce<MemberPrefs["notice"]>((acc, m) => (noticeRank[m.notice] > noticeRank[acc] ? m.notice : acc), "same-day");
  const noticeText = {
    "same-day": "Meetings can be called on the day.",
    "a-day": "Meetings are agreed at least a day ahead.",
    "several-days": "Meetings are agreed several days ahead, with an agenda.",
  }[longest];
  statements.push({
    text: noticeText,
    because: "This is the most notice anyone in the group asked for. Giving everyone that much costs nothing and means nobody is caught out.",
  });

  // Written contribution path — required if anyone prefers it, offered regardless.
  const anyWriting = members.some((m) => m.contribute === "writing" || m.contribute === "either");
  statements.push({
    text: "Anything that can be said in a meeting can be written instead, and counts the same.",
    because: anyWriting
      ? "At least one person said they would rather contribute in writing, or either way. A written path means real-time speaking is never the only way to be heard."
      : "Everyone here said they are comfortable speaking. Keeping a written path open anyway costs nothing and covers the days when that changes.",
  });

  // Decisions in writing.
  statements.push({
    text: "A decision is only a decision once it is written down here.",
    because: "It removes the need to infer agreement from tone, silence or body language, and it means nobody has to remember what was settled three weeks ago.",
  });

  // Feedback preferences — stated as options, per person, without ranking them.
  const feedbackText = {
    direct: "direct and to the point",
    "written-first": "in writing first, then talk if needed",
    "in-conversation": "in conversation rather than in writing",
  } as const;
  const grouped = members.map((m) => `${m.name}: ${feedbackText[m.feedback]}`).join(" · ");
  statements.push({
    text: `Feedback on someone's part goes to them the way they asked for it — ${grouped}.`,
    because: "People are told this about each other up front, so nobody has to ask for it mid-project or work out someone's preference by trial and error.",
  });

  const notes = members.filter((m) => m.note?.trim());
  if (notes.length) {
    statements.push({
      text: `The group also knows: ${notes.map((m) => `${m.name} — ${m.note!.trim()}`).join(" · ")}`,
      because: "Said voluntarily by each person about how they work. Nothing here was inferred.",
    });
  }

  return { statements, unclaimed, unassigned };
}
