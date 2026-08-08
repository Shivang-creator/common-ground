"use client";

import { useEffect, useState } from "react";

/**
 * Read-aloud, off until pressed.
 *
 * Three testers asked for this independently — a dyslexic student ("read-aloud" was
 * one of two things they said the Display panel was missing), an ADHD student, and
 * the original tester, who put it alongside the progress state as "function, not
 * decoration".
 *
 * An autistic tester set the constraint: *"If you add audio, it must be off until
 * pressed and never autoplay."* So there is no ambient audio anywhere, nothing
 * begins on load, and pressing again stops it immediately.
 *
 * Uses the browser's own speech synthesis — no account, no API key, no audio ever
 * leaves the device, and it works offline.
 */
export function ReadAloud({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="btn btn-quiet px-3 py-1.5 text-sm"
      title={speaking ? "Stop" : label}
    >
      {speaking ? "■ Stop" : "▶ " + label}
    </button>
  );
}
