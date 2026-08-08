"use client";

import { useRef, useState } from "react";

/**
 * Getting the brief in without typing it.
 *
 * A dyspraxic tester: *"Voice input would genuinely help — typing the brief in is
 * the worst part if I don't have a digital copy. A photo-of-the-brief → text option
 * would be even better; briefs get handed out on paper."*
 *
 * Three routes in, all optional, none replacing the textarea:
 *
 *  - **A file** — .txt, .md, or a photo/scan. Text files are read directly.
 *  - **A photo** — the camera on a phone, same path as a file.
 *  - **Dictation** — the browser's own speech recognition, so nothing is uploaded.
 *
 * Images are sent to the same reader that already handles the brief; nothing new
 * leaves the device that was not already going to. Dictation runs entirely in the
 * browser and never transmits audio.
 */
export function BriefInput({
  onText,
  disabled,
}: {
  onText: (text: string) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  async function handleFile(file: File) {
    setNote(null);
    if (file.type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(file.name)) {
      setBusy("Reading the file…");
      try {
        onText(await file.text());
      } finally {
        setBusy(null);
      }
      return;
    }
    if (file.type.startsWith("image/")) {
      setBusy("Reading the photo…");
      try {
        const b64 = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const resp = await fetch("/api/read-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: b64 }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.text) {
          setNote(
            data?.error ??
              "Couldn't read that photo. You can still paste or type the text in below.",
          );
        } else {
          onText(data.text);
        }
      } catch {
        setNote("Couldn't read that photo. You can still paste or type the text in below.");
      } finally {
        setBusy(null);
      }
      return;
    }
    setNote("That file type isn't supported. A photo, a .txt, or paste the text in below.");
  }

  function dictate() {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-GB";
    let acc = "";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) acc += e.results[i][0].transcript + " ";
      }
      onText(acc.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
    (window as unknown as { __cgRec?: SpeechRecognition }).__cgRec = rec;
  }

  function stopDictating() {
    (window as unknown as { __cgRec?: SpeechRecognition }).__cgRec?.stop();
    setListening(false);
  }

  return (
    <div className="no-print">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-quiet px-4 py-2 text-sm"
          disabled={disabled || !!busy}
          onClick={() => fileRef.current?.click()}
        >
          📄 Photo or file
        </button>
        {speechSupported && (
          <button
            type="button"
            className="btn btn-quiet px-4 py-2 text-sm"
            aria-pressed={listening}
            disabled={disabled || !!busy}
            onClick={listening ? stopDictating : dictate}
          >
            {listening ? "■ Stop dictating" : "🎤 Read it out instead"}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,text/plain,.txt,.md"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {busy && (
        <p className="text-sm mt-2" role="status" style={{ color: "var(--text-muted)" }}>
          {busy}
        </p>
      )}
      {listening && (
        <p className="text-sm mt-2" role="status" style={{ color: "var(--text-muted)" }}>
          Listening. Read the brief out loud — it appears below as you go. Nothing is
          recorded or uploaded.
        </p>
      )}
      {note && (
        <p className="sev-friction text-sm rounded-lg p-3 mt-2" role="alert">
          {note}
        </p>
      )}
    </div>
  );
}
