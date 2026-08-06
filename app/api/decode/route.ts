import { NextRequest, NextResponse } from "next/server";
import { runChecks } from "@/lib/checks";
import { interpret, aiConfigured } from "@/lib/llm";
import type { DecodeResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 40_000;

export async function POST(req: NextRequest) {
  const started = Date.now();
  let brief = "";
  try {
    const body = await req.json();
    brief = typeof body?.brief === "string" ? body.brief : "";
  } catch {
    return NextResponse.json({ error: "Could not read the request." }, { status: 400 });
  }

  brief = brief.trim();
  if (brief.length < 40) {
    return NextResponse.json(
      { error: "That looks too short to be a brief. Paste the whole thing — the more it says, the more we can check." },
      { status: 400 },
    );
  }
  if (brief.length > MAX_CHARS) brief = brief.slice(0, MAX_CHARS);

  const { findings, checksRun } = runChecks(brief);

  let interpretation;
  let aiError: string | undefined;
  if (aiConfigured()) {
    const { result, error } = await interpret(brief);
    interpretation = result ?? undefined;
    if (error) aiError = error;
  }

  const result: DecodeResult = {
    findings,
    interpretation,
    aiUsed: !!interpretation,
    aiError,
    meta: {
      words: brief.split(/\s+/).filter(Boolean).length,
      checksRun,
      ms: Date.now() - started,
    },
  };

  return NextResponse.json(result);
}
