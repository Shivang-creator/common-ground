/**
 * The AI layer.
 *
 * Rules this module follows, adapted from what the neurodivergent community has
 * said about generative AI in accessibility tools:
 *
 *  1. **Never rewrite the student's or the teacher's words.** ASAN's July 2025
 *     position on generative AI in plain-language work found it "added new ideas
 *     that were not in the text we wrote" and "changes what something means". So
 *     this layer only ever *extracts* and *asks* — it does not restate the brief
 *     back in different words, and it does not produce content to hand in.
 *  2. **Degrade to nothing.** No key, a timeout, a bad response — the caller gets
 *     `null` and the deterministic checks stand alone. A missing interpretation is
 *     fine; a confidently wrong one is not.
 *  3. **Never model the person.** The only input is the assignment brief. No user
 *     text, no behaviour, no timing data is ever sent anywhere.
 *
 * Providers are tried in order. Both are OpenAI-compatible, so one code path serves
 * Google and Featherless alike.
 */

import type { Interpretation } from "./types";

const TIMEOUT_MS = 45_000;

interface Provider {
  name: string;
  baseUrl: string;
  model: string;
  key?: string;
}

function providers(): Provider[] {
  const list: Provider[] = [];
  if (process.env.GEMINI_API_KEY) {
    list.push({
      name: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      key: process.env.GEMINI_API_KEY,
    });
  }
  if (process.env.FEATHERLESS_API_KEY) {
    list.push({
      name: "featherless",
      baseUrl: "https://api.featherless.ai/v1",
      model: process.env.FEATHERLESS_MODEL || "moonshotai/Kimi-K2-Instruct",
      key: process.env.FEATHERLESS_API_KEY,
    });
  }
  return list;
}

export const aiConfigured = () => providers().length > 0;

const SYSTEM = `You help students understand what an assignment brief is actually asking for.

You are working with students who find implicit expectations hard to read — which
includes autistic and ADHD students, students learning in a second language, and
anyone who missed the class where this was explained.

Absolute rules:
- Only use information present in the brief. Never invent requirements, deadlines,
  criteria or sources. If the brief does not say, leave the field out.
- Never write any part of the assignment itself. You describe the task; you never do it.
- Never rephrase the brief's meaning into something new. Extract, don't reinterpret.
- Plain, direct language. No idioms, no metaphors, no figures of speech.
- Never mention disability, neurodiversity, learning styles or any characteristic of
  the reader. You are describing a document, not a person.

Reply with JSON only, matching exactly this shape:
{
  "summary": "One plain sentence saying what this assignment asks for.",
  "definitionOfDone": ["Checkable statements. Each one is something a student could tick off."],
  "deliverables": ["Each distinct thing that must be handed in."],
  "workstreams": [{"name": "Short name", "description": "One sentence on what this part involves."}]
}

definitionOfDone: 3-7 items, each concrete and checkable. Derive only from the brief.
workstreams: 2-5 genuinely separable parts of the work. If the brief describes
individual work with no separable parts, return an empty array.
Omit any field the brief gives you no basis for.`;

async function callProvider(p: Provider, brief: string): Promise<Interpretation> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${p.key}`,
      },
      body: JSON.stringify({
        model: p.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Assignment brief:\n\n"""\n${brief.slice(0, 12_000)}\n"""` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`${p.name} returned ${res.status}`);
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    return parseInterpretation(content);
  } finally {
    clearTimeout(timer);
  }
}

/** Tolerant JSON extraction — models wrap JSON in prose and code fences. */
export function parseInterpretation(raw: string): Interpretation {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  if (!text.startsWith("{")) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("no JSON object in response");
    text = text.slice(start, end + 1);
  }
  const parsed = JSON.parse(text);

  const strings = (v: unknown, cap: number): string[] | undefined => {
    if (!Array.isArray(v)) return undefined;
    const out = v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, cap);
    return out.length ? out : undefined;
  };

  const workstreams = Array.isArray(parsed.workstreams)
    ? parsed.workstreams
        .filter((w: unknown): w is { name: string; description?: string } =>
          !!w && typeof w === "object" && typeof (w as { name?: unknown }).name === "string",
        )
        .map((w: { name: string; description?: string }) => ({
          name: w.name.trim().slice(0, 80),
          description: (w.description ?? "").trim().slice(0, 300),
        }))
        .slice(0, 5)
    : undefined;

  return {
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim().slice(0, 400) : undefined,
    definitionOfDone: strings(parsed.definitionOfDone, 7),
    deliverables: strings(parsed.deliverables, 6),
    workstreams: workstreams?.length ? workstreams : undefined,
  };
}

/**
 * Returns an interpretation, or null. Never throws — a failure here must not
 * degrade the deterministic result the user already has.
 */
export async function interpret(brief: string): Promise<{ result: Interpretation | null; error?: string }> {
  const list = providers();
  if (!list.length) return { result: null, error: "no-provider" };
  let lastError = "";
  for (const p of list) {
    try {
      return { result: await callProvider(p, brief) };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { result: null, error: lastError };
}
