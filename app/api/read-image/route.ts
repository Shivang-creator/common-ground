import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Read the text off a photo of a brief.
 *
 * Briefs get handed out on paper. A dyspraxic tester pointed out that typing one in
 * is the hardest part of using this tool for them, and that a photo would be better
 * than voice.
 *
 * This transcribes and nothing else. The model is told, explicitly, not to
 * summarise, tidy, correct or interpret — the checks depend on the brief's exact
 * wording, and "the usual format" only gets flagged if it survives verbatim.
 *
 * The image is sent once, read, and not stored.
 */
export async function POST(req: NextRequest) {
  let image = "";
  try {
    const body = await req.json();
    image = typeof body?.image === "string" ? body.image : "";
  } catch {
    return NextResponse.json({ error: "Could not read the request." }, { status: 400 });
  }

  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "That doesn't look like an image." }, { status: 400 });
  }
  // ~8MB of base64. Bigger than a phone photo of one page needs to be.
  if (image.length > 11_000_000) {
    return NextResponse.json(
      { error: "That photo is very large. Try a smaller one, or paste the text in." },
      { status: 413 },
    );
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Reading photos isn't available here. You can paste or type the text in." },
      { status: 503 },
    );
  }

  const model = process.env.GEMINI_VISION_MODEL || "gemini-flash-lite-latest";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "Transcribe the text in this image exactly. Reproduce every word as written, " +
                "keeping the original wording, order and line breaks. Do not summarise, " +
                "shorten, correct, tidy, translate or explain anything. Do not add headings " +
                "or commentary. Output only the transcribed text. If there is no readable " +
                "text, output nothing.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe this assignment brief exactly." },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Couldn't read that photo just now. You can paste the text in instead." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const text: string = (data?.choices?.[0]?.message?.content ?? "").trim();

    if (text.length < 40) {
      return NextResponse.json(
        {
          error:
            "Couldn't find much text in that photo. Try a straighter, brighter shot — or paste the text in.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Couldn't read that photo just now. You can paste the text in instead." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
